"""Production authentication sessions
Revision ID: 0007
Revises: 0006
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
revision='0007'; down_revision='0006'; branch_labels=None; depends_on=None

def upgrade():
    op.create_table('auth_credentials',
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id',ondelete='CASCADE'), primary_key=True),
        sa.Column('password_hash', sa.String(512), nullable=False),
        sa.Column('email_verified_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('verification_token_hash', sa.String(64), nullable=True, unique=True),
        sa.Column('verification_expires_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('failed_login_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('locked_until', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False))
    op.create_table('auth_sessions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id',ondelete='CASCADE'), nullable=False),
        sa.Column('token_hash', sa.String(64), nullable=False, unique=True),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('last_seen_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False))
    op.create_index('ix_auth_sessions_user_id','auth_sessions',['user_id'])

def downgrade():
    op.drop_index('ix_auth_sessions_user_id',table_name='auth_sessions')
    op.drop_table('auth_sessions'); op.drop_table('auth_credentials')
