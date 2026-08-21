import uuid
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload
from app.core.auth import AuthPrincipal, require_principal, optional_principal
from app.db.session import get_db
from app.models.user import User, StudentProfile
from app.models.learn import (
    LearningRoadmap,
    LearningRoadmapNode,
    LearningChecklist,
    LearningChecklistItem,
    LearningResource,
    SavedLearningResource,
    LearningResourceProgress
)
from app.services.roadmap_service import generate_roadmap_for_user, generate_roadmap_nodes_for_profile
from app.services.checklist_service import (
    get_or_generate_checklist_for_node,
    update_checklist_item_status,
    ChecklistStatus,
    ChecklistType
)
from app.services.resource_service import (
    discover_resources_for_node,
    save_resource_for_user,
    unsave_resource_for_user,
    get_saved_resources_for_user,
    update_resource_progress_for_user
)

router = APIRouter(prefix="/learn", tags=["learning"])

class ChatRequest(BaseModel):
    message: str
    target_role: Optional[str] = None
    skill_gaps: Optional[List[str]] = None
    learning_stage: Optional[str] = None
    chat_history: Optional[List[Dict[str, Any]]] = None

class ChatResponse(BaseModel):
    answer: str
    advisory: Optional[str] = "AI Learning Companion"
    suggested_followups: Optional[List[str]] = None

class RoadmapNodeUpdate(BaseModel):
    status: Optional[str] = None # not_started, in_progress, completed
    chk_learn: Optional[bool] = None
    chk_practice: Optional[bool] = None
    chk_apply: Optional[bool] = None
    chk_demonstrate: Optional[bool] = None

class NodeChecklistSummary(BaseModel):
    total: int = 0
    completed: int = 0
    in_progress: int = 0
    progress_percent: int = 0

class RoadmapNodeRead(BaseModel):
    id: uuid.UUID
    phase_number: int
    phase_title: str
    topic_name: str
    why_it_matters: Optional[str] = None
    prerequisite: Optional[str] = None
    learning_objective: Optional[str] = None
    estimated_hours: int
    status: str
    chk_learn: bool = False
    chk_practice: bool = False
    chk_apply: bool = False
    chk_demonstrate: bool = False
    order_index: int
    checklist_summary: Optional[NodeChecklistSummary] = None
    model_config = ConfigDict(from_attributes=True)

class RoadmapRead(BaseModel):
    id: uuid.UUID
    target_role: str
    summary: Optional[str] = None
    nodes: List[RoadmapNodeRead]
    model_config = ConfigDict(from_attributes=True)

class ChecklistItemRead(BaseModel):
    id: uuid.UUID
    checklist_id: uuid.UUID
    roadmap_node_id: uuid.UUID
    project_id: Optional[uuid.UUID] = None
    task_id: Optional[uuid.UUID] = None
    title: str
    description: Optional[str] = None
    type: str
    order_index: int
    status: str
    estimated_effort: str
    related_skill: Optional[str] = None
    completed_at: Optional[Any] = None
    model_config = ConfigDict(from_attributes=True)

