from datetime import datetime, timezone
from uuid import UUID
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session
from app.core.auth import AuthPrincipal, require_principal
from app.db.session import get_db
from app.models.user import User, StudentProfile
from app.models.project import Project, ProjectMember, ProjectJoinRequest
from app.api.routes.projects import current_user, owner_project, membership

router=APIRouter(tags=['community'])

class ListingUpdate(BaseModel):
    discoverable: bool
    collaboration_pitch: str|None=Field(default=None,max_length=1000)
    skills_needed: list[str]=Field(default_factory=list,max_length=12)
    team_capacity: int=Field(default=4,ge=2,le=12)
class JoinPayload(BaseModel): message: str|None=Field(default=None,max_length=600)
class Decision(BaseModel): decision: str

def active_count(project_id,db):
    return db.scalar(select(func.count()).select_from(ProjectMember).where(ProjectMember.project_id==project_id,ProjectMember.status=='active')) or 0

def safe_card(p,user,db):
    owner=db.get(User,p.creator_id); profile=db.get(StudentProfile,user.id)
    needed=[x.strip() for x in (p.skills_needed or '').splitlines() if x.strip()]
    own={s.name.lower() for s in user.skills}; have=[x for x in needed if x.lower() in own]; learn=[x for x in needed if x.lower() not in own]
    reasons=[]
    if have: reasons.append('You already have '+', '.join(have[:3]))
    if learn: reasons.append('You could practice or learn '+', '.join(learn[:3]))
    if profile and profile.target_role: reasons.append(f'Your target role is {profile.target_role}')
    req=db.scalar(select(ProjectJoinRequest).where(ProjectJoinRequest.project_id==p.id,ProjectJoinRequest.requester_user_id==user.id))
    count=active_count(p.id,db)
    return {'id':str(p.id),'title':p.title,'pitch':p.collaboration_pitch or p.description[:400],'difficulty':p.difficulty,'skills_needed':needed,'team_size':count,'team_capacity':p.team_capacity,'slots_available':max(p.team_capacity-count,0),'owner_name':owner.full_name or 'Student project owner','match_reasons':reasons[:3] or ['This project is open to collaborators'],'request_status':req.status if req else None}

@router.patch('/projects/{project_id}/discovery')
def update_listing(project_id:UUID,payload:ListingUpdate,principal:AuthPrincipal=Depends(require_principal),db:Session=Depends(get_db)):
    user=current_user(principal,db); p=owner_project(project_id,user,db)
    if payload.discoverable and not (payload.collaboration_pitch or '').strip(): raise HTTPException(400,'Add a short collaboration pitch before publishing')
    p.discoverable=payload.discoverable; p.collaboration_pitch=(payload.collaboration_pitch or '').strip() or None; p.skills_needed='\n'.join(dict.fromkeys(x.strip() for x in payload.skills_needed if x.strip())); p.team_capacity=payload.team_capacity
    db.commit(); return {'discoverable':p.discoverable,'collaboration_pitch':p.collaboration_pitch,'skills_needed':p.skills_needed.splitlines() if p.skills_needed else [],'team_capacity':p.team_capacity}

@router.get('/community/projects')
def discover(principal:AuthPrincipal=Depends(require_principal),db:Session=Depends(get_db)):
    user=current_user(principal,db); rows=db.scalars(select(Project).where(Project.discoverable.is_(True),Project.status=='active',Project.creator_id!=user.id).order_by(Project.updated_at.desc())).all()
    return [safe_card(p,user,db) for p in rows if not membership(p.id,user.id,db)]

@router.get('/community/projects/{project_id}')
def public_project_card(project_id:UUID,principal:AuthPrincipal=Depends(require_principal),db:Session=Depends(get_db)):
    user=current_user(principal,db); p=db.scalar(select(Project).where(Project.id==project_id,Project.discoverable.is_(True),Project.status=='active'))
    if not p: raise HTTPException(404,'Project listing not found')
    return safe_card(p,user,db)

@router.post('/community/projects/{project_id}/join-requests',status_code=201)
def request_join(project_id:UUID,payload:JoinPayload,principal:AuthPrincipal=Depends(require_principal),db:Session=Depends(get_db)):
    user=current_user(principal,db); p=db.scalar(select(Project).where(Project.id==project_id,Project.discoverable.is_(True),Project.status=='active'))
    if not p or p.creator_id==user.id: raise HTTPException(404,'Project listing not found')
    if membership(project_id,user.id,db): raise HTTPException(400,'You are already a project member')
    if active_count(project_id,db)>=p.team_capacity: raise HTTPException(409,'This project currently has no open team slots')
    row=db.scalar(select(ProjectJoinRequest).where(ProjectJoinRequest.project_id==project_id,ProjectJoinRequest.requester_user_id==user.id))
    if row and row.status=='pending': raise HTTPException(409,'Join request already pending')
    if row: row.status='pending'; row.message=(payload.message or '').strip() or None; row.created_at=datetime.now(timezone.utc); row.decided_at=None; row.decided_by_user_id=None
    else: row=ProjectJoinRequest(project_id=project_id,requester_user_id=user.id,message=(payload.message or '').strip() or None); db.add(row)
    db.commit(); db.refresh(row); return {'id':str(row.id),'status':row.status}

@router.get('/projects/{project_id}/join-requests')
def list_requests(project_id:UUID,principal:AuthPrincipal=Depends(require_principal),db:Session=Depends(get_db)):
    owner=current_user(principal,db); owner_project(project_id,owner,db)
    rows=db.execute(select(ProjectJoinRequest,User).join(User,User.id==ProjectJoinRequest.requester_user_id).where(ProjectJoinRequest.project_id==project_id).order_by(ProjectJoinRequest.created_at.desc())).all()
    return [{'id':str(r.id),'requester_user_id':str(u.id),'requester_name':u.full_name or u.email or 'Student','message':r.message,'status':r.status,'created_at':r.created_at} for r,u in rows]

@router.patch('/projects/{project_id}/join-requests/{request_id}')
def decide(project_id:UUID,request_id:UUID,payload:Decision,principal:AuthPrincipal=Depends(require_principal),db:Session=Depends(get_db)):
    owner=current_user(principal,db); p=owner_project(project_id,owner,db)
    if payload.decision not in {'accepted','rejected'}: raise HTTPException(400,'Decision must be accepted or rejected')
    row=db.scalar(select(ProjectJoinRequest).where(ProjectJoinRequest.id==request_id,ProjectJoinRequest.project_id==project_id,ProjectJoinRequest.status=='pending'))
    if not row: raise HTTPException(404,'Pending join request not found')
    if payload.decision=='accepted':
        if active_count(project_id,db)>=p.team_capacity: raise HTTPException(409,'Team capacity reached')
        member=db.scalar(select(ProjectMember).where(ProjectMember.project_id==project_id,ProjectMember.user_id==row.requester_user_id))
        if member: member.status='active'; member.role='contributor'; member.removed_at=None
        else: db.add(ProjectMember(project_id=project_id,user_id=row.requester_user_id,role='contributor'))
    row.status=payload.decision; row.decided_at=datetime.now(timezone.utc); row.decided_by_user_id=owner.id; db.commit()
    return {'id':str(row.id),'status':row.status,'membership_granted':payload.decision=='accepted'}
