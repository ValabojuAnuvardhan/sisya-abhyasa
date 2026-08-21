import os
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.models import User, Profile

client = TestClient(app)


def test_ai_project_architect_flow(capsys):
    db = SessionLocal()
    test_email = "architect_test_user@example.com"

    # Clean up old test data if present
    existing = db.query(User).filter(User.email == test_email).first()
    if existing:
        db.query(Profile).filter(Profile.user_id == existing.id).delete()
        db.query(User).filter(User.id == existing.id).delete()
        db.commit()
    db.close()

    # 1. Register test user
    reg_resp = client.post(
        "/auth/register",
        json={
            "email": test_email,
            "password": "Password123!",
            "github_url": "https://github.com/ai-architect-user"
        }
    )
    assert reg_resp.status_code == 200
    token = reg_resp.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Unauthenticated request to /projects/architect fails with 401
    unauth_resp = client.post(
        "/projects/architect",
        json={"idea": "Build an AI resume analyzer"}
    )
    assert unauth_resp.status_code == 401

    # 3. Authenticated call to /projects/architect
    payload = {
        "idea": "Build an AI-powered resume analyzer for college students",
        "target_users": "college students",
        "difficulty": "beginner",
        "available_weeks": 6
    }

    resp = client.post("/projects/architect", json=payload, headers=headers)
    assert resp.status_code == 200, f"API call failed: {resp.text}"

    data = resp.json()

    # Validate response contract
    assert "title" in data and len(data["title"]) > 0
    assert "description" in data and len(data["description"]) > 0
    assert "tech_stack" in data and isinstance(data["tech_stack"], list)
    assert "skills" in data and isinstance(data["skills"], list)
    assert "estimated_weeks" in data and isinstance(data["estimated_weeks"], int)
    assert "milestones" in data and isinstance(data["milestones"], list)
    assert len(data["milestones"]) > 0

    # Print visible acceptance criteria output
    tech_stack_str = "\n  ".join([f"- {t}" for t in data["tech_stack"]])
    milestones_str = "\n  ".join([
        f"{idx + 1}. {m['title']}: {m['description']} ({m.get('estimated_weeks', 1)} week(s))"
        for idx, m in enumerate(data["milestones"])
    ])

    output_block = (
        "\n=========================================="
        "\nAI Project Architect PASS"
        f"\n\nTitle: {data['title']}"
        f"\nTech Stack:\n  {tech_stack_str}"
        f"\nEstimated Weeks: {data['estimated_weeks']}"
        f"\n\nMilestones:\n  {milestones_str}"
        "\n==========================================\n"
    )

    print(output_block)
