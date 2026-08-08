import uuid
from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.models.user import Skill

def main():
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        existing = db.query(Skill).count()
        if existing == 0:
            skills = [
                ("Python", "python"),
                ("JavaScript", "javascript"),
                ("TypeScript", "typescript"),
                ("React", "react"),
                ("Next.js", "nextjs"),
                ("FastAPI", "fastapi"),
                ("PostgreSQL", "postgresql"),
                ("Git/GitHub", "git-github"),
                ("Machine Learning", "machine-learning"),
                ("Testing", "testing")
            ]
            for name, slug in skills:
                db.add(Skill(id=uuid.uuid4(), name=name, slug=slug))
            db.commit()
            print(f"Seeded {len(skills)} skills successfully.")
        else:
            print(f"Database already contains {existing} skills.")
    finally:
        db.close()

if __name__ == "__main__":
    main()