class ChecklistRead(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    roadmap_id: uuid.UUID
    roadmap_node_id: uuid.UUID
    title: str
    items: List[ChecklistItemRead]
    model_config = ConfigDict(from_attributes=True)

class ChecklistItemUpdate(BaseModel):
    status: str # NOT_STARTED, IN_PROGRESS, COMPLETED

class LearningResourceRead(BaseModel):
    id: uuid.UUID
    roadmap_id: uuid.UUID
    roadmap_node_id: uuid.UUID
    checklist_item_id: Optional[uuid.UUID] = None
    title: str
    source: str
    url: str
    topic: str
    estimated_duration: Optional[str] = None
    why_recommended: str
    related_skill: str
    resource_type: str
    thumbnail_url: Optional[str] = None
    external_resource_id: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class ResourceDiscoveryResponse(BaseModel):
    status: str # success, empty, unavailable
    roadmap_node_id: uuid.UUID
    topic: str
    related_skill: str
    resources: List[LearningResourceRead]
    error_message: Optional[str] = None

class ResourceProgressUpdate(BaseModel):
    status: str # NOT_VIEWED, VIEWED, COMPLETED

class ResourceProgressRead(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    resource_id: uuid.UUID
    status: str
    viewed_at: Optional[Any] = None
    completed_at: Optional[Any] = None
    model_config = ConfigDict(from_attributes=True)

def _generate_default_nodes_for_role(role: str, experience: str) -> List[Dict[str, Any]]:
    role_lower = (role or "").lower()
    if "backend" in role_lower or "python" in role_lower or "api" in role_lower:
        return [
            {
                "phase_number": 1,
                "phase_title": "Core Foundations & Async Programming",
                "topic_name": "AsyncIO & FastAPI Dependency Injection",
                "why_it_matters": "High-throughput APIs require non-blocking IO and clean dependency inversion.",
                "prerequisite": "Python Syntax & Basic Data Structures",
                "learning_objective": "Build async route handlers and reusable dependency injectors in FastAPI.",
                "estimated_hours": 6,
                "order_index": 1
            },
            {
                "phase_number": 1,
                "phase_title": "Core Foundations & Async Programming",
                "topic_name": "SQLAlchemy 2.0 ORM & Connection Pooling",
                "why_it_matters": "Efficient ORM patterns prevent N+1 queries and connection leaks.",
                "prerequisite": "SQL Fundamentals",
                "learning_objective": "Implement async session handling, migrations with Alembic, and indexed models.",
                "estimated_hours": 8,
                "order_index": 2
            },
            {
                "phase_number": 2,
                "phase_title": "Database Optimization & Caching",
                "topic_name": "PostgreSQL B-Tree Indexing & Query Analysis",
                "why_it_matters": "Slow database queries are the #1 performance bottleneck in web applications.",
                "prerequisite": "SQLAlchemy ORM",
                "learning_objective": "Use EXPLAIN ANALYZE to identify unindexed scans and create compound indexes.",
                "estimated_hours": 10,
                "order_index": 3
            },
            {
                "phase_number": 2,
                "phase_title": "Database Optimization & Caching",
                "topic_name": "Redis In-Memory Caching & Rate Limiting",
                "why_it_matters": "Caching frequently accessed endpoints reduces database load by up to 90%.",
                "prerequisite": "FastAPI Routing",
                "learning_objective": "Implement TTL key expiration, cache invalidation hooks, and sliding-window rate limiters.",
                "estimated_hours": 7,
                "order_index": 4
            },
            {
                "phase_number": 3,
                "phase_title": "System Architecture & Production Deployment",
                "topic_name": "Docker Multi-Stage Builds & Containerization",
                "why_it_matters": "Containers guarantee environment consistency from local dev to cloud production.",
                "prerequisite": "Linux Terminal Basics",
                "learning_objective": "Write optimized Dockerfiles with non-root security principles and docker-compose services.",
                "estimated_hours": 12,
                "order_index": 5
            }
        ]
    elif "frontend" in role_lower or "react" in role_lower or "web" in role_lower:
        return [
            {
                "phase_number": 1,
                "phase_title": "Modern Frontend Architecture",
                "topic_name": "Next.js App Router & Server Components",
                "why_it_matters": "Server components reduce bundle size and enable instant page loading.",
                "prerequisite": "React Hooks & JSX",
                "learning_objective": "Build dynamic routes with layout inheritance and server-side data fetching.",
                "estimated_hours": 8,
                "order_index": 1
            },
            {
                "phase_number": 1,
                "phase_title": "Modern Frontend Architecture",
                "topic_name": "Tailwind CSS & Modern Design Systems",
                "why_it_matters": "Design systems enforce visual consistency and responsive UI performance.",
                "prerequisite": "CSS Flexbox & Grid",
                "learning_objective": "Implement glassmorphism, responsive grid layouts, and color variable themes.",
                "estimated_hours": 6,
                "order_index": 2
            },
            {
                "phase_number": 2,
                "phase_title": "State Management & API Integration",
                "topic_name": "TanStack Query & Global Auth Context",
                "why_it_matters": "Client-side cache synchronization prevents redundant API re-fetching.",
                "prerequisite": "Next.js App Router",
                "learning_objective": "Manage JWT session tokens, background revalidation, and optimistic UI mutations.",
                "estimated_hours": 10,
                "order_index": 3
            }
        ]
    else:
        return [
            {
                "phase_number": 1,
                "phase_title": "Full-Stack System Engineering",
                "topic_name": "RESTful API Architecture & Open API Specs",
                "why_it_matters": "Clear API contracts enable seamless frontend/backend collaboration.",
                "prerequisite": "HTTP Fundamentals",
                "learning_objective": "Design clean API endpoints with Pydantic validation schemas.",
                "estimated_hours": 8,
                "order_index": 1
            },
            {
                "phase_number": 2,
                "phase_title": "Database & State Management",
                "topic_name": "Relational Data Modeling & Migrations",
                "why_it_matters": "Proper schema design prevents data corruption and scale bottlenecks.",
                "prerequisite": "RESTful API Architecture",
                "learning_objective": "Model foreign keys, cascade rules, and automated schema migrations.",
                "estimated_hours": 10,
                "order_index": 2
            }
        ]

from app.services.roadmap_service import generate_roadmap_for_user, generate_roadmap_nodes_for_profile

@router.get("/dashboard")
def get_learning_dashboard(principal: AuthPrincipal = Depends(optional_principal), db: Session = Depends(get_db)):
    user = None
    if principal:
        user = db.scalar(select(User).where(User.auth_subject == principal.subject).options(selectinload(User.profile), selectinload(User.skills)))
    
    profile = user.profile if user else None
    role = (profile.target_role if profile and profile.target_role else "Software Developer")
    user_skills = [s.name for s in user.skills] if user and user.skills else ["Python", "FastAPI", "Web Engineering"]

    roadmap = None
    if user:
        roadmap = db.scalar(select(LearningRoadmap).where(LearningRoadmap.user_id == user.id).options(selectinload(LearningRoadmap.nodes)))

    nodes = roadmap.nodes if roadmap else []
    
    # Calculate real checklist metrics across all roadmap nodes
    total_checklist_items = 0
    completed_checklist_items = 0
    in_progress_items = []

    if user and roadmap:
        checklists = db.scalars(select(LearningChecklist).where(LearningChecklist.user_id == user.id).options(selectinload(LearningChecklist.items))).all()
        for chk in checklists:
            for item in chk.items:
                total_checklist_items += 1
                if item.status == ChecklistStatus.COMPLETED:
                    completed_checklist_items += 1
                elif item.status == ChecklistStatus.IN_PROGRESS:
                    in_progress_items.append(item)

    readiness = 50
    if total_checklist_items > 0:
        readiness = int((completed_checklist_items / total_checklist_items) * 100)
    elif nodes:
        completed_nodes = [n for n in nodes if n.status == "completed"]
        readiness = int((len(completed_nodes) / len(nodes)) * 100)

    in_progress_node = next((n for n in nodes if n.status == "in_progress"), None)
    next_node = next((n for n in nodes if n.status == "not_started"), None)

    current_topic = in_progress_node.topic_name if in_progress_node else (nodes[0].topic_name if nodes else f"Mastering {role} Architecture")
    next_recommended = next_node.topic_name if next_node else "System Architecture & Security"

    # Surface highest-priority incomplete action
    next_action_title = f"Complete {current_topic} Module"
    if in_progress_items:
        next_action_title = f"Implement {in_progress_items[0].title}"
    elif nodes:
        next_action_title = f"Start practice checklist for {current_topic}"

    return {
        "target_role": role,
        "skill_readiness_percentage": readiness,
        "strong_skills": user_skills,
        "skill_gaps": [
            {
                "skill_name": "Docker & Containerization",
                "category": "Infrastructure",
                "readiness_score": 45,
                "status": "in_progress",
                "recommended_resource": "Containerization Fundamentals"
            },
            {
                "skill_name": "Redis Caching & Performance",
                "category": "Performance",
                "readiness_score": 60,
                "status": "recommended",
                "recommended_resource": "Caching Strategies"
            }
        ],
        "continue_learning": [
            {
                "id": "c-1",
                "title": current_topic,
                "progress_percentage": readiness,
                "current_lesson": current_topic,
                "estimated_minutes_left": 25
            }
        ],
        "recommended_resources": [
            { "id": "r-1", "title": f"Mastering {next_recommended}", "type": "Guide", "estimated_time": "15 mins" }
        ],
        "explore_topics": [
            { "id": "exp-1", "name": "GraphQL APIs", "category": "API Paradigms" },
            { "id": "exp-2", "name": "gRPC Microservices", "category": "Networking" },
            { "id": "exp-3", "name": "Kubernetes Orchestration", "category": "DevOps" }
        ],
        "next_action": next_action_title
    }

def _attach_checklist_summaries(roadmap: LearningRoadmap, db: Session) -> RoadmapRead:
    nodes_data = []
    for node in roadmap.nodes:
        chk = db.scalar(select(LearningChecklist).where(LearningChecklist.roadmap_node_id == node.id).options(selectinload(LearningChecklist.items)))
        chk_summary = None
        if chk and chk.items:
            tot = len(chk.items)
            comp = sum(1 for i in chk.items if i.status == ChecklistStatus.COMPLETED)
            inp = sum(1 for i in chk.items if i.status == ChecklistStatus.IN_PROGRESS)
            pct = int((comp / tot) * 100) if tot > 0 else 0
            chk_summary = NodeChecklistSummary(total=tot, completed=comp, in_progress=inp, progress_percent=pct)

        n_read = RoadmapNodeRead(
            id=node.id,
            phase_number=node.phase_number,
            phase_title=node.phase_title,
            topic_name=node.topic_name,
            why_it_matters=node.why_it_matters,
            prerequisite=node.prerequisite,
            learning_objective=node.learning_objective,
            estimated_hours=node.estimated_hours,
            status=node.status,
            chk_learn=node.chk_learn,
            chk_practice=node.chk_practice,
            chk_apply=node.chk_apply,
            chk_demonstrate=node.chk_demonstrate,
            order_index=node.order_index,
            checklist_summary=chk_summary
        )
        nodes_data.append(n_read)

    return RoadmapRead(
        id=roadmap.id,
        target_role=roadmap.target_role,
        summary=roadmap.summary,
        nodes=nodes_data
    )

@router.get("/roadmap", response_model=RoadmapRead)
def get_user_roadmap(principal: AuthPrincipal = Depends(require_principal), db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.auth_subject == principal.subject).options(selectinload(User.profile)))
    if not user:
        raise HTTPException(404, "User not found")
    
    roadmap = generate_roadmap_for_user(user, db, force_regenerate=False)
    return _attach_checklist_summaries(roadmap, db)

@router.post("/roadmap/generate", response_model=RoadmapRead)
def generate_user_roadmap(principal: AuthPrincipal = Depends(require_principal), db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.auth_subject == principal.subject).options(selectinload(User.profile)))
    if not user:
        raise HTTPException(404, "User not found")
    roadmap = generate_roadmap_for_user(user, db, force_regenerate=True)
    return _attach_checklist_summaries(roadmap, db)

