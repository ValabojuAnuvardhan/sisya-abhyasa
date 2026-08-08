from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload
from app.core.auth import AuthPrincipal, require_principal
from app.db.session import get_db
from app.models.user import User
from app.models.project import Project, Milestone, Task
from app.schemas.project_architect import ArchitectPlan, CreateProjectRequest, ProjectCreated, ProjectDraftRequest
from app.services.project_architect import local_plan
from app.schemas.workspace import TaskStatusUpdate, MentorQuestion

router=APIRouter(tags=['projects'])

def current_user(principal,db):
    u=db.scalar(select(User).where(User.auth_subject==principal.subject))
    if not u: raise HTTPException(404,'User not found')
    return u

@router.post('/projects/architect',response_model=ArchitectPlan)
def architect(payload:ProjectDraftRequest,principal:AuthPrincipal=Depends(require_principal),db:Session=Depends(get_db)):
    current_user(principal,db)
    return local_plan(payload)

@router.post('/projects',response_model=ProjectCreated,status_code=201)
def create_project(payload:CreateProjectRequest,principal:AuthPrincipal=Depends(require_principal),db:Session=Depends(get_db)):
    user=current_user(principal,db)
    project=Project(creator_id=user.id,title=payload.title,description=payload.description,difficulty=payload.difficulty,status='active',plan_status='accepted')
    db.add(project); db.flush()
    for mi,m in enumerate(payload.plan.milestones,1):
        milestone=Milestone(project_id=project.id,title=m.title,objective=m.objective,position=mi); db.add(milestone); db.flush()
        for ti,t in enumerate(m.tasks,1):
            db.add(Task(milestone_id=milestone.id,title=t.title,description=t.description,completion_criteria=t.completion_criteria,required_skills='\n'.join(t.required_skills),resources='\n'.join(t.resources),position=ti))
    db.commit(); db.refresh(project)
    return ProjectCreated(id=project.id,title=project.title,status=project.status,plan_status=project.plan_status)

@router.get('/projects/{project_id}')
def get_project(project_id:UUID,principal:AuthPrincipal=Depends(require_principal),db:Session=Depends(get_db)):
    user=current_user(principal,db)
    p=db.scalar(select(Project).where(Project.id==project_id,Project.creator_id==user.id).options(selectinload(Project.milestones).selectinload(Milestone.tasks)))
    if not p: raise HTTPException(404,'Project not found')
    return {'id':str(p.id),'title':p.title,'description':p.description,'difficulty':p.difficulty,'status':p.status,'plan_status':p.plan_status,'milestones':[{'id':str(m.id),'title':m.title,'objective':m.objective,'tasks':[{'id':str(t.id),'title':t.title,'description':t.description,'completion_criteria':t.completion_criteria,'required_skills':t.required_skills.splitlines(),'resources':t.resources.splitlines(),'status':t.status} for t in m.tasks]} for m in p.milestones]}

@router.get('/projects')
def list_projects(principal:AuthPrincipal=Depends(require_principal),db:Session=Depends(get_db)):
    user=current_user(principal,db)
    projects=db.scalars(select(Project).where(Project.creator_id==user.id).order_by(Project.updated_at.desc())).all()
    return [{'id':str(p.id),'title':p.title,'description':p.description,'difficulty':p.difficulty,'status':p.status,'updated_at':p.updated_at} for p in projects]

@router.patch('/tasks/{task_id}')
def update_task(task_id:UUID,payload:'TaskStatusUpdate',principal:AuthPrincipal=Depends(require_principal),db:Session=Depends(get_db)):
    user=current_user(principal,db)
    task=db.scalar(select(Task).join(Milestone).join(Project).where(Task.id==task_id,Project.creator_id==user.id))
    if not task: raise HTTPException(404,'Task not found')
    task.status=payload.status
    db.commit(); db.refresh(task)
    return {'id':str(task.id),'status':task.status}

@router.get('/tasks/{task_id}')
def get_task(task_id:UUID,principal:AuthPrincipal=Depends(require_principal),db:Session=Depends(get_db)):
    user=current_user(principal,db)
    task=db.scalar(select(Task).join(Milestone).join(Project).where(Task.id==task_id,Project.creator_id==user.id).options(selectinload(Task.milestone).selectinload(Milestone.project)))
    if not task: raise HTTPException(404,'Task not found')
    return {'id':str(task.id),'project_id':str(task.milestone.project.id),'project_title':task.milestone.project.title,'milestone_title':task.milestone.title,'title':task.title,'description':task.description,'completion_criteria':task.completion_criteria,'required_skills':task.required_skills.splitlines(),'resources':task.resources.splitlines(),'status':task.status}

@router.post('/tasks/{task_id}/mentor')
def ask_task_mentor(task_id:UUID,payload:'MentorQuestion',principal:AuthPrincipal=Depends(require_principal),db:Session=Depends(get_db)):
    user=current_user(principal,db)
    task=db.scalar(select(Task).join(Milestone).join(Project).where(Task.id==task_id,Project.creator_id==user.id).options(selectinload(Task.milestone).selectinload(Milestone.project)))
    if not task: raise HTTPException(404,'Task not found')
    skills=', '.join(task.required_skills.splitlines()) or 'the skills listed in the task'
    answer=f"For '{task.title}' in {task.milestone.project.title}, start from the completion criteria: {task.completion_criteria} Break your work into the smallest testable change, use {skills}, and verify the result before moving the task to In Review. For your question — {payload.question.strip()} — first compare the current behavior with the task objective, isolate one failing assumption, then implement and test the smallest correction."
    return {'answer':answer,'generated_by':'local-demo','notice':'Contextual mentor foundation only. No external AI provider is configured.'}
