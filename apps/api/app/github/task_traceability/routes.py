from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.core.auth import AuthPrincipal, require_principal
from app.db.session import get_db
from app.models.user import User
from app.github.task_traceability.schemas import (
    AssignBranchRequest,
    LinkCommitRequest,
    LinkPullRequestRequest,
    TaskTraceabilityStatusResponse,
    TaskTraceabilityChainResponse,
)
from app.github.task_traceability.service import TaskTraceabilityService

router = APIRouter(prefix="/github/tasks", tags=["github-task-traceability"])

def _get_user(principal: AuthPrincipal, db: Session) -> User:
    user = db.scalar(select(User).where(User.auth_subject == principal.subject))
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User profile not found")
    return user

@router.get("/{task_id}/traceability", response_model=TaskTraceabilityChainResponse)
def get_task_traceability_chain(
    task_id: UUID,
    principal: AuthPrincipal = Depends(require_principal),
    db: Session = Depends(get_db)
):
    user = _get_user(principal, db)
    return TaskTraceabilityService.get_traceability_chain(db, user, task_id)

@router.post("/{task_id}/branch", response_model=TaskTraceabilityStatusResponse)
def assign_task_branch(
    task_id: UUID,
    payload: AssignBranchRequest,
    principal: AuthPrincipal = Depends(require_principal),
    db: Session = Depends(get_db)
):
    user = _get_user(principal, db)
    return TaskTraceabilityService.assign_branch(db, user, task_id, payload)

@router.post("/{task_id}/commit", response_model=TaskTraceabilityStatusResponse)
def link_task_commit(
    task_id: UUID,
    payload: LinkCommitRequest,
    principal: AuthPrincipal = Depends(require_principal),
    db: Session = Depends(get_db)
):
    user = _get_user(principal, db)
    return TaskTraceabilityService.link_commit(db, user, task_id, payload)

@router.post("/{task_id}/pull-request", response_model=TaskTraceabilityStatusResponse)
def link_task_pull_request(
    task_id: UUID,
    payload: LinkPullRequestRequest,
    principal: AuthPrincipal = Depends(require_principal),
    db: Session = Depends(get_db)
):
    user = _get_user(principal, db)
    return TaskTraceabilityService.link_pull_request(db, user, task_id, payload)

@router.post("/{task_id}/auto-link", response_model=TaskTraceabilityStatusResponse)
def auto_link_task_evidence(
    task_id: UUID,
    principal: AuthPrincipal = Depends(require_principal),
    db: Session = Depends(get_db)
):
    user = _get_user(principal, db)
    return TaskTraceabilityService.auto_link_evidence(db, user, task_id)

@router.delete("/{task_id}/pull-request")
def unlink_task_pull_request(
    task_id: UUID,
    principal: AuthPrincipal = Depends(require_principal),
    db: Session = Depends(get_db)
):
    user = _get_user(principal, db)
    return TaskTraceabilityService.unlink_pull_request(db, user, task_id)

@router.get("/{task_id}/status", response_model=TaskTraceabilityStatusResponse)
def get_task_traceability_status(
    task_id: UUID,
    principal: AuthPrincipal = Depends(require_principal),
    db: Session = Depends(get_db)
):
    user = _get_user(principal, db)
    return TaskTraceabilityService.get_task_traceability_status(db, user, task_id)
