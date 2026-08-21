"""
Śiṣya Abhyāsa Phase E10 — Career Action Engine

Generates deterministic Career Action Plans linking missing opportunity requirements
and E9 skill gaps directly to E8 project workspace tasks and E5 learning modules.
"""

import uuid
from typing import Dict, List, Any
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.opportunity import CareerOpportunity, CareerActionPlan, CareerAction
from app.models.project import Task
from app.services.skill_gap_engine import compute_skill_gaps

def generate_or_get_action_plan(db: Session, user_id: uuid.UUID, opportunity_id: uuid.UUID | None = None) -> Dict[str, Any]:
    """
    Fetches or creates the student's active CareerActionPlan and populates actionable items.
    """
    stmt = (
        select(CareerActionPlan)
        .where(CareerActionPlan.user_id == user_id, CareerActionPlan.status == "ACTIVE")
    )
    plan = db.scalars(stmt).first()

    if not plan:
        plan = CareerActionPlan(user_id=user_id, opportunity_id=opportunity_id, status="ACTIVE")
        db.add(plan)
        db.commit()
        db.refresh(plan)

    # Populate actions if plan has < 2 actions
    existing_actions = plan.actions
    if len(existing_actions) < 2:
        gaps = compute_skill_gaps(db, user_id)
        for idx, gap in enumerate(gaps[:3]):
            skill_name = gap["skill_name"]
            # Find an existing E8 task for this skill
            task_stmt = select(Task).where(Task.status.in_(["todo", "in_progress"]), Task.required_skills.like(f"%{skill_name}%"))
            matching_task = db.scalars(task_stmt).first()

            action_title = f"Complete task '{matching_task.title}'" if matching_task else f"Build project feature demonstrating {skill_name}"
            action_type = "BUILD"
            source_type = "task" if matching_task else "custom"
            source_id = str(matching_task.id) if matching_task else None

            action = CareerAction(
                action_plan_id=plan.id,
                action_type=action_type,
                title=action_title,
                description=f"{skill_name} is a critical requirement lacking verified evidence. Complete this action and merge a PR.",
                skill=skill_name,
                source_type=source_type,
                source_id=source_id,
                priority="CRITICAL" if idx == 0 else "HIGH",
                status="PENDING",
            )
            db.add(action)
        db.commit()
        db.refresh(plan)

    return {
        "plan_id": str(plan.id),
        "user_id": str(user_id),
        "opportunity_id": str(plan.opportunity_id) if plan.opportunity_id else None,
        "status": plan.status,
        "actions": [
            {
                "id": str(a.id),
                "action_type": a.action_type,
                "title": a.title,
                "description": a.description,
                "skill": a.skill,
                "source_type": a.source_type,
                "source_id": a.source_id,
                "priority": a.priority,
                "status": a.status,
            }
            for a in plan.actions
        ],
    }
