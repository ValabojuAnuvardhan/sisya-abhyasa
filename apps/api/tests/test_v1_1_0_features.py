"""
Backend Test Suite for Śiṣya Abhyāsa v1.1.0 Features & Backward Compatibility
"""

import uuid
import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_v1_0_0_backward_compatibility():
    """Verify v1.0.0 root and health endpoints respond without regression."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["version"] == "1.1.0"

    health = client.get("/api/v1/health")
    assert health.status_code == 200


def test_v1_1_0_proactive_mentor_feed():
    """Verify AI Mentor 2.0 proactive observation feed."""
    res = client.get("/api/v1/mentor/observations")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert "title" in data[0]


def test_v1_1_0_dynamic_skill_graph():
    """Verify Dynamic Skill Graph endpoint returns extensible skill proficiencies."""
    res = client.get("/api/v1/skills/graph")
    assert res.status_code == 200
    data = res.json()
    assert "total_skills" in data
    assert data["total_skills"] >= 5
    assert "proficiencies" in data
    first_skill = data["proficiencies"][0]
    assert "score" in first_skill
    assert 0 <= first_skill["score"] <= 100


def test_v1_1_0_public_recruiter_profile():
    """Verify Public Recruiter View profile generation."""
    res = client.get("/api/v1/recruiter/profile/anuvardhan")
    assert res.status_code == 200
    data = res.json()
    assert data["github_username"] == "anuvardhan"
    assert "skills" in data
    assert "evidence_cards" in data


def test_v1_1_0_team_analytics_computed():
    """Verify Team Analytics computed metrics and risk alerts."""
    demo_team_id = uuid.uuid4()
    res = client.get(f"/api/v1/analytics/team/{demo_team_id}")
    assert res.status_code == 200
    data = res.json()
    assert "collaboration_score" in data
    assert "heatmap" in data


def test_v1_1_0_reproducible_project_evaluation():
    """Verify AI Project Evaluation endpoint returns reproducible audit scores."""
    demo_project_id = uuid.uuid4()
    res = client.post(f"/api/v1/evaluation/projects/{demo_project_id}")
    assert res.status_code == 200
    data = res.json()
    assert "overall_score" in data
    assert "eval_version" in data
    assert data["eval_version"] == "1.1.0"
    assert "model_name" in data
