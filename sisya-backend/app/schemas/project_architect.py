from typing import Optional
from pydantic import BaseModel, Field, model_validator


class ProjectArchitectRequest(BaseModel):
    idea: Optional[str] = Field(default=None, description="Student's project idea description")
    title: Optional[str] = Field(default=None, description="Project title")
    description: Optional[str] = Field(default=None, description="Project description")
    target_users: str = Field(default="college students", description="Target users for the application")
    difficulty: str = Field(default="beginner", description="Target difficulty level")
    available_weeks: int = Field(default=6, description="Total available weeks for project completion")
    desired_stack: Optional[list[str]] = Field(default=[], description="Preferred tech stack")

    @model_validator(mode="before")
    @classmethod
    def populate_idea(cls, values: dict) -> dict:
        if isinstance(values, dict):
            if not values.get("idea"):
                t = values.get("title", "")
                d = values.get("description", "")
                values["idea"] = f"{t}: {d}".strip(": ") or "New Project Idea"
        return values


class ArchitectMilestone(BaseModel):
    title: str
    description: str
    estimated_weeks: int = 1


class ProjectArchitectResponse(BaseModel):
    title: str
    description: str
    tech_stack: list[str] = []
    skills: list[str] = []
    estimated_weeks: int
    milestones: list[ArchitectMilestone] = []
