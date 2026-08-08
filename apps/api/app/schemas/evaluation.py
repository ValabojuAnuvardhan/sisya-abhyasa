"""
AI Project Evaluation Pydantic Schemas
"""

import uuid
from datetime import datetime
from pydantic import BaseModel, Field


class ProjectEvaluationResponse(BaseModel):
    id: uuid.UUID
    project_id: uuid.UUID
    overall_score: float = Field(..., ge=0.0, le=100.0)
    architecture_score: float = Field(..., ge=0.0, le=100.0)
    code_quality_score: float = Field(..., ge=0.0, le=100.0)
    testing_score: float = Field(..., ge=0.0, le=100.0)
    security_score: float = Field(..., ge=0.0, le=100.0)
    collaboration_score: float = Field(..., ge=0.0, le=100.0)
    strengths: list[str] = Field(default_factory=list)
    weaknesses: list[str] = Field(default_factory=list)
    resume_bullets: list[str] = Field(default_factory=list)
    linkedin_summary: str
    interview_questions: list[dict] = Field(default_factory=list)
    badge_level: str = Field(..., description="'Production Ready', 'Gold', 'Silver', 'Bronze'")
    eval_version: str = Field(default="1.1.0")
    model_name: str = Field(default="gemini-3.6-flash")
    created_at: datetime

    class Config:
        from_attributes = True
