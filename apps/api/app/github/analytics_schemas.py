from typing import Any, Dict, List, Optional
from pydantic import BaseModel

class RepositoryOverviewResponse(BaseModel):
    project_id: str
    repo_name: str
    owner: str
    visibility: str
    language: Optional[str] = None
    default_branch: str
    repository_age_days: int
    last_commit_at: Optional[str] = None
    last_sync_at: Optional[str] = None
    total_commits: int
    total_pull_requests: int
    total_branches: int
    total_contributors: int

class CommitAnalyticsResponse(BaseModel):
    total_commits: int
    today: int
    this_week: int
    this_month: int
    average_commits_per_day: float
    latest_commit: Optional[Dict[str, Any]] = None
    largest_commit: Optional[Dict[str, Any]] = None
    longest_commit_streak_days: int

class PullRequestAnalyticsResponse(BaseModel):
    total_prs: int
    merged: int
    open: int
    closed: int
    merge_rate: float
    average_merge_time_hours: float
    average_review_time_hours: float
    pending_reviews: int

class BranchAnalyticsResponse(BaseModel):
    default_branch: str
    active_branches: int
    merged_branches: int
    recently_created_branches: int
    stale_branches: int

class ContributorItem(BaseModel):
    contributor: str
    commit_count: int
    pr_count: int
    contribution_percentage: float
    avatar_url: Optional[str] = None

class ContributorsAnalyticsResponse(BaseModel):
    contributors: List[ContributorItem]
    total_contributors: int

class WeeklyActivityDay(BaseModel):
    day: str
    commits: int
    prs: int

class WeeklyActivityResponse(BaseModel):
    days: List[WeeklyActivityDay]

class CodeChurnResponse(BaseModel):
    lines_added: int
    lines_deleted: int
    files_changed: int
    average_files_per_commit: float
    largest_commit: Optional[Dict[str, Any]] = None
    smallest_commit: Optional[Dict[str, Any]] = None

class SyncHealthResponse(BaseModel):
    webhook_status: str
    last_sync: Optional[str] = None
    average_sync_duration_seconds: float
    failed_sync_count: int
    retry_count: int
    success_rate: float
    queue_status: str

class DashboardAnalyticsResponse(BaseModel):
    overview: RepositoryOverviewResponse
    commits: CommitAnalyticsResponse
    pull_requests: PullRequestAnalyticsResponse
    branches: BranchAnalyticsResponse
    contributors: ContributorsAnalyticsResponse
    weekly_activity: WeeklyActivityResponse
    code_churn: CodeChurnResponse
    sync_health: SyncHealthResponse
