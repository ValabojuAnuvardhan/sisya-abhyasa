from datetime import datetime, timezone
from uuid import UUID
from pydantic import BaseModel, EmailStr
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_, select
from sqlalchemy.orm import Session, selectinload
from app.core.auth import AuthPrincipal, require_principal
from app.db.session import get_db
from app.models.user import User
from app.models.project import Project, Milestone, Task, ProjectMember
from app.schemas.project_architect import ArchitectPlan, CreateProjectRequest, ProjectCreated, ProjectDraftRequest
from app.services.project_architect import local_plan
from app.schemas.workspace import TaskStatusUpdate, MentorQuestion
router=APIRouter(tags=['projects'])

class MemberAdd(BaseModel): email: EmailStr
class TaskAssignment(BaseModel): assigned_user_id: UUID|None=None

def current_user(principal,db):
    u=db.scalar(select(User).where(User.auth_subject==principal.subject))
    if not u: raise HTTPException(404,'User not found')
    return u

def membership(project_id,user_id,db):
    return db.scalar(select(ProjectMember).where(ProjectMember.project_id==project_id,ProjectMember.user_id==user_id,ProjectMember.status=='active'))

def accessible_project(project_id,user,db):
    p=db.scalar(select(Project).where(Project.id==project_id))
    if not p or (p.creator_id!=user.id and not membership(project_id,user.id,db)): raise HTTPException(404,'Project not found')
    return p

def owner_project(project_id,user,db):
    p=db.scalar(select(Project).where(Project.id==project_id,Project.creator_id==user.id))
    if not p: raise HTTPException(404,'Project not found')
    return p

@router.post('/projects/architect',response_model=ArchitectPlan)
def architect(payload:ProjectDraftRequest,principal:AuthPrincipal=Depends(require_principal),db:Session=Depends(get_db)):
    current_user(principal,db); return local_plan(payload)

@router.post('/projects',response_model=ProjectCreated,status_code=201)
def create_project(payload:CreateProjectRequest,principal:AuthPrincipal=Depends(require_principal),db:Session=Depends(get_db)):
    user=current_user(principal,db); project=Project(creator_id=user.id,title=payload.title,description=payload.description,difficulty=payload.difficulty,status='active',plan_status='accepted'); db.add(project); db.flush(); db.add(ProjectMember(project_id=project.id,user_id=user.id,role='owner'))
    for mi,m in enumerate(payload.plan.milestones,1):
        milestone=Milestone(project_id=project.id,title=m.title,objective=m.objective,position=mi); db.add(milestone); db.flush()
        for ti,t in enumerate(m.tasks,1): db.add(Task(milestone_id=milestone.id,title=t.title,description=t.description,completion_criteria=t.completion_criteria,required_skills='\n'.join(t.required_skills),resources='\n'.join(t.resources),position=ti))
    db.commit(); db.refresh(project); return ProjectCreated(id=project.id,title=project.title,status=project.status,plan_status=project.plan_status)

@router.get('/projects/{project_id}')
def get_project(project_id:UUID,principal:AuthPrincipal=Depends(require_principal),db:Session=Depends(get_db)):
    user=current_user(principal,db); accessible_project(project_id,user,db)
    p=db.scalar(select(Project).where(Project.id==project_id).options(selectinload(Project.milestones).selectinload(Milestone.tasks)))
    members=db.execute(select(ProjectMember,User).join(User,User.id==ProjectMember.user_id).where(ProjectMember.project_id==project_id).order_by(ProjectMember.joined_at)).all()
    return {'id':str(p.id),'title':p.title,'description':p.description,'difficulty':p.difficulty,'status':p.status,'plan_status':p.plan_status,'discoverable':p.discoverable,'collaboration_pitch':p.collaboration_pitch,'skills_needed':p.skills_needed.splitlines() if p.skills_needed else [],'team_capacity':p.team_capacity,'my_role':'owner' if p.creator_id==user.id else (membership(project_id,user.id,db).role if membership(project_id,user.id,db) else None),'members':[{'id':str(pm.id),'user_id':str(u.id),'full_name':u.full_name or u.email or 'Student','email':u.email,'role':pm.role,'status':pm.status,'joined_at':pm.joined_at,'removed_at':pm.removed_at} for pm,u in members], 'milestones':[{'id':str(m.id),'title':m.title,'objective':m.objective,'tasks':[{'id':str(t.id),'title':t.title,'description':t.description,'completion_criteria':t.completion_criteria,'required_skills':t.required_skills.splitlines(),'resources':t.resources.splitlines(),'status':t.status,'assigned_user_id':str(t.assigned_user_id) if t.assigned_user_id else None} for t in m.tasks]} for m in p.milestones]}

@router.get('/projects')
def list_projects(principal:AuthPrincipal=Depends(require_principal),db:Session=Depends(get_db)):
    user=current_user(principal,db); member_ids=select(ProjectMember.project_id).where(ProjectMember.user_id==user.id,ProjectMember.status=='active'); projects=db.scalars(select(Project).where(or_(Project.creator_id==user.id,Project.id.in_(member_ids))).order_by(Project.updated_at.desc())).all()
    return [{'id':str(p.id),'title':p.title,'description':p.description,'difficulty':p.difficulty,'status':p.status,'role':'owner' if p.creator_id==user.id else 'contributor','updated_at':p.updated_at} for p in projects]

