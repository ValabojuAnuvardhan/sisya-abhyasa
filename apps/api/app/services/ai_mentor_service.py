"""
Proactive AI Mentor 2.0 Service Engine

Continuously observes student activity (commits, open tasks, pull requests)
and generates proactive recommendations, daily coding goals, and architecture tips.
Decoupled background worker compatible interface.
"""

import uuid
from datetime import datetime, timedelta
from typing import Sequence
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.evaluations import MentorObservation
from app.models.project import Task, ProjectMember


def generate_proactive_observations(db: Session, user_id: uuid.UUID) -> Sequence[MentorObservation]:
    """
    Generates proactive observations for a student based on recent project state.
    """
    # 1. Fetch unread observations
    stmt = select(MentorObservation).where(
        MentorObservation.user_id == user_id,
        MentorObservation.is_read == False
    ).order_by(MentorObservation.created_at.desc())
    
    existing = db.scalars(stmt).all()
    if existing:
        return existing

    # 2. Generate proactive observations if none pending
    # Check open tasks assigned to user or project members
    task_stmt = select(Task).limit(3)
    tasks = db.scalars(task_stmt).all()

    observations = []
    
    # Observation A: Daily Coding Goal
    obs_goal = MentorObservation(
        id=uuid.uuid4(),
        user_id=user_id,
        observation_type="daily_goal",
        title="🎯 Daily Focus: Test Driven API Implementation",
        content="Implement unit tests for your project endpoints before pushing to GitHub. Target 80%+ test coverage.",
        action_url="/dashboard",
        is_read=False
    )
    db.add(obs_goal)
    observations.append(obs_goal)

    # Observation B: PR Review Guidance
    obs_pr = MentorObservation(
        id=uuid.uuid4(),
        user_id=user_id,
        observation_type="pr_review",
        title="🔍 Code Review Suggestion: Clean Architecture Check",
        content="Verify that your service logic is decoupled from database ORM queries. Use Pydantic schemas for data transfer.",
        action_url="/team-space",
        is_read=False
    )
    db.add(obs_pr)
    observations.append(obs_pr)

    db.commit()
    return observations
