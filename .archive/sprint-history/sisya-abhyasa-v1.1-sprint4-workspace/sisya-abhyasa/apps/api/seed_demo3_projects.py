import uuid
from sqlalchemy import select
from app.db.session import engine, SessionLocal
from app.models.user import User, StudentProfile
from app.models.project import Project, Milestone, Task

def main():
    db = SessionLocal()
    try:
        user = db.scalar(select(User).where(User.auth_subject == "local-student-1"))
        if not user:
            user = User(auth_subject="local-student-1", email="student@example.com", full_name="Anu Vardhan")
            user.profile = StudentProfile(education_year="3rd year", target_role="Backend Developer", experience_level="intermediate", interests="AI, developer tools", onboarding_completed=True)
            db.add(user)
            db.commit()
            db.refresh(user)

        # Check existing projects
        projects = db.scalars(select(Project).where(Project.creator_id == user.id)).all()
        titles = {p.title for p in projects}
        print("Existing project titles:", titles)

        p1_title = "Campus Event Discovery API"
        if p1_title not in titles:
            p1 = Project(creator_id=user.id, title=p1_title, description="Students miss useful campus events because information is scattered across clubs and departments.", difficulty="intermediate", status="active", plan_status="accepted")
            db.add(p1)
            db.flush()
            m1 = Milestone(project_id=p1.id, title="Phase 1: Core Setup", objective="Set up repo & API architecture.", position=1)
            db.add(m1); db.flush()
            db.add(Task(milestone_id=m1.id, title="Initialize FastAPI & DB Schema", description="Create initial API routes and database models.", completion_criteria="FastAPI runs and endpoints return JSON schema.", required_skills="Python\nFastAPI\nPostgreSQL", resources="FastAPI Documentation\nSQLAlchemy Docs", position=1))
            db.commit()
            print("Created", p1_title)

        p2_title = "Local Dev Tracker"
        if p2_title not in titles:
            p2 = Project(creator_id=user.id, title=p2_title, description="A tool for local development environment tracking and metrics.", difficulty="intermediate", status="active", plan_status="accepted")
            db.add(p2)
            db.flush()
            m2 = Milestone(project_id=p2.id, title="Phase 1: Local Ingestion Engine", objective="Build local telemetry ingestion.", position=1)
            db.add(m2); db.flush()
            t2 = Task(milestone_id=m2.id, title="Set up environment sensor script", description="Write local process inspector.", completion_criteria="Script detects running dev processes and logs metrics.", required_skills="Python\nGit", resources="Python OS Module\nProcess Monitoring Guide", position=1)
            db.add(t2)
            db.commit()
            print("Created", p2_title)

    finally:
        db.close()

if __name__ == "__main__":
    main()
