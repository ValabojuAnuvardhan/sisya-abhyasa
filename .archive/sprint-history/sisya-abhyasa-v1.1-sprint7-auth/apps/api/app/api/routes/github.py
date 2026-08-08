import json
from uuid import UUID
from fastapi import APIRouter,Depends,HTTPException,Request
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.core.auth import AuthPrincipal,require_principal
from app.core.config import settings
from app.db.session import get_db
from app.models.user import User,StudentProfile
from app.models.project import Project,Milestone,Task
from app.models.github import ProjectRepository,GithubWebhookEvent,GithubCommit,GithubPullRequest
from app.schemas.github import RepositoryConnect,PullRequestTaskLink
from app.services.github import verify_repository,verify_signature,process_push,process_pr
router=APIRouter(tags=['github'])

def user_for(p,db):
    u=db.scalar(select(User).where(User.auth_subject==p.subject))
    if not u:raise HTTPException(404,'User not found')
    return u

def owned_project(project_id,user,db):
    p=db.scalar(select(Project).where(Project.id==project_id,Project.creator_id==user.id))
    if not p:raise HTTPException(404,'Project not found')
    return p

@router.get('/github/config')
def config():
    return {'configured':bool(settings.github_app_id and settings.github_app_private_key and settings.github_webhook_secret),'app_slug':settings.github_app_slug,'install_url':f'https://github.com/apps/{settings.github_app_slug}/installations/new' if settings.github_app_slug else None,'identity_oauth_configured':bool(settings.github_app_client_id and settings.github_app_client_secret)}

@router.post('/projects/{project_id}/github/repository')
def connect_repo(project_id:UUID,payload:RepositoryConnect,principal:AuthPrincipal=Depends(require_principal),db:Session=Depends(get_db)):
    user=user_for(principal,db); owned_project(project_id,user,db); repo=verify_repository(payload.installation_id,payload.full_name)
    existing=db.scalar(select(ProjectRepository).where(ProjectRepository.project_id==project_id))
    if existing:
        existing.github_installation_id=payload.installation_id; existing.github_repository_id=repo['id']; existing.owner=repo['owner']['login']; existing.name=repo['name']; existing.full_name=repo['full_name']; existing.html_url=repo['html_url']; existing.is_private=repo['private']; row=existing
    else:
        row=ProjectRepository(project_id=project_id,github_installation_id=payload.installation_id,github_repository_id=repo['id'],owner=repo['owner']['login'],name=repo['name'],full_name=repo['full_name'],html_url=repo['html_url'],is_private=repo['private']); db.add(row)
    db.commit(); return {'full_name':row.full_name,'html_url':row.html_url,'private':row.is_private,'github_repository_id':row.github_repository_id}

@router.get('/projects/{project_id}/github/evidence')
def evidence(project_id:UUID,principal:AuthPrincipal=Depends(require_principal),db:Session=Depends(get_db)):
    user=user_for(principal,db); owned_project(project_id,user,db); repo=db.scalar(select(ProjectRepository).where(ProjectRepository.project_id==project_id))
    if not repo:return {'repository':None,'commits':[],'pull_requests':[]}
    commits=db.scalars(select(GithubCommit).where(GithubCommit.repository_id==repo.id).order_by(GithubCommit.created_at.desc()).limit(50)).all()
    prs=db.scalars(select(GithubPullRequest).where(GithubPullRequest.repository_id==repo.id).order_by(GithubPullRequest.updated_at_github.desc().nullslast(),GithubPullRequest.created_at.desc()).limit(50)).all()
    return {'repository':{'full_name':repo.full_name,'html_url':repo.html_url,'private':repo.is_private},'commits':[{'id':str(c.id),'sha':c.sha,'message':c.message,'actor':c.github_actor_login,'mapped':bool(c.user_id),'html_url':c.html_url} for c in commits],'pull_requests':[{'id':str(pr.id),'number':pr.number,'title':pr.title,'state':pr.state,'merged':pr.merged,'actor':pr.github_actor_login,'mapped':bool(pr.user_id),'html_url':pr.html_url,'task_id':str(pr.task_id) if pr.task_id else None} for pr in prs]}

