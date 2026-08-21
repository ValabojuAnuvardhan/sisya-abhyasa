import hashlib,hmac,time
from datetime import datetime
import httpx,jwt
from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.user import User,StudentProfile
from app.models.github import ProjectRepository,GithubCommit,GithubPullRequest,SkillEvidence

def configured():
    return bool(settings.github_app_id and settings.github_app_private_key and settings.github_webhook_secret)

def app_jwt():
    if not settings.github_app_id or not settings.github_app_private_key: raise HTTPException(503,'GitHub App is not configured')
    key=settings.github_app_private_key.replace('\\n','\n')
    now=int(time.time())
    return jwt.encode({'iat':now-60,'exp':now+540,'iss':settings.github_app_id},key,algorithm='RS256')

def gh_get(path,token):
    r=httpx.get('https://api.github.com'+path,headers={'Authorization':f'Bearer {token}','Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'},timeout=15)
    if r.status_code>=400: raise HTTPException(400,f'GitHub verification failed ({r.status_code})')
    return r.json()

def installation_token(installation_id:int):
    r=httpx.post(f'https://api.github.com/app/installations/{installation_id}/access_tokens',headers={'Authorization':f'Bearer {app_jwt()}','Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'},timeout=15)
    if r.status_code>=400: raise HTTPException(400,'Unable to access that GitHub App installation')
    return r.json()['token']

def verify_repository(installation_id:int,full_name:str):
    token=installation_token(installation_id); repo=gh_get('/repos/'+full_name,token)
    return repo

def verify_signature(raw:bytes,signature:str|None):
    if not settings.github_webhook_secret: raise HTTPException(503,'GitHub webhook secret is not configured')
    if not signature or not signature.startswith('sha256='): raise HTTPException(401,'Missing GitHub webhook signature')
    expected='sha256='+hmac.new(settings.github_webhook_secret.encode(),raw,hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected,signature): raise HTTPException(401,'Invalid GitHub webhook signature')

def parse_dt(v):
    if not v:return None
    return datetime.fromisoformat(v.replace('Z','+00:00'))

def mapped_user(db:Session,actor:dict|None):
    if not actor or not actor.get('id'): return None
    profile=db.scalar(select(StudentProfile).where(StudentProfile.github_user_id==str(actor['id'])))
    return profile.user_id if profile else None

def process_push(db:Session,repo:ProjectRepository,payload:dict):
    for c in payload.get('commits') or []:
        actor=c.get('author') or payload.get('sender') or {}
        existing=db.scalar(select(GithubCommit).where(GithubCommit.repository_id==repo.id,GithubCommit.sha==c.get('id')))
        if existing: continue
        db.add(GithubCommit(repository_id=repo.id,user_id=mapped_user(db,actor),github_actor_id=str(actor.get('id')) if actor.get('id') else None,github_actor_login=actor.get('login') or c.get('author',{}).get('username'),sha=c.get('id',''),message=c.get('message',''),html_url=c.get('url'),committed_at=parse_dt(c.get('timestamp'))))

def process_pr(db:Session,repo:ProjectRepository,payload:dict):
    pr=payload.get('pull_request') or {}; actor=pr.get('user') or payload.get('sender') or {}; number=payload.get('number') or pr.get('number')
    if not number:return
    uid = mapped_user(db, actor)
    row=db.scalar(select(GithubPullRequest).where(GithubPullRequest.repository_id==repo.id,GithubPullRequest.number==number))
    values=dict(user_id=uid,github_actor_id=str(actor.get('id')) if actor.get('id') else None,github_actor_login=actor.get('login'),title=pr.get('title',''),state=pr.get('state','open'),merged=bool(pr.get('merged')),html_url=pr.get('html_url',''),updated_at_github=parse_dt(pr.get('updated_at')))
    if row:
        for k,v in values.items(): setattr(row,k,v)
        pr_obj = row
    else:
        pr_obj = GithubPullRequest(repository_id=repo.id,number=number,**values)
        db.add(pr_obj)
        db.flush()

    # Generate verified SkillEvidence for attributable merged PR
    if values.get('merged') and uid and repo.project_id:
        existing_ev = db.scalar(select(SkillEvidence).where(SkillEvidence.user_id == uid, SkillEvidence.pull_request_id == pr_obj.id))
        if not existing_ev:
            ev = SkillEvidence(
                user_id=uid,
                project_id=repo.project_id,
                pull_request_id=pr_obj.id,
                skill_name="GitHub Telemetry & Engineering Proof",
                evidence_kind="github_pr_merged",
                explanation=f"Merged Pull Request #{number}: {values['title']}"
            )
            db.add(ev)
