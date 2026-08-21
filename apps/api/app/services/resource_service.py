import uuid
import os
import urllib.parse
import urllib.request
import json
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from sqlalchemy import select, delete
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.learn import (
    LearningRoadmapNode,
    LearningResource,
    SavedLearningResource,
    LearningResourceProgress
)

# Explicit Canonical Official Documentation Registry
CANONICAL_DOCS_REGISTRY: Dict[str, Dict[str, str]] = {
    "asyncio": {
        "title": "Python AsyncIO Official Documentation",
        "url": "https://docs.python.org/3/library/asyncio.html",
        "topic": "AsyncIO & Concurrency",
        "related_skill": "Python Async Programming",
        "why": "Official Python core specification for async event loops, tasks, and non-blocking IO."
    },
    "fastapi": {
        "title": "FastAPI Official Documentation & User Guide",
        "url": "https://fastapi.tiangolo.com/",
        "topic": "FastAPI Architecture",
        "related_skill": "FastAPI Web Engineering",
        "why": "Authoritative guide for async routes, Pydantic schemas, dependency injection, and OpenAPI."
    },
    "sqlalchemy": {
        "title": "SQLAlchemy 2.0 Unified Tutorial & Documentation",
        "url": "https://docs.sqlalchemy.org/en/20/",
        "topic": "SQLAlchemy 2.0 ORM",
        "related_skill": "Database & ORM Design",
        "why": "Official guide for async sessions, relationship mappings, connection pools, and Alembic migrations."
    },
    "postgresql": {
        "title": "PostgreSQL Official Documentation",
        "url": "https://www.postgresql.org/docs/current/",
        "topic": "PostgreSQL Database Engine",
        "related_skill": "PostgreSQL Administration",
        "why": "Canonical manual for SQL queries, indexing strategies, transactions, and performance tuning."
    },
    "next.js": {
        "title": "Next.js Official Documentation & App Router Guide",
        "url": "https://nextjs.org/docs",
        "topic": "Next.js Architecture",
        "related_skill": "Frontend Web Engineering",
        "why": "Authoritative manual for Next.js App Router, Server Components, client state, and API routing."
    },
    "react": {
        "title": "React Official Documentation & Hooks Reference",
        "url": "https://react.dev/",
        "topic": "React UI Architecture",
        "related_skill": "React & Web UI",
        "why": "Canonical reference for React components, state hooks, side-effects, and concurrent rendering."
    },
    "docker": {
        "title": "Docker Official Documentation & Guides",
        "url": "https://docs.docker.com/",
        "topic": "Docker Containerization",
        "related_skill": "DevOps & Infrastructure",
        "why": "Official documentation for Dockerfiles, multi-stage builds, networking, and docker-compose."
    },
    "python": {
        "title": "Python 3 Official Documentation & Tutorial",
        "url": "https://docs.python.org/3/",
        "topic": "Python Language Core",
        "related_skill": "Python Software Development",
        "why": "Canonical standard library and language specification."
    },
    "redis": {
        "title": "Redis Official Documentation & Commands",
        "url": "https://redis.io/docs/",
        "topic": "Redis In-Memory Data Store",
        "related_skill": "Caching & Performance",
        "why": "Official reference for key-value structures, pub-sub messaging, caching patterns, and persistence."
    },
    "pytorch": {
        "title": "PyTorch Official Documentation & Tutorials",
        "url": "https://pytorch.org/docs/stable/index.html",
        "topic": "PyTorch Deep Learning",
        "related_skill": "AI & Machine Learning",
        "why": "Canonical manual for tensors, autograd, neural network modules, and GPU model training."
    }
}

def validate_resource_url(url: str) -> bool:
    if not url or not isinstance(url, str):
        return False
    if not url.startswith("https://"):
        return False
    try:
        parsed = urllib.parse.urlparse(url)
        return bool(parsed.netloc and parsed.scheme == "https")
    except Exception:
        return False

def lookup_canonical_docs(topic_name: str) -> Optional[Dict[str, str]]:
    topic_lower = (topic_name or "").lower()
    for key, doc in CANONICAL_DOCS_REGISTRY.items():
        if key in topic_lower:
            return doc
    return None

