import uuid
from datetime import datetime, timezone
from typing import List, Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from app.core.auth import AuthPrincipal, require_principal, optional_principal
from app.db.session import get_db
from app.models.user import User, StudentProfile
from app.models.project import Project, Milestone, Task, ProjectMember
from app.models.learn import LearningResource
from app.models.network import NetworkPost, NetworkPostLike, NetworkPostComment, NetworkPostShare, NetworkPostRebuild

router = APIRouter(prefix="/network", tags=["network"])

# --- Schemas ---

class NetworkPostCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=5000)
    post_type: str = Field("LEARNING", description="LEARNING, PROJECT, PROGRESS")
    title: Optional[str] = Field(None, max_length=255)
    skill_topic: Optional[str] = Field(None, max_length=150)
    visibility: str = Field("PUBLIC", description="PUBLIC or PRIVATE")
    resource_id: Optional[uuid.UUID] = None
    project_id: Optional[uuid.UUID] = None
    task_id: Optional[uuid.UUID] = None
    roadmap_node_id: Optional[uuid.UUID] = None
    github_pr_url: Optional[str] = Field(None, max_length=500)

class NetworkPostUpdate(BaseModel):
    content: Optional[str] = Field(None, min_length=1, max_length=5000)
    title: Optional[str] = Field(None, max_length=255)
    skill_topic: Optional[str] = Field(None, max_length=150)
    visibility: Optional[str] = None
    resource_id: Optional[uuid.UUID] = None
    project_id: Optional[uuid.UUID] = None
    task_id: Optional[uuid.UUID] = None

class CommentCreate(BaseModel):
    body: str = Field(..., min_length=1, max_length=2000)

class NetworkPostResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    author_name: str
    author_username: str
    author_role: str
    post_type: str
    title: Optional[str] = None
    content: str
    skill_topic: Optional[str] = None
    visibility: str
    resource_id: Optional[uuid.UUID] = None
    resource_title: Optional[str] = None
    project_id: Optional[uuid.UUID] = None
    project_title: Optional[str] = None
    project_description: Optional[str] = None
    project_progress_summary: Optional[str] = None
    verified_proof_count: int = 0
    task_id: Optional[uuid.UUID] = None
    github_pr_url: Optional[str] = None
    likes_count: int
    comments_count: int
    shares_count: int
    rebuilds_count: int
    user_has_liked: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class NetworkPostRebuildRequest(BaseModel):
    collaboration_mode: Optional[str] = Field("SOLO", description="SOLO or TEAM")
    team_emails: Optional[List[str]] = Field(default=[], description="Teammate emails (max 4 additional members)")

class NetworkPostRebuildResponse(BaseModel):
    target_project_id: uuid.UUID
    project_title: str
    collaboration_mode: str
    milestones_count: int
    tasks_count: int
    owner_id: uuid.UUID

# --- Helpers ---

