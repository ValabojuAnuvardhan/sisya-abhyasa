"""seed starter canonical skills
Revision ID: 0002
Revises: 0001
"""
from alembic import op
import sqlalchemy as sa
import uuid
revision="0002"; down_revision="0001"; branch_labels=None; depends_on=None
skills=[("Python","python"),("JavaScript","javascript"),("TypeScript","typescript"),("React","react"),("Next.js","nextjs"),("FastAPI","fastapi"),("PostgreSQL","postgresql"),("Git/GitHub","git-github"),("Machine Learning","machine-learning"),("Testing","testing")]
def upgrade():
    table=sa.table("skills",sa.column("id"),sa.column("name"),sa.column("slug"))
    op.bulk_insert(table,[{"id":str(uuid.uuid4()),"name":n,"slug":s} for n,s in skills])
def downgrade():
    op.execute(sa.text("DELETE FROM skills WHERE slug IN :slugs").bindparams(sa.bindparam("slugs", expanding=True)), {"slugs":[s for _,s in skills]})
