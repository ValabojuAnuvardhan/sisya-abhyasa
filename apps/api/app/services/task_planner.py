import uuid
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models.project import Project, Milestone, Task, TaskBlocker, TaskDependency, ProjectSprint
from app.services.dependency_engine import get_project_dependencies

def get_next_best_action(db: Session, project_id: uuid.UUID) -> Dict[str, Any]:
    """
    Evaluates priority, dependencies, blockers, due dates, and sprint status
    to return the single recommended task to execute next with detailed reasoning.
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        return {"task": None, "reason": "Project not found"}

    # Get dependency & blocker state
    dep_data = get_project_dependencies(db, project_id)
    blocked_ids = set(dep_data["blocked_tasks"])
    critical_path_ids = set(dep_data["critical_path"])

    # Fetch uncompleted tasks
    tasks = (
        db.query(Task)
        .join(Milestone, Task.milestone_id == Milestone.id)
        .filter(Milestone.project_id == project_id)
        .all()
    )

    uncompleted = [t for t in tasks if (t.status or "").lower() != "done"]

    if not uncompleted:
        return {
            "task": None,
            "reason": "🎉 All project tasks are completed! Great work.",
            "next_recommendation": "Share your project on the Community feed or link a GitHub PR to generate verified Skill Evidence."
        }

    # Weighting priority
    priority_weights = {
        "CRITICAL": 100,
        "HIGH": 75,
        "MEDIUM": 50,
        "LOW": 25
    }

    scored_tasks = []

    for t in uncompleted:
        tid_str = str(t.id)
        is_blocked = tid_str in blocked_ids
        is_critical_path = tid_str in critical_path_ids

        score = priority_weights.get((t.priority or "MEDIUM").upper(), 50)

        # Penalize blocked tasks heavily so unblocked tasks are prioritized
        if is_blocked:
            score -= 200
        else:
            score += 30 # Unblocked bonus

        # Bonus if on critical path
        if is_critical_path:
            score += 40

        scored_tasks.append((score, t, is_blocked, is_critical_path))

    scored_tasks.sort(key=lambda x: x[0], reverse=True)
    best_score, best_task, is_blocked, is_critical = scored_tasks[0]

    # Formulate reason
    reasons = []
    if is_blocked:
        reasons.append("⚠️ This task is currently BLOCKED by incomplete prerequisites or an active blocker.")
    else:
        reasons.append("✅ This task is UNBLOCKED and ready for execution.")

    if is_critical:
        reasons.append("⚡ It lies on the project's CRITICAL PATH.")

    reasons.append(f"🔥 Priority level: {best_task.priority or 'MEDIUM'}.")
    if best_task.estimated_hours:
        reasons.append(f"⏱️ Estimated effort: {best_task.estimated_hours}h.")

    return {
        "task_id": str(best_task.id),
        "task_title": best_task.title,
        "priority": best_task.priority or "MEDIUM",
        "status": best_task.status,
        "estimated_hours": best_task.estimated_hours,
        "due_date": best_task.due_date.isoformat() if best_task.due_date else None,
        "is_blocked": is_blocked,
        "is_critical_path": is_critical,
        "reason": " ".join(reasons)
    }

def generate_ai_blocker_suggestion(reason: str, task_title: str) -> str:
    """
    Generates advisory, non-modifying guidance to help unblock a task.
    """
    reason_lower = reason.lower()

    if "database" in reason_lower or "postgres" in reason_lower or "migration" in reason_lower:
        return "💡 Advisory: Verify database connection strings, check if pending Alembic migrations exist (`alembic upgrade head`), and confirm table schemas match model definitions."
    elif "api" in reason_lower or "fastapi" in reason_lower or "endpoint" in reason_lower:
        return "💡 Advisory: Review the request Pydantic payload, check Uvicorn server logs (`uvicorn app.main:app`), and test endpoints using Swagger UI at /docs."
    elif "github" in reason_lower or "pr" in reason_lower or "git" in reason_lower:
        return "💡 Advisory: Check branch naming conventions (`feature/task-id`), ensure local commits are pushed to remote, and verify pull request status on GitHub."
    else:
        return f"💡 Advisory: Break down '{task_title}' into smaller sub-tasks, verify required dependencies are complete, or discuss with team members."
