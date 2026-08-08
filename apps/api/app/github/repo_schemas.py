from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field

class GithubRepositoryItem(BaseModel):
    github_repo_id: str
    repo_name: str
    owner: str
    full_name: str
    description: str | None = None
    visibility: str = "public"
    language: str | None = None
    default_branch: str = "main"
    html_url: str
    stars: int = 0
    forks: int = 0
    updated_at: str | None = None

    model_config = ConfigDict(from_attributes=True)

class GithubRepositoryListResponse(BaseModel):
    repositories: list[GithubRepositoryItem]
    total_count: int
    page: int
    per_page: int

class LinkRepositoryRequest(BaseModel):
    project_id: UUID
    repository_id: str | int

class ProjectRepositoryResponse(BaseModel):
    linked: bool
    project_id: UUID | None = None
    repository: GithubRepositoryItem | None = None
    linked_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)

class UnlinkRepositoryResponse(BaseModel):
    unlinked: bool
    message: str = "Repository unlinked successfully"
