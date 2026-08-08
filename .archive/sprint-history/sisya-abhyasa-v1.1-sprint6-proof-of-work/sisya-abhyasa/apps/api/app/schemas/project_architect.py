from typing import Literal
from uuid import UUID
from pydantic import BaseModel, Field

class ProjectDraftRequest(BaseModel):
    title: str=Field(min_length=3,max_length=255)
    description: str=Field(min_length=10,max_length=3000)
    difficulty: Literal['beginner','intermediate','challenging']='intermediate'
    desired_stack: list[str]=Field(default_factory=list,max_length=10)

class ArchitectTask(BaseModel):
    title: str=Field(min_length=3,max_length=255)
    description: str=Field(min_length=10,max_length=1200)
    completion_criteria: str=Field(min_length=5,max_length=1200)
    required_skills: list[str]=Field(default_factory=list,max_length=8)
    resources: list[str]=Field(default_factory=list,max_length=6)

class ArchitectMilestone(BaseModel):
    title: str
    objective: str
    tasks: list[ArchitectTask]=Field(min_length=1,max_length=6)

class ArchitectPlan(BaseModel):
    project_summary: str
    suggested_stack: list[str]=Field(min_length=1,max_length=10)
    completion_definition: list[str]=Field(min_length=2,max_length=8)
    milestones: list[ArchitectMilestone]=Field(min_length=2,max_length=6)
    generated_by: Literal['ai','local-demo']
    notice: str

class CreateProjectRequest(ProjectDraftRequest):
    plan: ArchitectPlan

class ProjectCreated(BaseModel):
    id: UUID
    title: str
    status: str
    plan_status: str