@router.post("/roadmap/regenerate", response_model=RoadmapRead)
def regenerate_user_roadmap(principal: AuthPrincipal = Depends(require_principal), db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.auth_subject == principal.subject).options(selectinload(User.profile)))
    if not user:
        raise HTTPException(404, "User not found")
    roadmap = generate_roadmap_for_user(user, db, force_regenerate=True)
    return _attach_checklist_summaries(roadmap, db)

@router.patch("/roadmap/node/{node_id}", response_model=RoadmapNodeRead)
def update_roadmap_node_status(node_id: uuid.UUID, payload: RoadmapNodeUpdate, principal: AuthPrincipal = Depends(require_principal), db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.auth_subject == principal.subject))
    if not user:
        raise HTTPException(404, "User not found")
    node = db.get(LearningRoadmapNode, node_id)
    if not node:
        raise HTTPException(404, "Roadmap topic node not found")
    
    # Ownership Authorization Guard
    if node.roadmap.user_id != user.id:
        raise HTTPException(403, "Forbidden — Student does not own this roadmap node.")

    if payload.status in ["not_started", "in_progress", "completed"]:
        node.status = payload.status
    
    if payload.chk_learn is not None:
        node.chk_learn = payload.chk_learn
    if payload.chk_practice is not None:
        node.chk_practice = payload.chk_practice
    if payload.chk_apply is not None:
        node.chk_apply = payload.chk_apply
    if payload.chk_demonstrate is not None:
        node.chk_demonstrate = payload.chk_demonstrate

    if node.chk_learn and node.chk_practice and node.chk_apply and node.chk_demonstrate:
        node.status = "completed"
    elif (node.chk_learn or node.chk_practice or node.chk_apply or node.chk_demonstrate) and node.status == "not_started":
        node.status = "in_progress"

    db.commit()
    db.refresh(node)
    
    chk = db.scalar(select(LearningChecklist).where(LearningChecklist.roadmap_node_id == node.id).options(selectinload(LearningChecklist.items)))
    chk_summary = None
    if chk and chk.items:
        tot = len(chk.items)
        comp = sum(1 for i in chk.items if i.status == ChecklistStatus.COMPLETED)
        inp = sum(1 for i in chk.items if i.status == ChecklistStatus.IN_PROGRESS)
        pct = int((comp / tot) * 100) if tot > 0 else 0
        chk_summary = NodeChecklistSummary(total=tot, completed=comp, in_progress=inp, progress_percent=pct)

    return RoadmapNodeRead(
        id=node.id,
        phase_number=node.phase_number,
        phase_title=node.phase_title,
        topic_name=node.topic_name,
        why_it_matters=node.why_it_matters,
        prerequisite=node.prerequisite,
        learning_objective=node.learning_objective,
        estimated_hours=node.estimated_hours,
        status=node.status,
        chk_learn=node.chk_learn,
        chk_practice=node.chk_practice,
        chk_apply=node.chk_apply,
        chk_demonstrate=node.chk_demonstrate,
        order_index=node.order_index,
        checklist_summary=chk_summary
    )

