import uuid
from datetime import datetime
from typing import List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.auth import require_principal, AuthPrincipal
from app.db.session import get_db
from app.models.project import Project, Task, Milestone, ProjectSprint, TaskDependency, TaskBlocker, ProjectMember
from app.models.github import GithubPullRequest
from app.github.task_traceability.models import TaskPullRequest
from app.services.dependency_engine import get_project_dependencies, validate_dependency_cycle
from app.services.workload_engine import calculate_project_workload
from app.services.task_planner import get_next_best_action, generate_ai_blocker_suggestion

router = APIRouter(prefix="/execution", tags=["Execution & Intelligence"])

# Schemas
class CreateDependencySchema(BaseModel):
    depends_on_task_id: str
    dependency_type: str = "BLOCKS"

class CreateBlockerSchema(BaseModel):
    reason: str = Field(..., min_length=3)

class CreateSprintSchema(BaseModel):
    name: str = Field(..., min_length=2)
    goal: str = Field(..., min_length=3)
    start_date: datetime
    end_date: datetime
    capacity_hours: float = 40.0

class UpdateTaskSchema(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    estimated_hours: Optional[float] = None
    actual_hours: Optional[float] = None
    due_date: Optional[datetime] = None
    sprint_id: Optional[str] = None
    branch_name: Optional[str] = None
    assigned_user_id: Optional[str] = None

class LinkPrSchema(BaseModel):
    github_pr_id: str

def verify_project_access(db: Session, project_id: uuid.UUID, user_id: uuid.UUID) -> Project:
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if project.creator_id == user_id:
        return project

    member = (
        db.query(ProjectMember)
        .filter(ProjectMember.project_id == project_id, ProjectMember.user_id == user_id, ProjectMember.status == "active")
        .first()
    )
    if not member:
        raise HTTPException(status_code=403, detail="Not authorized to access this project's execution data")

    return project

# ----------------------------
# DEPENDENCY ENDPOINTS
# ----------------------------
@router.get("/projects/{project_id}/dependencies")
def fetch_dependencies(project_id: uuid.UUID, principal: AuthPrincipal = Depends(require_principal), db: Session = Depends(get_db)):
    verify_project_access(db, project_id, principal.user_id)
    return get_project_dependencies(db, project_id)

@router.post("/tasks/{task_id}/dependencies")
def add_task_dependency(task_id: uuid.UUID, schema: CreateDependencySchema, principal: AuthPrincipal = Depends(require_principal), db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    dep_task_id = uuid.UUID(schema.depends_on_task_id)
    dep_task = db.query(Task).filter(Task.id == dep_task_id).first()
    if not dep_task:
        raise HTTPException(status_code=404, detail="Target dependency task not found")

    # Verify project access
    milestone = db.query(Milestone).filter(Milestone.id == task.milestone_id).first()
    verify_project_access(db, milestone.project_id, principal.user_id)

    # Check for duplicate
    existing = (
        db.query(TaskDependency)
        .filter(TaskDependency.task_id == task_id, TaskDependency.depends_on_task_id == dep_task_id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=409, detail="Duplicate dependency link already exists")

    # Check for cycle
    if validate_dependency_cycle(db, task_id, dep_task_id):
        raise HTTPException(status_code=409, detail="Circular dependency detected. Task cannot depend on itself or cause a loop.")

    new_dep = TaskDependency(
        task_id=task_id,
        depends_on_task_id=dep_task_id,
        dependency_type=schema.dependency_type.upper()
    )
    db.add(new_dep)
    db.commit()
    db.refresh(new_dep)
    return {"id": str(new_dep.id), "task_id": str(task_id), "depends_on_task_id": str(dep_task_id), "dependency_type": new_dep.dependency_type}

# ----------------------------
# BLOCKER ENDPOINTS
# ----------------------------
@router.post("/tasks/{task_id}/blockers")
def create_task_blocker(task_id: uuid.UUID, schema: CreateBlockerSchema, principal: AuthPrincipal = Depends(require_principal), db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    milestone = db.query(Milestone).filter(Milestone.id == task.milestone_id).first()
    verify_project_access(db, milestone.project_id, principal.user_id)

    ai_advice = generate_ai_blocker_suggestion(schema.reason, task.title)

    blocker = TaskBlocker(
        task_id=task_id,
        created_by_user_id=principal.user_id,
        reason=schema.reason,
        status="ACTIVE",
        ai_resolution_suggestion=ai_advice
    )
    task.status = "BLOCKED"
    db.add(blocker)
    db.commit()
    db.refresh(blocker)
    return {
        "id": str(blocker.id),
        "task_id": str(task_id),
        "reason": blocker.reason,
        "status": blocker.status,
        "ai_resolution_suggestion": blocker.ai_resolution_suggestion
    }

@router.patch("/blockers/{blocker_id}/resolve")
def resolve_task_blocker(blocker_id: uuid.UUID, principal: AuthPrincipal = Depends(require_principal), db: Session = Depends(get_db)):
    blocker = db.query(TaskBlocker).filter(TaskBlocker.id == blocker_id).first()
    if not blocker:
        raise HTTPException(status_code=404, detail="Blocker not found")

    task = db.query(Task).filter(Task.id == blocker.task_id).first()
    milestone = db.query(Milestone).filter(Milestone.id == task.milestone_id).first()
    verify_project_access(db, milestone.project_id, principal.user_id)

    blocker.status = "RESOLVED"
    blocker.resolved_at = datetime.now()

    # Check remaining active blockers
    remaining_active = (
        db.query(TaskBlocker)
        .filter(TaskBlocker.task_id == blocker.task_id, TaskBlocker.status == "ACTIVE", TaskBlocker.id != blocker_id)
        .count()
    )

    if remaining_active == 0 and (task.status or "").upper() == "BLOCKED":
        task.status = "todo"

    db.commit()
    return {"message": "Blocker resolved successfully", "task_status": task.status}

# ----------------------------
# SPRINT ENDPOINTS
# ----------------------------
@router.get("/projects/{project_id}/sprints")
def fetch_project_sprints(project_id: uuid.UUID, principal: AuthPrincipal = Depends(require_principal), db: Session = Depends(get_db)):
    verify_project_access(db, project_id, principal.user_id)
    sprints = db.query(ProjectSprint).filter(ProjectSprint.project_id == project_id).order_by(ProjectSprint.start_date.desc()).all()
    
    result = []
    for s in sprints:
        s_tasks = db.query(Task).filter(Task.sprint_id == s.id).all()
        done_count = sum(1 for t in s_tasks if (t.status or "").lower() == "done")
        tot_count = len(s_tasks)
        pct = (done_count / tot_count * 100.0) if tot_count > 0 else 0.0

        result.append({
            "id": str(s.id),
            "name": s.name,
            "goal": s.goal,
            "start_date": s.start_date.isoformat(),
            "end_date": s.end_date.isoformat(),
            "status": s.status,
            "capacity_hours": s.capacity_hours,
            "task_count": tot_count,
            "completed_task_count": done_count,
            "progress_percentage": round(pct, 1)
        })
    return result

@router.post("/projects/{project_id}/sprints")
def create_project_sprint(project_id: uuid.UUID, schema: CreateSprintSchema, principal: AuthPrincipal = Depends(require_principal), db: Session = Depends(get_db)):
    verify_project_access(db, project_id, principal.user_id)

    if schema.end_date < schema.start_date:
        raise HTTPException(status_code=422, detail="Sprint end_date must be on or after start_date")

    sprint = ProjectSprint(
        project_id=project_id,
        name=schema.name,
        goal=schema.goal,
        start_date=schema.start_date,
        end_date=schema.end_date,
        capacity_hours=schema.capacity_hours,
        status="ACTIVE"
    )
    db.add(sprint)
    db.commit()
    db.refresh(sprint)
    return {"id": str(sprint.id), "name": sprint.name, "goal": sprint.goal, "status": sprint.status}

# ----------------------------
# WORKLOAD & RECOMMENDATION
# ----------------------------
@router.get("/projects/{project_id}/workload")
def fetch_project_workload(project_id: uuid.UUID, principal: AuthPrincipal = Depends(require_principal), db: Session = Depends(get_db)):
    verify_project_access(db, project_id, principal.user_id)
    return calculate_project_workload(db, project_id)

@router.get("/projects/{project_id}/next-action")
def fetch_next_best_action(project_id: uuid.UUID, principal: AuthPrincipal = Depends(require_principal), db: Session = Depends(get_db)):
    verify_project_access(db, project_id, principal.user_id)
    return get_next_best_action(db, project_id)

# ----------------------------
# TASK UPDATE & KANBAN RULES
# ----------------------------
@router.patch("/tasks/{task_id}")
def update_task_details(task_id: uuid.UUID, schema: UpdateTaskSchema, principal: AuthPrincipal = Depends(require_principal), db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    milestone = db.query(Milestone).filter(Milestone.id == task.milestone_id).first()
    verify_project_access(db, milestone.project_id, principal.user_id)

    # Reject transitioning to DONE if task is blocked or has incomplete dependencies
    if schema.status and schema.status.lower() == "done":
        active_blockers = (
            db.query(TaskBlocker)
            .filter(TaskBlocker.task_id == task_id, TaskBlocker.status == "ACTIVE")
            .count()
        )
        if active_blockers > 0:
            raise HTTPException(status_code=409, detail=f"Task cannot be marked DONE because it has {active_blockers} active blocker(s).")

        # Check incomplete dependencies
        prereqs = db.query(TaskDependency).filter(TaskDependency.task_id == task_id).all()
        for p in prereqs:
            parent_task = db.query(Task).filter(Task.id == p.depends_on_task_id).first()
            if parent_task and (parent_task.status or "").lower() != "done":
                raise HTTPException(status_code=409, detail=f"Task cannot be completed because dependency Task '{parent_task.title}' is still incomplete.")

    if schema.title is not None: task.title = schema.title
    if schema.description is not None: task.description = schema.description
    if schema.status is not None: task.status = schema.status
    if schema.priority is not None: task.priority = schema.priority.upper()
    if schema.estimated_hours is not None: task.estimated_hours = schema.estimated_hours
    if schema.actual_hours is not None: task.actual_hours = schema.actual_hours
    if schema.due_date is not None: task.due_date = schema.due_date
    if schema.sprint_id is not None: task.sprint_id = uuid.UUID(schema.sprint_id) if schema.sprint_id else None
    if schema.branch_name is not None: task.branch_name = schema.branch_name
    if schema.assigned_user_id is not None: task.assigned_user_id = uuid.UUID(schema.assigned_user_id) if schema.assigned_user_id else None

    db.commit()
    db.refresh(task)
    return {
        "id": str(task.id),
        "title": task.title,
        "status": task.status,
        "priority": task.priority,
        "estimated_hours": task.estimated_hours,
        "actual_hours": task.actual_hours
    }

# ----------------------------
# GITHUB TASK LINKAGE
# ----------------------------
@router.post("/tasks/{task_id}/github/pr")
def link_pr_to_task(task_id: uuid.UUID, schema: LinkPrSchema, principal: AuthPrincipal = Depends(require_principal), db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    milestone = db.query(Milestone).filter(Milestone.id == task.milestone_id).first()
    verify_project_access(db, milestone.project_id, principal.user_id)

    pr_id = uuid.UUID(schema.github_pr_id)
    pr = db.query(GithubPullRequest).filter(GithubPullRequest.id == pr_id).first()
    if not pr:
        raise HTTPException(status_code=404, detail="GitHub Pull Request record not found")

    existing_link = db.query(TaskPullRequest).filter(TaskPullRequest.task_id == task_id).first()
    if existing_link:
        existing_link.github_pr_id = pr_id
    else:
        new_link = TaskPullRequest(task_id=task_id, github_pr_id=pr_id)
        db.add(new_link)

    db.commit()
    return {"message": "GitHub Pull Request linked to Task successfully", "task_id": str(task_id), "github_pr_id": str(pr_id)}
