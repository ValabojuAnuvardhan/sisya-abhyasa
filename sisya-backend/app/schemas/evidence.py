from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class PRReviewRequest(BaseModel):
    pull_request_id: UUID


class SkillDemonstrated(BaseModel):
    skill: str
    confidence: float = Field(default=0.80, ge=0.0, le=1.0)


class InlineComment(BaseModel):
    file: str
    line: int = 1
    comment: str


class PRReviewResponse(BaseModel):
    id: UUID
    pull_request_id: UUID
    summary: str
    strengths: list[str] = []
    improvements: list[str] = []
    inline_comments: list[InlineComment] = []
    skills_demonstrated: list[SkillDemonstrated] = []
    advisory: bool = True
    advisory_label: str = "AI-generated code review — for learning guidance only"
    reviewed_at: datetime

    model_config = ConfigDict(from_attributes=True)


class EvidenceDetail(BaseModel):
    type: str = "pr_review"
    id: str | None = None
    advisory: bool = True
    evidence_link: str | None = None


class SkillEvidenceItem(BaseModel):
    skill: str
    confidence: float
    evidence: list[EvidenceDetail] = []


class StudentSkillsResponse(BaseModel):
    student_id: UUID
    skills: list[SkillEvidenceItem] = []


class ProofOfWorkProject(BaseModel):
    id: UUID
    title: str
    description: str | None = None
    tech_stack: list[str] = []
    role: str = "contributor"


class ProofOfWorkPR(BaseModel):
    id: UUID
    pr_number: int
    title: str | None = None
    repository_name: str | None = None
    merged_at: datetime | None = None


class ProofOfWorkResponse(BaseModel):
    student_id: UUID
    github_username: str | None = None
    target_role: str | None = None
    education_year: int | None = None
    projects: list[ProofOfWorkProject] = []
    projects_count: int = 0
    merged_prs: list[ProofOfWorkPR] = []
    merged_prs_count: int = 0
    skills: list[SkillEvidenceItem] = []
    advisory: str = "AI-assessed · Advisory only · Not professional certification"

