import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload
from app.models.user import User
from app.models.learn import LearningRoadmapNode, LearningChecklist, LearningChecklistItem

class ChecklistType:
    LEARN = "LEARN"
    PRACTICE = "PRACTICE"
    IMPLEMENT = "IMPLEMENT"
    TEST = "TEST"
    APPLY = "APPLY"
    COMMIT = "COMMIT"
    PULL_REQUEST = "PULL_REQUEST"
    MERGE = "MERGE"

    ALL_TYPES = [LEARN, PRACTICE, IMPLEMENT, TEST, APPLY, COMMIT, PULL_REQUEST, MERGE]

class ChecklistStatus:
    NOT_STARTED = "NOT_STARTED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"

    ALL_STATUSES = [NOT_STARTED, IN_PROGRESS, COMPLETED]

def generate_default_items_spec(topic_name: str, why_it_matters: Optional[str], learning_objective: Optional[str]) -> List[Dict[str, Any]]:
    topic = topic_name or "Core Concept"
    return [
        {
            "title": f"Understand core concepts & architecture of {topic}",
            "description": f"Study the foundational specifications and design patterns. {why_it_matters or ''}".strip(),
            "type": ChecklistType.LEARN,
            "estimated_effort": "20 mins",
            "order_index": 1
        },
        {
            "title": f"Learn key interfaces & syntax for {topic}",
            "description": f"Master the methods, classes, and code syntax required for {topic}.",
            "type": ChecklistType.LEARN,
            "estimated_effort": "25 mins",
            "order_index": 2
        },
        {
            "title": f"Practice hands-on implementation of {topic} in local environment",
            "description": f"Build a mini-exercise or isolated script demonstrating {topic}.",
            "type": ChecklistType.PRACTICE,
            "estimated_effort": "30 mins",
            "order_index": 3
        },
        {
            "title": f"Implement reusable {topic} module in application codebase",
            "description": f"Integrate production-grade {topic} logic into your project. {learning_objective or ''}".strip(),
            "type": ChecklistType.IMPLEMENT,
            "estimated_effort": "45 mins",
            "order_index": 4
        },
        {
            "title": f"Write automated tests for {topic} functionality",
            "description": f"Add unit and integration tests covering happy path and edge cases for {topic}.",
            "type": ChecklistType.TEST,
            "estimated_effort": "30 mins",
            "order_index": 5
        },
        {
            "title": f"Apply {topic} to active project repository",
            "description": f"Connect the implementation to user-facing API routes or project workflows.",
            "type": ChecklistType.APPLY,
            "estimated_effort": "40 mins",
            "order_index": 6
        },
        {
            "title": f"Commit {topic} implementation with clean Git history",
            "description": f"Stage files and write a descriptive commit message linking to the task.",
            "type": ChecklistType.COMMIT,
            "estimated_effort": "10 mins",
            "order_index": 7
        },
        {
            "title": f"Open Pull Request for {topic} feature branch",
            "description": f"Submit code review request with clear description and passing test suite.",
            "type": ChecklistType.PULL_REQUEST,
            "estimated_effort": "15 mins",
            "order_index": 8
        },
        {
            "title": f"Merge Pull Request into main branch",
            "description": f"Complete code review sign-off and merge verified PR into primary codebase.",
            "type": ChecklistType.MERGE,
            "estimated_effort": "10 mins",
            "order_index": 9
        }
    ]

def get_or_generate_checklist_for_node(node: LearningRoadmapNode, user: User, db: Session) -> LearningChecklist:
    # 1. Ownership & Authorization Verification
    if node.roadmap.user_id != user.id:
        raise PermissionError("Unauthorized — Student does not own this roadmap node.")

    # 2. Idempotency Check: Return existing checklist if present
    existing = db.scalar(
        select(LearningChecklist)
        .where(LearningChecklist.roadmap_node_id == node.id)
        .options(selectinload(LearningChecklist.items))
    )
    if existing:
        return existing

    # 3. Create new persistent checklist
    checklist = LearningChecklist(
        user_id=user.id,
        roadmap_id=node.roadmap_id,
        roadmap_node_id=node.id,
        title=f"Checklist: {node.topic_name}"
    )
    db.add(checklist)
    db.commit()
    db.refresh(checklist)

    # 4. Generate structured items (ALL START AS NOT_STARTED!)
    items_spec = generate_default_items_spec(node.topic_name, node.why_it_matters, node.learning_objective)
    for spec in items_spec:
        item = LearningChecklistItem(
            checklist_id=checklist.id,
            roadmap_node_id=node.id,
            title=spec["title"],
            description=spec["description"],
            type=spec["type"],
            order_index=spec["order_index"],
            status=ChecklistStatus.NOT_STARTED,
            estimated_effort=spec["estimated_effort"],
            related_skill=node.topic_name
        )
        db.add(item)

    db.commit()
    return db.scalar(
        select(LearningChecklist)
        .where(LearningChecklist.id == checklist.id)
        .options(selectinload(LearningChecklist.items))
    )

def update_checklist_item_status(item_id: uuid.UUID, new_status: str, user: User, db: Session) -> LearningChecklistItem:
    if new_status not in ChecklistStatus.ALL_STATUSES:
        raise ValueError(f"Invalid status '{new_status}'. Must be one of {ChecklistStatus.ALL_STATUSES}")

    item = db.scalar(
        select(LearningChecklistItem)
        .where(LearningChecklistItem.id == item_id)
        .options(selectinload(LearningChecklistItem.checklist).selectinload(LearningChecklist.roadmap_node))
    )
    if not item:
        raise KeyError("Checklist item not found")

    # Strict Student Ownership Verification: user -> checklist -> roadmap -> user.id == current_user.id
    if item.checklist.user_id != user.id:
        raise PermissionError("Unauthorized — You do not own this checklist item.")

    item.status = new_status
    if new_status == ChecklistStatus.COMPLETED:
        item.completed_at = datetime.now(timezone.utc)
    else:
        item.completed_at = None

    # Sync parent roadmap node status if items progress
    checklist = item.checklist
    all_items = checklist.items
    completed_count = sum(1 for i in all_items if i.status == ChecklistStatus.COMPLETED)
    in_progress_count = sum(1 for i in all_items if i.status == ChecklistStatus.IN_PROGRESS)

    node = db.get(LearningRoadmapNode, item.roadmap_node_id)
    if node:
        if completed_count == len(all_items) and len(all_items) > 0:
            node.status = "completed"
        elif completed_count > 0 or in_progress_count > 0:
            node.status = "in_progress"

    db.commit()
    db.refresh(item)
    return item
