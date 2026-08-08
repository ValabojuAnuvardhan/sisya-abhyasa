import uuid
from datetime import datetime
from sqlalchemy import BigInteger, Boolean, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint, Uuid as UUID, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

class ProjectRepository(Base):
    __tablename__='project_repositories'
    __table_args__=(UniqueConstraint('github_repository_id',name='uq_project_repositories_github_id'),UniqueConstraint('project_id',name='uq_project_repositories_project'),)
    id: Mapped[uuid.UUID]=mapped_column(UUID(as_uuid=True),primary_key=True,default=uuid.uuid4)
    project_id: Mapped[uuid.UUID]=mapped_column(UUID(as_uuid=True),ForeignKey('projects.id',ondelete='CASCADE'),nullable=False,index=True)
    github_installation_id: Mapped[int]=mapped_column(BigInteger,nullable=False)
    github_repository_id: Mapped[int]=mapped_column(BigInteger,nullable=False)
    owner: Mapped[str]=mapped_column(String(100),nullable=False)
    name: Mapped[str]=mapped_column(String(100),nullable=False)
    full_name: Mapped[str]=mapped_column(String(220),nullable=False)
    html_url: Mapped[str]=mapped_column(String(500),nullable=False)
    is_private: Mapped[bool]=mapped_column(Boolean,nullable=False,default=False)
    created_at: Mapped[datetime]=mapped_column(DateTime(timezone=True),server_default=func.now(),nullable=False)

class GithubWebhookEvent(Base):
    __tablename__='github_webhook_events'
    id: Mapped[uuid.UUID]=mapped_column(UUID(as_uuid=True),primary_key=True,default=uuid.uuid4)
    delivery_id: Mapped[str]=mapped_column(String(100),unique=True,nullable=False,index=True)
    event_type: Mapped[str]=mapped_column(String(80),nullable=False)
    action: Mapped[str|None]=mapped_column(String(80),nullable=True)
    repository_id: Mapped[int|None]=mapped_column(BigInteger,nullable=True,index=True)
    processed: Mapped[bool]=mapped_column(Boolean,nullable=False,default=False)
    received_at: Mapped[datetime]=mapped_column(DateTime(timezone=True),server_default=func.now(),nullable=False)

class GithubCommit(Base):
    __tablename__='github_commits'
    __table_args__=(UniqueConstraint('repository_id','sha',name='uq_github_commit_repo_sha'),)
    id: Mapped[uuid.UUID]=mapped_column(UUID(as_uuid=True),primary_key=True,default=uuid.uuid4)
    repository_id: Mapped[uuid.UUID]=mapped_column(UUID(as_uuid=True),ForeignKey('project_repositories.id',ondelete='CASCADE'),nullable=False,index=True)
    user_id: Mapped[uuid.UUID|None]=mapped_column(UUID(as_uuid=True),ForeignKey('users.id',ondelete='SET NULL'),nullable=True,index=True)
    github_actor_id: Mapped[str|None]=mapped_column(String(64),nullable=True)
    github_actor_login: Mapped[str|None]=mapped_column(String(100),nullable=True)
    sha: Mapped[str]=mapped_column(String(64),nullable=False)
    message: Mapped[str]=mapped_column(Text,nullable=False,default='')
    html_url: Mapped[str|None]=mapped_column(String(500),nullable=True)
    committed_at: Mapped[datetime|None]=mapped_column(DateTime(timezone=True),nullable=True)
    created_at: Mapped[datetime]=mapped_column(DateTime(timezone=True),server_default=func.now(),nullable=False)

class GithubPullRequest(Base):
    __tablename__='github_pull_requests'
    __table_args__=(UniqueConstraint('repository_id','number',name='uq_github_pr_repo_number'),)
    id: Mapped[uuid.UUID]=mapped_column(UUID(as_uuid=True),primary_key=True,default=uuid.uuid4)
    repository_id: Mapped[uuid.UUID]=mapped_column(UUID(as_uuid=True),ForeignKey('project_repositories.id',ondelete='CASCADE'),nullable=False,index=True)
    user_id: Mapped[uuid.UUID|None]=mapped_column(UUID(as_uuid=True),ForeignKey('users.id',ondelete='SET NULL'),nullable=True,index=True)
    task_id: Mapped[uuid.UUID|None]=mapped_column(UUID(as_uuid=True),ForeignKey('tasks.id',ondelete='SET NULL'),nullable=True,index=True)
    github_actor_id: Mapped[str|None]=mapped_column(String(64),nullable=True)
    github_actor_login: Mapped[str|None]=mapped_column(String(100),nullable=True)
    number: Mapped[int]=mapped_column(Integer,nullable=False)
    title: Mapped[str]=mapped_column(String(500),nullable=False)
    state: Mapped[str]=mapped_column(String(30),nullable=False)
    merged: Mapped[bool]=mapped_column(Boolean,nullable=False,default=False)
    html_url: Mapped[str]=mapped_column(String(500),nullable=False)
    updated_at_github: Mapped[datetime|None]=mapped_column(DateTime(timezone=True),nullable=True)
    created_at: Mapped[datetime]=mapped_column(DateTime(timezone=True),server_default=func.now(),nullable=False)
