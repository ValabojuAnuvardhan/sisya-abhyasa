"""github evidence foundation
Revision ID: 0004
Revises: 0003
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
revision='0004'; down_revision='0003'; branch_labels=None; depends_on=None

def upgrade():
    op.create_table('project_repositories',
      sa.Column('id',postgresql.UUID(as_uuid=True),primary_key=True),sa.Column('project_id',postgresql.UUID(as_uuid=True),sa.ForeignKey('projects.id',ondelete='CASCADE'),nullable=False),
      sa.Column('github_installation_id',sa.BigInteger(),nullable=False),sa.Column('github_repository_id',sa.BigInteger(),nullable=False),sa.Column('owner',sa.String(100),nullable=False),sa.Column('name',sa.String(100),nullable=False),sa.Column('full_name',sa.String(220),nullable=False),sa.Column('html_url',sa.String(500),nullable=False),sa.Column('is_private',sa.Boolean(),nullable=False,server_default=sa.false()),sa.Column('created_at',sa.DateTime(timezone=True),nullable=False,server_default=sa.func.now()),sa.UniqueConstraint('github_repository_id',name='uq_project_repositories_github_id'),sa.UniqueConstraint('project_id',name='uq_project_repositories_project'))
    op.create_index('ix_project_repositories_project_id','project_repositories',['project_id'])
    op.create_table('github_webhook_events',sa.Column('id',postgresql.UUID(as_uuid=True),primary_key=True),sa.Column('delivery_id',sa.String(100),nullable=False),sa.Column('event_type',sa.String(80),nullable=False),sa.Column('action',sa.String(80)),sa.Column('repository_id',sa.BigInteger()),sa.Column('processed',sa.Boolean(),nullable=False,server_default=sa.false()),sa.Column('received_at',sa.DateTime(timezone=True),nullable=False,server_default=sa.func.now()),sa.UniqueConstraint('delivery_id'))
    op.create_index('ix_github_webhook_events_delivery_id','github_webhook_events',['delivery_id']); op.create_index('ix_github_webhook_events_repository_id','github_webhook_events',['repository_id'])
    op.create_table('github_commits',sa.Column('id',postgresql.UUID(as_uuid=True),primary_key=True),sa.Column('repository_id',postgresql.UUID(as_uuid=True),sa.ForeignKey('project_repositories.id',ondelete='CASCADE'),nullable=False),sa.Column('user_id',postgresql.UUID(as_uuid=True),sa.ForeignKey('users.id',ondelete='SET NULL')),sa.Column('github_actor_id',sa.String(64)),sa.Column('github_actor_login',sa.String(100)),sa.Column('sha',sa.String(64),nullable=False),sa.Column('message',sa.Text(),nullable=False,server_default=''),sa.Column('html_url',sa.String(500)),sa.Column('committed_at',sa.DateTime(timezone=True)),sa.Column('created_at',sa.DateTime(timezone=True),nullable=False,server_default=sa.func.now()),sa.UniqueConstraint('repository_id','sha',name='uq_github_commit_repo_sha'))
    op.create_index('ix_github_commits_repository_id','github_commits',['repository_id']); op.create_index('ix_github_commits_user_id','github_commits',['user_id'])
    op.create_table('github_pull_requests',sa.Column('id',postgresql.UUID(as_uuid=True),primary_key=True),sa.Column('repository_id',postgresql.UUID(as_uuid=True),sa.ForeignKey('project_repositories.id',ondelete='CASCADE'),nullable=False),sa.Column('user_id',postgresql.UUID(as_uuid=True),sa.ForeignKey('users.id',ondelete='SET NULL')),sa.Column('task_id',postgresql.UUID(as_uuid=True),sa.ForeignKey('tasks.id',ondelete='SET NULL')),sa.Column('github_actor_id',sa.String(64)),sa.Column('github_actor_login',sa.String(100)),sa.Column('number',sa.Integer(),nullable=False),sa.Column('title',sa.String(500),nullable=False),sa.Column('state',sa.String(30),nullable=False),sa.Column('merged',sa.Boolean(),nullable=False,server_default=sa.false()),sa.Column('html_url',sa.String(500),nullable=False),sa.Column('updated_at_github',sa.DateTime(timezone=True)),sa.Column('created_at',sa.DateTime(timezone=True),nullable=False,server_default=sa.func.now()),sa.UniqueConstraint('repository_id','number',name='uq_github_pr_repo_number'))
    op.create_index('ix_github_pull_requests_repository_id','github_pull_requests',['repository_id']); op.create_index('ix_github_pull_requests_user_id','github_pull_requests',['user_id']); op.create_index('ix_github_pull_requests_task_id','github_pull_requests',['task_id'])

def downgrade():
    op.drop_table('github_pull_requests'); op.drop_table('github_commits'); op.drop_table('github_webhook_events'); op.drop_table('project_repositories')
