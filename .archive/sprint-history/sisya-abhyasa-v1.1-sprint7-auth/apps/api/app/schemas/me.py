import uuid
from pydantic import BaseModel, ConfigDict, Field

class SkillRead(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    model_config = ConfigDict(from_attributes=True)

class ProfileUpdate(BaseModel):
    full_name: str | None = Field(default=None, max_length=120)
    education_year: str | None = Field(default=None, max_length=40)
    target_role: str | None = Field(default=None, max_length=120)
    experience_level: str | None = Field(default=None, max_length=30)
    interests: str | None = Field(default=None, max_length=500)
    skill_slugs: list[str] = Field(default_factory=list, max_length=30)
    onboarding_completed: bool | None = None

class MeRead(BaseModel):
    id: uuid.UUID
    email: str | None
    full_name: str | None
    education_year: str | None
    target_role: str | None
    experience_level: str | None
    interests: str | None
    profile_public: bool
    onboarding_completed: bool
    skills: list[SkillRead]
