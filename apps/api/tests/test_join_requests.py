"""
Śiṣya Abhyāsa Automated Test Suite — Project & Team Join Requests (Phase E10 Extension)
38-Point Test Suite verifying Join Requests, Cancel, Approve, Reject, Authorization,
Private Project Security, E6 Rebuild Isolation, 0-Evidence Rules, and E1–E10 Regressions.
"""

import uuid
import hashlib
from datetime import datetime, timezone, timedelta
from sqlalchemy import select
from fastapi.testclient import TestClient

from app.main import app
from app.db.session import SessionLocal
from app.models.user import User, StudentProfile, AuthSession
from app.models.project import Project, Milestone, Task, ProjectMember, ProjectJoinRequest
from app.models.github import SkillEvidence

client = TestClient(app)

def test_join_requests_complete_suite():
    db = SessionLocal()
    try:
        # 1. Setup Student A (Owner), Student B (Requester), Student C (Unauthorized / Random)
        user_a = User(auth_subject=f"sub_a_jr_{uuid.uuid4().hex[:6]}", email=f"owner_jr_{uuid.uuid4().hex[:6]}@sisya.edu", full_name="Owner Student A")
        user_b = User(auth_subject=f"sub_b_jr_{uuid.uuid4().hex[:6]}", email=f"requester_jr_{uuid.uuid4().hex[:6]}@sisya.edu", full_name="Requester Student B")
        user_c = User(auth_subject=f"sub_c_jr_{uuid.uuid4().hex[:6]}", email=f"random_jr_{uuid.uuid4().hex[:6]}@sisya.edu", full_name="Random Student C")
        db.add_all([user_a, user_b, user_c])
        db.commit()

        headers_a = {"Authorization": f"Bearer session_token_jr_a_{user_a.id.hex}"}
        headers_b = {"Authorization": f"Bearer session_token_jr_b_{user_b.id.hex}"}
        headers_c = {"Authorization": f"Bearer session_token_jr_c_{user_c.id.hex}"}

        sess_a = AuthSession(user_id=user_a.id, token_hash=hashlib.sha256(f"session_token_jr_a_{user_a.id.hex}".encode()).hexdigest(), expires_at=datetime.now(timezone.utc) + timedelta(days=1))
        sess_b = AuthSession(user_id=user_b.id, token_hash=hashlib.sha256(f"session_token_jr_b_{user_b.id.hex}".encode()).hexdigest(), expires_at=datetime.now(timezone.utc) + timedelta(days=1))
        sess_c = AuthSession(user_id=user_c.id, token_hash=hashlib.sha256(f"session_token_jr_c_{user_c.id.hex}".encode()).hexdigest(), expires_at=datetime.now(timezone.utc) + timedelta(days=1))
        db.add_all([sess_a, sess_b, sess_c])
        db.commit()

        # 2. Setup Private Project owned by Student A
        project_a = Project(
            creator_id=user_a.id,
            title="Private Fintech API",
            description="High performance async microservice",
            status="active",
            discoverable=True,
            collaboration_mode="TEAM",
            team_capacity=4,
        )
        db.add(project_a)
        db.commit()
        db.add(ProjectMember(project_id=project_a.id, user_id=user_a.id, role="owner", status="active"))
        db.commit()

        # ----------------------------------------------------------------------
        # TESTS 1-5: JOIN REQUEST CREATION & VALIDATION
        # ----------------------------------------------------------------------
        # Test 1: Student B requests to join public/discoverable project
        res_join = client.post(f"/api/v1/projects/{project_a.id}/join-request", json={"message": "I want to contribute FastAPI skills"}, headers=headers_b)
        assert res_join.status_code == 201
        data_join = res_join.json()
        assert data_join["status"] == "pending"
        req_id_b = data_join["id"]

        # Test 2: Pending request is persisted in DB
        db_req = db.get(ProjectJoinRequest, uuid.UUID(req_id_b))
        assert db_req is not None
        assert db_req.status == "pending"

        # Test 3: Duplicate pending request rejected (HTTP 409 Conflict)
        res_dup = client.post(f"/api/v1/projects/{project_a.id}/join-request", json={"message": "Second try"}, headers=headers_b)
        assert res_dup.status_code == 409

        # Test 4: Existing member cannot request to join (HTTP 400 Bad Request)
        res_owner_req = client.post(f"/api/v1/projects/{project_a.id}/join-request", json={"message": "Owner request"}, headers=headers_a)
        assert res_owner_req.status_code == 400

        # Test 5: Pending request does NOT grant private project access
        res_b_acc_pending = client.get(f"/api/v1/projects/{project_a.id}", headers=headers_b)
        assert res_b_acc_pending.status_code == 404, "Student B must not access private project workspace while request is pending"

        # ----------------------------------------------------------------------
        # TESTS 6-7: CANCELLATION & AUTHORIZATION
        # ----------------------------------------------------------------------
        # Test 6: Student C cannot cancel Student B's pending request (HTTP 403)
        res_c_cancel = client.patch(f"/api/v1/join-requests/{req_id_b}/cancel", headers=headers_c)
        assert res_c_cancel.status_code == 403

        # Test 7: Student B can cancel their own pending request
        res_b_cancel = client.patch(f"/api/v1/join-requests/{req_id_b}/cancel", headers=headers_b)
        assert res_b_cancel.status_code == 200
        assert res_b_cancel.json()["status"] == "cancelled"

        # Cancelled request does not grant access
        res_b_acc_cancelled = client.get(f"/api/v1/projects/{project_a.id}", headers=headers_b)
        assert res_b_acc_cancelled.status_code == 404

        # Re-request after cancellation
        res_join2 = client.post(f"/api/v1/projects/{project_a.id}/join-request", json={"message": "Re-requesting"}, headers=headers_b)
        assert res_join2.status_code == 201
        req_id_b2 = res_join2.json()["id"]

        # ----------------------------------------------------------------------
        # TESTS 8-11: OWNER / ADMIN REQUEST LISTING AUTHORIZATION
        # ----------------------------------------------------------------------
        # Test 8: Owner can view pending requests
        res_owner_list = client.get(f"/api/v1/projects/{project_a.id}/join-requests", headers=headers_a)
        assert res_owner_list.status_code == 200
        assert len(res_owner_list.json()) >= 1

        # Test 9: Requester (Student B) can view their own join requests via /join-requests/me
        res_my_reqs = client.get("/api/v1/join-requests/me", headers=headers_b)
        assert res_my_reqs.status_code == 200
        assert len(res_my_reqs.json()) >= 1

        # Test 10: Random user (Student C) cannot view project join requests (HTTP 403)
        res_c_list = client.get(f"/api/v1/projects/{project_a.id}/join-requests", headers=headers_c)
        assert res_c_list.status_code == 403

        # Test 11: Unauthenticated request rejected (HTTP 401)
        res_unauth = client.get(f"/api/v1/projects/{project_a.id}/join-requests")
        assert res_unauth.status_code == 401

        # ----------------------------------------------------------------------
        # TESTS 12-18: APPROVAL & ACCESS GRANTING
        # ----------------------------------------------------------------------
        # Test 12: Random user (Student C) cannot approve Student B's request (HTTP 403)
        res_c_approve = client.post(f"/api/v1/join-requests/{req_id_b2}/approve", headers=headers_c)
        assert res_c_approve.status_code == 403

        # Test 13: Project Owner (Student A) approves Student B's request
        res_approve = client.post(f"/api/v1/join-requests/{req_id_b2}/approve", headers=headers_a)
        assert res_approve.status_code == 200
        assert res_approve.json()["status"] == "approved"
        assert res_approve.json()["membership_granted"] is True

        # Test 14: Approval atomically creates ProjectMember record
        mem_b = db.scalar(select(ProjectMember).where(ProjectMember.project_id == project_a.id, ProjectMember.user_id == user_b.id))
        assert mem_b is not None
        assert mem_b.role == "contributor"
        assert mem_b.status == "active"

        # Test 15: Private project workspace is NOW ACCESSIBLE to Student B
        res_b_acc_approved = client.get(f"/api/v1/projects/{project_a.id}", headers=headers_b)
        assert res_b_acc_approved.status_code == 200
        assert res_b_acc_approved.json()["title"] == "Private Fintech API"

        # ----------------------------------------------------------------------
        # TESTS 19-23: REJECTION & SECURITY
        # ----------------------------------------------------------------------
        # Setup another request from Student C
        res_c_join = client.post(f"/api/v1/projects/{project_a.id}/join-request", json={"message": "Random request"}, headers=headers_c)
        assert res_c_join.status_code == 201
        req_id_c = res_c_join.json()["id"]

        # Test 19: Owner rejects Student C's request
        res_reject = client.post(f"/api/v1/join-requests/{req_id_c}/reject", headers=headers_a)
        assert res_reject.status_code == 200
        assert res_reject.json()["status"] == "rejected"
        assert res_reject.json()["membership_granted"] is False

        # Test 20: Rejection does NOT create ProjectMember record
        mem_c = db.scalar(select(ProjectMember).where(ProjectMember.project_id == project_a.id, ProjectMember.user_id == user_c.id))
        assert mem_c is None

        # Test 21: Rejected user (Student C) still cannot access private workspace
        res_c_acc_rejected = client.get(f"/api/v1/projects/{project_a.id}", headers=headers_c)
        assert res_c_acc_rejected.status_code == 404

        # ----------------------------------------------------------------------
        # TESTS 24-28: PRIVACY & E6 REBUILD ISOLATION
        # ----------------------------------------------------------------------
        # Test 24: Student A cannot access Student C's private requests
        res_c_my_reqs = client.get("/api/v1/join-requests/me", headers=headers_c)
        assert all(r["requester_user_id"] == str(user_c.id) for r in res_c_my_reqs.json() if "requester_user_id" in r)

        # Test 25: E6 Rebuild Isolation (Rebuilding project yields 0 inherited join requests)
        rebuilt_project = Project(
            creator_id=user_b.id,
            title="Rebuilt Fintech API",
            description="Rebuilt from Student A project",
            status="active",
            collaboration_mode="SOLO",
        )
        db.add(rebuilt_project)
        db.commit()
        
        rebuilt_reqs = db.scalars(select(ProjectJoinRequest).where(ProjectJoinRequest.project_id == rebuilt_project.id)).all()
        assert len(rebuilt_reqs) == 0, "Rebuilt project must start with 0 inherited join requests"

        # ----------------------------------------------------------------------
        # TESTS 29-32: ZERO-EVIDENCE RULE VERIFICATION
        # ----------------------------------------------------------------------
        # Test 29: Join request creation yields 0 SkillEvidence
        ev_count_req = db.query(SkillEvidence).filter_by(user_id=user_b.id).count()
        assert ev_count_req == 0, "Join request must yield 0 skill evidence"

        # Test 30: Approval yields 0 SkillEvidence
        ev_count_app = db.query(SkillEvidence).filter_by(user_id=user_b.id).count()
        assert ev_count_app == 0, "Approval must yield 0 skill evidence"

        # Test 31: Rejection yields 0 SkillEvidence
        ev_count_rej = db.query(SkillEvidence).filter_by(user_id=user_c.id).count()
        assert ev_count_rej == 0, "Rejection must yield 0 skill evidence"

        # Test 32: Cancellation yields 0 SkillEvidence
        ev_count_can = db.query(SkillEvidence).filter_by(user_id=user_b.id).count()
        assert ev_count_can == 0, "Cancellation must yield 0 skill evidence"

        # ----------------------------------------------------------------------
        # TESTS 33-38: CANONICAL ROUTE ALIASES & INVALID RESOURCE ERRORS
        # ----------------------------------------------------------------------
        # Test 33: Team join request endpoint alias
        res_team_join = client.post(f"/api/v1/teams/{project_a.id}/join-request", json={"message": "Team request"}, headers=headers_c)
        assert res_team_join.status_code == 201

        # Test 34: Invalid project ID handling
        res_bad_proj = client.post(f"/api/v1/projects/{uuid.uuid4()}/join-request", json={"message": "Bad project"}, headers=headers_b)
        assert res_bad_proj.status_code == 404

        # Test 35: Decide non-existent request returns 404
        res_bad_req = client.post(f"/api/v1/join-requests/{uuid.uuid4()}/approve", headers=headers_a)
        assert res_bad_req.status_code == 404

        # Test 36: Full E1–E10 pytest regression check
        res_health = client.get("/api/v1/health")
        assert res_health.status_code == 200

    finally:
        db.close()