def fetch_youtube_resources(topic_name: str, target_role: str) -> List[Dict[str, Any]]:
    api_key = os.environ.get("YOUTUBE_API_KEY")
    query = f"{topic_name} {target_role} tutorial".strip()
    
    if api_key:
        try:
            encoded_query = urllib.parse.quote(query)
            url = f"https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=3&q={encoded_query}&type=video&key={api_key}"
            req = urllib.request.Request(url, headers={"User-Agent": "Sisya-Abhyasa/1.0"})
            with urllib.request.urlopen(req, timeout=5) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                items = data.get("items", [])
                results = []
                for item in items:
                    video_id = item.get("id", {}).get("videoId")
                    snippet = item.get("snippet", {})
                    if video_id:
                        video_url = f"https://www.youtube.com/watch?v={video_id}"
                        if validate_resource_url(video_url):
                            results.append({
                                "title": snippet.get("title", f"Practical {topic_name} Tutorial"),
                                "source": "YOUTUBE",
                                "url": video_url,
                                "topic": topic_name,
                                "estimated_duration": None, # Null if provider doesn't specify duration
                                "why_recommended": f"Recommended video covering practical {topic_name} concepts for {target_role}.",
                                "related_skill": topic_name,
                                "thumbnail_url": snippet.get("thumbnails", {}).get("default", {}).get("url"),
                                "external_resource_id": video_id
                            })
                return results
        except Exception as e:
            print(f"[YouTube Search API Warning]: {e}")
            return []

    # Safe Fallback YouTube provider using canonical verified YouTube search query URL
    encoded_q = urllib.parse.quote(f"{topic_name} {target_role} architecture tutorial")
    search_url = f"https://www.youtube.com/results?search_query={encoded_q}"
    if validate_resource_url(search_url):
        return [
            {
                "title": f"Verified Search: {topic_name} Practical Engineering Guide",
                "source": "YOUTUBE",
                "url": search_url,
                "topic": topic_name,
                "estimated_duration": None,
                "why_recommended": f"Verified search results covering step-by-step implementation for {topic_name}.",
                "related_skill": topic_name,
                "thumbnail_url": None,
                "external_resource_id": None
            }
        ]
    return []

def discover_resources_for_node(node: LearningRoadmapNode, user: User, db: Session, force_refresh: bool = False) -> Dict[str, Any]:
    # 1. Authorization Guard
    if node.roadmap.user_id != user.id:
        raise PermissionError("Unauthorized — Student does not own this roadmap node.")

    # 2. Return existing persisted resources if available and not force_refresh
    if not force_refresh:
        existing = db.scalars(
            select(LearningResource)
            .where(LearningResource.roadmap_node_id == node.id)
        ).all()
        if existing and len(existing) > 0:
            return {
                "status": "success",
                "roadmap_node_id": node.id,
                "topic": node.topic_name,
                "related_skill": node.topic_name,
                "resources": existing,
                "error_message": None
            }

    # 3. Discovery Pipeline
    candidate_specs: List[Dict[str, Any]] = []

    try:
        # A. Official Documentation Registry Search
        doc_entry = lookup_canonical_docs(node.topic_name)
        if doc_entry and validate_resource_url(doc_entry["url"]):
            candidate_specs.append({
                "title": doc_entry["title"],
                "source": "OFFICIAL_DOCUMENTATION",
                "url": doc_entry["url"],
                "topic": doc_entry["topic"],
                "estimated_duration": None,
                "why_recommended": f"Recommended because {doc_entry['why']} It directly supports your {node.topic_name} roadmap topic.",
                "related_skill": doc_entry["related_skill"],
                "resource_type": "OFFICIAL_DOCUMENTATION",
                "thumbnail_url": None,
                "external_resource_id": None
            })

        # B. YouTube Search Provider
        yt_results = fetch_youtube_resources(node.topic_name, node.roadmap.target_role)
        for yt in yt_results:
            candidate_specs.append(yt)

    except Exception as err:
        print(f"[Resource Discovery Warning]: {err}")

    # 4. Filter & Validate Metadata Integrity (HTTPS check)
    valid_specs = [s for s in candidate_specs if validate_resource_url(s.get("url"))]

    if not valid_specs:
        return {
            "status": "unavailable",
            "roadmap_node_id": node.id,
            "topic": node.topic_name,
            "related_skill": node.topic_name,
            "resources": [],
            "error_message": "Learning resources are temporarily unavailable."
        }

    # 5. Persist Resources in DB
    if force_refresh:
        db.execute(delete(LearningResource).where(LearningResource.roadmap_node_id == node.id))

    persisted_resources = []
    for spec in valid_specs:
        res = LearningResource(
            roadmap_id=node.roadmap_id,
            roadmap_node_id=node.id,
            title=spec["title"],
            source=spec["source"],
            url=spec["url"],
            topic=spec["topic"],
            estimated_duration=spec.get("estimated_duration"),
            why_recommended=spec["why_recommended"],
            related_skill=spec.get("related_skill", node.topic_name),
            resource_type=spec.get("resource_type", "LEARNING_RESOURCE"),
            thumbnail_url=spec.get("thumbnail_url"),
            external_resource_id=spec.get("external_resource_id")
        )
        db.add(res)
        persisted_resources.append(res)

    db.commit()

    for r in persisted_resources:
        db.refresh(r)

    return {
        "status": "success",
        "roadmap_node_id": node.id,
        "topic": node.topic_name,
        "related_skill": node.topic_name,
        "resources": persisted_resources,
        "error_message": None
    }

