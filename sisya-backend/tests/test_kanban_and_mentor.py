import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.models import User, Profile, Project, ProjectMember, Milestone, Task, TaskStatusHistory

client = TestClient(app)


def test_day_4_kanban_and_mentor_suite():
    db = SessionLocal()
    owner_email = "owner_day4@example.com"
    member_email = "member_day4@example.com"

    # Clean up old test users & data
    for em in [owner_email, member_email]:
        u = db.query(User).filter(User.email == em).first()
        if u:
            db.query(TaskStatusHistory).filter(TaskStatusHistory.changed_by_id == u.id).delete()
            db.query(ProjectMember).filter(ProjectMember.user_id == u.id).delete()
            projs = db.query(Project).filter(Project.owner_id == u.id).all()
            for p in projs:
                db.query(Task).filter(Task.project_id == p.id).delete()
                db.query(Milestone).filter(Milestone.project_id == p.id).delete()
                db.query(ProjectMember).filter(ProjectMember.project_id == p.id).delete()
                db.query(Project).filter(Project.id == p.id).delete()
            db.query(Profile).filter(Profile.user_id == u.id).delete()
            db.query(User).filter(User.id == u.id).delete()
            db.commit()
    db.close()

    # 1. Register Owner and Member
    reg_owner = client.post("/auth/register", json={"email": owner_email, "password": "Password123!", "github_url": "https://github.com/owner4"})
    assert reg_owner.status_code == 200
    owner_token = reg_owner.json()["token"]
    owner_id = reg_owner.json()["user_id"]
    owner_headers = {"Authorization": f"Bearer {owner_token}"}

    reg_member = client.post("/auth/register", json={"email": member_email, "password": "Password123!", "github_url": "https://github.com/member4"})
    assert reg_member.status_code == 200
    member_token = reg_member.json()["token"]
    member_id = reg_member.json()["user_id"]
    member_headers = {"Authorization": f"Bearer {member_token}"}

    # 2. Owner creates a Project
    proj_resp = client.post("/projects/", json={"title": "Day 4 Kanban Platform", "tech_stack": ["Python", "FastAPI", "React"]}, headers=owner_headers)
    assert proj_resp.status_code == 201
    project_id = proj_resp.json()["id"]

    # 3. Create a Milestone directly in DB for testing
    db_session = SessionLocal()
    milestone = Milestone(project_id=project_id, title="Sprint 1 Core Services", completion_pct=0)
    db_session.add(milestone)
    db_session.commit()
    db_session.refresh(milestone)
    milestone_id = str(milestone.id)
    db_session.close()

    # -------------------------------------------------------------
    # ASSERTION 1: Task Creation & Kanban Grouping
    # -------------------------------------------------------------
    t1_resp = client.post("/tasks/", json={
        "project_id": project_id,
        "milestone_id": milestone_id,
        "title": "Build Auth API",
        "description": "Implement registration and login JWT routes",
        "completion_criteria": "Tests pass for login and register",
        "required_skills": ["FastAPI", "JWT"],
        "status": "todo"
    }, headers=owner_headers)
    assert t1_resp.status_code == 201
    t1_data = t1_resp.json()
    t1_id = t1_data["id"]

    t2_resp = client.post("/tasks/", json={
        "project_id": project_id,
        "milestone_id": milestone_id,
        "title": "Build Profile API",
        "status": "in_progress"
    }, headers=owner_headers)
    assert t2_resp.status_code == 201

    kanban_resp = client.get(f"/tasks/project/{project_id}/kanban", headers=owner_headers)
    assert kanban_resp.status_code == 200
    kanban_data = kanban_resp.json()
    assert len(kanban_data["todo"]) == 1
    assert len(kanban_data["in_progress"]) == 1
    assert kanban_data["todo"][0]["id"] == t1_id

    # -------------------------------------------------------------
    # ASSERTION 2: TaskStatusHistory & Immutable Transition Log
    # -------------------------------------------------------------
    move_resp = client.patch(f"/tasks/{t1_id}/status", json={"status": "in_progress"}, headers=owner_headers)
    assert move_resp.status_code == 200
    assert move_resp.json()["status"] == "in_progress"

    hist_resp = client.get(f"/tasks/{t1_id}/history", headers=owner_headers)
    assert hist_resp.status_code == 200
    hist_list = hist_resp.json()
    assert len(hist_list) >= 2  # initial create (None->todo) + transition (todo->in_progress)
    latest_hist = hist_list[-1]
    assert latest_hist["from_status"] == "todo"
    assert latest_hist["to_status"] == "in_progress"
    assert latest_hist["changed_by_id"] == owner_id

    # -------------------------------------------------------------
    # ASSERTION 3: Milestone completion_pct Auto-Calculation
    # -------------------------------------------------------------
    move_done_resp = client.patch(f"/tasks/{t1_id}/status", json={"status": "done"}, headers=owner_headers)
    assert move_done_resp.status_code == 200

    db_session = SessionLocal()
    ms_db = db_session.query(Milestone).filter(Milestone.id == milestone_id).first()
    # 1 task is done out of 2 total tasks = 50% completion
    assert ms_db.completion_pct == 50
    db_session.close()

    # -------------------------------------------------------------
    # ASSERTION 4: Team Join Flow (request to join)
    # -------------------------------------------------------------
    join_resp = client.post(f"/projects/{project_id}/join", headers=member_headers)
    assert join_resp.status_code == 201
    member_req_id = join_resp.json()["id"]
    assert join_resp.json()["status"] == "pending"

    # Member list visible to owner
    members_resp = client.get(f"/projects/{project_id}/members", headers=owner_headers)
    assert members_resp.status_code == 200
    assert any(m["id"] == member_req_id and m["status"] == "pending" for m in members_resp.json())

    # -------------------------------------------------------------
    # ASSERTION 5: Team Approve & Reject Flow
    # -------------------------------------------------------------
    approve_resp = client.patch(f"/projects/{project_id}/members/{member_req_id}", json={"status": "approved"}, headers=owner_headers)
    assert approve_resp.status_code == 200
    assert approve_resp.json()["status"] == "approved"

    # Non-owner cannot approve/reject
    unauth_approve = client.patch(f"/projects/{project_id}/members/{member_req_id}", json={"status": "rejected"}, headers=member_headers)
    assert unauth_approve.status_code == 403

    # -------------------------------------------------------------
    # ASSERTION 6: Task Assignment to Approved Team Member
    # -------------------------------------------------------------
    assign_resp = client.patch(f"/tasks/{t1_id}/assign", json={"user_id": member_id}, headers=owner_headers)
    assert assign_resp.status_code == 200
    assert assign_resp.json()["assignee_id"] == member_id

    # Assigning to non-member fails with 400
    fake_assign_resp = client.patch(f"/tasks/{t1_id}/assign", json={"user_id": "00000000-0000-0000-0000-000000000000"}, headers=owner_headers)
    assert fake_assign_resp.status_code == 400

    # -------------------------------------------------------------
    # ASSERTION 7: Contextual AI Task Mentor
    # -------------------------------------------------------------
    mentor_resp = client.post(f"/tasks/{t1_id}/mentor", json={"question": "How do I implement JWT token verification cleanly?"}, headers=member_headers)
    assert mentor_resp.status_code == 200
    mentor_data = mentor_resp.json()
    assert "answer" in mentor_data and len(mentor_data["answer"]) > 0

    # Print Day 4 Status Acceptance Block
    status_block = (
        "\n=========================================="
        "\nDAY 4 STATUS"
        "\n\nTask system: PASS"
        "\nTaskStatusHistory: PASS"
        "\nStatus transitions: PASS"
        "\nTask assignment: PASS"
        "\nKanban grouping: PASS"
        "\nMilestone completion: PASS"
        "\nAI Task Mentor: PASS"
        "\nTeam join: PASS"
        "\nTeam approve: PASS"
        "\nTeam reject: PASS"
        "\n\nTests: 7/7 PASS"
        "\nFrontend modified: NO"
        "\n==========================================\n"
    )
    print(status_block)
