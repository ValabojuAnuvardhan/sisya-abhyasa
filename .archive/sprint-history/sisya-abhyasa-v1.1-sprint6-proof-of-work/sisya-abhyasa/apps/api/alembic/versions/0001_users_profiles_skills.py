"""users profiles skills
Revision ID: 0001
Revises: 
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
revision = "0001"
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.create_table("users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("auth_subject", sa.String(255), nullable=False, unique=True),
        sa.Column("email", sa.String(320), nullable=True, unique=True),
        sa.Column("full_name", sa.String(120), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()))
    op.create_table("skills",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("slug", sa.String(100), nullable=False),
        sa.UniqueConstraint("slug", name="uq_skills_slug"))
    op.create_table("student_profiles",
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("education_year", sa.String(40)),
        sa.Column("target_role", sa.String(120)),
        sa.Column("experience_level", sa.String(30)),
        sa.Column("interests", sa.String(500)),
        sa.Column("github_user_id", sa.String(64), unique=True),
        sa.Column("github_username", sa.String(100)),
        sa.Column("profile_public", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("onboarding_completed", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()))
    op.create_table("user_skills",
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("skill_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("skills.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()))

def downgrade():
    op.drop_table("user_skills"); op.drop_table("student_profiles"); op.drop_table("skills"); op.drop_table("users")
