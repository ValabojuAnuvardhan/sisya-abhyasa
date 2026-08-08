"""
Śiṣya Abhyāsa Sprint 1 Schema Migration: github_connections
Revision ID: 0012
Revises: 0011
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '0012'
down_revision = '0011'
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        'github_connections',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            'user_id',
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey('users.id', ondelete='CASCADE'),
            nullable=False,
            unique=True
        ),
        sa.Column('github_user_id', sa.String(64), nullable=False),
        sa.Column('username', sa.String(100), nullable=False),
        sa.Column('avatar_url', sa.String(500), nullable=True),
        sa.Column('access_token', sa.Text(), nullable=False),
        sa.Column('connected_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('last_sync', sa.DateTime(timezone=True), nullable=True)
    )
    op.create_index('ix_github_connections_user_id', 'github_connections', ['user_id'])

def downgrade():
    op.drop_index('ix_github_connections_user_id', table_name='github_connections')
    op.drop_table('github_connections')
