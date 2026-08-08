"""
Śiṣya Abhyāsa Sprint 2 Schema Migration: project_github_repositories
Revision ID: 0013
Revises: 0012
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '0013'
down_revision = '0012'
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        'project_github_repositories',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            'project_id',
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey('projects.id', ondelete='CASCADE'),
            nullable=False,
            unique=True
        ),
        sa.Column(
            'github_connection_id',
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey('github_connections.id', ondelete='CASCADE'),
            nullable=False
        ),
        sa.Column('github_repo_id', sa.String(64), nullable=False),
        sa.Column('repo_name', sa.String(100), nullable=False),
        sa.Column('owner', sa.String(100), nullable=False),
        sa.Column('full_name', sa.String(200), nullable=False),
        sa.Column('description', sa.String(500), nullable=True),
        sa.Column('visibility', sa.String(20), server_default='public', nullable=False),
        sa.Column('language', sa.String(50), nullable=True),
        sa.Column('default_branch', sa.String(100), server_default='main', nullable=False),
        sa.Column('html_url', sa.String(500), nullable=False),
        sa.Column('stars', sa.Integer(), server_default='0', nullable=False),
        sa.Column('forks', sa.Integer(), server_default='0', nullable=False),
        sa.Column('linked_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False)
    )
    op.create_index('ix_project_github_repositories_project_id', 'project_github_repositories', ['project_id'])
    op.create_index('ix_project_github_repositories_connection_id', 'project_github_repositories', ['github_connection_id'])
    op.create_index('ix_project_github_repositories_repo_id', 'project_github_repositories', ['github_repo_id'])

def downgrade():
    op.drop_index('ix_project_github_repositories_repo_id', table_name='project_github_repositories')
    op.drop_index('ix_project_github_repositories_connection_id', table_name='project_github_repositories')
    op.drop_index('ix_project_github_repositories_project_id', table_name='project_github_repositories')
    op.drop_table('project_github_repositories')
