import uuid
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.github.evidence_graph.models import EvidenceRecord, EvidenceLink, EvidenceEvent

class RelationshipBuilder:
    VALID_RELATIONSHIPS = {
        'implemented_by',
        'contains',
        'merged_into',
        'reviewed_by',
        'approved_by',
        'modifies',
        'produced_by',
        'demonstrates'
    }

    @classmethod
    def create_link(
        cls,
        db: Session,
        project_id: uuid.UUID,
        evidence_a_id: uuid.UUID,
        evidence_b_id: uuid.UUID,
        relationship: str,
        confidence: float = 1.0,
        performed_by: uuid.UUID | None = None
    ) -> EvidenceLink:
        if relationship not in cls.VALID_RELATIONSHIPS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid relationship type '{relationship}'. Valid types: {sorted(cls.VALID_RELATIONSHIPS)}"
            )

        rec_a = db.scalar(select(EvidenceRecord).where(EvidenceRecord.id == evidence_a_id, EvidenceRecord.project_id == project_id))
        rec_b = db.scalar(select(EvidenceRecord).where(EvidenceRecord.id == evidence_b_id, EvidenceRecord.project_id == project_id))

        if not rec_a or not rec_b:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="One or both evidence records were not found for this project"
            )

        existing = db.scalar(
            select(EvidenceLink).where(
                EvidenceLink.evidence_a_id == evidence_a_id,
                EvidenceLink.evidence_b_id == evidence_b_id,
                EvidenceLink.relationship == relationship
            )
        )
        if existing:
            return existing

        link = EvidenceLink(
            project_id=project_id,
            evidence_a_id=evidence_a_id,
            evidence_b_id=evidence_b_id,
            relationship=relationship,
            confidence=confidence,
            version=1
        )
        db.add(link)
        db.flush()

        db.add(EvidenceEvent(
            evidence_id=rec_a.id,
            event_type="LINKED",
            performed_by=performed_by,
            reason=f"Created typed relationship '{relationship}' to evidence record {rec_b.id}"
        ))
        db.commit()
        return link
