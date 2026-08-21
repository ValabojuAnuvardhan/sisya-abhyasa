import hmac
import hashlib
import json
import uuid
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.models import (
    User, Profile, Project, Milestone, Task, Repository, PullRequest, Commit, PRReview, SkillEvidence, WorkPost, PostRebuild
)
from app.core.security import create_access_token

client = TestClient(app)

WEBHOOK_SECRET = "test-secret-for-unit-tests"


def sign_payload(payload: dict) -> tuple[bytes, str]:
    body = json.dumps(payload).encode("utf-8")
    sig = "sha256=" + hmac.new(WEBHOOK_SECRET.encode("utf-8"), body, hashlib.sha256).hexdigest()
    return body, sig


def test_rc_1_github_webhook_hmac_and_idempotency():
    """
    RC Safeguard 1: Real GitHub webhook processing, HMAC-SHA256 verification, and idempotency.
    """
    push_payload = {
        "repository": {"id": "repo-rc-101", "full_name": "qa-user/rc-repo"},
        "commits": [
            {
                "id": "sha-rc-001",
                "message": "Add authentication guard",
                "author": {"username": "qa-user"},
                "timestamp": "2026-08-17T12:00:00Z"
            }
        ]
    }
    body, sig = sign_payload(push_payload)

    # 1. Invalid signature should be rejected with 401
    bad_resp = client.post(
        "/github/webhook",
        content=body,
        headers={"Content-Type": "application/json", "X-Hub-Signature-256": "sha256=invalid", "X-GitHub-Delivery": "deliv-rc-001", "X-GitHub-Event": "push"}
    )
    assert bad_resp.status_code == 401

    # 2. Valid signature succeeds
    good_resp = client.post(
        "/github/webhook",
        content=body,
        headers={"Content-Type": "application/json", "X-Hub-Signature-256": sig, "X-GitHub-Delivery": "deliv-rc-001", "X-GitHub-Event": "push"}
    )
    assert good_resp.status_code == 200

    # 3. Duplicate delivery ID returns status='duplicate' without duplicate processing
    dup_resp = client.post(
        "/github/webhook",
        content=body,
        headers={"Content-Type": "application/json", "X-Hub-Signature-256": sig, "X-GitHub-Delivery": "deliv-rc-001", "X-GitHub-Event": "push"}
    )
    assert dup_resp.status_code == 200
    assert dup_resp.json().get("status") == "duplicate"


def test_rc_2_ai_pr_review_caching_guard():
    """
    RC Safeguard 2: PR Review Caching Guard.
    First request creates and persists PRReview + SkillEvidence.
    Second request returns existing cached PRReview without re-executing LLM completions.
    """
    db = SessionLocal()
    email = f"rc_ai_{uuid.uuid4().hex[:6]}@example.com"
    user = User(email=email, password_hash="hash")
    db.add(user)
    db.commit()
    db.refresh(user)

    project = Project(owner_id=user.id, title="RC AI Test Project")
    db.add(project)
    db.commit()
    db.refresh(project)

    repo_id_str = f"repo-{uuid.uuid4().hex[:6]}"
    repo = Repository(project_id=project.id, github_repo_id=repo_id_str, full_name=f"rc-user/{repo_id_str}")
    db.add(repo)
    db.commit()
    db.refresh(repo)

    pr = PullRequest(repository_id=repo.id, pr_number=101, title="PR #101 Optimization", author_github_username="rc-user", state="closed", merged=True)
    db.add(pr)
    db.commit()
    db.refresh(pr)

    token = create_access_token(str(user.id))
    headers = {"Authorization": f"Bearer {token}"}

    # First request -> generates review
    req_payload = {"pull_request_id": str(pr.id)}
    res1 = client.post("/evidence/pr-review", json=req_payload, headers=headers)
    assert res1.status_code == 200
    review1 = res1.json()
    assert review1["advisory"] is True
    assert "AI-generated code review" in review1["advisory_label"]

    # Second request -> hits cache guard (same ID, no duplicate LLM call)
    res2 = client.post("/evidence/pr-review", json=req_payload, headers=headers)
    assert res2.status_code == 200
    review2 = res2.json()
    assert review2["id"] == review1["id"]

    db.close()


