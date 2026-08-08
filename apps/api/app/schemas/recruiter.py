"""
Recruiter Profile Pydantic Schemas
"""

import uuid
from typing import Optional
from pydantic import BaseModel, Field

from app.schemas.skills_v2 import SkillProficiencyItem


class RecruiterProfileResponse(BaseModel):
    user_id: uuid.UUID
    full_name: Optional[str] = None
    github_username: Optional[str] = None
    custom_headline: Optional[str] = None
    target_role: Optional[str] = None
    is_public: bool = True
    public_url: str
    skills: list[SkillProficiencyItem] = Field(default_factory=list)
    evidence_cards: list[dict] = Field(default_factory=list)
    featured_projects: list[dict] = Field(default_factory=list)
    collaboration_stats: dict = Field(default_factory=dict)
