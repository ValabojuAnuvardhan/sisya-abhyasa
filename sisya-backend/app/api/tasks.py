from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Project, ProjectMember, Milestone, Task, TaskStatusHistory
from app.schemas.task import (
    TaskCreate,
    TaskResponse,
    TaskStatusUpdate,
    TaskAssignUpdate,
    KanbanBoardResponse,
    TaskStatusHistoryResponse,
    TaskMentorRequest,
    TaskMentorResponse,
)
from app.api.deps import get_current_user
from app.ai.client import complete

router = APIRouter()


def verify_project_access(project_id: UUID, user_id: UUID, db: Session) -> Project:
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    if project.owner_id == user_id:
        return project

    member = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == user_id,
        ProjectMember.status == "approved"
    ).first()

    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: You are not an approved member of this project"
        )
    return project


def update_milestone_completion(milestone_id: UUID, db: Session):
    milestone = db.query(Milestone).filter(Milestone.id == milestone_id).first()
    if not milestone:
        return
    total_tasks = db.query(Task).filter(Task.milestone_id == milestone_id).count()
    if total_tasks == 0:
        milestone.completion_pct = 0
    else:
        done_tasks = db.query(Task).filter(
            Task.milestone_id == milestone_id,
            Task.status == "done"
        ).count()
        milestone.completion_pct = int((done_tasks / total_tasks) * 100)
    db.commit()


@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED, include_in_schema=False)
def create_task(
    payload: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    verify_project_access(payload.project_id, current_user.id, db)

    task = Task(
        project_id=payload.project_id,
        milestone_id=payload.milestone_id,
        title=payload.title,
        description=payload.description,
        completion_criteria=payload.completion_criteria,
        required_skills=payload.required_skills,
        status=payload.status,
        order=payload.order
    )
    db.add(task)
    db.commit()
    db.refresh(task)

    # Log initial status history event
    history = TaskStatusHistory(
        task_id=task.id,
        changed_by_id=current_user.id,
        from_status=None,
        to_status=task.status
    )
    db.add(history)
    db.commit()

    if task.milestone_id:
        update_milestone_completion(task.milestone_id, db)

    return task


@router.get("/project/{project_id}/kanban", response_model=KanbanBoardResponse, status_code=status.HTTP_200_OK)
def get_kanban_board(
    project_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    verify_project_access(project_id, current_user.id, db)

    all_tasks = db.query(Task).filter(Task.project_id == project_id).order_by(Task.order.asc()).all()

    board = {
        "backlog": [],
        "todo": [],
        "in_progress": [],
        "in_review": [],
        "done": []
    }

    for t in all_tasks:
        s = t.status.lower() if t.status else "todo"
        if s == "review":
            s = "in_review"
        if s in board:
            board[s].append(t)
        else:
            board["todo"].append(t)

    return KanbanBoardResponse(**board)


@router.get("/{task_id}", response_model=TaskResponse, status_code=status.HTTP_200_OK)
def get_task_detail(
    task_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    verify_project_access(task.project_id, current_user.id, db)
    return task


@router.patch("/{task_id}/status", response_model=TaskResponse, status_code=status.HTTP_200_OK)
def update_task_status(
    task_id: UUID,
    payload: TaskStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    verify_project_access(task.project_id, current_user.id, db)

    from_status = task.status
    to_status = payload.status.lower()
    if to_status == "review":
        to_status = "in_review"

    if from_status != to_status:
        task.status = to_status
        db.commit()
        db.refresh(task)

        # Record immutable status history audit event
        history = TaskStatusHistory(
            task_id=task.id,
            changed_by_id=current_user.id,
            from_status=from_status,
            to_status=to_status
        )
        db.add(history)
        db.commit()

        if task.milestone_id:
            update_milestone_completion(task.milestone_id, db)

    return task


@router.patch("/{task_id}/assign", response_model=TaskResponse, status_code=status.HTTP_200_OK)
def assign_task(
    task_id: UUID,
    payload: TaskAssignUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    project = verify_project_access(task.project_id, current_user.id, db)

    if payload.user_id:
        # Target assignee must be project owner or approved member
        if payload.user_id != project.owner_id:
            member = db.query(ProjectMember).filter(
                ProjectMember.project_id == project.id,
                ProjectMember.user_id == payload.user_id,
                ProjectMember.status == "approved"
            ).first()
            if not member:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Target user is not an approved member of this project"
                )

    task.assignee_id = payload.user_id
    db.commit()
    db.refresh(task)
    return task


@router.post("/{task_id}/mentor", response_model=TaskMentorResponse, status_code=status.HTTP_200_OK)
def ask_task_mentor(
    task_id: UUID,
    payload: TaskMentorRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    project = verify_project_access(task.project_id, current_user.id, db)

    milestone_title = "General Backlog"
    if task.milestone_id:
        ms = db.query(Milestone).filter(Milestone.id == task.milestone_id).first()
        if ms:
            milestone_title = ms.title

    system_prompt = (
        "You are an expert AI software mentor for Śiṣya Abhyāsa. "
        "You are assisting a student developer working on a specific project task. "
        "Provide clear, concise, actionable technical advice.\n\n"
        f"Context:\n"
        f"Project Title: {project.title}\n"
        f"Tech Stack: {', '.join(project.tech_stack or [])}\n"
        f"Milestone: {milestone_title}\n"
        f"Task Title: {task.title}\n"
        f"Task Description: {task.description or 'None'}\n"
        f"Completion Criteria: {task.completion_criteria or 'None'}\n"
        f"Required Skills: {', '.join(task.required_skills or [])}\n"
        f"Task Status: {task.status}\n"
    )

    user_prompt = f"Student Question: {payload.question}"

    answer = complete(prompt=user_prompt, system_prompt=system_prompt)
    return TaskMentorResponse(answer=answer)


@router.get("/{task_id}/history", response_model=list[TaskStatusHistoryResponse], status_code=status.HTTP_200_OK)
def get_task_history(
    task_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    verify_project_access(task.project_id, current_user.id, db)

    history = (
        db.query(TaskStatusHistory)
        .filter(TaskStatusHistory.task_id == task_id)
        .order_by(TaskStatusHistory.changed_at.asc())
        .all()
    )
    return history