@router.patch('/projects/{project_id}/github/pull-requests/{pr_id}/task')
def link_pr(project_id:UUID,pr_id:UUID,payload:PullRequestTaskLink,principal:AuthPrincipal=Depends(require_principal),db:Session=Depends(get_db)):
    user=user_for(principal,db); owned_project(project_id,user,db); repo=db.scalar(select(ProjectRepository).where(ProjectRepository.project_id==project_id));
    if not repo:raise HTTPException(404,'Repository not connected')
    pr=db.scalar(select(GithubPullRequest).where(GithubPullRequest.id==pr_id,GithubPullRequest.repository_id==repo.id))
    if not pr:raise HTTPException(404,'Pull request not found')
    if payload.task_id:
        task=db.scalar(select(Task).join(Milestone).where(Task.id==payload.task_id,Milestone.project_id==project_id))
        if not task:raise HTTPException(400,'Task does not belong to project')
    pr.task_id=payload.task_id; db.commit(); return {'id':str(pr.id),'task_id':str(pr.task_id) if pr.task_id else None}

@router.post('/github/webhooks',status_code=202)
async def webhook(request:Request,db:Session=Depends(get_db)):
    raw=await request.body(); verify_signature(raw,request.headers.get('X-Hub-Signature-256'))
    delivery=request.headers.get('X-GitHub-Delivery'); event=request.headers.get('X-GitHub-Event')
    if not delivery or not event:raise HTTPException(400,'Missing GitHub delivery headers')
    if db.scalar(select(GithubWebhookEvent).where(GithubWebhookEvent.delivery_id==delivery)):return {'accepted':True,'duplicate':True}
    payload=json.loads(raw); rid=(payload.get('repository') or {}).get('id'); record=GithubWebhookEvent(delivery_id=delivery,event_type=event,action=payload.get('action'),repository_id=rid); db.add(record); db.flush()
    repo=db.scalar(select(ProjectRepository).where(ProjectRepository.github_repository_id==rid)) if rid else None
    if repo:
        if event=='push':process_push(db,repo,payload)
        elif event=='pull_request':process_pr(db,repo,payload)
    record.processed=True; db.commit(); return {'accepted':True,'duplicate':False,'repository_mapped':bool(repo)}

@router.get('/projects/{project_id}/github/identity/start')
def github_identity_start(project_id:UUID,principal:AuthPrincipal=Depends(require_principal),db:Session=Depends(get_db)):
    import hashlib,hmac,base64
    user=user_for(principal,db); owned_project(project_id,user,db)
    if not settings.github_app_client_id or not settings.github_app_client_secret or not settings.github_webhook_secret: raise HTTPException(503,'GitHub user authorization is not configured')
    body=f'{project_id}:{user.id}'; sig=hmac.new(settings.github_webhook_secret.encode(),body.encode(),hashlib.sha256).hexdigest(); state=base64.urlsafe_b64encode(f'{body}:{sig}'.encode()).decode()
    from urllib.parse import urlencode
    return {'authorize_url':'https://github.com/login/oauth/authorize?'+urlencode({'client_id':settings.github_app_client_id,'state':state,'scope':'read:user'})}

