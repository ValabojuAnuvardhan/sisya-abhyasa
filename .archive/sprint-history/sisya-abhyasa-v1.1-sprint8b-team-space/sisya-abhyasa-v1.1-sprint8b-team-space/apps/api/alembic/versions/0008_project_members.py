"""Minimal project teams and task assignment
Revision ID: 0008
Revises: 0007
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
revision='0008'; down_revision='0007'; branch_labels=None; depends_on=None

def upgrade():
    op.create_table('project_members',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('project_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('projects.id',ondelete='CASCADE'), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id',ondelete='CASCADE'), nullable=False),
        sa.Column('role', sa.String(30), nullable=False, server_default='contributor'),
        sa.Column('status', sa.String(30), nullable=False, server_default='active'),
        sa.Column('joined_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('removed_at', sa.DateTime(timezone=True), nullable=True),
        sa.UniqueConstraint('project_id','user_id',name='uq_project_member_user'))
    op.create_index('ix_project_members_project_id','project_members',['project_id'])
    op.create_index('ix_project_members_user_id','project_members',['user_id'])
    op.add_column('tasks', sa.Column('assigned_user_id', postgresql.UUID(as_uuid=True), nullable=True))
    op.create_foreign_key('fk_tasks_assigned_user','tasks','users',['assigned_user_id'],['id'],ondelete='SET NULL')
    # Existing creators become explicit owners without changing legacy creator_id semantics.
    op.execute("""INSERT INTO project_members (id, project_id, user_id, role, status, joined_at)
                SELECT gen_random_uuid(), id, creator_id, 'owner', 'active', created_at FROM projects
                ON CONFLICT (project_id, user_id) DO NOTHING""")

def downgrade():
    op.drop_constraint('fk_tasks_assigned_user','tasks',type_='foreignkey')
    op.drop_column('tasks','assigned_user_id')
    op.drop_index('ix_project_members_user_id',table_name='project_members')
    op.drop_index('ix_project_members_project_id',table_name='project_members')
    op.drop_table('project_members')
