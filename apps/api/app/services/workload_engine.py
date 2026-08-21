import uuid
from typing import Dict, List, Any
from sqlalchemy.orm import Session
from app.models.project import Project, ProjectMember, Task, Milestone, ProjectSprint
from app.models.user import User

def calculate_project_workload(db: Session, project_id: uuid.UUID) -> Dict[str, Any]:
    """
    Computes capacity, assigned hours, completed hours, remaining hours, and overload detection for a project.
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        return {"members": [], "total_capacity": 0, "total_assigned": 0, "is_overloaded": False}

    # Fetch active project members
    members = db.query(ProjectMember).filter(ProjectMember.project_id == project_id, ProjectMember.status == "active").all()
    
    # If SOLO or no members registered, treat creator as single member
    member_user_ids = [m.user_id for m in members] if members else [project.creator_id]
    if project.creator_id not in member_user_ids:
        member_user_ids.append(project.creator_id)

    users = db.query(User).filter(User.id.in_(member_user_ids)).all()
    user_map = {u.id: u for u in users}

    # Fetch tasks for project
    tasks = (
        db.query(Task)
        .join(Milestone, Task.milestone_id == Milestone.id)
        .filter(Milestone.project_id == project_id)
        .all()
    )

    # Standard weekly capacity (20 hours per student)
    DEFAULT_CAPACITY = 20.0

    member_stats: List[Dict[str, Any]] = []
    project_overloaded = False

    for uid in member_user_ids:
        user_obj = user_map.get(uid)
        uname = user_obj.full_name or user_obj.email if user_obj else "Student"
        
        user_tasks = [t for t in tasks if t.assigned_user_id == uid or (not t.assigned_user_id and uid == project.creator_id)]
        
        assigned_h = sum(t.estimated_hours or 0.0 for t in user_tasks)
        completed_h = sum(t.actual_hours or 0.0 for t in user_tasks if (t.status or "").lower() == "done")
        remaining_h = max(0.0, assigned_h - completed_h)
        capacity_h = DEFAULT_CAPACITY

        utilization = (assigned_h / capacity_h * 100.0) if capacity_h > 0 else 0.0
        is_overloaded = assigned_h > capacity_h

        if is_overloaded:
            project_overloaded = True

        member_stats.append({
            "user_id": str(uid),
            "name": uname,
            "role": "Owner" if uid == project.creator_id else "Member",
            "capacity_hours": capacity_h,
            "assigned_hours": round(assigned_h, 1),
            "completed_hours": round(completed_h, 1),
            "remaining_hours": round(remaining_h, 1),
            "utilization_percentage": round(utilization, 1),
            "is_overloaded": is_overloaded,
            "task_count": len(user_tasks)
        })

    tot_cap = sum(m["capacity_hours"] for m in member_stats)
    tot_assign = sum(m["assigned_hours"] for m in member_stats)

    return {
        "collaboration_mode": project.collaboration_mode,
        "team_capacity_limit": project.team_capacity,
        "active_member_count": len(member_user_ids),
        "total_capacity": tot_cap,
        "total_assigned": tot_assign,
        "is_overloaded": project_overloaded,
        "members": member_stats
    }