@router.post('/projects/{project_id}/members',status_code=201)
def add_member(project_id:UUID,payload:MemberAdd,principal:AuthPrincipal=Depends(require_principal),db:Session=Depends(get_db)):
    owner=current_user(principal,db); owner_project(project_id,owner,db); target=db.scalar(select(User).where(User.email==str(payload.email).lower()))
    if not target: raise HTTPException(404,'Student account not found')
    if target.id==owner.id: raise HTTPException(400,'Project owner is already a member')
    row=db.scalar(select(ProjectMember).where(ProjectMember.project_id==project_id,ProjectMember.user_id==target.id))
    if row:
        row.status='active'; row.role='contributor'; row.removed_at=None
    else: row=ProjectMember(project_id=project_id,user_id=target.id,role='contributor'); db.add(row)
    db.commit(); db.refresh(row); return {'id':str(row.id),'user_id':str(target.id),'full_name':target.full_name or target.email,'email':target.email,'role':row.role,'status':row.status}

@router.delete('/projects/{project_id}/members/{member_user_id}')
def remove_member(project_id:UUID,member_user_id:UUID,principal:AuthPrincipal=Depends(require_principal),db:Session=Depends(get_db)):
    owner=current_user(principal,db); p=owner_project(project_id,owner,db)
    if member_user_id==p.creator_id: raise HTTPException(400,'Project owner cannot be removed')
    row=db.scalar(select(ProjectMember).where(ProjectMember.project_id==project_id,ProjectMember.user_id==member_user_id,ProjectMember.status=='active'))
    if not row: raise HTTPException(404,'Active member not found')
    row.status='removed'; row.removed_at=datetime.now(timezone.utc); db.commit(); return {'removed':True,'historical_membership_preserved':True}

@router.patch('/tasks/{task_id}/assignment')
def assign_task(task_id:UUID,payload:TaskAssignment,principal:AuthPrincipal=Depends(require_principal),db:Session=Depends(get_db)):
    owner=current_user(principal,db); task=db.scalar(select(Task).join(Milestone).join(Project).where(Task.id==task_id,Project.creator_id==owner.id))
    if not task: raise HTTPException(404,'Task not found')
    if payload.assigned_user_id and not membership(task.milestone.project_id,payload.assigned_user_id,db): raise HTTPException(400,'Task can only be assigned to an active project member')
    task.assigned_user_id=payload.assigned_user_id; db.commit(); return {'id':str(task.id),'assigned_user_id':str(task.assigned_user_id) if task.assigned_user_id else None}

@router.patch('/tasks/{task_id}')
def update_task(task_id:UUID,payload:TaskStatusUpdate,principal:AuthPrincipal=Depends(require_principal),db:Session=Depends(get_db)):
    user=current_user(principal,db); task=db.scalar(select(Task).join(Milestone).where(Task.id==task_id).options(selectinload(Task.milestone)))
    if not task: raise HTTPException(404,'Task not found')
    accessible_project(task.milestone.project_id,user,db); task.status=payload.status; db.commit(); db.refresh(task); return {'id':str(task.id),'status':task.status}

@router.get('/tasks/{task_id}')
def get_task(task_id:UUID,principal:AuthPrincipal=Depends(require_principal),db:Session=Depends(get_db)):
    user=current_user(principal,db); task=db.scalar(select(Task).where(Task.id==task_id).options(selectinload(Task.milestone).selectinload(Milestone.project)))
    if not task: raise HTTPException(404,'Task not found')
    accessible_project(task.milestone.project.id,user,db); return {'id':str(task.id),'project_id':str(task.milestone.project.id),'project_title':task.milestone.project.title,'milestone_title':task.milestone.title,'title':task.title,'description':task.description,'completion_criteria':task.completion_criteria,'required_skills':task.required_skills.splitlines(),'resources':task.resources.splitlines(),'status':task.status,'assigned_user_id':str(task.assigned_user_id) if task.assigned_user_id else None}

@router.post('/tasks/{task_id}/mentor')
def ask_task_mentor(task_id:UUID,payload:MentorQuestion,principal:AuthPrincipal=Depends(require_principal),db:Session=Depends(get_db)):
    user=current_user(principal,db); task=db.scalar(select(Task).where(Task.id==task_id).options(selectinload(Task.milestone).selectinload(Milestone.project)))
    if not task: raise HTTPException(404,'Task not found')
    accessible_project(task.milestone.project.id,user,db); skills=', '.join(task.required_skills.splitlines()) or 'the skills listed in the task'; answer=f"For '{task.title}' in {task.milestone.project.title}, start from the completion criteria: {task.completion_criteria} Break your work into the smallest testable change, use {skills}, and verify the result before moving the task to In Review. For your question — {payload.question.strip()} — first compare the current behavior with the task objective, isolate one failing assumption, then implement and test the smallest correction."
    return {'answer':answer,'generated_by':'local-demo','notice':'Contextual mentor foundation only. No external AI provider is configured.'}
