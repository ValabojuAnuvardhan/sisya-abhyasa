import re
from urllib.parse import urlparse
from uuid import UUID
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.core.auth import AuthPrincipal, require_principal
from app.db.session import get_db
from app.models.user import User
from app.models.project import Project, ProjectMember, Milestone, Task, TeamSpaceSettings, TeamMessage, TeamMessageReference
from app.models.github import ProjectRepository, GithubPullRequest

router=APIRouter(tags=['team-space'])

class MessageCreate(BaseModel):
    body: str = Field(min_length=1,max_length=4000)
    mentioned_user_ids: list[UUID] = []
class MeetingUpdate(BaseModel): meeting_url: str|None=None

def user_for(principal,db):
    u=db.scalar(select(User).where(User.auth_subject==principal.subject))
    if not u: raise HTTPException(404,'User not found')
    return u

def active_member(project_id,user_id,db):
    return db.scalar(select(ProjectMember).where(ProjectMember.project_id==project_id,ProjectMember.user_id==user_id,ProjectMember.status=='active'))

def project_access(project_id,user,db):
    p=db.scalar(select(Project).where(Project.id==project_id))
    if not p or (p.creator_id!=user.id and not active_member(project_id,user.id,db)): raise HTTPException(404,'Project not found')
    return p

def owner_access(project_id,user,db):
    p=db.scalar(select(Project).where(Project.id==project_id,Project.creator_id==user.id))
    if not p: raise HTTPException(404,'Project not found')
    return p

def task_index(project_id,db):
    rows=db.execute(select(Task,Milestone).join(Milestone,Task.milestone_id==Milestone.id).where(Milestone.project_id==project_id).order_by(Milestone.position,Task.position)).all()
    return {i+1:t for i,(t,m) in enumerate(rows)}

def pr_index(project_id,db):
    repo=db.scalar(select(ProjectRepository).where(ProjectRepository.project_id==project_id))
    if not repo: return {}
    return {p.number:p for p in db.scalars(select(GithubPullRequest).where(GithubPullRequest.repository_id==repo.id)).all()}

def serialize_messages(project_id,db):
    rows=db.execute(select(TeamMessage,User).outerjoin(User,User.id==TeamMessage.author_user_id).where(TeamMessage.project_id==project_id).order_by(TeamMessage.created_at.asc()).limit(250)).all()
    result=[]
    for m,u in rows:
        refs=db.scalars(select(TeamMessageReference).where(TeamMessageReference.message_id==m.id)).all()
        result.append({'id':str(m.id),'body':m.body,'author_kind':m.author_kind,'author_user_id':str(m.author_user_id) if m.author_user_id else None,'author_name':'Śiṣya Mentor' if m.author_kind=='mentor' else ((u.full_name or u.email or 'Student') if u else 'Former member'),'created_at':m.created_at,'references':[{'type':r.target_type,'target_id':str(r.target_id),'label':r.label} for r in refs]})
    return result

def add_reference(db,message,target_type,target_id,label):
    db.add(TeamMessageReference(message_id=message.id,target_type=target_type,target_id=target_id,label=label))

def resolve_refs(project_id,message,payload,db):
    tasks=task_index(project_id,db); prs=pr_index(project_id,db); seen=set(); refs=[]
    for n in {int(x) for x in re.findall(r'(?i)\bTask\s*#(\d+)\b',payload.body)}:
        t=tasks.get(n)
        if t: refs.append(('task',t.id,f'Task #{n}: {t.title}'))
    for n in {int(x) for x in re.findall(r'(?i)\bPR\s*#(\d+)\b',payload.body)}:
        pr=prs.get(n)
        if pr: refs.append(('pr',pr.id,f'PR #{n}: {pr.title}'))
    for uid in payload.mentioned_user_ids:
        pm=active_member(project_id,uid,db); u=db.get(User,uid)
        if pm and u: refs.append(('user',u.id,'@'+(u.full_name or u.email or 'Student')))
    for typ,tid,label in refs:
        key=(typ,tid)
        if key not in seen: add_reference(db,message,typ,tid,label); seen.add(key)
    return refs

