import uuid
from typing import Tuple
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.project import Project, Milestone, Task, ProjectMember
from app.models.github import ProjectRepository, GithubCommit, GithubPullRequest

def validate_task_and_project_access(db: Session, user: User, task_id: uuid.UUID) -> Tuple[Task, Milestone, Project]:
    task = db.scalar(select(Task).where(Task.id == task_id))
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    milestone = db.scalar(select(Milestone).where(Milestone.id == task.milestone_id))
    if not milestone:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task milestone not found")

    project = db.scalar(select(Project).where(Project.id == milestone.project_id))
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    # Access check: user is project creator or an active project member
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
                detail="User does not have access to this task's project"
            )

    return task, milestone, project

def validate_commit_repo_match(db: Session, project_id: uuid.UUID, commit_sha: str) -> GithubCommit:
    repo = db.scalar(select(ProjectRepository).where(ProjectRepository.project_id == project_id))
    if not repo:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No GitHub repository linked to this project"
        )

    # Search by full sha or 7-char prefix match
    commit = db.scalar(
        select(GithubCommit).where(
            GithubCommit.repository_id == repo.id,
            (GithubCommit.sha == commit_sha) | (GithubCommit.sha.startswith(commit_sha))
        )
    )
    if not commit:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Commit '{commit_sha}' not found in synchronized repository commits"
        )

    return commit

def validate_pr_repo_match(db: Session, project_id: uuid.UUID, pr_number: int) -> GithubPullRequest:
    repo = db.scalar(select(ProjectRepository).where(ProjectRepository.project_id == project_id))
    if not repo:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No GitHub repository linked to this project"
        )

    pr = db.scalar(
        select(GithubPullRequest).where(
            GithubPullRequest.repository_id == repo.id,
            GithubPullRequest.number == pr_number
        )
    )
    if not pr:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Pull Request #{pr_number} not found in synchronized repository"
        )

    return pr
