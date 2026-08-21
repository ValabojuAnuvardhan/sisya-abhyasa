from uuid import UUID
from pydantic import BaseModel, ConfigDict


class ProfileUpdate(BaseModel):
    education_year: int | None = None
    skills: list[str] | None = None
    interests: list[str] | None = None
    target_role: str | None = None
    github_username: str | None = None


class ProfileResponse(BaseModel):
    id: UUID
    user_id: UUID
    github_username: str | None = None
    education_year: int | None = None
    skills: list[str] = []
    interests: list[str] = []
    target_role: str | None = None
    completion_pct: int = 0

    model_config = ConfigDict(from_attributes=True)
