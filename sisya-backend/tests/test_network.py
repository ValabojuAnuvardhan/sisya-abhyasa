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
    email = f"net_user_{uuid.uuid4().hex[:6]}@example.com"
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


def test_network_feed():
    response = client.get("/api/v1/network/feed")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


def test_create_work_post_and_like():
    headers = get_auth_headers()
    post_payload = {
        "title": "Built JWT Auth Middleware",
        "content": "Finished implementing security headers and token refresh.",
        "post_type": "technical_post"
    }
    create_res = client.post("/api/v1/network/posts", json=post_payload, headers=headers)
    assert create_res.status_code == 200
    post_data = create_res.json()
    post_id = post_data["id"]

    # Like post
    like_res = client.post(f"/api/v1/network/posts/{post_id}/like", headers=headers)
    assert like_res.status_code == 200
    assert like_res.json()["liked"] is True


def test_rebuild_project_from_post():
    headers = get_auth_headers()
    # First create a post
    post_payload = {
        "title": "Built JWT Auth Middleware",
        "content": "Finished implementing security headers and token refresh.",
        "post_type": "technical_post"
    }
    create_res = client.post("/api/v1/network/posts", json=post_payload, headers=headers)
    assert create_res.status_code == 200
    post_id = create_res.json()["id"]

    # Trigger 🔨 Rebuild
    rebuild_res = client.post(f"/api/v1/network/rebuild/{post_id}", json={"target_role": "Backend Developer"}, headers=headers)
    assert rebuild_res.status_code == 200
    rebuild_data = rebuild_res.json()
    assert "rebuild_id" in rebuild_data
    assert "new_project_id" in rebuild_data
    assert rebuild_data["milestones_count"] > 0
    assert rebuild_data["tasks_count"] > 0
