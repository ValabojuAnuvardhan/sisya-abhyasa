from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

class AssignBranchRequest(BaseModel):
    branch_name: str = Field(..., min_length=1, max_length=255, description="Git branch name")

class LinkCommitRequest(BaseModel):
    commit_sha: str = Field(..., min_length=7, max_length=64, description="Commit SHA hash")

class LinkPullRequestRequest(BaseModel):
    pr_number: int = Field(..., ge=1, description="GitHub Pull Request number")

class TaskTraceabilityStatusResponse(BaseModel):
    task_id: str
    status: str
    traceability_score_pct: int
    branch_assigned: bool
    commits_count: int
    pr_linked: bool
    merged: bool

class TaskTraceabilityChainResponse(BaseModel):
    task_id: str
    task_title: str
    project_id: str
    branch: Optional[Dict[str, Any]] = None
    commits: List[Dict[str, Any]] = []
    pull_request: Optional[Dict[str, Any]] = None
    traceability_score_pct: int
    status: str
