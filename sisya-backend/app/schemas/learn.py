from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class SisyachatRequest(BaseModel):
    message: str = Field(..., description="User's concept question or response")
    target_role: Optional[str] = Field(default="Backend Developer")
    skill_gaps: Optional[List[str]] = Field(default=["Docker", "Redis", "System Design"])
    learning_stage: Optional[str] = Field(default="Intermediate")
    chat_history: Optional[List[Dict[str, str]]] = Field(default=None)

class SisyachatResponse(BaseModel):
    reply: str
    persona: str = "ŚiṣyaChat"
    layer: str = "Learn"
    recommended_topics: List[str] = []
    follow_up_quiz: Optional[str] = None

class SkillGapItem(BaseModel):
    skill_name: str
    category: str
    readiness_score: int
    status: str # "strong", "needs_practice", "missing"
    recommended_resource: Optional[str] = None

class LearningDashboardResponse(BaseModel):
    target_role: str
    skill_readiness_percentage: int
    strong_skills: List[str]
    skill_gaps: List[SkillGapItem]
    continue_learning: List[Dict[str, Any]]
    recommended_resources: List[Dict[str, Any]]
    explore_topics: List[Dict[str, Any]]
    next_action: str