@router.get('/github/identity/callback')
def github_identity_callback(code:str,state:str,db:Session=Depends(get_db)):
    import hashlib,hmac,base64
    from fastapi.responses import RedirectResponse
    try:
        decoded=base64.urlsafe_b64decode(state.encode()).decode(); project_id,user_id,sig=decoded.rsplit(':',2); body=f'{project_id}:{user_id}'
    except Exception: raise HTTPException(400,'Invalid OAuth state')
    expected=hmac.new((settings.github_webhook_secret or '').encode(),body.encode(),hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected,sig): raise HTTPException(400,'Invalid OAuth state')
    r=__import__('httpx').post('https://github.com/login/oauth/access_token',json={'client_id':settings.github_app_client_id,'client_secret':settings.github_app_client_secret,'code':code},headers={'Accept':'application/json'},timeout=15)
    data=r.json(); token=data.get('access_token')
    if not token: raise HTTPException(400,'GitHub user authorization failed')
    u=__import__('httpx').get('https://api.github.com/user',headers={'Authorization':f'Bearer {token}','Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'},timeout=15).json()
    profile=db.scalar(select(StudentProfile).where(StudentProfile.user_id==UUID(user_id)))
    if not profile: raise HTTPException(404,'Student profile not found')
    profile.github_user_id=str(u['id']); profile.github_username=u['login']; db.commit()
    return RedirectResponse(f'{settings.frontend_origin}/projects/{project_id}?github_identity=connected')

@router.post('/projects/{project_id}/github/pull-requests/{pr_id}/review')
def review_pr(project_id:UUID,pr_id:UUID,principal:AuthPrincipal=Depends(require_principal),db:Session=Depends(get_db)):
    from app.models.github import PrReview,SkillEvidence
    from app.services.reviews import create_local_review
    user=user_for(principal,db); owned_project(project_id,user,db)
    repo=db.scalar(select(ProjectRepository).where(ProjectRepository.project_id==project_id))
    if not repo: raise HTTPException(404,'Repository not connected')
    pr=db.scalar(select(GithubPullRequest).where(GithubPullRequest.id==pr_id,GithubPullRequest.repository_id==repo.id))
    if not pr: raise HTTPException(404,'Pull request not found')
    if pr.user_id!=user.id: raise HTTPException(403,'Only the attributed student can create this review')
    if not pr.task_id: raise HTTPException(400,'Link the pull request to a project task before reviewing it')
    existing=db.scalar(select(PrReview).where(PrReview.pull_request_id==pr.id))
    if existing: return {'id':str(existing.id),'already_exists':True}
    row=create_local_review(db,repo,pr,project_id); db.commit(); return {'id':str(row.id),'already_exists':False,'review_mode':row.review_mode}

@router.get('/projects/{project_id}/github/reviews')
def reviews(project_id:UUID,principal:AuthPrincipal=Depends(require_principal),db:Session=Depends(get_db)):
    from app.models.github import PrReview,SkillEvidence
    user=user_for(principal,db); owned_project(project_id,user,db)
    repo=db.scalar(select(ProjectRepository).where(ProjectRepository.project_id==project_id))
    if not repo:return {'reviews':[],'skill_evidence':[],'external_private_code_review_enabled':False}
    prs=db.scalars(select(GithubPullRequest).where(GithubPullRequest.repository_id==repo.id)).all(); ids=[x.id for x in prs]
    rs=db.scalars(select(PrReview).where(PrReview.pull_request_id.in_(ids)).order_by(PrReview.created_at.desc())).all() if ids else []
    skills=db.scalars(select(SkillEvidence).where(SkillEvidence.project_id==project_id,SkillEvidence.user_id==user.id).order_by(SkillEvidence.created_at.desc())).all()
    return {'reviews':[{'id':str(r.id),'pull_request_id':str(r.pull_request_id),'review_mode':r.review_mode,'source_scope':r.source_scope,'summary':r.summary,'task_alignment':r.task_alignment,'findings':r.findings,'limitations':r.limitations} for r in rs], 'skill_evidence':[{'id':str(s.id),'pull_request_id':str(s.pull_request_id),'task_id':str(s.task_id) if s.task_id else None,'skill_name':s.skill_name,'evidence_kind':s.evidence_kind,'explanation':s.explanation} for s in skills], 'external_private_code_review_enabled':bool(settings.external_ai_code_review_enabled)}
