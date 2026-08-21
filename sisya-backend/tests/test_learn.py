import uuid
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.models import User, Profile
from app.core.security import create_access_token

client = TestClient(app)


def get_auth_headers():
    db = SessionLocal()
    email = f"learn_user_{uuid.uuid4().hex[:6]}@example.com"
    user = User(email=email, password_hash="hash")
    db.add(user)
    db.commit()
    db.refresh(user)
    user_id_str = str(user.id)

    profile = Profile(user_id=user.id, target_role="Backend Developer")
    db.add(profile)
    db.commit()
    db.close()

    token = create_access_token(user_id_str)
    return {"Authorization": f"Bearer {token}"}


def test_get_learning_dashboard():
    headers = get_auth_headers()
    response = client.get("/api/v1/learn/dashboard", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["target_role"] == "Backend Developer"
    assert "skill_readiness_percentage" in data
    assert "strong_skills" in data
    assert "explore_topics" in data


def test_sisyachat_endpoint_success():
    headers = get_auth_headers()
    payload = {
        "message": "What is dependency injection in FastAPI?",
        "target_role": "Backend Developer",
        "skill_gaps": ["Docker", "Redis"],
        "learning_stage": "Intermediate"
    }
    response = client.post("/api/v1/learn/chat", json=payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert data["persona"] == "ŚiṣyaChat"
    assert data["layer"] == "Learn"


def test_sisyachat_endpoint_empty_message():
    headers = get_auth_headers()
    payload = {
        "message": "   "
    }
    response = client.post("/api/v1/learn/chat", json=payload, headers=headers)
    assert response.status_code == 400
