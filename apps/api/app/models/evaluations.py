"""
Śiṣya Abhyāsa v1.1.0 Database Models

Includes Dynamic Skill Proficiencies, AI Mentor Observations, Reproducible Project Evaluations,
and Recruiter Profile Preferences.
"""

import uuid
from datetime import datetime
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text, JSON, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class UserSkillProficiency(Base):
    """
    Extensible Dynamic Skill Graph Model.
    Stores inferred skill proficiency scores dynamically without fixed table columns.
    """
    __tablename__ = "user_skill_proficiencies"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    skill_name: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    category: Mapped[str] = mapped_column(String(50), default="General", nullable=False)
    score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    confidence: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    evidence_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    last_updated: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    user: Mapped["User"] = relationship()


class MentorObservation(Base):
    """
    Proactive AI Mentor Observation Feed.
    Stores daily goals, PR reviews, refactor suggestions, and risk alerts emitted by AI Mentor 2.0.
    """
    __tablename__ = "mentor_observations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    project_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=True)
    observation_type: Mapped[str] = mapped_column(String(50), nullable=False)  # 'daily_goal', 'pr_review', 'refactor', 'risk_alert'
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    action_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user: Mapped["User"] = relationship()


class ProjectEvaluation(Base):
    """
    Reproducible AI Project Evaluation Engine Model.
    Stores 10-dimension evaluation scores, career assets, and reproducibility metadata (model, prompt version).
    """
    __tablename__ = "project_evaluations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), index=True, nullable=False)
    
    overall_score: Mapped[float] = mapped_column(Float, nullable=False)
    architecture_score: Mapped[float] = mapped_column(Float, nullable=False)
    code_quality_score: Mapped[float] = mapped_column(Float, nullable=False)
    testing_score: Mapped[float] = mapped_column(Float, nullable=False)
    security_score: Mapped[float] = mapped_column(Float, nullable=False)
    collaboration_score: Mapped[float] = mapped_column(Float, nullable=False)
    
    strengths: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    weaknesses: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    resume_bullets: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    linkedin_summary: Mapped[str] = mapped_column(Text, nullable=False)
    interview_questions: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    badge_level: Mapped[str] = mapped_column(String(50), nullable=False)  # 'Production Ready', 'Gold', 'Silver'

    # Reproducibility metadata
    eval_version: Mapped[str] = mapped_column(String(20), default="1.1.0", nullable=False)
    model_name: Mapped[str] = mapped_column(String(100), default="gemini-3.6-flash", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    project: Mapped["Project"] = relationship()


class RecruiterSettings(Base):
    """
    Recruiter View Settings Model.
    Stores custom recruiter view preferences without duplicating existing user or profile data.
    """
    __tablename__ = "recruiter_settings"

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    custom_headline: Mapped[str | None] = mapped_column(String(255), nullable=True)
    theme: Mapped[str] = mapped_column(String(50), default="default", nullable=False)
    featured_project_ids: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    is_public: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user: Mapped["User"] = relationship()