def current_user(principal: AuthPrincipal, db: Session) -> User:
    user = db.get(User, principal.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

def build_post_response(post: NetworkPost, current_user_id: Optional[uuid.UUID], db: Session) -> NetworkPostResponse:
    author = db.get(User, post.user_id)
    profile = db.get(StudentProfile, post.user_id) if author else None

    author_name = author.full_name if author and author.full_name else "Student Builder"
    author_username = author.email.split("@")[0] if author and author.email else "student"
    author_role = profile.target_role if profile and profile.target_role else "Software Engineer"

    likes_count = db.scalar(select(func.count()).select_from(NetworkPostLike).where(NetworkPostLike.post_id == post.id)) or 0
    comments_count = db.scalar(select(func.count()).select_from(NetworkPostComment).where(NetworkPostComment.post_id == post.id)) or 0
    shares_count = db.scalar(select(func.count()).select_from(NetworkPostShare).where(NetworkPostShare.post_id == post.id)) or 0
    rebuilds_count = db.scalar(select(func.count()).select_from(NetworkPostRebuild).where(NetworkPostRebuild.post_id == post.id)) or 0

    user_has_liked = False
    if current_user_id:
        like_row = db.scalar(select(NetworkPostLike).where(NetworkPostLike.post_id == post.id, NetworkPostLike.user_id == current_user_id))
        user_has_liked = like_row is not None

    resource_title = None
    if post.resource_id:
        res_obj = db.get(LearningResource, post.resource_id)
        if res_obj:
            resource_title = res_obj.title

    project_title = None
    project_description = None
    project_progress_summary = None
    verified_proof_count = 0

    if post.project_id:
        proj = db.get(Project, post.project_id)
        if proj:
            project_title = proj.title
            project_description = proj.description
            total_m = len(proj.milestones) if proj.milestones else 0
            total_t = sum(len(m.tasks) for m in proj.milestones) if proj.milestones else 0
            completed_t = sum(sum(1 for t in m.tasks if t.status == 'completed') for m in proj.milestones) if proj.milestones else 0
            project_progress_summary = f"{completed_t}/{total_t} Tasks Completed ({total_m} Milestones)"
            verified_proof_count = completed_t + (1 if post.github_pr_url else 0)

    return NetworkPostResponse(
        id=post.id,
        user_id=post.user_id,
        author_name=author_name,
        author_username=author_username,
        author_role=author_role,
        post_type=post.post_type,
        title=post.title,
        content=post.content,
        skill_topic=post.skill_topic,
        visibility=post.visibility,
        resource_id=post.resource_id,
        resource_title=resource_title,
        project_id=post.project_id,
        project_title=project_title,
        project_description=project_description,
        project_progress_summary=project_progress_summary,
        verified_proof_count=verified_proof_count,
        task_id=post.task_id,
        github_pr_url=post.github_pr_url,
        likes_count=likes_count,
        comments_count=comments_count,
        shares_count=shares_count,
        rebuilds_count=rebuilds_count,
        user_has_liked=user_has_liked,
        created_at=post.created_at,
        updated_at=post.updated_at
    )

# --- Endpoints ---

@router.get("/feed", response_model=List[NetworkPostResponse])
def get_network_feed(
    type: str = Query("ALL", description="ALL, LEARNING, PROJECT, PROGRESS"),
    principal: Optional[AuthPrincipal] = Depends(optional_principal),
    db: Session = Depends(get_db)
):
    current_uid = principal.user_id if principal else None

    # Server-side visibility enforcement: Community feed only shows PUBLIC posts
    query = select(NetworkPost).where(NetworkPost.visibility == "PUBLIC")

    type_upper = type.upper()
    if type_upper in ("LEARNING", "PROJECT", "PROGRESS"):
        query = query.where(NetworkPost.post_type == type_upper)

    posts = db.scalars(query.order_by(NetworkPost.created_at.desc())).all()

    return [build_post_response(p, current_uid, db) for p in posts]

@router.post("/posts", response_model=NetworkPostResponse, status_code=201)
def create_network_post(
    payload: NetworkPostCreate,
    principal: AuthPrincipal = Depends(require_principal),
    db: Session = Depends(get_db)
):
    user = current_user(principal, db)

    # Validate post_type
    post_type_clean = payload.post_type.upper()
    if post_type_clean not in ("LEARNING", "PROJECT", "PROGRESS"):
        raise HTTPException(status_code=400, detail="Invalid post_type. Must be LEARNING, PROJECT, or PROGRESS")

    # Validate visibility
    visibility_clean = payload.visibility.upper()
    if visibility_clean not in ("PUBLIC", "PRIVATE"):
        raise HTTPException(status_code=400, detail="Invalid visibility. Must be PUBLIC or PRIVATE")

    # Validate optional resource_id
    if payload.resource_id:
        res = db.get(LearningResource, payload.resource_id)
        if not res:
            raise HTTPException(status_code=404, detail="Referenced resource not found")

    post = NetworkPost(
        user_id=user.id,
        post_type=post_type_clean,
        title=(payload.title or "").strip() or None,
        content=payload.content.strip(),
        skill_topic=(payload.skill_topic or "").strip() or None,
        visibility=visibility_clean,
        resource_id=payload.resource_id,
        project_id=payload.project_id,
        task_id=payload.task_id,
        roadmap_node_id=payload.roadmap_node_id,
        github_pr_url=(payload.github_pr_url or "").strip() or None
    )

    # Note: Hard evidence boundary enforced - Creating post NEVER creates skill evidence records!
    db.add(post)
    db.commit()
    db.refresh(post)

    return build_post_response(post, user.id, db)

@router.get("/posts/{post_id}", response_model=NetworkPostResponse)
def get_post_by_id(
    post_id: uuid.UUID,
    principal: Optional[AuthPrincipal] = Depends(optional_principal),
    db: Session = Depends(get_db)
):
    current_uid = principal.user_id if principal else None
    post = db.get(NetworkPost, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # Private visibility authorization guard
    if post.visibility == "PRIVATE" and post.user_id != current_uid:
        raise HTTPException(status_code=403, detail="Forbidden: Private post access denied")

    return build_post_response(post, current_uid, db)

@router.patch("/posts/{post_id}", response_model=NetworkPostResponse)
def update_network_post(
    post_id: uuid.UUID,
    payload: NetworkPostUpdate,
    principal: AuthPrincipal = Depends(require_principal),
    db: Session = Depends(get_db)
):
    user = current_user(principal, db)
    post = db.get(NetworkPost, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # Author-only authorization guard
    if post.user_id != user.id:
        raise HTTPException(status_code=403, detail="Forbidden: You can only edit your own posts")

    if payload.content is not None:
        post.content = payload.content.strip()
    if payload.title is not None:
        post.title = payload.title.strip() or None
    if payload.skill_topic is not None:
        post.skill_topic = payload.skill_topic.strip() or None
    if payload.visibility is not None:
        vis_clean = payload.visibility.upper()
        if vis_clean not in ("PUBLIC", "PRIVATE"):
            raise HTTPException(status_code=400, detail="Invalid visibility. Must be PUBLIC or PRIVATE")
        post.visibility = vis_clean
    if payload.resource_id is not None:
        post.resource_id = payload.resource_id
    if payload.project_id is not None:
        post.project_id = payload.project_id
    if payload.task_id is not None:
        post.task_id = payload.task_id

    post.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(post)

    return build_post_response(post, user.id, db)

@router.delete("/posts/{post_id}")
def delete_network_post(
    post_id: uuid.UUID,
    principal: AuthPrincipal = Depends(require_principal),
    db: Session = Depends(get_db)
):
    user = current_user(principal, db)
    post = db.get(NetworkPost, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # Author-only authorization guard
    if post.user_id != user.id:
        raise HTTPException(status_code=403, detail="Forbidden: You can only delete your own posts")

    # Deleting post does NOT delete roadmap nodes, checklist items, resources, projects, tasks, or evidence!
    db.delete(post)
    db.commit()
    return {"message": "Post deleted successfully", "id": str(post_id)}

@router.post("/posts/{post_id}/like")
def toggle_post_like(
    post_id: uuid.UUID,
    principal: AuthPrincipal = Depends(require_principal),
    db: Session = Depends(get_db)
):
    user = current_user(principal, db)
    post = db.get(NetworkPost, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    if post.visibility == "PRIVATE" and post.user_id != user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    existing = db.scalar(select(NetworkPostLike).where(NetworkPostLike.post_id == post_id, NetworkPostLike.user_id == user.id))
    if existing:
        db.delete(existing)
        db.commit()
        return {"liked": False}
    else:
        like = NetworkPostLike(post_id=post_id, user_id=user.id)
        db.add(like)
        db.commit()
        return {"liked": True}

@router.post("/posts/{post_id}/comments", status_code=201)
def add_post_comment(
    post_id: uuid.UUID,
    payload: CommentCreate,
    principal: AuthPrincipal = Depends(require_principal),
    db: Session = Depends(get_db)
):
    user = current_user(principal, db)
    post = db.get(NetworkPost, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    if post.visibility == "PRIVATE" and post.user_id != user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    comment = NetworkPostComment(post_id=post_id, user_id=user.id, body=payload.body.strip())
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return {"id": str(comment.id), "body": comment.body, "author_id": str(user.id), "created_at": comment.created_at}

@router.get("/posts/{post_id}/comments")
def list_post_comments(
    post_id: uuid.UUID,
    principal: Optional[AuthPrincipal] = Depends(optional_principal),
    db: Session = Depends(get_db)
):
    current_uid = principal.user_id if principal else None
    post = db.get(NetworkPost, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    if post.visibility == "PRIVATE" and post.user_id != current_uid:
        raise HTTPException(status_code=403, detail="Forbidden")

    comments = db.scalars(select(NetworkPostComment).where(NetworkPostComment.post_id == post_id).order_by(NetworkPostComment.created_at.asc())).all()
    res = []
    for c in comments:
        c_author = db.get(User, c.user_id)
        res.append({
            "id": str(c.id),
            "body": c.body,
            "author_id": str(c.user_id),
            "author_name": c_author.full_name if c_author and c_author.full_name else "Student Builder",
            "created_at": c.created_at
        })
    return res

@router.post("/posts/{post_id}/share")
def share_post(
    post_id: uuid.UUID,
    principal: AuthPrincipal = Depends(require_principal),
    db: Session = Depends(get_db)
):
    user = current_user(principal, db)
    post = db.get(NetworkPost, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    if post.visibility == "PRIVATE" and post.user_id != user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    share_obj = NetworkPostShare(post_id=post_id, user_id=user.id)
    db.add(share_obj)
    db.commit()
    return {"message": "Post shared successfully", "share_id": str(share_obj.id)}

@router.post("/posts/{post_id}/rebuild", response_model=NetworkPostRebuildResponse, status_code=201)
def rebuild_project_from_post(
    post_id: uuid.UUID,
    payload: Optional[NetworkPostRebuildRequest] = None,
    principal: AuthPrincipal = Depends(require_principal),
    db: Session = Depends(get_db)
):
    user = current_user(principal, db)
    post = db.get(NetworkPost, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # Visibility authorization guard
    if post.visibility == "PRIVATE" and post.user_id != user.id:
        raise HTTPException(status_code=403, detail="Forbidden: Cannot rebuild from a private post")

    mode = (payload.collaboration_mode if payload and payload.collaboration_mode else "SOLO").upper()
    if mode not in ("SOLO", "TEAM"):
        mode = "SOLO"

    # Determine source project details
    source_title = post.title or "Inspirational Project"
    source_desc = post.content
    source_skills = post.skill_topic or "Software Engineering"
    source_project_id = post.project_id

    if post.project_id:
        src_proj = db.get(Project, post.project_id)
        if src_proj:
            source_title = src_proj.title
            source_desc = src_proj.description
            if src_proj.skills_needed:
                source_skills = src_proj.skills_needed

    # Create new Project B owned by current user (Student B)
    # STRICT PRIVACY & MULTI-TENANT ISOLATION:
    # Creator is user.id (Student B). No private tasks, commits, repo credentials of Student A are copied!
    target_project = Project(
        creator_id=user.id,
        title=f"Rebuild: {source_title}",
        description=f"Personalized rebuild inspired by community project '{source_title}'. Concept: {source_desc[:200]}...",
        source="community_rebuild",
        difficulty="intermediate",
        status="active",
        plan_status="active",
        discoverable=False,
        collaboration_mode=mode,
        skills_needed=source_skills
    )
    db.add(target_project)
    db.commit()
    db.refresh(target_project)

    # Generate personalized milestones and tasks for Student B
    m1 = Milestone(
        project_id=target_project.id,
        title="Phase 1: System Architecture & Foundation",
        objective=f"Set up core repository structure and foundation for {source_title}.",
        position=1
    )
    db.add(m1)
    db.commit()
    db.refresh(m1)

    t1_1 = Task(
        milestone_id=m1.id,
        title="Initialize Repository & Dependency Configuration",
        description="Set up clean development environment, initial project scaffolding, and environment config.",
        completion_criteria="Repository initialized with working build scripts and clean configuration.",
        required_skills=source_skills,
        resources="Official Documentation",
        status="todo",
        position=1,
        assigned_user_id=user.id
    )
    t1_2 = Task(
        milestone_id=m1.id,
        title="Design Core Data Schemas & API Models",
        description="Define foundational database tables, API schemas, and validation contracts.",
        completion_criteria="Database schemas defined and validated with initial migrations.",
        required_skills=source_skills,
        resources="Architecture Specifications",
        status="todo",
        position=2,
        assigned_user_id=user.id
    )
    db.add_all([t1_1, t1_2])

    m2 = Milestone(
        project_id=target_project.id,
        title="Phase 2: Core Engineering & Telemetry Verification",
        objective="Implement primary service logic and verify engineering completion with unit tests and PR telemetry.",
        position=2
    )
    db.add(m2)
    db.commit()
    db.refresh(m2)

    t2_1 = Task(
        milestone_id=m2.id,
        title="Implement Service Controllers & Business Logic",
        description="Build primary business logic and REST endpoints for core project workflows.",
        completion_criteria="Endpoints pass unit test suite and return 200 OK responses.",
        required_skills=source_skills,
        resources="API Integration Guides",
        status="todo",
        position=1,
        assigned_user_id=user.id
    )
    t2_2 = Task(
        milestone_id=m2.id,
        title="Submit GitHub PR & Verify Evidence Telemetry",
        description="Open Pull Request for project implementation and link verified proof-of-work telemetry.",
        completion_criteria="GitHub PR merged with green CI/CD build status.",
        required_skills=source_skills,
        resources="GitHub Telemetry Pipeline",
        status="todo",
        position=2,
        assigned_user_id=user.id
    )
    db.add_all([t2_1, t2_2])

    # Add owner membership
    owner_member = ProjectMember(
        project_id=target_project.id,
        user_id=user.id,
        role="owner",
        status="active"
    )
    db.add(owner_member)

    # Add teammates if TEAM mode requested
    if mode == "TEAM" and payload and payload.team_emails:
        added_count = 0
        for email in payload.team_emails:
            if added_count >= 4: # Max 5 total members (1 owner + 4 teammates)
                break
            target_user = db.scalar(select(User).where(User.email == email.strip().lower()))
            if target_user and target_user.id != user.id:
                tm = ProjectMember(
                    project_id=target_project.id,
                    user_id=target_user.id,
                    role="contributor",
                    status="active"
                )
                db.add(tm)
                added_count += 1

    rebuild_record = NetworkPostRebuild(
        post_id=post.id,
        user_id=user.id,
        source_project_id=source_project_id,
        target_project_id=target_project.id
    )
    db.add(rebuild_record)

    db.commit()

    return NetworkPostRebuildResponse(
        target_project_id=target_project.id,
        project_title=target_project.title,
        collaboration_mode=mode,
        milestones_count=2,
        tasks_count=4,
        owner_id=user.id
    )
