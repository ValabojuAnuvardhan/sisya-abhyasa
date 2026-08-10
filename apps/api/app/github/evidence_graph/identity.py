import hashlib
import uuid
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.github.evidence_graph.models import EvidenceIdentity

class EvidenceIdentityResolver:
    @staticmethod
    def generate_hash(project_id: uuid.UUID, provider: str, provider_entity_id: str) -> str:
        raw = f"{str(project_id)}:{provider.lower()}:{provider_entity_id.strip()}"
        return hashlib.sha256(raw.encode('utf-8')).hexdigest()

    @classmethod
    def resolve_or_create(
        cls,
        db: Session,
        project_id: uuid.UUID,
        provider: str,
        provider_entity_id: str
    ) -> EvidenceIdentity:
        ident_hash = cls.generate_hash(project_id, provider, provider_entity_id)

        existing = db.scalar(
            select(EvidenceIdentity).where(EvidenceIdentity.identity_hash == ident_hash)
        )
        if existing:
            return existing

        identity = EvidenceIdentity(
            project_id=project_id,
            provider=provider.lower(),
            provider_entity_id=provider_entity_id,
            identity_hash=ident_hash
        )
        db.add(identity)
        db.flush()
        return identity
