"""Community project discovery and join requests
Revision ID: 0010
Revises: 0009
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
revision='0010'; down_revision='0009'; branch_labels=None; depends_on=None

def upgrade():
    op.add_column('projects', sa.Column('discoverable', sa.Boolean(), nullable=False, server_default=sa.false()))
    op.add_column('projects', sa.Column('collaboration_pitch', sa.Text(), nullable=True))
    op.add_column('projects', sa.Column('skills_needed', sa.Text(), nullable=True))
    op.add_column('projects', sa.Column('team_capacity', sa.Integer(), nullable=False, server_default='4'))
    op.create_index('ix_projects_discoverable','projects',['discoverable'])
    op.create_table('project_join_requests',
        sa.Column('id',postgresql.UUID(as_uuid=True),primary_key=True),
        sa.Column('project_id',postgresql.UUID(as_uuid=True),sa.ForeignKey('projects.id',ondelete='CASCADE'),nullable=False),
        sa.Column('requester_user_id',postgresql.UUID(as_uuid=True),sa.ForeignKey('users.id',ondelete='CASCADE'),nullable=False),
        sa.Column('message',sa.Text(),nullable=True),
        sa.Column('status',sa.String(20),nullable=False,server_default='pending'),
        sa.Column('created_at',sa.DateTime(timezone=True),server_default=sa.func.now(),nullable=False),
        sa.Column('decided_at',sa.DateTime(timezone=True),nullable=True),
        sa.Column('decided_by_user_id',postgresql.UUID(as_uuid=True),sa.ForeignKey('users.id',ondelete='SET NULL'),nullable=True),
        sa.UniqueConstraint('project_id','requester_user_id',name='uq_project_join_request_user'))
    op.create_index('ix_project_join_requests_project_id','project_join_requests',['project_id'])
    op.create_index('ix_project_join_requests_requester_user_id','project_join_requests',['requester_user_id'])

def downgrade():
    op.drop_index('ix_project_join_requests_requester_user_id',table_name='project_join_requests'); op.drop_index('ix_project_join_requests_project_id',table_name='project_join_requests'); op.drop_table('project_join_requests')
    op.drop_index('ix_projects_discoverable',table_name='projects')
    op.drop_column('projects','team_capacity'); op.drop_column('projects','skills_needed'); op.drop_column('projects','collaboration_pitch'); op.drop_column('projects','discoverable')
