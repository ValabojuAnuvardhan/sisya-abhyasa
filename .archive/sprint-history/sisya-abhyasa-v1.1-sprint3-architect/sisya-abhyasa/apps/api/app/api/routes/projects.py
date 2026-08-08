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
