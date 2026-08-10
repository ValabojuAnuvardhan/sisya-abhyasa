from uuid import UUID
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.core.auth import AuthPrincipal, require_principal
from app.db.session import get_db
from app.models.user import User
from app.github.evidence_graph.schemas import (
    CreateEvidenceLinkRequest,
    EvidenceDecisionRequest,
    EvidenceRecordDTO,
    EvidenceLinkDTO,
    EvidenceBundleDTO,
    EvidenceStoreSummaryResponse,
)
from app.github.evidence_graph.service import EvidenceStoreService
from app.github.evidence_graph.builder import RelationshipBuilder
from app.github.evidence_graph.validators import validate_task_access

router = APIRouter(prefix="/evidence-graph", tags=["evidence-graph"])

def _get_user(principal: AuthPrincipal, db: Session) -> User:
    user = db.scalar(select(User).where(User.auth_subject == principal.subject))
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User profile not found")
    return user

@router.get("/task/{task_id}", response_model=EvidenceBundleDTO)
def get_task_evidence_bundle(
    task_id: UUID,
    principal: AuthPrincipal = Depends(require_principal),
    db: Session = Depends(get_db)
):
    user = _get_user(principal, db)
    return EvidenceStoreService.get_task_evidence_bundle(db, user, task_id)

@router.get("/project/{project_id}", response_model=EvidenceStoreSummaryResponse)
def get_project_evidence_summary(
    project_id: UUID,
    principal: AuthPrincipal = Depends(require_principal),
    db: Session = Depends(get_db)
):
    user = _get_user(principal, db)
    return EvidenceStoreService.get_project_summary(db, user, project_id)

@router.post("/collect/{project_id}", response_model=List[EvidenceRecordDTO])
def collect_project_evidence(
    project_id: UUID,
    principal: AuthPrincipal = Depends(require_principal),
    db: Session = Depends(get_db)
):
    user = _get_user(principal, db)
    return EvidenceStoreService.collect_project_evidence(db, user, project_id)

@router.post("/task/{task_id}/link", response_model=EvidenceLinkDTO)
def create_task_evidence_link(
    task_id: UUID,
    payload: CreateEvidenceLinkRequest,
    principal: AuthPrincipal = Depends(require_principal),
    db: Session = Depends(get_db)
):
    user = _get_user(principal, db)
    task, milestone, project = validate_task_access(db, user, task_id)
    
    link = RelationshipBuilder.create_link(
        db=db,
        project_id=project.id,
        evidence_a_id=UUID(payload.evidence_a_id),
        evidence_b_id=UUID(payload.evidence_b_id),
        relationship=payload.relationship,
        confidence=payload.confidence,
        performed_by=user.id
    )
    return EvidenceStoreService._to_link_dto(link)

@router.post("/record/{evidence_id}/confirm", response_model=EvidenceRecordDTO)
def confirm_evidence_decision(
    evidence_id: UUID,
    payload: EvidenceDecisionRequest,
    principal: AuthPrincipal = Depends(require_principal),
    db: Session = Depends(get_db)
):
    user = _get_user(principal, db)
    return EvidenceStoreService.record_human_decision(db, user, evidence_id, payload)