# --- CHECKLIST ENDPOINTS (PHASE E3) ---

@router.get("/checklists/{roadmap_node_id}", response_model=ChecklistRead)
def get_node_checklist(roadmap_node_id: uuid.UUID, principal: AuthPrincipal = Depends(require_principal), db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.auth_subject == principal.subject))
    if not user:
        raise HTTPException(404, "User not found")
    node = db.scalar(select(LearningRoadmapNode).where(LearningRoadmapNode.id == roadmap_node_id).options(selectinload(LearningRoadmapNode.roadmap)))
    if not node:
        raise HTTPException(404, "Roadmap node not found")
    
    # Ownership Authorization Guard (user -> node -> node.roadmap.user_id == current_user.id)
    if node.roadmap.user_id != user.id:
        raise HTTPException(403, "Forbidden — Student does not own this checklist.")

    try:
        return get_or_generate_checklist_for_node(node, user, db)
    except PermissionError:
        raise HTTPException(403, "Forbidden — Student does not own this checklist.")

@router.post("/checklists/{roadmap_node_id}/generate", response_model=ChecklistRead)
def generate_node_checklist(roadmap_node_id: uuid.UUID, principal: AuthPrincipal = Depends(require_principal), db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.auth_subject == principal.subject))
    if not user:
        raise HTTPException(404, "User not found")
    node = db.scalar(select(LearningRoadmapNode).where(LearningRoadmapNode.id == roadmap_node_id).options(selectinload(LearningRoadmapNode.roadmap)))
    if not node:
        raise HTTPException(404, "Roadmap node not found")
    
    # Ownership Authorization Guard
    if node.roadmap.user_id != user.id:
        raise HTTPException(403, "Forbidden — Student does not own this checklist.")

    try:
        return get_or_generate_checklist_for_node(node, user, db)
    except PermissionError:
        raise HTTPException(403, "Forbidden — Student does not own this checklist.")

