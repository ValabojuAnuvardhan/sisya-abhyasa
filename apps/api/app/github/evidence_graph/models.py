import uuid
from datetime import datetime
from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base

class EvidenceIdentity(Base):
    __tablename__ = 'evidence_identities'
    __table_args__ = (
        UniqueConstraint('identity_hash', name='uq_evidence_identity_hash'),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey('projects.id', ondelete='CASCADE'),
        nullable=False,
        index=True
    )
    provider: Mapped[str] = mapped_column(String(50), nullable=False)
    provider_entity_id: Mapped[str] = mapped_column(String(255), nullable=False)
    identity_hash: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

class EvidenceRecord(Base):
    __tablename__ = 'evidence_records'

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey('projects.id', ondelete='CASCADE'),
        nullable=False,
        index=True
    )
    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey('users.id', ondelete='CASCADE'),
        nullable=False,
        index=True
    )
    identity_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey('evidence_identities.id', ondelete='CASCADE'),
        nullable=False,
        index=True
    )
    source: Mapped[str] = mapped_column(String(50), nullable=False, default='github')
    artifact_type: Mapped[str] = mapped_column(String(50), nullable=False)
    artifact_reference: Mapped[str] = mapped_column(String(255), nullable=False)
    origin: Mapped[str] = mapped_column(String(50), nullable=False, default='sync')
    created_from: Mapped[str] = mapped_column(String(100), nullable=False, default='Github Sync Pipeline')
    status: Mapped[str] = mapped_column(String(30), nullable=False, default='discovered')
    decision: Mapped[str] = mapped_column(String(30), nullable=False, default='pending')
    confidence: Mapped[float] = mapped_column(Float, nullable=False, default=1.0)
    confidence_explanation_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

class EvidenceLink(Base):
    __tablename__ = 'evidence_links'
    __table_args__ = (
        UniqueConstraint('evidence_a_id', 'evidence_b_id', 'relationship', name='uq_evidence_link_pair_rel'),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey('projects.id', ondelete='CASCADE'),
        nullable=False,
        index=True
    )
    evidence_a_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey('evidence_records.id', ondelete='CASCADE'),
        nullable=False,
        index=True
    )
    evidence_b_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey('evidence_records.id', ondelete='CASCADE'),
        nullable=False,
        index=True
    )
    relationship: Mapped[str] = mapped_column(String(50), nullable=False)
    confidence: Mapped[float] = mapped_column(Float, nullable=False, default=1.0)
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    superseded_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey('evidence_links.id', ondelete='SET NULL'),
        nullable=True
    )
    supersedes: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey('evidence_links.id', ondelete='SET NULL'),
        nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

class EvidenceSkill(Base):
    __tablename__ = 'evidence_skills'
    __table_args__ = (
        UniqueConstraint('evidence_id', 'skill_id', name='uq_evidence_skills_pair'),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    evidence_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey('evidence_records.id', ondelete='CASCADE'),
        nullable=False,
        index=True
    )
    skill_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey('skills.id', ondelete='CASCADE'),
        nullable=False,
        index=True
    )
    confidence: Mapped[float] = mapped_column(Float, nullable=False, default=1.0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

class EvidenceEvent(Base):
    __tablename__ = 'evidence_events'

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    evidence_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey('evidence_records.id', ondelete='CASCADE'),
        nullable=False,
        index=True
    )
    event_type: Mapped[str] = mapped_column(String(50), nullable=False)
    performed_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey('users.id', ondelete='SET NULL'),
        nullable=True
    )
    reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    metadata_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
