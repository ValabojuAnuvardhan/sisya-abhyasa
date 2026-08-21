import hmac
import hashlib
import json
import os
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.models import User, Profile, Project, ProjectMember, Repository, WebhookEvent, Commit, PullRequest

client = TestClient(app)

WEBHOOK_SECRET = os.getenv("GITHUB_WEBHOOK_SECRET", "test-secret-for-unit-tests")


def sign_payload(payload: dict) -> tuple[bytes, str]:
    body = json.dumps(payload).encode("utf-8")
    sig = "sha256=" + hmac.new(
        WEBHOOK_SECRET.encode("utf-8"), body, hashlib.sha256
    ).hexdigest()
    return body, sig


def test_webhook_invalid_signature():
    payload = {"repository": {"id": "999", "full_name": "test/repo"}}
    body = json.dumps(payload).encode("utf-8")
    resp = client.post(
        "/github/webhook",
        content=body,
        headers={
            "Content-Type": "application/json",
            "X-Hub-Signature-256": "sha256=invalidsignature",
            "X-GitHub-Delivery": "test-delivery-invalid",
            "X-GitHub-Event": "push"
        }
    )
    assert resp.status_code == 401, f"Expected 401, got {resp.status_code}"
    print("\nInvalid signature rejected (401): PASS")


def test_webhook_push_event():
    db = SessionLocal()
    test_email = "github_test_user@example.com"

    # Clean up old test data
    u = db.query(User).filter(User.email == test_email).first()
    if u:
        projs = db.query(Project).filter(Project.owner_id == u.id).all()
        for p in projs:
            repos = db.query(Repository).filter(Repository.project_id == p.id).all()
            for r in repos:
                db.query(Commit).filter(Commit.repository_id == r.id).delete()
                db.query(PullRequest).filter(PullRequest.repository_id == r.id).delete()
                db.query(Repository).filter(Repository.id == r.id).delete()
            db.query(ProjectMember).filter(ProjectMember.project_id == p.id).delete()
            db.query(Project).filter(Project.id == p.id).delete()
        db.query(Profile).filter(Profile.user_id == u.id).delete()
        db.query(User).filter(User.id == u.id).delete()
        db.commit()
    db.query(WebhookEvent).delete()
    db.commit()
    db.close()

    # 1. Register & Login
    reg_resp = client.post(
        "/auth/register",
        json={"email": test_email, "password": "Password123!", "github_url": "https://github.com/testuser"}
    )
    assert reg_resp.status_code == 200
    token = reg_resp.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Create project
    proj_resp = client.post(
        "/projects/",
        json={"title": "GitHub Evidence Project", "tech_stack": ["Python"]},
        headers=headers
    )
    assert proj_resp.status_code == 201
    project_id = proj_resp.json()["id"]

    # 3. Link repository
    repo_resp = client.post(
        f"/projects/{project_id}/link-repo",
        json={
            "github_repo_id": "test-repo-12345",
            "full_name": "testuser/evidence-project",
            "owner_github_username": "testuser"
        },
        headers=headers
    )
    assert repo_resp.status_code == 200

    # 4. Deliver push event
    push_payload = {
        "repository": {
            "id": "test-repo-12345",
            "full_name": "testuser/evidence-project"
        },
        "commits": [
            {
                "id": "abc123def456abc123def456abc123def456abc1",
                "message": "Add user authentication endpoint",
                "author": {"username": "testuser", "name": "Test User"},
                "timestamp": "2026-01-15T10:30:00Z",
                "added": ["app/api/auth.py"],
                "modified": ["app/main.py"],
                "removed": []
            },
            {
                "id": "def456abc123def456abc123def456abc123def4",
                "message": "Fix JWT token expiry",
                "author": {"username": "testuser", "name": "Test User"},
                "timestamp": "2026-01-15T11:00:00Z",
                "added": [],
                "modified": ["app/core/security.py"],
                "removed": []
            }
        ]
    }

    body, sig = sign_payload(push_payload)
    resp = client.post(
        "/github/webhook",
        content=body,
        headers={
            "Content-Type": "application/json",
            "X-Hub-Signature-256": sig,
            "X-GitHub-Delivery": "test-push-delivery-001",
            "X-GitHub-Event": "push"
        }
    )
    assert resp.status_code == 200
    assert resp.json().get("commits_saved") == 2
    print(f"Push event: {resp.json()['commits_saved']} commits saved: PASS")


def test_webhook_idempotency():
    push_payload = {
        "repository": {
            "id": "test-repo-12345",
            "full_name": "testuser/evidence-project"
        },
        "commits": [
            {
                "id": "idempotency-test-sha",
                "message": "Duplicate commit",
                "author": {"username": "testuser"},
                "timestamp": "2026-01-15T12:00:00Z",
                "added": [],
                "modified": [],
                "removed": []
            }
        ]
    }

    body, sig = sign_payload(push_payload)
    headers = {
        "Content-Type": "application/json",
        "X-Hub-Signature-256": sig,
        "X-GitHub-Delivery": "idempotency-test-delivery-999",
        "X-GitHub-Event": "push"
    }

    r1 = client.post("/github/webhook", content=body, headers=headers)
    assert r1.status_code == 200

    r2 = client.post("/github/webhook", content=body, headers=headers)
    assert r2.status_code == 200
    assert r2.json().get("status") == "duplicate"
    print("Idempotency (duplicate rejected): PASS")


def test_evidence_endpoint():
    db = SessionLocal()
    u = db.query(User).filter(User.email == "github_test_user@example.com").first()
    assert u is not None

    reg_login = client.post("/auth/login", json={"email": "github_test_user@example.com", "password": "Password123!"})
    assert reg_login.status_code == 200
    token = reg_login.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    projects_resp = client.get("/projects/", headers=headers).json()
    project_id = projects_resp[0]["id"]

    evidence_resp = client.get(f"/projects/{project_id}/evidence", headers=headers)
    assert evidence_resp.status_code == 200
    evidence = evidence_resp.json()
    assert len(evidence) > 0
    assert len(evidence[0]["commits"]) >= 2
    print(f"Evidence retrieved: {len(evidence[0]['commits'])} commits: PASS")
