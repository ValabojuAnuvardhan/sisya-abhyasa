import uuid
from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.models.user import User, StudentProfile, Skill
from app.models.project import Project, Milestone, Task
from app.models.github import ProjectRepository, GithubWebhookEvent, GithubCommit, GithubPullRequest

def main():
    print("Creating database tables for Sprint 4B (Users, Profiles, Skills, Projects, Milestones, Tasks, GitHub Evidence)...")
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