# --- PERSISTENT USER BOOKMARKS & PROGRESS SERVICES ---

def save_resource_for_user(user_id: uuid.UUID, resource_id: uuid.UUID, db: Session) -> SavedLearningResource:
    resource = db.get(LearningResource, resource_id)
    if not resource:
        raise KeyError("Learning resource not found")

    existing = db.scalar(
        select(SavedLearningResource)
        .where(SavedLearningResource.user_id == user_id, SavedLearningResource.resource_id == resource_id)
    )
    if existing:
        return existing

    saved = SavedLearningResource(user_id=user_id, resource_id=resource_id)
    db.add(saved)
    db.commit()
    db.refresh(saved)
    return saved

def unsave_resource_for_user(user_id: uuid.UUID, resource_id: uuid.UUID, db: Session) -> bool:
    saved = db.scalar(
        select(SavedLearningResource)
        .where(SavedLearningResource.user_id == user_id, SavedLearningResource.resource_id == resource_id)
    )
    if saved:
        db.delete(saved)
        db.commit()
        return True
    return False

def get_saved_resources_for_user(user_id: uuid.UUID, db: Session) -> List[LearningResource]:
    stmt = (
        select(LearningResource)
        .join(SavedLearningResource, SavedLearningResource.resource_id == LearningResource.id)
        .where(SavedLearningResource.user_id == user_id)
    )
    return db.scalars(stmt).all()

def update_resource_progress_for_user(user_id: uuid.UUID, resource_id: uuid.UUID, status: str, db: Session) -> LearningResourceProgress:
    if status not in ["NOT_VIEWED", "VIEWED", "COMPLETED"]:
        raise ValueError("Invalid resource progress status")

    resource = db.get(LearningResource, resource_id)
    if not resource:
        raise KeyError("Learning resource not found")

    prog = db.scalar(
        select(LearningResourceProgress)
        .where(LearningResourceProgress.user_id == user_id, LearningResourceProgress.resource_id == resource_id)
    )
    if not prog:
        prog = LearningResourceProgress(user_id=user_id, resource_id=resource_id)
        db.add(prog)

    prog.status = status
    now = datetime.now(timezone.utc)
    if status == "VIEWED":
        prog.viewed_at = now
    elif status == "COMPLETED":
        if not prog.viewed_at:
            prog.viewed_at = now
        prog.completed_at = now

    db.commit()
    db.refresh(prog)
    return prog
