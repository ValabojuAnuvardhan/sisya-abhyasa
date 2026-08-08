from datetime import datetime
from pydantic import BaseModel, Field

class GithubConnectResponse(BaseModel):
    authorization_url: str = Field(..., description="GitHub OAuth authorization URL")

class GithubStatusResponse(BaseModel):
    connected: bool = Field(..., description="Whether user has connected a GitHub account")
    username: str | None = Field(None, description="GitHub username")
    avatar: str | None = Field(None, description="GitHub avatar URL")
    github_user_id: str | None = Field(None, description="GitHub numerical user ID")
    connected_at: datetime | None = Field(None, description="Timestamp when account was first connected")
    last_sync: datetime | None = Field(None, description="Timestamp of last profile sync")

class GithubDisconnectResponse(BaseModel):
    disconnected: bool = Field(True, description="Disconnect operation success indicator")
    message: str = Field("Disconnected successfully", description="Status message")
