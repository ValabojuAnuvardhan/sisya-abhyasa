from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

class CreateEvidenceLinkRequest(BaseModel):
    evidence_a_id: str = Field(..., description="Source evidence record UUID")
    evidence_b_id: str = Field(..., description="Target evidence record UUID")
    relationship: str = Field(..., description="Relationship type: implemented_by, contains, merged_into, etc.")
    confidence: float = Field(default=1.0, ge=0.0, le=1.0, description="Confidence score between 0.0 and 1.0")

class EvidenceDecisionRequest(BaseModel):
    decision: str = Field(..., description="Decision state: approved, rejected, ignored")
    reason: Optional[str] = Field(default=None, description="Audit reason for decision")

class EvidenceRecordDTO(BaseModel):
    id: str
    project_id: str
    student_id: str
    identity_id: str
    source: str
    artifact_type: str
    artifact_reference: str
    origin: str
    created_from: str
    status: str
    decision: str
    confidence: float
    confidence_explanation: Optional[Dict[str, Any]] = None
    version: int
    created_at: str

class EvidenceLinkDTO(BaseModel):
    id: str
    evidence_a_id: str
    evidence_b_id: str
    relationship: str
    confidence: float
    version: int
    created_at: str

class EvidenceBundleDTO(BaseModel):
    task_id: str
    task_title: str
    project_id: str
    version: int
    status: str
    completion_pct: int
    records: List[EvidenceRecordDTO] = []
    links: List[EvidenceLinkDTO] = []
    skills: List[Dict[str, Any]] = []
    updated_at: str

class EvidenceStoreSummaryResponse(BaseModel):
    project_id: str
    total_identities: int
    total_records: int
    total_links: int
    total_events: int
