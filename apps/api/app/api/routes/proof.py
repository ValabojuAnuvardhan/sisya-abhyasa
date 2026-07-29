import secrets
from uuid import UUID
from fastapi import APIRouter,Depends,HTTPException
from sqlalchemy import select, or_
from sqlalchemy.orm import Session
from app.core.auth import AuthPrincipal,require_principal
from app.db.session import get_db
from app.models.user import User,StudentProfile
from app.models.project import Project,Task,ProjectMember
from app.models.github import ProjectRepository,GithubPullRequest,SkillEvidence

router=APIRouter(tags=['proof-of-work'])

def _user(principal,db):
    u=db.scalar(select(User).where(User.auth_subject==principal.subject))
    if not u: raise HTTPException(404,'User not found')
    return u

def _safe_projection(user,db):
    profile=db.scalar(select(StudentProfile).where(StudentProfile.user_id==user.id))
    member_project_ids=select(ProjectMember.project_id).where(ProjectMember.user_id==user.id,ProjectMember.status=='active')
    projects=db.scalars(select(Project).where(or_(Project.creator_id==user.id,Project.id.in_(member_project_ids))).order_by(Project.updated_at.desc())).all()
    out=[]
    for project in projects:
        repo=db.scalar(select(ProjectRepository).where(ProjectRepository.project_id==project.id))
        if not repo: continue
        prs=db.scalars(select(GithubPullRequest).where(GithubPullRequest.repository_id==repo.id,GithubPullRequest.user_id==user.id,GithubPullRequest.merged==True)).all()
        contributions=[]
        for pr in prs:
            task=db.get(Task,pr.task_id) if pr.task_id else None
            skills=db.scalars(select(SkillEvidence).where(SkillEvidence.user_id==user.id,SkillEvidence.project_id==project.id,SkillEvidence.pull_request_id==pr.id).order_by(SkillEvidence.skill_name)).all()
            contributions.append({'pull_request_number':pr.number,'title':pr.title,'status':'merged','task':task.title if task else None,'skills':[{'name':s.skill_name,'evidence_kind':s.evidence_kind,'explanation':s.explanation} for s in skills]})
        if contributions:
            out.append({'project_id':str(project.id),'title':project.title,'description':project.description,'difficulty':project.difficulty,'repository_visibility':'private' if repo.is_private else 'public','contributions':contributions})
    return {'student':{'name':user.full_name or 'Student','target_role':profile.target_role if profile else None,'experience_level':profile.experience_level if profile else None},'projects':out,'notice':'Evidence is derived from attributed, merged GitHub pull requests linked to project work. Demonstrated skills are evidence of application, not expertise ratings or certificates.'}

@router.get('/proof-of-work/me')
def private_preview(principal:AuthPrincipal=Depends(require_principal),db:Session=Depends(get_db)):
    user=_user(principal,db); profile=db.scalar(select(StudentProfile).where(StudentProfile.user_id==user.id)); data=_safe_projection(user,db)
    data['publishing']={'public':bool(profile and profile.profile_public),'slug':profile.public_slug if profile else None}
    return data

@router.post('/proof-of-work/publish')
def publish(principal:AuthPrincipal=Depends(require_principal),db:Session=Depends(get_db)):
    user=_user(principal,db); profile=db.scalar(select(StudentProfile).where(StudentProfile.user_id==user.id))
    if not profile: raise HTTPException(400,'Complete your student profile first')
    if not profile.public_slug:
        while True:
            slug=secrets.token_urlsafe(12).replace('_','').replace('-','')
            if not db.scalar(select(StudentProfile).where(StudentProfile.public_slug==slug)): profile.public_slug=slug; break
    profile.profile_public=True; db.commit()
    return {'public':True,'slug':profile.public_slug}

@router.post('/proof-of-work/unpublish')
def unpublish(principal:AuthPrincipal=Depends(require_principal),db:Session=Depends(get_db)):
    user=_user(principal,db); profile=db.scalar(select(StudentProfile).where(StudentProfile.user_id==user.id))
    if not profile: raise HTTPException(404,'Student profile not found')
    profile.profile_public=False; db.commit(); return {'public':False,'slug':profile.public_slug}

@router.get('/public/proof-of-work/{slug}')
def public_proof(slug:str,db:Session=Depends(get_db)):
    profile=db.scalar(select(StudentProfile).where(StudentProfile.public_slug==slug,StudentProfile.profile_public==True))
    if not profile: raise HTTPException(404,'Proof-of-Work profile not found')
    user=db.get(User,profile.user_id); return _safe_projection(user,db)
