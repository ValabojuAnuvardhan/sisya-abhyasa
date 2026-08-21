import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal, Base, engine
from app.models import User, Profile, Project, Task
from app.core.security import hash_password, create_access_token

Base.metadata.create_all(bind=engine)
client = TestClient(app)


def test_ai_agents_chat_flow():
    db = SessionLocal()
    email = "agent_test_user@example.com"
    
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        db.query(Profile).filter(Profile.user_id == existing.id).delete()
        db.query(User).filter(User.id == existing.id).delete()
        db.commit()

    user = User(email=email, password_hash=hash_password("Password123!"))
    db.add(user)
    db.commit()
    db.refresh(user)

    profile = Profile(
        user_id=user.id,
        github_username="agentuser",
        target_role="Backend Developer",
        skills=["Python", "FastAPI"],
        interests=["AI Agents", "Databases"],
        completion_pct=80
    )
    db.add(profile)

    project = Project(
        owner_id=user.id,
        title="Agent Practice Project",
        description="Testing AI practice agent integration",
        tech_stack=["Python", "FastAPI", "PostgreSQL"]
    )
    db.add(project)
    db.commit()
    db.refresh(project)

    task = Task(
        project_id=project.id,
        title="Implement AI Chat Router",
        completion_criteria="POST /ai/chat endpoint working with JWT auth",
        status="in_progress"
    )
    db.add(task)
    db.commit()
    db.refresh(task)

    token = create_access_token(str(user.id))
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Test ŚiṣyaChat (Learn)
    res_learn = client.post("/ai/chat", json={
        "message": "Explain dependency injection in FastAPI",
        "agent": "sisya_chat"
    }, headers=headers)
    assert res_learn.status_code == 200
    data_learn = res_learn.json()
    assert data_learn["agent"] == "ŚiṣyaChat"
    assert "answer" in data_learn
    assert "advisory" in data_learn

    # 2. Test AbhyāsBot (Practice)
    res_practice = client.post("/ai/chat", json={
        "message": "How do I implement this task?",
        "agent": "abhyas_bot",
        "project_id": str(project.id),
        "task_id": str(task.id)
    }, headers=headers)
    assert res_practice.status_code == 200
    data_practice = res_practice.json()
    assert data_practice["agent"] == "AbhyāsBot"
    assert "answer" in data_practice
    assert "advisory" in data_practice

    # 3. Test Invalid Agent Rejection
    res_invalid = client.post("/ai/chat", json={
        "message": "Hello",
        "agent": "invalid_agent"
    }, headers=headers)
    assert res_invalid.status_code == 400

    # Cleanup
    db.query(Task).filter(Task.id == task.id).delete()
    db.query(Project).filter(Project.id == project.id).delete()
    db.query(Profile).filter(Profile.user_id == user.id).delete()
    db.query(User).filter(User.id == user.id).delete()
    db.commit()
    db.close()
