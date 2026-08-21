import uuid
from datetime import datetime
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text, UniqueConstraint, func
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
    collaboration_mode: Mapped[str]=mapped_column(String(20),nullable=False,default='SOLO') # SOLO, TEAM
    team_capacity: Mapped[int]=mapped_column(Integer,nullable=False,default=4) # max 5
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
    priority: Mapped[str]=mapped_column(String(20),nullable=False,default='MEDIUM') # LOW, MEDIUM, HIGH, CRITICAL
    estimated_hours: Mapped[float]=mapped_column(Float,nullable=False,default=0.0)
    actual_hours: Mapped[float]=mapped_column(Float,nullable=False,default=0.0)
    due_date: Mapped[datetime|None]=mapped_column(DateTime(timezone=True),nullable=True)
    sprint_id: Mapped[uuid.UUID|None]=mapped_column(UUID(as_uuid=True),ForeignKey('project_sprints.id',ondelete='SET NULL'),nullable=True,index=True)
    branch_name: Mapped[str|None]=mapped_column(String(255),nullable=True)
    milestone: Mapped[Milestone]=relationship(back_populates='tasks')

class ProjectSprint(Base):
    __tablename__='project_sprints'
    id: Mapped[uuid.UUID]=mapped_column(UUID(as_uuid=True),primary_key=True,default=uuid.uuid4)
    project_id: Mapped[uuid.UUID]=mapped_column(UUID(as_uuid=True),ForeignKey('projects.id',ondelete='CASCADE'),nullable=False,index=True)
    name: Mapped[str]=mapped_column(String(255),nullable=False)
    goal: Mapped[str]=mapped_column(Text,nullable=False)
    start_date: Mapped[datetime]=mapped_column(DateTime(timezone=True),nullable=False)
    end_date: Mapped[datetime]=mapped_column(DateTime(timezone=True),nullable=False)
    status: Mapped[str]=mapped_column(String(30),nullable=False,default='PLANNING') # PLANNING, ACTIVE, COMPLETED
    capacity_hours: Mapped[float]=mapped_column(Float,nullable=False,default=40.0)
    created_at: Mapped[datetime]=mapped_column(DateTime(timezone=True),server_default=func.now(),nullable=False)
    updated_at: Mapped[datetime]=mapped_column(DateTime(timezone=True),server_default=func.now(),onupdate=func.now(),nullable=False)

class TaskDependency(Base):
    __tablename__='task_dependencies'
    __table_args__=(UniqueConstraint('task_id','depends_on_task_id',name='uq_task_dependency_link'),)
    id: Mapped[uuid.UUID]=mapped_column(UUID(as_uuid=True),primary_key=True,default=uuid.uuid4)
    task_id: Mapped[uuid.UUID]=mapped_column(UUID(as_uuid=True),ForeignKey('tasks.id',ondelete='CASCADE'),nullable=False,index=True)
    depends_on_task_id: Mapped[uuid.UUID]=mapped_column(UUID(as_uuid=True),ForeignKey('tasks.id',ondelete='CASCADE'),nullable=False,index=True)
    dependency_type: Mapped[str]=mapped_column(String(20),nullable=False,default='BLOCKS') # BLOCKS, REQUIRES
    created_at: Mapped[datetime]=mapped_column(DateTime(timezone=True),server_default=func.now(),nullable=False)

class TaskBlocker(Base):
    __tablename__='task_blockers'
    id: Mapped[uuid.UUID]=mapped_column(UUID(as_uuid=True),primary_key=True,default=uuid.uuid4)
    task_id: Mapped[uuid.UUID]=mapped_column(UUID(as_uuid=True),ForeignKey('tasks.id',ondelete='CASCADE'),nullable=False,index=True)
    created_by_user_id: Mapped[uuid.UUID]=mapped_column(UUID(as_uuid=True),ForeignKey('users.id',ondelete='CASCADE'),nullable=False,index=True)
    reason: Mapped[str]=mapped_column(Text,nullable=False)
    status: Mapped[str]=mapped_column(String(20),nullable=False,default='ACTIVE') # ACTIVE, RESOLVED
    resolved_at: Mapped[datetime|None]=mapped_column(DateTime(timezone=True),nullable=True)
    ai_resolution_suggestion: Mapped[str|None]=mapped_column(Text,nullable=True)
    created_at: Mapped[datetime]=mapped_column(DateTime(timezone=True),server_default=func.now(),nullable=False)
    updated_at: Mapped[datetime]=mapped_column(DateTime(timezone=True),server_default=func.now(),onupdate=func.now(),nullable=False)

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
