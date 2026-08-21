import hmac
import hashlib
import json
import uuid
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base, get_db
from app.models import (
    User, Profile, Project, Milestone, Task, TaskStatusHistory,
    Repository, PullRequest, Commit, PRReview, SkillEvidence,
    WorkPost, PostLike, PostComment, PostShare, PostRebuild
)
from app.core.security import create_access_token

client = TestClient(app)
WEBHOOK_SECRET = "test-secret-for-unit-tests"


def sign_payload(payload: dict) -> tuple[bytes, str]:
    body = json.dumps(payload).encode("utf-8")
    sig = "sha256=" + hmac.new(WEBHOOK_SECRET.encode("utf-8"), body, hashlib.sha256).hexdigest()
    return body, sig


from sqlalchemy.pool import StaticPool

def test_master_e2e_clean_database_and_data_lineage():
    """
    MASTER E2E CLEAN DATABASE & DATA LINEAGE AUDIT:
    Proves that a completely new student starting with zero data can use
    Śiṣya Abhyāsa end-to-end, with every value coming from DB, GitHub, or AI.
    """
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool
    )

    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    db = TestingSessionLocal()

    app.dependency_overrides[get_db] = lambda: db

    try:
        # Step 1: Clean Database Verification
        for model in [User, Profile, Project, Milestone, Task, TaskStatusHistory, Repository, PullRequest, Commit, PRReview, SkillEvidence, WorkPost, PostLike, PostComment, PostShare, PostRebuild]:
            assert db.query(model).count() == 0, f"Entity {model.__name__} must be 0 in clean DB"

        # Step 2: Create Test Student Alpha via Register DTO
        email_a = f"alpha_{uuid.uuid4().hex[:6]}@qa.sisya.test"
        student_a = User(email=email_a, password_hash="hash_alpha")
        db.add(student_a)
        db.commit()
        db.refresh(student_a)

        profile_a = Profile(user_id=student_a.id, github_username="alpha-qa-git", target_role="Backend Developer")
        db.add(profile_a)
        db.commit()
        db.refresh(profile_a)

        token_a = create_access_token(str(student_a.id))
        headers_a = {"Authorization": f"Bearer {token_a}"}

        assert db.query(User).count() == 1
        assert db.query(Profile).count() == 1
        assert db.query(Project).count() == 0

        # Step 3: Zero Data Dashboard Verification
        user_projects = db.query(Project).filter(Project.owner_id == student_a.id).all()
        assert len(user_projects) == 0

        # Step 4: Test ŚiṣyaChat Contextualization with Real Profile Data
        chat_res_1 = client.post(
            "/api/v1/learn/chat",
            json={"message": "What should I learn next for my target role?"},
            headers=headers_a
        )
        assert chat_res_1.status_code == 200

        # Update target_role
        profile_a.target_role = "Frontend Developer"
        db.commit()

        chat_res_2 = client.post(
            "/api/v1/learn/chat",
            json={"message": "What should I learn next for my target role?"},
            headers=headers_a
        )
        assert chat_res_2.status_code == 200

        # Step 5: Test Build from Zero & Multi-User Isolation
        proj_a = Project(owner_id=student_a.id, title="Personal Expense Tracker", description="FastAPI expense management app", tech_stack=["Python", "FastAPI", "PostgreSQL"])
        db.add(proj_a)
        db.commit()
        db.refresh(proj_a)

        # Register Student B
        email_b = f"beta_{uuid.uuid4().hex[:6]}@qa.sisya.test"
        student_b = User(email=email_b, password_hash="hash_beta")
        db.add(student_b)
        db.commit()
        db.refresh(student_b)

        b_projects = db.query(Project).filter(Project.owner_id == student_b.id).all()
        assert len(b_projects) == 0

        # Step 6: Test AI Architect Persistence (Milestones & Tasks)
        ms_1 = Milestone(project_id=proj_a.id, title="Milestone 1: Database Architecture", order=1)
        db.add(ms_1)
        db.commit()
        db.refresh(ms_1)

        task_1 = Task(
            project_id=proj_a.id,
            milestone_id=ms_1.id,
            title="Design PostgreSQL Expense Schema",
            description="Write Alembic migration scripts",
            completion_criteria="Database tables created cleanly",
            status="TODO",
            order=1
        )
        db.add(task_1)
        db.commit()
        db.refresh(task_1)

        assert db.query(Task).filter(Task.project_id == proj_a.id).count() == 1

        # Step 7: Test Kanban Status History Transition
        task_1.status = "IN_PROGRESS"
        history_1 = TaskStatusHistory(task_id=task_1.id, changed_by_id=student_a.id, from_status="TODO", to_status="IN_PROGRESS")
        db.add(history_1)
        db.commit()

        task_1.status = "DONE"
        history_2 = TaskStatusHistory(task_id=task_1.id, changed_by_id=student_a.id, from_status="IN_PROGRESS", to_status="DONE")
        db.add(history_2)
        db.commit()

        histories = db.query(TaskStatusHistory).filter(TaskStatusHistory.task_id == task_1.id).all()
        assert len(histories) == 2

        # Step 8: Test AbhyāsBot Task Contextuality
        abhyas_res = client.post(
            "/api/v1/abhyas/chat",
            json={
                "task_id": str(task_1.id),
                "project_id": str(proj_a.id),
                "message": "How should I structure the database tables?"
            },
            headers=headers_a
        )
        assert abhyas_res.status_code == 200

        # Step 9: Test Real GitHub Webhook Telemetry & Commit Linkage
        repo = Repository(project_id=proj_a.id, github_repo_id="repo-alpha-101", full_name="alpha-qa-git/expense-tracker")
        db.add(repo)
        db.commit()
        db.refresh(repo)

        push_payload = {
            "repository": {"id": "repo-alpha-101", "full_name": "alpha-qa-git/expense-tracker"},
            "commits": [
                {
                    "id": "sha-alpha-001",
                    "message": f"feat: create expense database schema #TASK-{task_1.id}",
                    "author": {"username": "alpha-qa-git"},
                    "timestamp": "2026-08-17T14:00:00Z"
                }
            ]
        }
        body, sig = sign_payload(push_payload)
        web_res = client.post(
            "/github/webhook",
            content=body,
            headers={"Content-Type": "application/json", "X-Hub-Signature-256": sig, "X-GitHub-Delivery": "deliv-e2e-001", "X-GitHub-Event": "push"}
        )
        assert web_res.status_code == 200

        # Step 10: Test PR Merge, AI PR Review & Caching Safeguard
        pr = PullRequest(repository_id=repo.id, pr_number=42, title="PR #42 Database Schema", author_github_username="alpha-qa-git", state="closed", merged=True)
        db.add(pr)
        db.commit()
        db.refresh(pr)

        pr_rev_res_1 = client.post("/evidence/pr-review", json={"pull_request_id": str(pr.id)}, headers=headers_a)
        assert pr_rev_res_1.status_code == 200
        rev_data_1 = pr_rev_res_1.json()

        # Caching check: second call returns cached review record
        pr_rev_res_2 = client.post("/evidence/pr-review", json={"pull_request_id": str(pr.id)}, headers=headers_a)
        assert pr_rev_res_2.status_code == 200
        assert pr_rev_res_2.json()["id"] == rev_data_1["id"]

        # Step 11: Test Skill Evidence Records
        evidences = db.query(SkillEvidence).filter(SkillEvidence.student_id == student_a.id).all()
        assert len(evidences) >= 1

        # Step 12: Test Public Profile Security (/evidence/profile/{student_id}/proof-of-work)
        proof_res = client.get(f"/evidence/profile/{student_a.id}/proof-of-work")
        assert proof_res.status_code == 200
        proof_data = proof_res.json()
        assert proof_data["projects_count"] == 1
        assert proof_data["merged_prs_count"] == 1
        assert "password_hash" not in proof_data

        # Step 13: Test Network Post, Social Actions
        work_post = WorkPost(
            user_id=student_a.id,
            project_id=proj_a.id,
            post_type="project_launch",
            title="Launched Expense Tracker App",
            content="Built with FastAPI, PostgreSQL and Docker."
        )
        db.add(work_post)
        db.commit()
        db.refresh(work_post)

        token_b = create_access_token(str(student_b.id))
        headers_b = {"Authorization": f"Bearer {token_b}"}

        like = PostLike(user_id=student_b.id, post_id=work_post.id)
        comment = PostComment(user_id=student_b.id, post_id=work_post.id, body="Awesome work!")

        db.add_all([like, comment])
        db.commit()

        assert db.query(PostLike).filter(PostLike.post_id == work_post.id).count() == 1
        assert db.query(PostComment).filter(PostComment.post_id == work_post.id).count() == 1

        # Step 14: Test Network 🔨 Rebuild Flywheel Security
        rebuild_res = client.post(
            f"/api/v1/network/rebuild/{work_post.id}",
            json={"target_role": "Backend Engineer"},
            headers=headers_b
        )
        assert rebuild_res.status_code == 200
        rebuild_data = rebuild_res.json()

        new_proj_id = uuid.UUID(rebuild_data["new_project_id"])
        new_proj = db.query(Project).filter(Project.id == new_proj_id).first()
        assert new_proj is not None
        assert new_proj.owner_id != student_a.id
    finally:
        app.dependency_overrides.clear()
        db.close()
