"""PR review and skill evidence
Revision ID: 0005
Revises: 0004
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
revision='0005'; down_revision='0004'; branch_labels=None; depends_on=None

def upgrade():
    op.create_table('pr_reviews',
      sa.Column('id',postgresql.UUID(as_uuid=True),primary_key=True),
      sa.Column('pull_request_id',postgresql.UUID(as_uuid=True),sa.ForeignKey('github_pull_requests.id',ondelete='CASCADE'),nullable=False),
      sa.Column('review_mode',sa.String(30),nullable=False),
      sa.Column('source_scope',sa.String(40),nullable=False),
      sa.Column('summary',sa.Text(),nullable=False),
      sa.Column('task_alignment',sa.Text(),nullable=False),
      sa.Column('findings',postgresql.JSONB(),nullable=False,server_default=sa.text("'[]'::jsonb")),
      sa.Column('limitations',postgresql.JSONB(),nullable=False,server_default=sa.text("'[]'::jsonb")),
      sa.Column('created_at',sa.DateTime(timezone=True),nullable=False,server_default=sa.func.now()),
      sa.UniqueConstraint('pull_request_id',name='uq_pr_reviews_pull_request'))
    op.create_index('ix_pr_reviews_pull_request_id','pr_reviews',['pull_request_id'])
    op.create_table('skill_evidence',
      sa.Column('id',postgresql.UUID(as_uuid=True),primary_key=True),
      sa.Column('user_id',postgresql.UUID(as_uuid=True),sa.ForeignKey('users.id',ondelete='CASCADE'),nullable=False),
      sa.Column('project_id',postgresql.UUID(as_uuid=True),sa.ForeignKey('projects.id',ondelete='CASCADE'),nullable=False),
      sa.Column('pull_request_id',postgresql.UUID(as_uuid=True),sa.ForeignKey('github_pull_requests.id',ondelete='CASCADE'),nullable=False),
      sa.Column('task_id',postgresql.UUID(as_uuid=True),sa.ForeignKey('tasks.id',ondelete='SET NULL')),
      sa.Column('skill_name',sa.String(100),nullable=False),
      sa.Column('evidence_kind',sa.String(40),nullable=False),
      sa.Column('explanation',sa.Text(),nullable=False),
      sa.Column('created_at',sa.DateTime(timezone=True),nullable=False,server_default=sa.func.now()),
      sa.UniqueConstraint('user_id','pull_request_id','skill_name',name='uq_skill_evidence_user_pr_skill'))
    op.create_index('ix_skill_evidence_user_id','skill_evidence',['user_id']); op.create_index('ix_skill_evidence_project_id','skill_evidence',['project_id']); op.create_index('ix_skill_evidence_pull_request_id','skill_evidence',['pull_request_id'])

def downgrade():
    op.drop_table('skill_evidence'); op.drop_table('pr_reviews')