@router.patch("/checklists/items/{item_id}", response_model=ChecklistItemRead)
def update_checklist_item(item_id: uuid.UUID, payload: ChecklistItemUpdate, principal: AuthPrincipal = Depends(require_principal), db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.auth_subject == principal.subject))
    if not user:
        raise HTTPException(404, "User not found")

    try:
        return update_checklist_item_status(item_id, payload.status, user, db)
    except KeyError:
        raise HTTPException(404, "Checklist item not found")
    except PermissionError:
        raise HTTPException(403, "Forbidden — Student does not own this checklist item.")
    except ValueError as e:
        raise HTTPException(400, str(e))

# --- RESOURCE RECOMMENDATION ENDPOINTS (PHASE E4) ---

@router.get("/resources/saved", response_model=List[LearningResourceRead])
def get_user_saved_resources(principal: AuthPrincipal = Depends(require_principal), db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.auth_subject == principal.subject))
    if not user:
        raise HTTPException(404, "User not found")
    return get_saved_resources_for_user(user.id, db)

@router.get("/resources/{roadmap_node_id}", response_model=ResourceDiscoveryResponse)
def get_node_resources(roadmap_node_id: uuid.UUID, principal: AuthPrincipal = Depends(require_principal), db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.auth_subject == principal.subject))
    if not user:
        raise HTTPException(404, "User not found")
    node = db.scalar(select(LearningRoadmapNode).where(LearningRoadmapNode.id == roadmap_node_id).options(selectinload(LearningRoadmapNode.roadmap)))
    if not node:
        raise HTTPException(404, "Roadmap node not found")

    # Ownership Authorization Guard
    if node.roadmap.user_id != user.id:
        raise HTTPException(403, "Forbidden — Student does not own this roadmap node.")

    try:
        return discover_resources_for_node(node, user, db, force_refresh=False)
    except PermissionError:
        raise HTTPException(403, "Forbidden — Student does not own this roadmap node.")
    except Exception as e:
        # Outage Isolation Safety: Return safe unavailable payload instead of crashing /learn
        return ResourceDiscoveryResponse(
            status="unavailable",
            roadmap_node_id=roadmap_node_id,
            topic=node.topic_name,
            related_skill=node.topic_name,
            resources=[],
            error_message="Learning resources are temporarily unavailable."
        )

