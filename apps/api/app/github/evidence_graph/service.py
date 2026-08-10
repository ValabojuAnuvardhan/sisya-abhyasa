import json
import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.github import GithubCommit, GithubPullRequest
from app.github.evidence_graph.models import EvidenceRecord, EvidenceLink, EvidenceEvent, EvidenceIdentity, EvidenceSkill
from app.github.evidence_graph.collector import GitHubCollector
from app.github.evidence_graph.validators import validate_project_access, validate_task_access
from app.github.evidence_graph.schemas import (
    EvidenceRecordDTO,
    EvidenceLinkDTO,
    EvidenceBundleDTO,
    EvidenceStoreSummaryResponse,
    EvidenceDecisionRequest,
)

class EvidenceStoreService:
    @classmethod
    def collect_project_evidence(cls, db: Session, user: User, project_id: uuid.UUID) -> List[EvidenceRecordDTO]:
        project = validate_project_access(db, user, project_id)
        collector = GitHubCollector()
        records = collector.collect(db, project.id, user.id)
        return [cls._to_record_dto(r) for r in records]

    @classmethod
    def get_task_evidence_bundle(cls, db: Session, user: User, task_id: uuid.UUID) -> EvidenceBundleDTO:
        task, milestone, project = validate_task_access(db, user, task_id)

        # 1. Fetch task evidence records (records directly matching task or linked via EvidenceLink)
        records = db.scalars(
            select(EvidenceRecord).where(
                EvidenceRecord.project_id == project.id,
                EvidenceRecord.artifact_reference == str(task.id)
            )
        ).all()

        record_ids = {r.id for r in records}

        # 2. Fetch linked evidence via EvidenceLink
        links: List[EvidenceLink] = []
        if record_ids:
            links = db.scalars(
                select(EvidenceLink).where(
                    EvidenceLink.project_id == project.id,
                    (EvidenceLink.evidence_a_id.in_(record_ids)) | (EvidenceLink.evidence_b_id.in_(record_ids))
                )
            ).all()

        # Fetch extra linked evidence records
        linked_ids = set()
        for l in links:
            linked_ids.add(l.evidence_a_id)
            linked_ids.add(l.evidence_b_id)
        
        extra_ids = linked_ids - record_ids
        if extra_ids:
            extra_recs = db.scalars(
                select(EvidenceRecord).where(EvidenceRecord.id.in_(extra_ids))
            ).all()
            records.extend(extra_recs)

        # 3. Calculate status and completion percentage
        has_commit = any(r.artifact_type == 'commit' for r in records)
        has_pr = any(r.artifact_type == 'pull_request' for r in records)
        is_merged = False

        for r in records:
            if r.artifact_type == 'pull_request':
                try:
                    pr_uuid = uuid.UUID(r.artifact_reference)
                    gh_pr = db.scalar(select(GithubPullRequest).where(GithubPullRequest.id == pr_uuid))
                    if gh_pr and gh_pr.merged:
                        is_merged = True
                except (ValueError, TypeError):
                    pass

        if is_merged:
            pct = 100
            w_status = "merged"
        elif has_pr:
            pct = 75
            w_status = "in_review"
        elif has_commit:
            pct = 50
            w_status = "in_progress"
        elif records:
            pct = 25
            w_status = "in_progress"
        else:
            pct = 0
            w_status = "discovered"

        record_dtos = [cls._to_record_dto(r) for r in records]
        link_dtos = [cls._to_link_dto(l) for l in links]

        return EvidenceBundleDTO(
            task_id=str(task.id),
            task_title=task.title,
            project_id=str(project.id),
            version=1,
            status=w_status,
            completion_pct=pct,
            records=record_dtos,
            links=link_dtos,
            skills=[],
            updated_at=datetime.now(timezone.utc).isoformat()
        )

    @classmethod
    def record_human_decision(
        cls,
        db: Session,
        user: User,
        evidence_id: uuid.UUID,
        payload: EvidenceDecisionRequest
    ) -> EvidenceRecordDTO:
        evidence = db.scalar(select(EvidenceRecord).where(EvidenceRecord.id == evidence_id))
        if not evidence:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Evidence record not found")

        validate_project_access(db, user, evidence.project_id)

        decision_clean = payload.decision.lower()
        if decision_clean not in ['approved', 'rejected', 'ignored']:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid decision state. Valid values: approved, rejected, ignored"
            )

        evidence.decision = decision_clean
        if decision_clean == 'approved':
            evidence.status = 'verified'
        elif decision_clean == 'rejected':
            evidence.status = 'archived'

        # Log append-only EvidenceEvent
        db.add(EvidenceEvent(
            evidence_id=evidence.id,
            event_type=f"DECISION_{decision_clean.upper()}",
            performed_by=user.id,
            reason=payload.reason
        ))
        db.commit()
        db.refresh(evidence)
        return cls._to_record_dto(evidence)

    @classmethod
    def get_project_summary(cls, db: Session, user: User, project_id: uuid.UUID) -> EvidenceStoreSummaryResponse:
        project = validate_project_access(db, user, project_id)

        tot_ident = db.query(EvidenceIdentity).filter_by(project_id=project.id).count()
        tot_rec = db.query(EvidenceRecord).filter_by(project_id=project.id).count()
        tot_links = db.query(EvidenceLink).filter_by(project_id=project.id).count()
        
        rec_ids = [r.id for r in db.query(EvidenceRecord.id).filter_by(project_id=project.id).all()]
        tot_events = db.query(EvidenceEvent).filter(EvidenceEvent.evidence_id.in_(rec_ids)).count() if rec_ids else 0

        return EvidenceStoreSummaryResponse(
            project_id=str(project.id),
            total_identities=tot_ident,
            total_records=tot_rec,
            total_links=tot_links,
            total_events=tot_events
        )

    @staticmethod
    def _to_record_dto(rec: EvidenceRecord) -> EvidenceRecordDTO:
        expl = None
        if rec.confidence_explanation_json:
            try:
                expl = json.loads(rec.confidence_explanation_json)
            except Exception:
                expl = None

        return EvidenceRecordDTO(
            id=str(rec.id),
            project_id=str(rec.project_id),
            student_id=str(rec.student_id),
            identity_id=str(rec.identity_id),
            source=rec.source,
            artifact_type=rec.artifact_type,
            artifact_reference=rec.artifact_reference,
            origin=rec.origin,
            created_from=rec.created_from,
            status=rec.status,
            decision=rec.decision,
            confidence=rec.confidence,
            confidence_explanation=expl,
            version=rec.version,
            created_at=rec.created_at.isoformat()
        )

    @staticmethod
    def _to_link_dto(link: EvidenceLink) -> EvidenceLinkDTO:
        return EvidenceLinkDTO(
            id=str(link.id),
            evidence_a_id=str(link.evidence_a_id),
            evidence_b_id=str(link.evidence_b_id),
            relationship=link.relationship,
            confidence=link.confidence,
            version=link.version,
            created_at=link.created_at.isoformat()
        )
