import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.models import User, Profile

client = TestClient(app)


def test_profile_update_and_completion():
    db = SessionLocal()
    test_email = "test_profile_user@example.com"

    # Clean up old test data
    existing = db.query(User).filter(User.email == test_email).first()
    if existing:
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
            "github_url": "https://github.com/profiledev"
        }
    )
    assert reg_resp.status_code == 200
    token = reg_resp.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Unauthenticated request fails with 401
    unauth_resp = client.put("/profile/me", json={"education_year": 3})
    assert unauth_resp.status_code == 401

    # 3. Partial update with token
    partial_payload = {
        "education_year": 3,
        "skills": ["Python", "FastAPI", "PostgreSQL"]
    }
    part_resp = client.put("/profile/me", json=partial_payload, headers=headers)
    assert part_resp.status_code == 200
    part_data = part_resp.json()
    assert part_data["education_year"] == 3
    assert part_data["skills"] == ["Python", "FastAPI", "PostgreSQL"]
    assert part_data["github_username"] == "profiledev"
    # github_username (20) + education_year (20) + skills (20) = 60
    assert part_data["completion_pct"] == 60

    # 4. Full update to 100%
    full_payload = {
        "education_year": 3,
        "skills": ["Python", "FastAPI", "PostgreSQL"],
        "interests": ["AI", "Backend Engineering"],
        "target_role": "Backend Engineer"
    }
    full_resp = client.put("/profile/me", json=full_payload, headers=headers)
    assert full_resp.status_code == 200
    full_data = full_resp.json()
    assert full_data["completion_pct"] == 100
    assert full_data["target_role"] == "Backend Engineer"

    # 5. GET /profile/me
    get_resp = client.get("/profile/me", headers=headers)
    assert get_resp.status_code == 200
    assert get_resp.json()["completion_pct"] == 100
