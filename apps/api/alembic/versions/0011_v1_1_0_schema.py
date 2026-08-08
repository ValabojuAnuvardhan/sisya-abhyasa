"""
Śiṣya Abhyāsa v1.1.0 Additive Schema Migration
Revision ID: 0011
Revises: 0010
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '0011'
down_revision = '0010'
branch_labels = None
depends_on = None


def upgrade():
    # 1. Dynamic Skill Proficiencies
    op.create_table(
        'user_skill_proficiencies',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('skill_name', sa.String(100), nullable=False),
        sa.Column('category', sa.String(50), nullable=False, server_default='General'),
        sa.Column('score', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('confidence', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('evidence_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('last_updated', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint('user_id', 'skill_name', name='uq_user_skill_name')
    )
    op.create_index('ix_user_skill_proficiencies_user_id', 'user_skill_proficiencies', ['user_id'])
    op.create_index('ix_user_skill_proficiencies_skill_name', 'user_skill_proficiencies', ['skill_name'])

    # 2. Mentor Observations (Proactive AI Mentor 2.0)
    op.create_table(
        'mentor_observations',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('project_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('projects.id', ondelete='CASCADE'), nullable=True),
        sa.Column('observation_type', sa.String(50), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('action_url', sa.String(500), nullable=True),
        sa.Column('is_read', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False)
    )
    op.create_index('ix_mentor_observations_user_id', 'mentor_observations', ['user_id'])

    # 3. Project Evaluations (Reproducible AI Evaluation)
    op.create_table(
        'project_evaluations',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('project_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('projects.id', ondelete='CASCADE'), nullable=False),
        sa.Column('overall_score', sa.Float(), nullable=False),
        sa.Column('architecture_score', sa.Float(), nullable=False),
        sa.Column('code_quality_score', sa.Float(), nullable=False),
        sa.Column('testing_score', sa.Float(), nullable=False),
        sa.Column('security_score', sa.Float(), nullable=False),
        sa.Column('collaboration_score', sa.Float(), nullable=False),
        sa.Column('strengths', sa.JSON(), nullable=False),
        sa.Column('weaknesses', sa.JSON(), nullable=False),
        sa.Column('resume_bullets', sa.JSON(), nullable=False),
        sa.Column('linkedin_summary', sa.Text(), nullable=False),
        sa.Column('interview_questions', sa.JSON(), nullable=False),
        sa.Column('badge_level', sa.String(50), nullable=False),
        sa.Column('eval_version', sa.String(20), nullable=False, server_default='1.1.0'),
        sa.Column('model_name', sa.String(100), nullable=False, server_default='gemini-3.6-flash'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False)
    )
    op.create_index('ix_project_evaluations_project_id', 'project_evaluations', ['project_id'])

    # 4. Recruiter Settings (Recruiter View Preferences)
    op.create_table(
        'recruiter_settings',
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), primary_key=True),
        sa.Column('custom_headline', sa.String(255), nullable=True),
        sa.Column('theme', sa.String(50), nullable=False, server_default='default'),
        sa.Column('featured_project_ids', sa.JSON(), nullable=False),
        sa.Column('is_public', sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False)
    )


def downgrade():
    op.drop_table('recruiter_settings')
    op.drop_index('ix_project_evaluations_project_id', table_name='project_evaluations')
    op.drop_table('project_evaluations')
    op.drop_index('ix_mentor_observations_user_id', table_name='mentor_observations')
    op.drop_table('mentor_observations')
    op.drop_index('ix_user_skill_proficiencies_skill_name', table_name='user_skill_proficiencies')
    op.drop_index('ix_user_skill_proficiencies_user_id', table_name='user_skill_proficiencies')
    op.drop_table('user_skill_proficiencies')
