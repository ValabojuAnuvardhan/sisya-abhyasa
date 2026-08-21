import uuid
import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Integer, ARRAY, Text, ForeignKey, JSON, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


def get_utc_now():
    return datetime.datetime.now(datetime.timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=get_utc_now)

    profile = relationship("Profile", back_populates="user", uselist=False)


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True)
    github_username = Column(String, nullable=True)
    education_year = Column(Integer, nullable=True)
    skills = Column(JSON().with_variant(ARRAY(String), "postgresql"), default=[])
    interests = Column(JSON().with_variant(ARRAY(String), "postgresql"), default=[])
    target_role = Column(String, nullable=True)
    completion_pct = Column(Integer, default=0)

    user = relationship("User", back_populates="profile")


class Project(Base):
    __tablename__ = "projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    tech_stack = Column(JSON().with_variant(ARRAY(String), "postgresql"), default=[])

    status = Column(String, default="active")
    created_at = Column(DateTime, default=get_utc_now)

    milestones = relationship("Milestone", back_populates="project", cascade="all, delete-orphan")


class ProjectMember(Base):
    __tablename__ = "project_members"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    role = Column(String, default="contributor")
    status = Column(String, default="approved")
    joined_at = Column(DateTime, default=get_utc_now)


class Milestone(Base):
    __tablename__ = "milestones"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    order = Column(Integer, default=0)
    completion_pct = Column(Integer, default=0)
    created_at = Column(DateTime, default=get_utc_now)

    project = relationship("Project", back_populates="milestones")
    tasks = relationship("Task", back_populates="milestone", cascade="all, delete-orphan")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False)
    milestone_id = Column(UUID(as_uuid=True), ForeignKey("milestones.id"), nullable=True)
    assignee_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    completion_criteria = Column(Text, nullable=True)
    required_skills = Column(JSON().with_variant(ARRAY(String), "postgresql"), default=[])
    status = Column(String, default="todo")
    order = Column(Integer, default=0)
    created_at = Column(DateTime, default=get_utc_now)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)

    milestone = relationship("Milestone", back_populates="tasks")


class TaskStatusHistory(Base):
    __tablename__ = "task_status_histories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    task_id = Column(UUID(as_uuid=True), ForeignKey("tasks.id"), nullable=False)
    changed_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    from_status = Column(String, nullable=True)
    to_status = Column(String, nullable=False)
    changed_at = Column(DateTime, default=get_utc_now)


class Repository(Base):
    __tablename__ = "repositories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False)
    github_repo_id = Column(String, nullable=False, unique=True)
    full_name = Column(String, nullable=False)
    owner_github_username = Column(String, nullable=True)
    linked_at = Column(DateTime, default=get_utc_now)

    commits = relationship("Commit", back_populates="repository", cascade="all, delete-orphan")
    pull_requests = relationship("PullRequest", back_populates="repository", cascade="all, delete-orphan")


class WebhookEvent(Base):
    __tablename__ = "webhook_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    delivery_id = Column(String, unique=True, nullable=False, index=True)
    event_type = Column(String, nullable=False)
    repository_full_name = Column(String, nullable=True)
    received_at = Column(DateTime, default=get_utc_now)
    processed = Column(Boolean, default=False)


class Commit(Base):
    __tablename__ = "commits"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    repository_id = Column(UUID(as_uuid=True), ForeignKey("repositories.id"))
    sha = Column(String, nullable=False, index=True)
    author_github_username = Column(String, nullable=False)
    message = Column(Text, nullable=True)
    committed_at = Column(DateTime, nullable=True)
    files_changed = Column(JSON().with_variant(ARRAY(String), "postgresql"), default=[])
    task_id = Column(UUID(as_uuid=True), ForeignKey("tasks.id"), nullable=True)

    repository = relationship("Repository", back_populates="commits")


class PullRequest(Base):
    __tablename__ = "pull_requests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    repository_id = Column(UUID(as_uuid=True), ForeignKey("repositories.id"))
    pr_number = Column(Integer, nullable=False)
    title = Column(String, nullable=True)
    author_github_username = Column(String, nullable=False)
    state = Column(String, nullable=False)  # open / closed
    merged = Column(Boolean, default=False)
    merged_at = Column(DateTime, nullable=True)
    base_branch = Column(String, nullable=True)
    head_branch = Column(String, nullable=True)
    opened_at = Column(DateTime, nullable=True)

    repository = relationship("Repository", back_populates="pull_requests")
    review = relationship("PRReview", back_populates="pull_request", uselist=False, cascade="all, delete-orphan")


class PRReview(Base):
    __tablename__ = "pr_reviews"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    pull_request_id = Column(UUID(as_uuid=True), ForeignKey("pull_requests.id"), unique=True, index=True, nullable=False)
    summary = Column(Text, nullable=False)
    strengths = Column(JSON().with_variant(ARRAY(String), "postgresql"), default=[])
    improvements = Column(JSON().with_variant(ARRAY(String), "postgresql"), default=[])

    inline_comments = Column(JSON, default=[])
    skills_demonstrated = Column(JSON, default=[])
    advisory = Column(Boolean, default=True)
    advisory_label = Column(String, default="AI-generated code review — for learning guidance only")
    reviewed_at = Column(DateTime, default=get_utc_now)

    pull_request = relationship("PullRequest", back_populates="review")


class SkillEvidence(Base):
    __tablename__ = "skill_evidence"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), index=True, nullable=False)
    skill = Column(String, nullable=False)
    confidence = Column(Float, default=0.80)
    evidence_type = Column(String, default="pr_review")
    evidence_id = Column(UUID(as_uuid=True), nullable=True)
    evidence_link = Column(String, nullable=True)
    advisory = Column(Boolean, default=True)
    created_at = Column(DateTime, default=get_utc_now)

