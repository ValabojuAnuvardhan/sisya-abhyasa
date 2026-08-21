from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class ProjectCreate(BaseModel):
    title: str
    description: str | None = None
    tech_stack: list[str] = []


class ProjectResponse(BaseModel):
    id: UUID
    owner_id: UUID
    title: str
    description: str | None = None
    tech_stack: list[str] = []
    status: str = "active"
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
