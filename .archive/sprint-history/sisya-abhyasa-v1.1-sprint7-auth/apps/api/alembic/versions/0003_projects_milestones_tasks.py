"""projects milestones tasks
Revision ID: 0003
Revises: 0002
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
revision='0003'; down_revision='0002'; branch_labels=None; depends_on=None

def upgrade():
    op.create_table('projects',
        sa.Column('id',postgresql.UUID(as_uuid=True),primary_key=True),
        sa.Column('creator_id',postgresql.UUID(as_uuid=True),sa.ForeignKey('users.id',ondelete='CASCADE'),nullable=False),
        sa.Column('title',sa.String(255),nullable=False),sa.Column('description',sa.Text(),nullable=False),
        sa.Column('source',sa.String(30),nullable=False,server_default='student'),
        sa.Column('difficulty',sa.String(30),nullable=False,server_default='intermediate'),
        sa.Column('status',sa.String(30),nullable=False,server_default='draft'),
        sa.Column('plan_status',sa.String(30),nullable=False,server_default='draft'),
        sa.Column('created_at',sa.DateTime(timezone=True),nullable=False,server_default=sa.func.now()),
        sa.Column('updated_at',sa.DateTime(timezone=True),nullable=False,server_default=sa.func.now()))
    op.create_index('ix_projects_creator_id','projects',['creator_id'])
    op.create_table('milestones',sa.Column('id',postgresql.UUID(as_uuid=True),primary_key=True),sa.Column('project_id',postgresql.UUID(as_uuid=True),sa.ForeignKey('projects.id',ondelete='CASCADE'),nullable=False),sa.Column('title',sa.String(255),nullable=False),sa.Column('objective',sa.Text(),nullable=False),sa.Column('position',sa.Integer(),nullable=False),sa.UniqueConstraint('project_id','position',name='uq_milestone_project_position'))
    op.create_index('ix_milestones_project_id','milestones',['project_id'])
    op.create_table('tasks',sa.Column('id',postgresql.UUID(as_uuid=True),primary_key=True),sa.Column('milestone_id',postgresql.UUID(as_uuid=True),sa.ForeignKey('milestones.id',ondelete='CASCADE'),nullable=False),sa.Column('title',sa.String(255),nullable=False),sa.Column('description',sa.Text(),nullable=False),sa.Column('completion_criteria',sa.Text(),nullable=False),sa.Column('required_skills',sa.Text(),nullable=False,server_default=''),sa.Column('resources',sa.Text(),nullable=False,server_default=''),sa.Column('status',sa.String(30),nullable=False,server_default='todo'),sa.Column('position',sa.Integer(),nullable=False),sa.UniqueConstraint('milestone_id','position',name='uq_task_milestone_position'))
    op.create_index('ix_tasks_milestone_id','tasks',['milestone_id'])

def downgrade():
    op.drop_table('tasks'); op.drop_table('milestones'); op.drop_table('projects')
