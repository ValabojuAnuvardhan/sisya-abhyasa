"""
Dynamic Skill Graph Pydantic Schemas
"""

import uuid
from datetime import datetime
from pydantic import BaseModel, Field


class SkillProficiencyItem(BaseModel):
    skill_name: str
    category: str = Field(default="General")
    score: float = Field(..., ge=0.0, le=100.0, description="Proficiency score percentage (0-100%)")
    confidence: float = Field(default=85.0, ge=0.0, le=100.0)
    evidence_count: int = Field(default=0, ge=0)
    last_updated: datetime

    class Config:
        from_attributes = True


class SkillGraphResponse(BaseModel):
    user_id: uuid.UUID
    total_skills: int
    proficiencies: list[SkillProficiencyItem]