def mentor_response(project_id,student_message,refs,db):
    task_refs=[x for x in refs if x[0]=='task']; pr_refs=[x for x in refs if x[0]=='pr']
    pieces=[]
    if task_refs:
        t=db.get(Task,task_refs[0][1]); pieces.append(f"{task_refs[0][2]} requires: {t.completion_criteria}")
    if pr_refs:
        pr=db.get(GithubPullRequest,pr_refs[0][1]); pieces.append(f"{pr_refs[0][2]} is {'merged' if pr.merged else pr.state} and {'is' if pr.task_id else 'is not'} linked to a project task.")
    context=' '.join(pieces) if pieces else 'I can use this project’s tasks, completion criteria, team membership, and captured GitHub PR metadata when you reference them.'
    limits=" I do not have verified test results or private code-diff analysis here, so I will not claim implementation correctness without that evidence."
    return f"Project-context guidance: {context} For your question — {student_message.strip()} — compare the referenced task's completion criteria with the trusted PR/task evidence, identify the smallest missing requirement, and verify it before marking the task Done.{limits}"

@router.get('/projects/{project_id}/team-space')
def get_team_space(project_id:UUID,principal:AuthPrincipal=Depends(require_principal),db:Session=Depends(get_db)):
    user=user_for(principal,db); p=project_access(project_id,user,db); settings=db.get(TeamSpaceSettings,project_id)
    members=db.execute(select(ProjectMember,User).join(User,User.id==ProjectMember.user_id).where(ProjectMember.project_id==project_id,ProjectMember.status=='active').order_by(ProjectMember.joined_at)).all()
    return {'project_id':str(project_id),'my_role':'owner' if p.creator_id==user.id else 'contributor','meeting_url':settings.meeting_url if settings else None,'members':[{'user_id':str(u.id),'name':u.full_name or u.email or 'Student','role':pm.role} for pm,u in members],'messages':serialize_messages(project_id,db),'reference_help':'Use Task #N and PR #N in messages. Select teammates to create structured @mentions. Use @mentor for project-context guidance.'}

@router.post('/projects/{project_id}/team-space/messages',status_code=201)
def post_message(project_id:UUID,payload:MessageCreate,principal:AuthPrincipal=Depends(require_principal),db:Session=Depends(get_db)):
    user=user_for(principal,db); project_access(project_id,user,db); body=payload.body.strip()
    m=TeamMessage(project_id=project_id,author_user_id=user.id,author_kind='student',body=body); db.add(m); db.flush(); refs=resolve_refs(project_id,m,payload,db)
    if re.search(r'(?i)(^|\s)@mentor\b',body):
        mentor=TeamMessage(project_id=project_id,author_user_id=None,author_kind='mentor',body=mentor_response(project_id,body,refs,db)); db.add(mentor); db.flush()
        for typ,tid,label in refs:
            if typ in ('task','pr'): add_reference(db,mentor,typ,tid,label)
    db.commit(); return {'created':True,'messages':serialize_messages(project_id,db)}

@router.patch('/projects/{project_id}/team-space/meeting')
def update_meeting(project_id:UUID,payload:MeetingUpdate,principal:AuthPrincipal=Depends(require_principal),db:Session=Depends(get_db)):
    user=user_for(principal,db); owner_access(project_id,user,db); url=(payload.meeting_url or '').strip() or None
    if url:
        parsed=urlparse(url)
        if parsed.scheme!='https' or parsed.hostname not in {'meet.google.com','www.meet.google.com'}: raise HTTPException(400,'V1 meeting link must be a valid https://meet.google.com URL')
    row=db.get(TeamSpaceSettings,project_id)
    if not row: row=TeamSpaceSettings(project_id=project_id); db.add(row)
    row.meeting_url=url; row.updated_by_user_id=user.id; db.commit(); return {'meeting_url':url}
