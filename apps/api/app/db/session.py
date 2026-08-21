from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.dialects.postgresql import JSONB, UUID
from app.core.config import settings
import app.models  # Ensure all ORM models are registered
from app.db.base import Base

@compiles(JSONB, "sqlite")
def compile_jsonb_sqlite(type_, compiler, **kw):
    return "JSON"

@compiles(UUID, "sqlite")
def compile_uuid_sqlite(type_, compiler, **kw):
    return "TEXT"

is_sqlite = settings.database_url.startswith("sqlite")
connect_args = {"check_same_thread": False} if is_sqlite else {}
engine = create_engine(settings.database_url, pool_pre_ping=not is_sqlite, connect_args=connect_args)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)

# Initialize database schema automatically for development
Base.metadata.create_all(bind=engine)

if is_sqlite:
    from sqlalchemy import inspect, text
    with engine.connect() as conn:
        inspector = inspect(engine)
        if "student_profiles" in inspector.get_table_names():
            columns = [c["name"] for c in inspector.get_columns("student_profiles")]
            for col_name, col_type in [("headline", "VARCHAR(255)"), ("bio", "VARCHAR(1000)"), ("location", "VARCHAR(120)"), ("avatar_url", "VARCHAR(500)"), ("github_username", "VARCHAR(100)")]:
                if col_name not in columns:
                    conn.execute(text(f"ALTER TABLE student_profiles ADD COLUMN {col_name} {col_type}"))
        if "learning_roadmap_nodes" in inspector.get_table_names():
            node_cols = [c["name"] for c in inspector.get_columns("learning_roadmap_nodes")]
            for col_name in ["chk_learn", "chk_practice", "chk_apply", "chk_demonstrate"]:
                if col_name not in node_cols:
                    conn.execute(text(f"ALTER TABLE learning_roadmap_nodes ADD COLUMN {col_name} BOOLEAN DEFAULT 0"))
        if "projects" in inspector.get_table_names():
            proj_cols = [c["name"] for c in inspector.get_columns("projects")]
            if "collaboration_mode" not in proj_cols:
                conn.execute(text("ALTER TABLE projects ADD COLUMN collaboration_mode VARCHAR(20) DEFAULT 'SOLO'"))
        if "tasks" in inspector.get_table_names():
            task_cols = [c["name"] for c in inspector.get_columns("tasks")]
            for col_name, col_type in [("priority", "VARCHAR(20) DEFAULT 'MEDIUM'"), ("estimated_hours", "FLOAT DEFAULT 0.0"), ("actual_hours", "FLOAT DEFAULT 0.0"), ("due_date", "DATETIME"), ("sprint_id", "TEXT"), ("branch_name", "VARCHAR(255)")]:
                if col_name not in task_cols:
                    conn.execute(text(f"ALTER TABLE tasks ADD COLUMN {col_name} {col_type}"))
        conn.commit()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
