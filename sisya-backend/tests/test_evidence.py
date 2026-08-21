import uuid
import pytest
from datetime import datetime, timezone
from fastapi.testclient import TestClient

from app.database import Base, engine, SessionLocal
from app.main import app
from app.models import User, Profile, Project, Repository, PullRequest, Commit, PRReview, SkillEvidence
from app.core.security import hash_password, create_access_token

Base.metadata.create_all(bind=engine)
client = TestClient(app)


@pytest.fixture
def db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def test_evidence_pipeline_and_proof_of_work(db_session):
    # Setup test user and profile
    unique_suffix = uuid.uuid4().hex[:6]
    test_email = f"evidence_student_{unique_suffix}@example.com"
    gh_username = f"evidencestudent_{unique_suffix}"

    user = User(
        email=test_email,
        password_hash=hash_password("Password123!")
    )
    db_session.add(user)
    db_session.commit()

    profile = Profile(
        user_id=user.id,
        github_username=gh_username,
        skills=["Python", "FastAPI"],
        target_role="Backend Developer"
    )
    db_session.add(profile)

    # Setup test project and repo
    project = Project(
        owner_id=user.id,
        title=f"Evidence Test Project {unique_suffix}",
        description="A test project for AI PR Review and evidence engine",
        tech_stack=["Python", "FastAPI", "PostgreSQL"]
    )
    db_session.add(project)
    db_session.commit()

    repo = Repository(
        project_id=project.id,
        github_repo_id=f"repo_id_{unique_suffix}",
        full_name=f"sisya/{unique_suffix}",
        owner_github_username=gh_username
    )
    db_session.add(repo)
    db_session.commit()

    # Create merged PR
    pr = PullRequest(
        repository_id=repo.id,
        pr_number=101,
        title="Add AI evidence extraction pipeline",
        author_github_username=gh_username,
        state="closed",
        merged=True,
        merged_at=datetime.now(timezone.utc)
    )
    db_session.add(pr)
    db_session.commit()

    # Add commit for PR
    commit = Commit(
        repository_id=repo.id,
        sha=f"sha_{unique_suffix}",
        author_github_username=gh_username,
        message="feat: implement skill evidence generation",
        files_changed=["app/api/evidence.py", "app/models/user.py"]
    )
    db_session.add(commit)
    db_session.commit()

    token = create_access_token(str(user.id))
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Test POST /evidence/pr-review
    pr_review_payload = {"pull_request_id": str(pr.id)}
    resp1 = client.post("/evidence/pr-review", json=pr_review_payload, headers=headers)
    assert resp1.status_code == 200, f"PR review creation failed: {resp1.text}"
    review_data = resp1.json()

    assert "id" in review_data
    assert review_data["pull_request_id"] == str(pr.id)
    assert "summary" in review_data
    assert len(review_data["strengths"]) > 0
    assert len(review_data["improvements"]) > 0
    assert len(review_data["inline_comments"]) > 0
    assert len(review_data["skills_demonstrated"]) > 0
    assert review_data["advisory"] is True
    assert review_data["advisory_label"] == "AI-generated code review — for learning guidance only"

    review_id_1 = review_data["id"]

    # 2. Test Review Caching (Second call must hit cache and return identical review instantly)
    resp2 = client.post("/evidence/pr-review", json=pr_review_payload, headers=headers)
    assert resp2.status_code == 200
    review_data_cached = resp2.json()
    assert review_data_cached["id"] == review_id_1

    # 3. Test GET /evidence/profile/{id}/skills
    skills_resp = client.get(f"/evidence/profile/{user.id}/skills")
    assert skills_resp.status_code == 200
    skills_data = skills_resp.json()
    assert skills_data["student_id"] == str(user.id)
    assert len(skills_data["skills"]) > 0
    for sk in skills_data["skills"]:
        assert "skill" in sk
        assert "confidence" in sk
        assert len(sk["evidence"]) > 0
        assert sk["evidence"][0]["advisory"] is True

    # 4. Test GET /evidence/profile/{id}/proof-of-work
    pow_resp = client.get(f"/evidence/profile/{user.id}/proof-of-work")
    assert pow_resp.status_code == 200
    pow_data = pow_resp.json()

    assert pow_data["student_id"] == str(user.id)
    assert pow_data["github_username"] == gh_username
    assert pow_data["projects_count"] == len(pow_data["projects"])
    assert pow_data["merged_prs_count"] == 1
    assert len(pow_data["merged_prs"]) == 1
    assert pow_data["merged_prs"][0]["pr_number"] == 101
    assert len(pow_data["skills"]) > 0

    print("\n--- DAY 6 PROOF OF WORK VERIFICATION ---")
    print(f"Student ID: {pow_data['student_id']}")
    print(f"GitHub Username: {pow_data['github_username']}")
    print(f"Projects Count: {pow_data['projects_count']}")
    print(f"Merged PRs Count: {pow_data['merged_prs_count']}")
    print("Skills Demonstrated:")
    for sk in pow_data["skills"]:
        print(f"  - {sk['skill']} (Confidence: {sk['confidence']}, Evidence Count: {len(sk['evidence'])})")
    print("-------------------------------------------\n")


def test_unmerged_pr_review_rejected(db_session):
    user = User(email=f"unmerged_{uuid.uuid4().hex[:6]}@example.com", password_hash=hash_password("Pass123!"))
    db_session.add(user)
    db_session.commit()

    project = Project(owner_id=user.id, title="Unmerged PR Project")
    db_session.add(project)
    db_session.commit()

    repo = Repository(project_id=project.id, github_repo_id=uuid.uuid4().hex, full_name=f"sisya/unmerged_{uuid.uuid4().hex[:4]}")
    db_session.add(repo)
    db_session.commit()

    unmerged_pr = PullRequest(
        repository_id=repo.id,
        pr_number=50,
        title="Unmerged Draft PR",
        author_github_username="draftuser",
        state="open",
        merged=False
    )
    db_session.add(unmerged_pr)
    db_session.commit()

    token = create_access_token(str(user.id))
    resp = client.post("/evidence/pr-review", json={"pull_request_id": str(unmerged_pr.id)}, headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 400
    assert resp.json()["detail"] == "PR review requires a merged pull request"
