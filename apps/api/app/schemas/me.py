import uuid
from pydantic import BaseModel, ConfigDict, Field

class SkillRead(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    model_config = ConfigDict(from_attributes=True)

class ProfileUpdate(BaseModel):
    full_name: str | None = Field(default=None, max_length=120)
    headline: str | None = Field(default=None, max_length=255)
    bio: str | None = Field(default=None, max_length=1000)
    location: str | None = Field(default=None, max_length=120)
    avatar_url: str | None = Field(default=None, max_length=500)
    education_year: str | None = Field(default=None, max_length=40)
    target_role: str | None = Field(default=None, max_length=120)
    experience_level: str | None = Field(default=None, max_length=30)
    interests: str | None = Field(default=None, max_length=500)
    github_username: str | None = Field(default=None, max_length=100)
    profile_public: bool | None = None
    skill_slugs: list[str] | None = Field(default=None, max_length=30)
    onboarding_completed: bool | None = None

class MeRead(BaseModel):
    id: uuid.UUID
    email: str | None
    full_name: str | None
    headline: str | None = None
    bio: str | None = None
    location: str | None = None
    avatar_url: str | None = None
    education_year: str | None
    target_role: str | None
    experience_level: str | None
    interests: str | None
    github_username: str | None = None
    profile_public: bool
    onboarding_completed: bool
    skills: list[SkillRead]
