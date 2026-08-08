import uuid
from datetime import datetime
from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, UniqueConstraint, func, Uuid as UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

class Project(Base):
    __tablename__='projects'
    id: Mapped[uuid.UUID]=mapped_column(UUID(as_uuid=True),primary_key=True,default=uuid.uuid4)
    creator_id: Mapped[uuid.UUID]=mapped_column(UUID(as_uuid=True),ForeignKey('users.id',ondelete='CASCADE'),nullable=False,index=True)
    title: Mapped[str]=mapped_column(String(255),nullable=False)
    description: Mapped[str]=mapped_column(Text,nullable=False)
    source: Mapped[str]=mapped_column(String(30),nullable=False,default='student')
    difficulty: Mapped[str]=mapped_column(String(30),nullable=False,default='intermediate')
    status: Mapped[str]=mapped_column(String(30),nullable=False,default='draft')
    plan_status: Mapped[str]=mapped_column(String(30),nullable=False,default='draft')
    created_at: Mapped[datetime]=mapped_column(DateTime(timezone=True),server_default=func.now(),nullable=False)
    updated_at: Mapped[datetime]=mapped_column(DateTime(timezone=True),server_default=func.now(),onupdate=func.now(),nullable=False)
    milestones: Mapped[list['Milestone']]=relationship(back_populates='project',cascade='all, delete-orphan',order_by='Milestone.position')

class Milestone(Base):
    __tablename__='milestones'
    __table_args__=(UniqueConstraint('project_id','position',name='uq_milestone_project_position'),)
    id: Mapped[uuid.UUID]=mapped_column(UUID(as_uuid=True),primary_key=True,default=uuid.uuid4)
    project_id: Mapped[uuid.UUID]=mapped_column(UUID(as_uuid=True),ForeignKey('projects.id',ondelete='CASCADE'),nullable=False,index=True)
    title: Mapped[str]=mapped_column(String(255),nullable=False)
    objective: Mapped[str]=mapped_column(Text,nullable=False)
    position: Mapped[int]=mapped_column(Integer,nullable=False)
    project: Mapped[Project]=relationship(back_populates='milestones')
    tasks: Mapped[list['Task']]=relationship(back_populates='milestone',cascade='all, delete-orphan',order_by='Task.position')

class Task(Base):
    __tablename__='tasks'
    __table_args__=(UniqueConstraint('milestone_id','position',name='uq_task_milestone_position'),)
    id: Mapped[uuid.UUID]=mapped_column(UUID(as_uuid=True),primary_key=True,default=uuid.uuid4)
    milestone_id: Mapped[uuid.UUID]=mapped_column(UUID(as_uuid=True),ForeignKey('milestones.id',ondelete='CASCADE'),nullable=False,index=True)
    title: Mapped[str]=mapped_column(String(255),nullable=False)
    description: Mapped[str]=mapped_column(Text,nullable=False)
    completion_criteria: Mapped[str]=mapped_column(Text,nullable=False)
    required_skills: Mapped[str]=mapped_column(Text,nullable=False,default='')
    resources: Mapped[str]=mapped_column(Text,nullable=False,default='')
    status: Mapped[str]=mapped_column(String(30),nullable=False,default='todo')
    position: Mapped[int]=mapped_column(Integer,nullable=False)
    milestone: Mapped[Milestone]=relationship(back_populates='tasks')
