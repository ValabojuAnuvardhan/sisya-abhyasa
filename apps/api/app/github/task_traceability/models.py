import uuid
from datetime import datetime
from sqlalchemy import DateTime, ForeignKey, String, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base

class TaskGitBranch(Base):
    __tablename__ = 'task_git_branches'
    __table_args__ = (
        UniqueConstraint('task_id', 'branch_name', name='uq_task_git_branches_task_branch'),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    task_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey('tasks.id', ondelete='CASCADE'),
        nullable=False,
        index=True
    )
    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey('projects.id', ondelete='CASCADE'),
        nullable=False,
        index=True
    )
    branch_name: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

class TaskCommit(Base):
    __tablename__ = 'task_commits'
    __table_args__ = (
        UniqueConstraint('task_id', 'github_commit_id', name='uq_task_commits_task_commit_id'),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    task_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey('tasks.id', ondelete='CASCADE'),
        nullable=False,
        index=True
    )
    github_commit_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey('github_commits.id', ondelete='CASCADE'),
        nullable=False,
        index=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

class TaskPullRequest(Base):
    __tablename__ = 'task_pull_requests'
    __table_args__ = (
        UniqueConstraint('github_pr_id', name='uq_task_pull_requests_github_pr_id'),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    task_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey('tasks.id', ondelete='CASCADE'),
        unique=True,
        index=True,
        nullable=False
    )
    github_pr_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey('github_pull_requests.id', ondelete='CASCADE'),
        nullable=False,
        index=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
