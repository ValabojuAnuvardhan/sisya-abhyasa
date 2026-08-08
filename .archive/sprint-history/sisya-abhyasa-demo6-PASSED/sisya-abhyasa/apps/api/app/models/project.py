import uuid
from datetime import datetime
from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
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
    discoverable: Mapped[bool]=mapped_column(Boolean,nullable=False,default=False,index=True)
    collaboration_pitch: Mapped[str|None]=mapped_column(Text,nullable=True)
    skills_needed: Mapped[str|None]=mapped_column(Text,nullable=True)
    team_capacity: Mapped[int]=mapped_column(Integer,nullable=False,default=4)
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
    assigned_user_id: Mapped[uuid.UUID|None]=mapped_column(UUID(as_uuid=True),ForeignKey('users.id',ondelete='SET NULL'),nullable=True)
    milestone: Mapped[Milestone]=relationship(back_populates='tasks')

class ProjectMember(Base):
    __tablename__='project_members'
    __table_args__=(UniqueConstraint('project_id','user_id',name='uq_project_member_user'),)
    id: Mapped[uuid.UUID]=mapped_column(UUID(as_uuid=True),primary_key=True,default=uuid.uuid4)
    project_id: Mapped[uuid.UUID]=mapped_column(UUID(as_uuid=True),ForeignKey('projects.id',ondelete='CASCADE'),nullable=False,index=True)
    user_id: Mapped[uuid.UUID]=mapped_column(UUID(as_uuid=True),ForeignKey('users.id',ondelete='CASCADE'),nullable=False,index=True)
    role: Mapped[str]=mapped_column(String(30),nullable=False,default='contributor')
    status: Mapped[str]=mapped_column(String(30),nullable=False,default='active')
    joined_at: Mapped[datetime]=mapped_column(DateTime(timezone=True),server_default=func.now(),nullable=False)
    removed_at: Mapped[datetime|None]=mapped_column(DateTime(timezone=True),nullable=True)

class TeamSpaceSettings(Base):
    __tablename__='team_space_settings'
    project_id: Mapped[uuid.UUID]=mapped_column(UUID(as_uuid=True),ForeignKey('projects.id',ondelete='CASCADE'),primary_key=True)
    meeting_url: Mapped[str|None]=mapped_column(String(500),nullable=True)
    updated_by_user_id: Mapped[uuid.UUID|None]=mapped_column(UUID(as_uuid=True),ForeignKey('users.id',ondelete='SET NULL'),nullable=True)
    updated_at: Mapped[datetime]=mapped_column(DateTime(timezone=True),server_default=func.now(),onupdate=func.now(),nullable=False)

class TeamMessage(Base):
    __tablename__='team_messages'
    id: Mapped[uuid.UUID]=mapped_column(UUID(as_uuid=True),primary_key=True,default=uuid.uuid4)
    project_id: Mapped[uuid.UUID]=mapped_column(UUID(as_uuid=True),ForeignKey('projects.id',ondelete='CASCADE'),nullable=False,index=True)
    author_user_id: Mapped[uuid.UUID|None]=mapped_column(UUID(as_uuid=True),ForeignKey('users.id',ondelete='SET NULL'),nullable=True,index=True)
    author_kind: Mapped[str]=mapped_column(String(20),nullable=False,default='student')
    body: Mapped[str]=mapped_column(Text,nullable=False)
    created_at: Mapped[datetime]=mapped_column(DateTime(timezone=True),server_default=func.now(),nullable=False,index=True)

class TeamMessageReference(Base):
    __tablename__='team_message_references'
    __table_args__=(UniqueConstraint('message_id','target_type','target_id',name='uq_team_message_reference_target'),)
    id: Mapped[uuid.UUID]=mapped_column(UUID(as_uuid=True),primary_key=True,default=uuid.uuid4)
    message_id: Mapped[uuid.UUID]=mapped_column(UUID(as_uuid=True),ForeignKey('team_messages.id',ondelete='CASCADE'),nullable=False,index=True)
    target_type: Mapped[str]=mapped_column(String(20),nullable=False)
    target_id: Mapped[uuid.UUID]=mapped_column(UUID(as_uuid=True),nullable=False)
    label: Mapped[str]=mapped_column(String(255),nullable=False)


class ProjectJoinRequest(Base):
    __tablename__='project_join_requests'
    __table_args__=(UniqueConstraint('project_id','requester_user_id',name='uq_project_join_request_user'),)
    id: Mapped[uuid.UUID]=mapped_column(UUID(as_uuid=True),primary_key=True,default=uuid.uuid4)
    project_id: Mapped[uuid.UUID]=mapped_column(UUID(as_uuid=True),ForeignKey('projects.id',ondelete='CASCADE'),nullable=False,index=True)
    requester_user_id: Mapped[uuid.UUID]=mapped_column(UUID(as_uuid=True),ForeignKey('users.id',ondelete='CASCADE'),nullable=False,index=True)
    message: Mapped[str|None]=mapped_column(Text,nullable=True)
    status: Mapped[str]=mapped_column(String(20),nullable=False,default='pending')
    created_at: Mapped[datetime]=mapped_column(DateTime(timezone=True),server_default=func.now(),nullable=False)
    decided_at: Mapped[datetime|None]=mapped_column(DateTime(timezone=True),nullable=True)
    decided_by_user_id: Mapped[uuid.UUID|None]=mapped_column(UUID(as_uuid=True),ForeignKey('users.id',ondelete='SET NULL'),nullable=True)
