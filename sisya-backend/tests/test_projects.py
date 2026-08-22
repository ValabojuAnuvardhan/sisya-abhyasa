import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.models import User, Profile, Project, ProjectMember

client = TestClient(app)


def test_project_creation_and_listing():
    db = SessionLocal()
    test_email = "test_project_user@example.com"

    # Clean up existing user and projects
    existing = db.query(User).filter(User.email == test_email).first()
    if existing:
        from app.models import Task, Milestone
        projs = db.query(Project).filter(Project.owner_id == existing.id).all()
        for p in projs:
            db.query(Task).filter(Task.project_id == p.id).delete()
            db.query(Milestone).filter(Milestone.project_id == p.id).delete()
            db.query(ProjectMember).filter(ProjectMember.project_id == p.id).delete()
            db.query(Project).filter(Project.id == p.id).delete()
        db.query(ProjectMember).filter(ProjectMember.user_id == existing.id).delete()
        db.query(Profile).filter(Profile.user_id == existing.id).delete()
        db.query(User).filter(User.id == existing.id).delete()
        db.commit()
    db.close()

    # 1. Register user
    reg_resp = client.post(
        "/auth/register",
        json={
            "email": test_email,
            "password": "Password123!",
            "github_url": "https://github.com/projectdev"
        }
    )
    assert reg_resp.status_code == 200
    reg_data = reg_resp.json()
    token = reg_data["token"]
    user_id = reg_data["user_id"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Unauthenticated calls fail
    assert client.post("/projects/", json={"title": "Test Project"}).status_code == 401
    assert client.get("/projects/").status_code == 401

    # 3. Create project with JWT auth
    project_payload = {
        "title": "AI Resume Analyzer",
        "description": "An AI-powered resume analysis platform.",
        "tech_stack": ["Python", "FastAPI", "React", "PostgreSQL"]
    }
    create_resp = client.post("/projects/", json=project_payload, headers=headers)
    assert create_resp.status_code == 201
    proj_data = create_resp.json()
    assert proj_data["title"] == "AI Resume Analyzer"
    assert proj_data["owner_id"] == user_id
    assert proj_data["tech_stack"] == ["Python", "FastAPI", "React", "PostgreSQL"]
    project_id = proj_data["id"]

    # 4. Verify ProjectMember auto-created with role="owner"
    db_session = SessionLocal()
    import uuid as uuid_lib
    member = db_session.query(ProjectMember).filter(
        ProjectMember.project_id == uuid_lib.UUID(project_id),
        ProjectMember.user_id == uuid_lib.UUID(user_id)
    ).first()
    assert member is not None
    assert member.role == "owner"
    db_session.close()

    # 5. GET /projects/ returns student's projects
    list_resp = client.get("/projects/", headers=headers)
    assert list_resp.status_code == 200
    projects_list = list_resp.json()
    assert len(projects_list) >= 1
    assert any(p["id"] == project_id for p in projects_list)

    # 6. POST /projects/{project_id}/generate creates milestones and tasks in DB
    gen_resp = client.post(
        f"/projects/{project_id}/generate",
        json={"idea": "AI Resume Analyzer for Students", "skill_level": "Beginner"},
        headers=headers
    )
    assert gen_resp.status_code == 200
    gen_data = gen_resp.json()
    assert gen_data["milestones_count"] > 0
    assert gen_data["tasks_count"] > 0

    # 7. Duplicate generate attempt triggers duplication protection 400
    dup_resp = client.post(
        f"/projects/{project_id}/generate",
        json={"idea": "AI Resume Analyzer for Students", "skill_level": "Beginner"},
        headers=headers
    )
    assert dup_resp.status_code == 400
    assert "duplication protection" in dup_resp.json()["detail"].lower()

