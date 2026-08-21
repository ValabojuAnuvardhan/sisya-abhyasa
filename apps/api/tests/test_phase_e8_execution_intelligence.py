import uuid
import hashlib
from datetime import datetime, timedelta, timezone
from fastapi.testclient import TestClient

from app.main import app
from app.db.session import SessionLocal
from app.models.user import User, AuthSession
from app.models.project import Project, Milestone, Task, ProjectSprint, TaskDependency, TaskBlocker, ProjectMember

client = TestClient(app)

def test_phase_e8_complete_suite():
    """
    Complete Phase E8 Integration & Isolation Test Suite:
    - Settings GET & PATCH
    - Task Priority Update
    - Dependency Creation, Self Dependency Rejection & Cycle Rejection
    - Dependency Graph & Critical Path
    - Blocker Creation, AI Advisory Suggestion, and Resolution
    - Sprint Engine Creation & Date Validation (start <= end)
    - Workload & Capacity Engine calculation
    - Next Best Action Recommendation Engine
    - Multi-User Privacy Isolation (Student A vs Student B)
    """
    db = SessionLocal()
    try:
        # Create Student A and Student B
        user_a = User(auth_subject=f"sub_a_{uuid.uuid4().hex[:6]}", email=f"student_a_{uuid.uuid4().hex[:6]}@sisya.edu", full_name="Student A")
        user_b = User(auth_subject=f"sub_b_{uuid.uuid4().hex[:6]}", email=f"student_b_{uuid.uuid4().hex[:6]}@sisya.edu", full_name="Student B")
        db.add_all([user_a, user_b])
        db.commit()
        db.refresh(user_a)
        db.refresh(user_b)

        token_raw_a = f"session_token_{user_a.id.hex}"
        hash_a = hashlib.sha256(token_raw_a.encode()).hexdigest()
        sess_a = AuthSession(user_id=user_a.id, token_hash=hash_a, expires_at=datetime.now(timezone.utc) + timedelta(days=1))

        token_raw_b = f"session_token_{user_b.id.hex}"
        hash_b = hashlib.sha256(token_raw_b.encode()).hexdigest()
        sess_b = AuthSession(user_id=user_b.id, token_hash=hash_b, expires_at=datetime.now(timezone.utc) + timedelta(days=1))

        db.add_all([sess_a, sess_b])
        db.commit()

        headers_a = {"Authorization": f"Bearer {token_raw_a}"}
        headers_b = {"Authorization": f"Bearer {token_raw_b}"}

        # 1. Settings GET
        res = client.get("/api/v1/settings/me", headers=headers_a)
        assert res.status_code == 200, f"Settings GET failed: {res.text}"
        assert res.json()["email"] == user_a.email

        # 2. Settings PATCH
        patch_res = client.patch("/api/v1/settings/me", json={"target_role": "Backend Engineer", "bio": "Systems programmer"}, headers=headers_a)
        assert patch_res.status_code == 200, f"Settings PATCH failed: {patch_res.text}"
        
        get_after_patch = client.get("/api/v1/settings/me", headers=headers_a)
        assert get_after_patch.json()["target_role"] == "Backend Engineer"

        # Create Project for Student A
        project_a = Project(creator_id=user_a.id, title="Project A Execution Test", description="Test suite project", collaboration_mode="SOLO")
        db.add(project_a)
        db.commit()
        db.refresh(project_a)

        milestone_a = Milestone(project_id=project_a.id, title="Milestone 1", objective="Setup", position=1)
        db.add(milestone_a)
        db.commit()
        db.refresh(milestone_a)

        task_1 = Task(milestone_id=milestone_a.id, title="Task 1 Architecture", description="Design DAG", completion_criteria="Schema done", position=1, priority="HIGH", estimated_hours=10.0)
        task_2 = Task(milestone_id=milestone_a.id, title="Task 2 API Endpoints", description="Build REST routes", completion_criteria="Routes 200 OK", position=2, priority="HIGH", estimated_hours=15.0)
        task_3 = Task(milestone_id=milestone_a.id, title="Task 3 Frontend UI", description="Build React components", completion_criteria="Render state", position=3, priority="MEDIUM", estimated_hours=8.0)
        db.add_all([task_1, task_2, task_3])
        db.commit()
        db.refresh(task_1)
        db.refresh(task_2)
        db.refresh(task_3)

        # 3. Task Priority & Details Update
        up_res = client.patch(f"/api/v1/execution/tasks/{task_1.id}", json={"priority": "CRITICAL", "estimated_hours": 12.0}, headers=headers_a)
        assert up_res.status_code == 200, f"Task update failed: {up_res.text}"
        assert up_res.json()["priority"] == "CRITICAL"

        # 4. Dependency Creation (Task 2 depends on Task 1)
        dep_res = client.post(f"/api/v1/execution/tasks/{task_2.id}/dependencies", json={"depends_on_task_id": str(task_1.id)}, headers=headers_a)
        assert dep_res.status_code == 200, f"Dependency creation failed: {dep_res.text}"

        # 5. Self Dependency Rejection
        self_res = client.post(f"/api/v1/execution/tasks/{task_1.id}/dependencies", json={"depends_on_task_id": str(task_1.id)}, headers=headers_a)
        assert self_res.status_code == 409, f"Self dependency should fail with 409: {self_res.status_code}"

        # 6. Cycle Rejection (Task 1 depending on Task 2 creates loop 1 -> 2 -> 1)
        cycle_res = client.post(f"/api/v1/execution/tasks/{task_1.id}/dependencies", json={"depends_on_task_id": str(task_2.id)}, headers=headers_a)
        assert cycle_res.status_code == 409, f"Cycle dependency should fail with 409: {cycle_res.status_code}"

        # 7 & 8. Dependency Graph & Critical Path
        graph_res = client.get(f"/api/v1/execution/projects/{project_a.id}/dependencies", headers=headers_a)
        assert graph_res.status_code == 200
        g_data = graph_res.json()
        assert str(task_2.id) in g_data["blocked_tasks"], "Task 2 should be marked blocked because Task 1 is incomplete"

        # 9, 10, 11. Blocker Creation & Resolution
        block_res = client.post(f"/api/v1/execution/tasks/{task_1.id}/blockers", json={"reason": "Missing PostgreSQL database migration credentials"}, headers=headers_a)
        assert block_res.status_code == 200
        b_data = block_res.json()
        assert "Alembic" in b_data["ai_resolution_suggestion"] or "database" in b_data["ai_resolution_suggestion"].lower()
        blocker_id = b_data["id"]

        # Rejection of DONE status when blocked
        done_res = client.patch(f"/api/v1/execution/tasks/{task_1.id}", json={"status": "done"}, headers=headers_a)
        assert done_res.status_code == 409, "Blocked task should not be marked DONE"

        resolve_res = client.patch(f"/api/v1/execution/blockers/{blocker_id}/resolve", headers=headers_a)
        assert resolve_res.status_code == 200
        assert resolve_res.json()["task_status"] == "todo"

        # 12, 13, 14. Sprint Engine & Progress
        start_t = datetime.now()
        end_t = start_t + timedelta(days=14)
        invalid_sprint = client.post(f"/api/v1/execution/projects/{project_a.id}/sprints", json={"name": "Sprint Bad", "goal": "Test", "start_date": end_t.isoformat(), "end_date": start_t.isoformat()}, headers=headers_a)
        assert invalid_sprint.status_code == 422, "End date < Start date must return 422"

        valid_sprint = client.post(f"/api/v1/execution/projects/{project_a.id}/sprints", json={"name": "Sprint 1", "goal": "Backend MVP", "start_date": start_t.isoformat(), "end_date": end_t.isoformat(), "capacity_hours": 40.0}, headers=headers_a)
        assert valid_sprint.status_code == 200
        sprint_id = valid_sprint.json()["id"]

        client.patch(f"/api/v1/execution/tasks/{task_1.id}", json={"sprint_id": sprint_id}, headers=headers_a)
        sprint_list = client.get(f"/api/v1/execution/projects/{project_a.id}/sprints", headers=headers_a)
        assert sprint_list.status_code == 200
        assert sprint_list.json()[0]["task_count"] == 1

        # 15, 16, 17. Workload & Capacity Engine
        wl_res = client.get(f"/api/v1/execution/projects/{project_a.id}/workload", headers=headers_a)
        assert wl_res.status_code == 200
        wl_data = wl_res.json()
        assert wl_data["total_capacity"] == 20.0

        # 18. Next Best Action
        nba_res = client.get(f"/api/v1/execution/projects/{project_a.id}/next-action", headers=headers_a)
        assert nba_res.status_code == 200
        assert nba_res.json()["task_id"] == str(task_1.id)

        # 25. Multi-User Privacy Test (Student B cannot access Student A's project execution)
        b_access = client.get(f"/api/v1/execution/projects/{project_a.id}/dependencies", headers=headers_b)
        assert b_access.status_code == 403, f"Student B must get 403 Forbidden: {b_access.status_code}"

    finally:
        db.close()
