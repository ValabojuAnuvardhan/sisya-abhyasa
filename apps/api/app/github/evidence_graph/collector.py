import uuid
from abc import ABC, abstractmethod
from typing import List
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.github import ProjectRepository, GithubCommit, GithubPullRequest
from app.github.evidence_graph.models import EvidenceRecord, EvidenceEvent
from app.github.evidence_graph.adapter import GithubAdapter
from app.github.evidence_graph.identity import EvidenceIdentityResolver

class BaseEvidenceCollector(ABC):
    @abstractmethod
    def collect(self, db: Session, project_id: uuid.UUID, student_id: uuid.UUID) -> List[EvidenceRecord]:
        pass

class GitHubCollector(BaseEvidenceCollector):
    def __init__(self, adapter: GithubAdapter | None = None):
        self.adapter = adapter or GithubAdapter()

    def collect(self, db: Session, project_id: uuid.UUID, student_id: uuid.UUID) -> List[EvidenceRecord]:
        repo = db.scalar(select(ProjectRepository).where(ProjectRepository.project_id == project_id))
        if not repo:
            return []

        collected_records: List[EvidenceRecord] = []

        # 1. Collect Commits
        commits = db.scalars(
            select(GithubCommit).where(GithubCommit.repository_id == repo.id)
        ).all()
        for c in commits:
            norm = self.adapter.normalize_commit(c)
            identity = EvidenceIdentityResolver.resolve_or_create(
                db, project_id, norm["source"], norm["provider_entity_id"]
            )
            existing = db.scalar(
                select(EvidenceRecord).where(
                    EvidenceRecord.project_id == project_id,
                    EvidenceRecord.identity_id == identity.id
                )
            )
            if not existing:
                rec = EvidenceRecord(
                    project_id=project_id,
                    student_id=student_id,
                    identity_id=identity.id,
                    source=norm["source"],
                    artifact_type=norm["artifact_type"],
                    artifact_reference=norm["artifact_reference"],
                    origin=norm["origin"],
                    created_from=norm["created_from"],
                    status="discovered",
                    decision="pending",
                    confidence=1.0
                )
                db.add(rec)
                db.flush()
                db.add(EvidenceEvent(
                    evidence_id=rec.id,
                    event_type="INGESTED",
                    performed_by=student_id,
                    reason="Collected from GitHub synchronized commits"
                ))
                collected_records.append(rec)

        # 2. Collect Pull Requests
        prs = db.scalars(
            select(GithubPullRequest).where(GithubPullRequest.repository_id == repo.id)
        ).all()
        for pr in prs:
            norm = self.adapter.normalize_pull_request(pr)
            identity = EvidenceIdentityResolver.resolve_or_create(
                db, project_id, norm["source"], norm["provider_entity_id"]
            )
            existing = db.scalar(
                select(EvidenceRecord).where(
                    EvidenceRecord.project_id == project_id,
                    EvidenceRecord.identity_id == identity.id
                )
            )
            if not existing:
                rec = EvidenceRecord(
                    project_id=project_id,
                    student_id=student_id,
                    identity_id=identity.id,
                    source=norm["source"],
                    artifact_type=norm["artifact_type"],
                    artifact_reference=norm["artifact_reference"],
                    origin=norm["origin"],
                    created_from=norm["created_from"],
                    status="discovered",
                    decision="pending",
                    confidence=1.0
                )
                db.add(rec)
                db.flush()
                db.add(EvidenceEvent(
                    evidence_id=rec.id,
                    event_type="INGESTED",
                    performed_by=student_id,
                    reason="Collected from GitHub synchronized pull requests"
                ))
                collected_records.append(rec)

        db.commit()
        return collected_records
