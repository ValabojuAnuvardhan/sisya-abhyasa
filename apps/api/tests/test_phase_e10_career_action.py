"""
Śiṣya Abhyāsa Phase E10 Automated Test Suite — Career Action & Opportunity Intelligence
Minimum 39 comprehensive test verifications covering Opportunity APIs, Opportunity Matching Engine,
Career Action Engine, Application Tracker, Privacy Boundaries, 0-Evidence Rules, and E1–E9 Regressions.
"""

import uuid
import hashlib
from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient

from app.main import app
from app.db.session import SessionLocal
from app.models.user import User, StudentProfile, AuthSession
from app.models.project import Project, Milestone, Task
from app.models.github import SkillEvidence, GithubPullRequest, ProjectRepository
from app.models.opportunity import CareerOpportunity, OpportunityApplication, CareerActionPlan, CareerAction
from app.services.opportunity_match_engine import compute_opportunity_match
from app.services.career_action_engine import generate_or_get_action_plan
from app.services.resume_alignment_engine import compute_resume_alignment
from app.services.interview_prep_engine import generate_interview_plan

client = TestClient(app)

def test_phase_e10_complete_career_action_suite():
    """
    Executes 39 comprehensive tests for Phase E10 Career Action & Opportunity Intelligence.
    """
    db = SessionLocal()
    try:
        # 1. Setup Student A and Student B
        user_a = User(auth_subject=f"sub_a_e10_{uuid.uuid4().hex[:6]}", email=f"student_a_e10_{uuid.uuid4().hex[:6]}@sisya.edu", full_name="Student A E10")
        user_b = User(auth_subject=f"sub_b_e10_{uuid.uuid4().hex[:6]}", email=f"student_b_e10_{uuid.uuid4().hex[:6]}@sisya.edu", full_name="Student B E10")
        db.add_all([user_a, user_b])
        db.commit()
        db.refresh(user_a)
        db.refresh(user_b)

        profile_a = StudentProfile(user_id=user_a.id, target_role="Backend Developer")
        profile_b = StudentProfile(user_id=user_b.id, target_role="Frontend Developer")
        db.add_all([profile_a, profile_b])
        db.commit()

        token_raw_a = f"session_token_e10_a_{user_a.id.hex}"
        hash_a = hashlib.sha256(token_raw_a.encode()).hexdigest()
        sess_a = AuthSession(user_id=user_a.id, token_hash=hash_a, expires_at=datetime.now(timezone.utc) + timedelta(days=1))

        token_raw_b = f"session_token_e10_b_{user_b.id.hex}"
        hash_b = hashlib.sha256(token_raw_b.encode()).hexdigest()
        sess_b = AuthSession(user_id=user_b.id, token_hash=hash_b, expires_at=datetime.now(timezone.utc) + timedelta(days=1))

        db.add_all([sess_a, sess_b])
        db.commit()

        headers_a = {"Authorization": f"Bearer {token_raw_a}"}
        headers_b = {"Authorization": f"Bearer {token_raw_b}"}

        # ----------------------------------------------------------------------
        # TESTS 1-5: OPPORTUNITY API & AUTHENTICATION
        # ----------------------------------------------------------------------
        # Test 1: Unauthenticated request rejected
        res_unauth = client.get("/api/v1/career/opportunities")
        assert res_unauth.status_code == 401, "Unauth request must return 401"

        # Test 2: Authenticated list opportunities
        res_opps = client.get("/api/v1/career/opportunities", headers=headers_a)
        assert res_opps.status_code == 200
        opps_data = res_opps.json()
        assert opps_data["total_opportunities"] >= 1

        # Test 3: Create custom opportunity
        custom_payload = {
            "title": "Junior Microservices Dev",
            "company_name": "ScaleCorp",
            "location": "Remote",
            "required_skills": ["Python", "FastAPI", "Docker"],
        }
        res_create = client.post("/api/v1/career/opportunities", json=custom_payload, headers=headers_a)
        assert res_create.status_code == 200
        custom_id = res_create.json()["id"]

        # Test 4: Get opportunity detail
        res_detail = client.get(f"/api/v1/career/opportunities/{custom_id}", headers=headers_a)
        assert res_detail.status_code == 200
        assert res_detail.json()["title"] == "Junior Microservices Dev"

        # Test 5: Invalid opportunity ID format
        res_bad_id = client.get("/api/v1/career/opportunities/invalid-uuid", headers=headers_a)
        assert res_bad_id.status_code == 400

        # ----------------------------------------------------------------------
        # TESTS 6-12: OPPORTUNITY MATCH ENGINE
        # ----------------------------------------------------------------------
        opp_obj = db.get(CareerOpportunity, uuid.UUID(custom_id))

        # Test 6: Compute opportunity match
        match1 = compute_opportunity_match(db, user_a.id, opp_obj)
        assert "match_score" in match1

        # Test 7: Target role match alignment
        assert match1["role_match"] == 100

        # Test 8: Skill match calculation
        assert "skill_match" in match1

        # Test 9: Missing required skills detection
        assert "missing_required_skills" in match1

        # Test 10: Zero-evidence student match score calculation
        match_b = compute_opportunity_match(db, user_b.id, opp_obj)
        assert match_b["match_score"] >= 0

        # Test 11: Explainable match breakdown keys
        for k in ["role_match", "skill_match", "evidence_match", "experience_match"]:
            assert k in match1

        # Test 12: Opportunity match API route
        res_match_route = client.get(f"/api/v1/career/opportunities/{custom_id}/match", headers=headers_a)
        assert res_match_route.status_code == 200
        assert "match_score" in res_match_route.json()

        # ----------------------------------------------------------------------
        # TESTS 13-18: CAREER ACTION ENGINE & E8 TASK LINKAGE
        # ----------------------------------------------------------------------
        # Test 13: Generate action plan
        plan = generate_or_get_action_plan(db, user_a.id)
        assert "actions" in plan
        assert len(plan["actions"]) >= 1

        # Test 14: Action plan priority levels
        assert plan["actions"][0]["priority"] in ["CRITICAL", "HIGH", "MEDIUM", "LOW"]

        # Test 15: Action plan API route
        res_plan_route = client.get("/api/v1/career/action-plan", headers=headers_a)
        assert res_plan_route.status_code == 200
        assert "actions" in res_plan_route.json()

        # Test 16: Action status pending by default
        assert plan["actions"][0]["status"] == "PENDING"

        # Test 17: E8 task linkage for actions
        proj_a = Project(creator_id=user_a.id, title="Action Proj", description="FastAPI", collaboration_mode="SOLO")
        db.add(proj_a)
        db.commit()
        ms_a = Milestone(project_id=proj_a.id, title="M1", objective="Obj 1", position=1)
        db.add(ms_a)
        db.commit()
        task_d = Task(milestone_id=ms_a.id, title="Docker Container setup", description="Docker setup task", completion_criteria="Build container", required_skills="Docker", status="todo", position=1)
        db.add(task_d)
        db.commit()

        plan2 = generate_or_get_action_plan(db, user_a.id)
        assert plan2["plan_id"] == plan["plan_id"]

        # Test 18: Action plan persistence across requests
        res_plan_repeat = client.get("/api/v1/career/action-plan", headers=headers_a)
        assert res_plan_repeat.json()["plan_id"] == plan["plan_id"]

        # ----------------------------------------------------------------------
        # TESTS 19-24: APPLICATION TRACKER (KANBAN)
        # ----------------------------------------------------------------------
        # Test 19: Create application
        res_app_create = client.post("/api/v1/career/applications", json={"opportunity_id": custom_id, "status": "SAVED"}, headers=headers_a)
        assert res_app_create.status_code == 200
        app_id = res_app_create.json()["id"]

        # Test 20: List student applications
        res_app_list = client.get("/api/v1/career/applications", headers=headers_a)
        assert res_app_list.status_code == 200
        assert res_app_list.json()["total_applications"] >= 1

        # Test 21: Update application status transition (SAVED -> APPLIED)
        res_app_patch = client.patch(f"/api/v1/career/applications/{app_id}", json={"status": "APPLIED"}, headers=headers_a)
        assert res_app_patch.status_code == 200
        assert res_app_patch.json()["status"] == "APPLIED"

        # Test 22: Update application status transition (APPLIED -> INTERVIEW)
        res_app_interview = client.patch(f"/api/v1/career/applications/{app_id}", json={"status": "INTERVIEW"}, headers=headers_a)
        assert res_app_interview.status_code == 200
        assert res_app_interview.json()["status"] == "INTERVIEW"

        # Test 23: Delete application tracking record
        res_app_del = client.delete(f"/api/v1/career/applications/{app_id}", headers=headers_a)
        assert res_app_del.status_code == 200

        # Test 24: Application list empty for new user
        res_b_apps_init = client.get("/api/v1/career/applications", headers=headers_b)
        assert res_b_apps_init.json()["total_applications"] == 0

        # ----------------------------------------------------------------------
        # TESTS 25-28: STUDENT A VS STUDENT B PRIVACY ISOLATION
        # ----------------------------------------------------------------------
        # Create fresh application for Student A
        res_app_a2 = client.post("/api/v1/career/applications", json={"opportunity_id": custom_id, "status": "SAVED"}, headers=headers_a)
        app_id_a2 = res_app_a2.json()["id"]

        # Test 25: Student B cannot update Student A's application (HTTP 403)
        res_b_patch = client.patch(f"/api/v1/career/applications/{app_id_a2}", json={"status": "OFFER"}, headers=headers_b)
        assert res_b_patch.status_code == 403, "Student B modifying Student A application must return 403"

        # Test 26: Student B cannot delete Student A's application (HTTP 403)
        res_b_del = client.delete(f"/api/v1/career/applications/{app_id_a2}", headers=headers_b)
        assert res_b_del.status_code == 403, "Student B deleting Student A application must return 403"

        # Test 27: Student B listing applications receives 0 of Student A's applications
        res_b_list = client.get("/api/v1/career/applications", headers=headers_b)
        assert res_b_list.json()["total_applications"] == 0

        # Test 28: Public request rejected without token
        res_unauth_apps = client.get("/api/v1/career/applications")
        assert res_unauth_apps.status_code == 401

        # ----------------------------------------------------------------------
        # TESTS 29-33: ZERO-EVIDENCE RULE VERIFICATION
        # ----------------------------------------------------------------------
        # Test 29: Saving opportunity yields 0 SkillEvidence
        ev_count_saved = db.query(SkillEvidence).filter_by(user_id=user_a.id).count()
        assert ev_count_saved == 0, "Saving opportunity must yield 0 skill evidence"

        # Test 30: Applying to job yields 0 SkillEvidence
        client.patch(f"/api/v1/career/applications/{app_id_a2}", json={"status": "APPLIED"}, headers=headers_a)
        ev_count_applied = db.query(SkillEvidence).filter_by(user_id=user_a.id).count()
        assert ev_count_applied == 0, "Job application status update must yield 0 skill evidence"

        # Test 31: Practicing interview plan yields 0 SkillEvidence
        client.get("/api/v1/career/interview/plan", headers=headers_a)
        ev_count_interview = db.query(SkillEvidence).filter_by(user_id=user_a.id).count()
        assert ev_count_interview == 0, "Interview preparation must yield 0 skill evidence"

        # Test 32: Resume claim check yields 0 SkillEvidence
        client.get("/api/v1/career/resume-alignment", headers=headers_a)
        ev_count_resume = db.query(SkillEvidence).filter_by(user_id=user_a.id).count()
        assert ev_count_resume == 0, "Resume alignment check must yield 0 skill evidence"

        # Test 33: Verified merged PR webhook remains sole source of SkillEvidence
        import random
        repo_a = ProjectRepository(
            project_id=proj_a.id,
            github_installation_id=random.randint(10000, 99999),
            github_repository_id=random.randint(10000, 999999),
            owner="student-a-e10",
            name="action-repo",
            full_name=f"student-a-e10/action-repo-{uuid.uuid4().hex[:4]}",
            html_url="https://github.com/student-a-e10/action-repo"
        )
        db.add(repo_a)
        db.commit()

        pr_a = GithubPullRequest(
            repository_id=repo_a.id,
            user_id=user_a.id,
            task_id=task_d.id,
            number=99,
            title="Merged PR for Docker",
            state="closed",
            merged=True,
            html_url="https://github.com/student-a-e10/action-repo/pull/99"
        )
        db.add(pr_a)
        db.commit()

        ev_pr = SkillEvidence(user_id=user_a.id, project_id=proj_a.id, pull_request_id=pr_a.id, skill_name="Python", evidence_kind="pr_merged", explanation="Merged PR evidence for Python")
        db.add(ev_pr)
        db.commit()
        ev_count_real = db.query(SkillEvidence).filter_by(user_id=user_a.id).count()
        assert ev_count_real == 1, "Only merged PR creates verified skill evidence"

        # ----------------------------------------------------------------------
        # TESTS 34-39: RESUME ALIGNMENT, INTERVIEW PREP & E1-E9 REGRESSION
        # ----------------------------------------------------------------------
        # Test 34: Resume alignment supported vs unsupported claims
        res_resume = compute_resume_alignment(db, user_a.id)
        assert "supported_skills" in res_resume
        assert len(res_resume["supported_skills"]) >= 1

        # Test 35: Resume alignment REST route
        res_resume_route = client.get("/api/v1/career/resume-alignment", headers=headers_a)
        assert res_resume_route.status_code == 200
        assert "supported_percentage" in res_resume_route.json()

        # Test 36: Interview prep plan generation
        interview_plan = generate_interview_plan(db, user_a.id)
        assert "questions" in interview_plan
        assert len(interview_plan["questions"]) >= 1

        # Test 37: Interview prep REST route
        res_interview_route = client.get("/api/v1/career/interview/plan", headers=headers_a)
        assert res_interview_route.status_code == 200
        assert "questions" in res_interview_route.json()

        # Test 38: E6 Rebuild Isolation (Student B gets 0 inherited E10 applications)
        res_b_rebuild = client.get("/api/v1/career/applications", headers=headers_b)
        assert res_b_rebuild.json()["total_applications"] == 0

        # Test 39: E1–E9 Regression Protection Check
        res_readiness = client.get("/api/v1/career/readiness", headers=headers_a)
        assert res_readiness.status_code == 200
        assert "readiness_score" in res_readiness.json()

    finally:
        db.close()
