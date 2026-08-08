from app.db.base import Base
from app.db.session import engine
import app.models.user
import app.models.project
import app.models.github

def init():
    print("Applying migration 0006 and initializing Sprint 6 tables...")
    Base.metadata.create_all(bind=engine)
    
    # Ensure public_slug column exists in SQLite student_profiles table
    from sqlalchemy import text
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE student_profiles ADD COLUMN public_slug VARCHAR(64)"))
            conn.commit()
            print("Added public_slug column to student_profiles table.")
        except Exception as e:
            print("Column public_slug already exists or alter skipped:", e)

    print("Sprint 6 database tables initialized successfully.")

if __name__ == "__main__":
    init()
