from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class TaskCreate(BaseModel):
    project_id: UUID
    milestone_id: UUID | None = None
    title: str
    description: str | None = None
    completion_criteria: str | None = None
    required_skills: list[str] = []
    status: str = "todo"
    order: int = 0


class TaskResponse(BaseModel):
    id: UUID
    project_id: UUID
    milestone_id: UUID | None = None
    assignee_id: UUID | None = None
    title: str
    description: str | None = None
    completion_criteria: str | None = None
    required_skills: list[str] = []
    status: str
    order: int = 0
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TaskStatusUpdate(BaseModel):
    status: str


class TaskAssignUpdate(BaseModel):
    user_id: UUID | None = None


class TaskStatusHistoryResponse(BaseModel):
    id: UUID
    task_id: UUID
    changed_by_id: UUID
    from_status: str | None = None
    to_status: str
    changed_at: datetime

    model_config = ConfigDict(from_attributes=True)


class KanbanBoardResponse(BaseModel):
    backlog: list[TaskResponse] = []
    todo: list[TaskResponse] = []
    in_progress: list[TaskResponse] = []
    in_review: list[TaskResponse] = []
    done: list[TaskResponse] = []


class TaskMentorRequest(BaseModel):
    question: str


class TaskMentorResponse(BaseModel):
    answer: str


class MemberStatusUpdate(BaseModel):
    status: str  # approved, rejected


class TeamMemberResponse(BaseModel):
    id: UUID
    project_id: UUID
    user_id: UUID
    role: str
    status: str
    joined_at: datetime

    model_config = ConfigDict(from_attributes=True)
