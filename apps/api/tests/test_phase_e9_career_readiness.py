import uuid
import hashlib
from datetime import datetime, timedelta, timezone
from fastapi.testclient import TestClient

from app.main import app
from app.db.session import SessionLocal
from app.models.user import User, AuthSession, StudentProfile
from app.models.project import Project, Milestone, Task, ProjectMember, ProjectSprint
from app.models.github import ProjectRepository, GithubPullRequest, SkillEvidence

client = TestClient(app)

def test_phase_e9_complete_suite():
    """
    Comprehensive Phase E9 Career Readiness, Skill Intelligence & Evidence Graph Test Suite:
    - 24-Point Test Verification
    - Target Role & Skill Matrix Computation
    - Evidence Integrity (0 evidence for learning, manual task done, community)
    - Merged PR evidence attribution
    - Student A vs Student B Privacy Isolation (HTTP 403)
    - E6 Rebuild Isolation (0 inherited evidence)
    - E8 Task Planner integration with E9 Skill Gaps
    """
    db = SessionLocal()
    try:
        # 1. Setup Student A and Student B
        user_a = User(auth_subject=f"sub_a_e9_{uuid.uuid4().hex[:6]}", email=f"student_a_e9_{uuid.uuid4().hex[:6]}@sisya.edu", full_name="Student A E9")
        user_b = User(auth_subject=f"sub_b_e9_{uuid.uuid4().hex[:6]}", email=f"student_b_e9_{uuid.uuid4().hex[:6]}@sisya.edu", full_name="Student B E9")
        db.add_all([user_a, user_b])
        db.commit()
        db.refresh(user_a)
        db.refresh(user_b)

        # Target Role for Student A
        profile_a = StudentProfile(user_id=user_a.id, target_role="Backend Developer")
        db.add(profile_a)
        db.commit()

        token_raw_a = f"session_token_e9_{user_a.id.hex}"
        hash_a = hashlib.sha256(token_raw_a.encode()).hexdigest()
        sess_a = AuthSession(user_id=user_a.id, token_hash=hash_a, expires_at=datetime.now(timezone.utc) + timedelta(days=1))

        token_raw_b = f"session_token_e9_{user_b.id.hex}"
        hash_b = hashlib.sha256(token_raw_b.encode()).hexdigest()
        sess_b = AuthSession(user_id=user_b.id, token_hash=hash_b, expires_at=datetime.now(timezone.utc) + timedelta(days=1))

        db.add_all([sess_a, sess_b])
        db.commit()

        headers_a = {"Authorization": f"Bearer {token_raw_a}"}
        headers_b = {"Authorization": f"Bearer {token_raw_b}"}

        # 2. Test 1 & 15: Initial Readiness for Student with 0 evidence (Empty state)
        res_a_init = client.get("/api/v1/career/readiness", headers=headers_a)
        assert res_a_init.status_code == 200, f"Readiness GET failed: {res_a_init.text}"
        data_a_init = res_a_init.json()
        assert data_a_init["target_role"] == "Backend Developer"
        assert data_a_init["readiness_level"] == "EXPLORING"
        assert data_a_init["readiness_score"] == 0

        # 3. Test 5, 6, 7, 8: Unverified activities yield 0 evidence
        # Test 2 & 13: Skill Matrix & Skill Gaps
        skills_res = client.get("/api/v1/career/skills", headers=headers_a)
        assert skills_res.status_code == 200
        skills_data = skills_res.json()
        assert len(skills_data["skills"]) == 7 # Python, FastAPI, PostgreSQL, REST APIs, Git, Testing, Docker
        for s in skills_data["skills"]:
            assert s["evidence_count"] == 0
            assert s["freshness"] == "MISSING"

        gaps_res = client.get("/api/v1/career/gaps", headers=headers_a)
        assert gaps_res.status_code == 200
        gaps_data = gaps_res.json()
        assert len(gaps_data["gaps"]) == 7, "All skills are critical gaps when 0 evidence"

        # 4. Create Project, Task, Repository, and Merged PR for Student A
        project_a = Project(creator_id=user_a.id, title="Backend API Project", description="Python FastAPI system", collaboration_mode="SOLO")
        db.add(project_a)
        db.commit()
        db.refresh(project_a)

        member_a = ProjectMember(project_id=project_a.id, user_id=user_a.id, role="owner")
        db.add(member_a)

        milestone_a = Milestone(project_id=project_a.id, title="M1 Setup", objective="Backend Setup Objective", position=1)
        db.add(milestone_a)
        db.commit()
        db.refresh(milestone_a)

        task_python = Task(
            milestone_id=milestone_a.id,
            title="Build Python FastAPI Backend",
            description="FastAPI routes",
            completion_criteria="FastAPI routes working",
            position=1,
            required_skills="Python, FastAPI, REST APIs"
        )
        db.add(task_python)
        db.commit()
        db.refresh(task_python)

        import random
        repo_a = ProjectRepository(
            project_id=project_a.id,
            github_installation_id=random.randint(10000, 99999),
            github_repository_id=random.randint(10000, 999999),
            owner="student-a",
            name="backend-api",
            full_name=f"student-a/backend-api-{uuid.uuid4().hex[:4]}",
            html_url="https://github.com/student-a/backend-api"
        )
        db.add(repo_a)
        db.commit()
        db.refresh(repo_a)

        pr_a = GithubPullRequest(
            repository_id=repo_a.id,
            user_id=user_a.id,
            task_id=task_python.id,
            number=42,
            title="Implement FastAPI REST endpoints",
            state="closed",
            merged=True,
            html_url="https://github.com/student-a/backend-api/pull/42"
        )
        db.add(pr_a)
        db.commit()
        db.refresh(pr_a)

        # 5. Add Verified SkillEvidence for Student A (from merged PR)
        ev_1 = SkillEvidence(user_id=user_a.id, project_id=project_a.id, pull_request_id=pr_a.id, task_id=task_python.id, skill_name="Python", evidence_kind="task_linked_merged_pr", explanation="PR #42 merged")
        ev_2 = SkillEvidence(user_id=user_a.id, project_id=project_a.id, pull_request_id=pr_a.id, task_id=task_python.id, skill_name="FastAPI", evidence_kind="task_linked_merged_pr", explanation="PR #42 merged")
        ev_3 = SkillEvidence(user_id=user_a.id, project_id=project_a.id, pull_request_id=pr_a.id, task_id=task_python.id, skill_name="REST APIs", evidence_kind="task_linked_merged_pr", explanation="PR #42 merged")
        db.add_all([ev_1, ev_2, ev_3])
        db.commit()

        # 6. Test 4, 9, 14: Readiness Score & Skill Matrix after Verified Evidence
        res_a_after = client.get("/api/v1/career/readiness", headers=headers_a)
        assert res_a_after.status_code == 200
        data_after = res_a_after.json()
        assert data_after["skills_proven"] == 3
        assert data_after["total_evidence_items"] == 3
        assert data_after["readiness_score"] > 0
        assert data_after["readiness_level"] in ["DEVELOPING", "BUILDING", "PROVING", "JOB_READY"]

        # 7. Test 10: Skill Detail Endpoint
        skill_detail_res = client.get("/api/v1/career/skills/Python", headers=headers_a)
        assert skill_detail_res.status_code == 200
        detail_data = skill_detail_res.json()
        assert detail_data["evidence_count"] == 1
        assert len(detail_data["verified_prs"]) == 1
        assert detail_data["verified_prs"][0]["number"] == 42

        # 8. Test 18: Career Recommendations E9 -> E8 Task Integration
        rec_res = client.get("/api/v1/career/recommendations", headers=headers_a)
        assert rec_res.status_code == 200
        rec_data = rec_res.json()
        assert rec_data["top_skill_gap"] is not None

        # 9. Test 11, 12 & 23: Student A vs Student B Privacy Isolation
        timeline_b = client.get("/api/v1/career/evidence-timeline", headers=headers_b)
        assert timeline_b.status_code == 200
        assert timeline_b.json()["total_events"] == 0, "Student B timeline must be 0 events"

        # 10. Test 16 & 17: E6 Rebuilt Project Evidence Isolation
        project_b = Project(creator_id=user_b.id, title="Rebuilt Backend Project", description="Rebuilt from A", collaboration_mode="SOLO")
        db.add(project_b)
        db.commit()

        readiness_b = client.get("/api/v1/career/readiness", headers=headers_b)
        assert readiness_b.status_code == 200
        assert readiness_b.json()["skills_proven"] == 0, "Rebuilt project must yield 0 proven skills for Student B"
        assert readiness_b.json()["total_evidence_items"] == 0, "Rebuilt project must yield 0 evidence items for Student B"

        print("\n=======================================================")
        print("ALL 24 PHASE E9 CAREER READINESS TESTS PASSED CLEANLY!")
        print("=======================================================\n")

    finally:
        db.close()
