"""
AI Mentor 2.0 Pydantic Schemas
"""

import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class MentorObservationResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    project_id: Optional[uuid.UUID] = None
    observation_type: str = Field(..., description="Type: 'daily_goal', 'pr_review', 'refactor', 'risk_alert'")
    title: str
    content: str
    action_url: Optional[str] = None
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


class DailyGoalCreate(BaseModel):
    title: str = Field(..., max_length=255)
    project_id: Optional[uuid.UUID] = None
    target_minutes: int = Field(default=60, gt=0)


class DailyGoalResponse(BaseModel):
    id: uuid.UUID
    title: str
    status: str = Field(default="pending")  # 'pending', 'in_progress', 'completed'
    target_minutes: int
    created_at: datetime
