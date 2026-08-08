import uuid
from datetime import datetime
from sqlalchemy import Boolean, DateTime, ForeignKey, String, Table, Column, UniqueConstraint, func, Uuid as UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

user_skills = Table(
    "user_skills",
    Base.metadata,
    Column("user_id", UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("skill_id", UUID(as_uuid=True), ForeignKey("skills.id", ondelete="CASCADE"), primary_key=True),
    Column("created_at", DateTime(timezone=True), server_default=func.now(), nullable=False),
)

class User(Base):
    __tablename__ = "users"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    auth_subject: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    email: Mapped[str | None] = mapped_column(String(320), unique=True, nullable=True)
    full_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    profile: Mapped["StudentProfile | None"] = relationship(back_populates="user", cascade="all, delete-orphan", uselist=False)
    skills: Mapped[list["Skill"]] = relationship(secondary=user_skills, back_populates="users")

class StudentProfile(Base):
    __tablename__ = "student_profiles"
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    education_year: Mapped[str | None] = mapped_column(String(40), nullable=True)
    target_role: Mapped[str | None] = mapped_column(String(120), nullable=True)
    experience_level: Mapped[str | None] = mapped_column(String(30), nullable=True)
    interests: Mapped[str | None] = mapped_column(String(500), nullable=True)
    github_user_id: Mapped[str | None] = mapped_column(String(64), unique=True, nullable=True)
    github_username: Mapped[str | None] = mapped_column(String(100), nullable=True)
    profile_public: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    onboarding_completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    user: Mapped[User] = relationship(back_populates="profile")

class Skill(Base):
    __tablename__ = "skills"
    __table_args__ = (UniqueConstraint("slug", name="uq_skills_slug"),)
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), nullable=False)
    users: Mapped[list[User]] = relationship(secondary=user_skills, back_populates="skills")
