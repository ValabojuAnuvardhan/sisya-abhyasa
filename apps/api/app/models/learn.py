import uuid
from datetime import datetime
from sqlalchemy import String, Integer, DateTime, ForeignKey, Text, Boolean, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

class LearningRoadmap(Base):
    __tablename__ = "learning_roadmaps"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    target_role: Mapped[str] = mapped_column(String(120), nullable=False)
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    nodes: Mapped[list["LearningRoadmapNode"]] = relationship("LearningRoadmapNode", back_populates="roadmap", cascade="all, delete-orphan", order_by="LearningRoadmapNode.order_index")

class LearningRoadmapNode(Base):
    __tablename__ = "learning_roadmap_nodes"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    roadmap_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("learning_roadmaps.id", ondelete="CASCADE"), index=True, nullable=False)
    phase_number: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    phase_title: Mapped[str] = mapped_column(String(150), nullable=False)
    topic_name: Mapped[str] = mapped_column(String(150), nullable=False)
    why_it_matters: Mapped[str | None] = mapped_column(Text, nullable=True)
    prerequisite: Mapped[str | None] = mapped_column(String(150), nullable=True)
    learning_objective: Mapped[str | None] = mapped_column(Text, nullable=True)
    estimated_hours: Mapped[int] = mapped_column(Integer, default=5, nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="not_started", nullable=False) # not_started, in_progress, completed
    chk_learn: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    chk_practice: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    chk_apply: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    chk_demonstrate: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    order_index: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    roadmap: Mapped[LearningRoadmap] = relationship("LearningRoadmap", back_populates="nodes")
    checklist: Mapped["LearningChecklist | None"] = relationship("LearningChecklist", back_populates="roadmap_node", uselist=False, cascade="all, delete-orphan")
    resources: Mapped[list["LearningResource"]] = relationship("LearningResource", back_populates="roadmap_node", cascade="all, delete-orphan")

class LearningChecklist(Base):
    __tablename__ = "learning_checklists"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    roadmap_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("learning_roadmaps.id", ondelete="CASCADE"), index=True, nullable=False)
    roadmap_node_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("learning_roadmap_nodes.id", ondelete="CASCADE"), unique=True, index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(150), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    roadmap_node: Mapped[LearningRoadmapNode] = relationship("LearningRoadmapNode", back_populates="checklist")
    items: Mapped[list["LearningChecklistItem"]] = relationship("LearningChecklistItem", back_populates="checklist", cascade="all, delete-orphan", order_by="LearningChecklistItem.order_index")

class LearningChecklistItem(Base):
    __tablename__ = "learning_checklist_items"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    checklist_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("learning_checklists.id", ondelete="CASCADE"), index=True, nullable=False)
    roadmap_node_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("learning_roadmap_nodes.id", ondelete="CASCADE"), index=True, nullable=False)
    project_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="SET NULL"), nullable=True)
    task_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("tasks.id", ondelete="SET NULL"), nullable=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    type: Mapped[str] = mapped_column(String(30), nullable=False, default="LEARN") # LEARN, PRACTICE, IMPLEMENT, TEST, APPLY, COMMIT, PULL_REQUEST, MERGE
    order_index: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="NOT_STARTED", nullable=False) # NOT_STARTED, IN_PROGRESS, COMPLETED
    estimated_effort: Mapped[str] = mapped_column(String(50), default="30 mins", nullable=False)
    related_skill: Mapped[str | None] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    checklist: Mapped[LearningChecklist] = relationship("LearningChecklist", back_populates="items")

class LearningResource(Base):
    __tablename__ = "learning_resources"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    roadmap_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("learning_roadmaps.id", ondelete="CASCADE"), index=True, nullable=False)
    roadmap_node_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("learning_roadmap_nodes.id", ondelete="CASCADE"), index=True, nullable=False)
    checklist_item_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("learning_checklist_items.id", ondelete="SET NULL"), nullable=True)
    title: Mapped[str] = mapped_column(String(250), nullable=False)
    source: Mapped[str] = mapped_column(String(50), nullable=False) # YOUTUBE, OFFICIAL_DOCUMENTATION, LEARNING_RESOURCE
    url: Mapped[str] = mapped_column(String(1000), nullable=False)
    topic: Mapped[str] = mapped_column(String(150), nullable=False)
    estimated_duration: Mapped[str | None] = mapped_column(String(50), nullable=True)
    why_recommended: Mapped[str] = mapped_column(Text, nullable=False)
    related_skill: Mapped[str] = mapped_column(String(100), nullable=False)
    resource_type: Mapped[str] = mapped_column(String(50), default="LEARNING_RESOURCE", nullable=False)
    thumbnail_url: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    external_resource_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    roadmap_node: Mapped[LearningRoadmapNode] = relationship("LearningRoadmapNode", back_populates="resources")

class SavedLearningResource(Base):
    __tablename__ = "saved_learning_resources"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    resource_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("learning_resources.id", ondelete="CASCADE"), index=True, nullable=False)
    saved_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

class LearningResourceProgress(Base):
    __tablename__ = "learning_resource_progress"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    resource_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("learning_resources.id", ondelete="CASCADE"), index=True, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="NOT_VIEWED", nullable=False) # NOT_VIEWED, VIEWED, COMPLETED
    viewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