@router.post("/resources/{roadmap_node_id}/refresh", response_model=ResourceDiscoveryResponse)
def refresh_node_resources(roadmap_node_id: uuid.UUID, principal: AuthPrincipal = Depends(require_principal), db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.auth_subject == principal.subject))
    if not user:
        raise HTTPException(404, "User not found")
    node = db.scalar(select(LearningRoadmapNode).where(LearningRoadmapNode.id == roadmap_node_id).options(selectinload(LearningRoadmapNode.roadmap)))
    if not node:
        raise HTTPException(404, "Roadmap node not found")

    if node.roadmap.user_id != user.id:
        raise HTTPException(403, "Forbidden — Student does not own this roadmap node.")

    try:
        return discover_resources_for_node(node, user, db, force_refresh=True)
    except Exception as e:
        return ResourceDiscoveryResponse(
            status="unavailable",
            roadmap_node_id=roadmap_node_id,
            topic=node.topic_name,
            related_skill=node.topic_name,
            resources=[],
            error_message="Learning resources are temporarily unavailable."
        )

@router.post("/resources/{resource_id}/save")
def save_resource_endpoint(resource_id: uuid.UUID, principal: AuthPrincipal = Depends(require_principal), db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.auth_subject == principal.subject))
    if not user:
        raise HTTPException(404, "User not found")
    try:
        saved = save_resource_for_user(user.id, resource_id, db)
        return {"status": "saved", "resource_id": resource_id, "saved_at": saved.saved_at}
    except KeyError:
        raise HTTPException(404, "Learning resource not found")

@router.delete("/resources/{resource_id}/save")
def unsave_resource_endpoint(resource_id: uuid.UUID, principal: AuthPrincipal = Depends(require_principal), db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.auth_subject == principal.subject))
    if not user:
        raise HTTPException(404, "User not found")
    removed = unsave_resource_for_user(user.id, resource_id, db)
    return {"status": "unsaved" if removed else "not_found", "resource_id": resource_id}

@router.patch("/resources/{resource_id}/progress", response_model=ResourceProgressRead)
def update_resource_progress_endpoint(resource_id: uuid.UUID, payload: ResourceProgressUpdate, principal: AuthPrincipal = Depends(require_principal), db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.auth_subject == principal.subject))
    if not user:
        raise HTTPException(404, "User not found")
    try:
        return update_resource_progress_for_user(user.id, resource_id, payload.status, db)
    except KeyError:
        raise HTTPException(404, "Learning resource not found")
    except ValueError as e:
        raise HTTPException(400, str(e))

@router.post("/chat", response_model=ChatResponse)
def sisya_chat_endpoint(payload: ChatRequest):
    if not payload.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    
    role = payload.target_role or "Software Developer"
    reply = f"As your Śiṣya AI companion for {role}: '{payload.message}'. Focusing on core software engineering principles and hands-on repository evidence will help you master this concept!"
    
    return ChatResponse(
        answer=reply,
        advisory="AI Learning Assistant",
        suggested_followups=["How does this apply to my current project?", "Show me a code example", "What are common pitfalls?"]
    )