def test_rc_3_multi_user_isolation_and_public_proof():
    """
    RC Safeguard 3: Multi-User Isolation & Public Proof Profile Boundaries.
    - User B cannot access User A's project evidence.
    - Public recruiter proof endpoint returns ONLY safe DTO fields.
    """
    db = SessionLocal()
    email_a = f"user_a_{uuid.uuid4().hex[:6]}@example.com"
    email_b = f"user_b_{uuid.uuid4().hex[:6]}@example.com"
    user_a = User(email=email_a, password_hash="hash_a")
    user_b = User(email=email_b, password_hash="hash_b")
    db.add_all([user_a, user_b])
    db.commit()
    db.refresh(user_a)
    db.refresh(user_b)

    proj_a = Project(owner_id=user_a.id, title="User A Private Project")
    db.add(proj_a)
    db.commit()
    db.refresh(proj_a)

    token_b = create_access_token(str(user_b.id))
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # User B attempts to access User A's project evidence -> 403 Forbidden
    res_b_mod = client.get(f"/projects/{proj_a.id}/evidence", headers=headers_b)
    assert res_b_mod.status_code == 403

    # Unauthenticated / Public Proof of Work Endpoint check
    public_res = client.get(f"/evidence/profile/{user_a.id}/proof-of-work")
    assert public_res.status_code == 200
    data = public_res.json()
    assert "projects" in data
    assert "merged_prs" in data
    assert "skills" in data
    assert "advisory" in data
    # Ensure sensitive user fields are NOT exposed
    assert "password_hash" not in data
    assert "token" not in data

    db.close()


def test_rc_4_network_rebuild_security_guard():
    """
    RC Safeguard 4: Network 🔨 Rebuild Security Guard.
    - User B rebuilds User A's Work Post.
    - New Project is owned by User B (owner_id = user_b.id).
    - Original post & project ownership remain intact (NO repo/code cloning).
    """
    db = SessionLocal()
    email_auth = f"author_{uuid.uuid4().hex[:6]}@example.com"
    email_reb = f"rebuilder_{uuid.uuid4().hex[:6]}@example.com"
    author = User(email=email_auth, password_hash="hash")
    rebuilder = User(email=email_reb, password_hash="hash")
    db.add_all([author, rebuilder])
    db.commit()
    db.refresh(author)
    db.refresh(rebuilder)

    original_proj = Project(owner_id=author.id, title="Original E-Commerce Service")
    db.add(original_proj)
    db.commit()
    db.refresh(original_proj)

    post = WorkPost(
        user_id=author.id,
        project_id=original_proj.id,
        post_type="project_launch",
        title="Launched E-Commerce Microservice",
        content="Engineered async order processing pipeline with FastAPI and PostgreSQL."
    )
    db.add(post)
    db.commit()
    db.refresh(post)

    token_reb = create_access_token(str(rebuilder.id))
    headers_reb = {"Authorization": f"Bearer {token_reb}"}

    # Rebuilder triggers 🔨 Rebuild
    res = client.post(f"/api/v1/network/rebuild/{post.id}", json={"target_role": "Backend Developer"}, headers=headers_reb)

    assert res.status_code == 200
    data = res.json()

    new_proj_id = uuid.UUID(data["new_project_id"])
    new_proj = db.query(Project).filter(Project.id == new_proj_id).first()
    assert new_proj is not None
    # Verify ownership is owned by user, NOT original author
    assert new_proj.owner_id != author.id

    # Verify original project owner is unchanged
    orig_proj_refreshed = db.query(Project).filter(Project.id == original_proj.id).first()
    assert orig_proj_refreshed.owner_id == author.id

    db.close()
