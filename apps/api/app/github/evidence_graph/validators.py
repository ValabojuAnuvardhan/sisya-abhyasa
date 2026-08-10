import uuid
from typing import Tuple
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.project import Project, Milestone, Task, ProjectMember

def validate_project_access(db: Session, user: User, project_id: uuid.UUID) -> Project:
    project = db.scalar(select(Project).where(Project.id == project_id))
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    if project.creator_id != user.id:
        member = db.scalar(
            select(ProjectMember).where(
                ProjectMember.project_id == project.id,
                ProjectMember.user_id == user.id,
                ProjectMember.status == 'active'
            )
        )
        if not member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User does not have access to this project"
            )

    return project

def validate_task_access(db: Session, user: User, task_id: uuid.UUID) -> Tuple[Task, Milestone, Project]:
    task = db.scalar(select(Task).where(Task.id == task_id))
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    milestone = db.scalar(select(Milestone).where(Milestone.id == task.milestone_id))
    if not milestone:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task milestone not found")

    project = validate_project_access(db, user, milestone.project_id)
    return task, milestone, project
