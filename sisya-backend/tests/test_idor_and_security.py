import uuid
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal, get_db
from app.models import User, Profile, Project, Milestone, Task, Repository, PullRequest, PRReview
from app.core.security import create_access_token

client = TestClient(app)


def test_idor_and_authorization_boundaries():
    """
    AGGRESSIVE IDOR & SECURITY AUDIT:
    Systematically verifies that Student A cannot read, modify, delete,
    or invoke AI agents against Student B's private resources via direct API parameter manipulation.
    """
    db = SessionLocal()
    app.dependency_overrides[get_db] = lambda: db

    try:
        # Create Student A and Student B
        user_a = User(email=f"user_a_{uuid.uuid4().hex[:6]}@qa.sisya.test", password_hash="hash_a")
        user_b = User(email=f"user_b_{uuid.uuid4().hex[:6]}@qa.sisya.test", password_hash="hash_b")
        db.add_all([user_a, user_b])
        db.commit()
        db.refresh(user_a)
        db.refresh(user_b)

        prof_a = Profile(user_id=user_a.id, github_username="user-a-git", target_role="Backend Developer")
        prof_b = Profile(user_id=user_b.id, github_username="user-b-git", target_role="Frontend Developer")
        db.add_all([prof_a, prof_b])
        db.commit()

        # Student B creates private project, milestone, task, repo, PR
        proj_b = Project(owner_id=user_b.id, title="Student B Secret Engine", description="Private IP")
        db.add(proj_b)
        db.commit()
        db.refresh(proj_b)

        ms_b = Milestone(project_id=proj_b.id, title="B Milestone 1", order=1)
        db.add(ms_b)
        db.commit()
        db.refresh(ms_b)

        task_b = Task(project_id=proj_b.id, milestone_id=ms_b.id, title="B Private Task", completion_criteria="Done", status="todo")
        db.add(task_b)
        db.commit()
        db.refresh(task_b)

        repo_b = Repository(project_id=proj_b.id, github_repo_id=f"repo-b-{uuid.uuid4().hex[:6]}", full_name="user-b/secret-repo")
        db.add(repo_b)
        db.commit()
        db.refresh(repo_b)

        pr_b = PullRequest(repository_id=repo_b.id, pr_number=1, title="B Secret PR", author_github_username="user-b-git", state="closed", merged=True)
        db.add(pr_b)
        db.commit()
        db.refresh(pr_b)

        token_a = create_access_token(str(user_a.id))
        headers_a = {"Authorization": f"Bearer {token_a}"}

        # 1. Student A attempts to access Student B's Project Evidence -> 403
        res1 = client.get(f"/projects/{proj_b.id}/evidence", headers=headers_a)
        assert res1.status_code == 403

        # 2. Student A attempts to access Student B's Kanban Board -> 403
        res2 = client.get(f"/tasks/project/{proj_b.id}/kanban", headers=headers_a)
        assert res2.status_code == 403

        # 3. Student A attempts to update Student B's Task status -> 403
        res3 = client.patch(f"/tasks/{task_b.id}/status", json={"status": "done"}, headers=headers_a)
        assert res3.status_code == 403

        # 4. Student A attempts to assign Student B's Task -> 403
        res4 = client.patch(f"/tasks/{task_b.id}/assign", json={"user_id": str(user_a.id)}, headers=headers_a)
        assert res4.status_code == 403

        # 5. Student A attempts to ask Task Mentor for Student B's Task -> 403
        res5 = client.post(f"/tasks/{task_b.id}/mentor", json={"question": "Tell me about this task"}, headers=headers_a)
        assert res5.status_code == 403

        # 6. Student A attempts to query AbhyāsBot against Student B's Task context -> 403
        res6 = client.post(
            "/api/v1/abhyas/chat",
            json={"agent": "abhyas_bot", "task_id": str(task_b.id), "message": "Give me code for B's task"},
            headers=headers_a
        )
        assert res6.status_code == 403, f"Expected 403, got {res6.status_code}: {res6.text}"

        # 7. Student A attempts to request PR review for Student B's PR -> 403
        res7 = client.post("/evidence/pr-review", json={"pull_request_id": str(pr_b.id)}, headers=headers_a)
        assert res7.status_code == 403

        # 8. Unauthenticated Public Profile endpoint exposes ONLY safe proof DTO
        res8 = client.get(f"/evidence/profile/{user_b.id}/proof-of-work")
        assert res8.status_code == 200
        data8 = res8.json()
        assert "projects" in data8
        assert "merged_prs" in data8
        assert "password_hash" not in data8
        assert "token" not in data8
    finally:
        app.dependency_overrides.clear()
        db.close()
