"""
Śiṣya Abhyāsa Phase E10 — Career Opportunity & Action Models
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy import BigInteger, Boolean, DateTime, Float, ForeignKey, Integer, String, Text, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

class CareerOpportunity(Base):
    """
    Represents job, internship, or career opportunities targeted by students.
    """
    __tablename__ = "career_opportunities"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source: Mapped[str] = mapped_column(String(50), default="user_added", nullable=False)  # external_api, user_added, company_careers
    external_id: Mapped[str | None] = mapped_column(String(100), nullable=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    company_name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    company_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    location: Mapped[str] = mapped_column(String(255), default="Remote", nullable=False)
    remote_type: Mapped[str] = mapped_column(String(50), default="Remote", nullable=False)  # Remote, Hybrid, Onsite
    employment_type: Mapped[str] = mapped_column(String(50), default="Full-time", nullable=False)  # Full-time, Internship, Contract
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    target_roles: Mapped[list] = mapped_column(JSONB, default=list, nullable=False)  # ["Backend Developer"]
    required_skills: Mapped[list] = mapped_column(JSONB, default=list, nullable=False)  # ["Python", "FastAPI", "PostgreSQL", "Docker"]
    preferred_skills: Mapped[list] = mapped_column(JSONB, default=list, nullable=False)  # ["Redis", "AWS"]
    experience_level: Mapped[str] = mapped_column(String(50), default="Entry-level", nullable=False)
    salary_min: Mapped[float | None] = mapped_column(Float, nullable=True)
    salary_max: Mapped[float | None] = mapped_column(Float, nullable=True)
    application_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    status: Mapped[str] = mapped_column(String(30), default="ACTIVE", nullable=False)  # ACTIVE, EXPIRED, CLOSED
    posted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class OpportunityApplication(Base):
    """
    Student job/internship application tracking state.
    Produces 0 Skill Evidence (Tracking only).
    """
    __tablename__ = "opportunity_applications"
    __table_args__ = (UniqueConstraint("user_id", "opportunity_id", name="uq_user_opportunity_application"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    opportunity_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("career_opportunities.id", ondelete="CASCADE"), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(30), default="SAVED", nullable=False)  # SAVED, PREPARING, APPLIED, ASSESSMENT, INTERVIEW, OFFER, REJECTED, WITHDRAWN
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    next_action: Mapped[str | None] = mapped_column(String(255), nullable=True)
    applied_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    opportunity: Mapped[CareerOpportunity] = relationship()


class CareerActionPlan(Base):
    """
    Student Career Action Plan linking E10 opportunities/skill gaps to E8 project tasks & E5 learning modules.
    """
    __tablename__ = "career_action_plans"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    opportunity_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("career_opportunities.id", ondelete="SET NULL"), nullable=True)
    status: Mapped[str] = mapped_column(String(30), default="ACTIVE", nullable=False)  # ACTIVE, COMPLETED, ARCHIVED
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    actions: Mapped[list["CareerAction"]] = relationship(back_populates="action_plan", cascade="all, delete-orphan")


class CareerAction(Base):
    """
    Individual actionable item in a Career Action Plan.
    """
    __tablename__ = "career_actions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    action_plan_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("career_action_plans.id", ondelete="CASCADE"), nullable=False, index=True)
    action_type: Mapped[str] = mapped_column(String(30), nullable=False)  # LEARN, BUILD, PRACTICE, PROVE, PREPARE_RESUME, PREPARE_INTERVIEW, APPLY, FOLLOW_UP
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    skill: Mapped[str | None] = mapped_column(String(100), nullable=True)
    source_type: Mapped[str] = mapped_column(String(50), default="custom", nullable=False)  # task, learning_module, custom
    source_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    priority: Mapped[str] = mapped_column(String(20), default="MEDIUM", nullable=False)  # LOW, MEDIUM, HIGH, CRITICAL
    status: Mapped[str] = mapped_column(String(30), default="PENDING", nullable=False)  # PENDING, IN_PROGRESS, COMPLETED
    due_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    action_plan: Mapped[CareerActionPlan] = relationship(back_populates="actions")
