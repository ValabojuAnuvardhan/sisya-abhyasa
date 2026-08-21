import uuid
from datetime import datetime
from pydantic import BaseModel, Field
from typing import List, Optional

class WorkPostCreate(BaseModel):
    title: str = Field(..., max_length=255)
    content: str
    post_type: str = Field(default="project_update") # project_update, technical_post, achievement, build_log, project_launch
    project_id: Optional[uuid.UUID] = None
    milestone_id: Optional[uuid.UUID] = None
    github_pr_url: Optional[str] = None

class CommentCreate(BaseModel):
    body: str

class WorkPostResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    author_name: str = "Anuvardhan"
    author_username: str = "anuvardhan"
    author_role: str = "Backend Developer"
    post_type: str
    title: str
    content: str
    project_id: Optional[uuid.UUID] = None
    milestone_id: Optional[uuid.UUID] = None
    github_pr_url: Optional[str] = None
    likes_count: int = 0
    comments_count: int = 0
    shares_count: int = 0
    rebuilds_count: int = 0
    user_has_liked: bool = False
    created_at: datetime

    model_config = {"from_attributes": True}

class RebuildRequest(BaseModel):
    target_role: Optional[str] = "Backend Developer"
    experience_level: Optional[str] = "Intermediate"

class RebuildResponse(BaseModel):
    message: str
    rebuild_id: uuid.UUID
    new_project_id: uuid.UUID
    project_title: str
    project_description: str
    milestones_count: int
    tasks_count: int
