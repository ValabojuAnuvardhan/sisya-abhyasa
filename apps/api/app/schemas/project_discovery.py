from typing import Literal
from pydantic import BaseModel, Field

class ProjectDiscoveryRequest(BaseModel):
    interests: str | None = Field(default=None, max_length=500)
    desired_skills: list[str] = Field(default_factory=list, max_length=12)
    preferred_difficulty: Literal['beginner','intermediate','challenging'] | None = None
    time_commitment: Literal['light','moderate','intensive'] | None = None

class ProjectRecommendation(BaseModel):
    id: str
    title: str
    problem: str
    why_this_matches: str
    difficulty: Literal['beginner','intermediate','challenging']
    suggested_stack: list[str]
    skills_to_practice: list[str]
    skills_to_learn: list[str]
    expected_deliverables: list[str]
    evidence_opportunities: list[str]

class ProjectDiscoveryResponse(BaseModel):
    recommendations: list[ProjectRecommendation] = Field(min_length=3, max_length=5)
    generated_by: Literal['ai','local-demo']
    notice: str
