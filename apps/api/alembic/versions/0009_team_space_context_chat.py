"""Project-aware team chat and meeting link
Revision ID: 0009
Revises: 0008
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
revision='0009'; down_revision='0008'; branch_labels=None; depends_on=None

def upgrade():
    op.create_table('team_space_settings',
        sa.Column('project_id',postgresql.UUID(as_uuid=True),sa.ForeignKey('projects.id',ondelete='CASCADE'),primary_key=True),
        sa.Column('meeting_url',sa.String(500),nullable=True),
        sa.Column('updated_by_user_id',postgresql.UUID(as_uuid=True),sa.ForeignKey('users.id',ondelete='SET NULL'),nullable=True),
        sa.Column('updated_at',sa.DateTime(timezone=True),server_default=sa.func.now(),nullable=False))
    op.create_table('team_messages',
        sa.Column('id',postgresql.UUID(as_uuid=True),primary_key=True),
        sa.Column('project_id',postgresql.UUID(as_uuid=True),sa.ForeignKey('projects.id',ondelete='CASCADE'),nullable=False),
        sa.Column('author_user_id',postgresql.UUID(as_uuid=True),sa.ForeignKey('users.id',ondelete='SET NULL'),nullable=True),
        sa.Column('author_kind',sa.String(20),nullable=False,server_default='student'),
        sa.Column('body',sa.Text(),nullable=False),
        sa.Column('created_at',sa.DateTime(timezone=True),server_default=sa.func.now(),nullable=False))
    op.create_index('ix_team_messages_project_id','team_messages',['project_id'])
    op.create_index('ix_team_messages_author_user_id','team_messages',['author_user_id'])
    op.create_index('ix_team_messages_created_at','team_messages',['created_at'])
    op.create_table('team_message_references',
        sa.Column('id',postgresql.UUID(as_uuid=True),primary_key=True),
        sa.Column('message_id',postgresql.UUID(as_uuid=True),sa.ForeignKey('team_messages.id',ondelete='CASCADE'),nullable=False),
        sa.Column('target_type',sa.String(20),nullable=False),
        sa.Column('target_id',postgresql.UUID(as_uuid=True),nullable=False),
        sa.Column('label',sa.String(255),nullable=False),
        sa.UniqueConstraint('message_id','target_type','target_id',name='uq_team_message_reference_target'))
    op.create_index('ix_team_message_references_message_id','team_message_references',['message_id'])

def downgrade():
    op.drop_index('ix_team_message_references_message_id',table_name='team_message_references'); op.drop_table('team_message_references')
    op.drop_index('ix_team_messages_created_at',table_name='team_messages'); op.drop_index('ix_team_messages_author_user_id',table_name='team_messages'); op.drop_index('ix_team_messages_project_id',table_name='team_messages'); op.drop_table('team_messages')
    op.drop_table('team_space_settings')
