import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.api.deps import get_current_user
from app.models.user import User, Project, ProjectMember, Milestone, Task

from app.models.network import WorkPost, PostLike, PostComment, PostShare, PostRebuild, UserConnection
from app.schemas.network import WorkPostCreate, CommentCreate, WorkPostResponse, RebuildRequest, RebuildResponse
from app.ai.project_architect import generate_project_structure

router = APIRouter(prefix="/network", tags=["network"])

def get_demo_user(db: Session) -> User:
    user = db.query(User).first()
    if not user:
        user = User(email="student@sisya.ai", full_name="Anuvardhan", username="anuvardhan")
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

@router.get("/feed", response_model=List[WorkPostResponse])
def get_network_feed(db: Session = Depends(get_db)):
    """
    Retrieves the engineering work feed.
    """
    current_user = get_demo_user(db)
    posts = db.query(WorkPost).order_by(WorkPost.created_at.desc()).all()
    
    if not posts:
        # Create initial seed work post for demonstration
        seed_post = WorkPost(
            user_id=current_user.id,
            post_type="project_update",
            title="Completed Milestone 2: Async PostgreSQL Session Management",
            content="🚀 Just finished implementing async connection pooling and JWT token refresh middleware in FastAPI! Checked in tests and evidence.",
            github_pr_url="https://github.com/ValabojuAnuvardhan/sisya-abhyasa/pull/21"
        )
        db.add(seed_post)
        db.commit()
        db.refresh(seed_post)
        posts = [seed_post]

    res = []
    for p in posts:
        likes_c = db.query(PostLike).filter(PostLike.post_id == p.id).count()
        comments_c = db.query(PostComment).filter(PostComment.post_id == p.id).count()
        shares_c = db.query(PostShare).filter(PostShare.post_id == p.id).count()
        rebuilds_c = db.query(PostRebuild).filter(PostRebuild.post_id == p.id).count()
        has_liked = db.query(PostLike).filter(PostLike.post_id == p.id, PostLike.user_id == current_user.id).first() is not None

        res.append(WorkPostResponse(
            id=p.id,
            user_id=p.user_id,
            author_name="Anuvardhan",
            author_username="anuvardhan",
            author_role="Backend Developer",
            post_type=p.post_type,
            title=p.title,
            content=p.content,
            project_id=p.project_id,
            milestone_id=p.milestone_id,
            github_pr_url=p.github_pr_url,
            likes_count=likes_c,
            comments_count=comments_c,
            shares_count=shares_c,
            rebuilds_count=rebuilds_c,
            user_has_liked=has_liked,
            created_at=p.created_at
        ))
    return res

@router.post("/posts", response_model=WorkPostResponse)
def create_work_post(payload: WorkPostCreate, db: Session = Depends(get_db)):
    """
    Creates a new engineering Work Post.
    """
    current_user = get_demo_user(db)
    post = WorkPost(
        user_id=current_user.id,
        post_type=payload.post_type,
        title=payload.title,
        content=payload.content,
        project_id=payload.project_id,
        milestone_id=payload.milestone_id,
        github_pr_url=payload.github_pr_url
    )
    db.add(post)
    db.commit()
    db.refresh(post)

    return WorkPostResponse(
        id=post.id,
        user_id=post.user_id,
        author_name="Anuvardhan",
        author_username="anuvardhan",
        author_role="Backend Developer",
        post_type=post.post_type,
        title=post.title,
        content=post.content,
        project_id=post.project_id,
        milestone_id=post.milestone_id,
        github_pr_url=post.github_pr_url,
        likes_count=0,
        comments_count=0,
        shares_count=0,
        rebuilds_count=0,
        user_has_liked=False,
        created_at=post.created_at
    )

@router.post("/posts/{post_id}/like")
def toggle_post_like(post_id: uuid.UUID, db: Session = Depends(get_db)):
    current_user = get_demo_user(db)
    existing = db.query(PostLike).filter(PostLike.post_id == post_id, PostLike.user_id == current_user.id).first()
    if existing:
        db.delete(existing)
        db.commit()
        return {"liked": False}
    else:
        like = PostLike(post_id=post_id, user_id=current_user.id)
        db.add(like)
        db.commit()
        return {"liked": True}

@router.post("/posts/{post_id}/comment")
def add_post_comment(post_id: uuid.UUID, payload: CommentCreate, db: Session = Depends(get_db)):
    current_user = get_demo_user(db)
    comment = PostComment(post_id=post_id, user_id=current_user.id, body=payload.body)
    db.add(comment)
    db.commit()
    return {"message": "Comment added successfully", "comment_id": comment.id}

@router.post("/rebuild/{post_id}", response_model=RebuildResponse)
def rebuild_project_from_post(
    post_id: uuid.UUID,
    payload: RebuildRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    post = db.query(WorkPost).filter(WorkPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Work post not found")

    # Call AI Architect with the post context
    prompt = f"Inspired by project '{post.title}': {post.content}"
    arch_result = generate_project_structure(prompt)

    # Create new Project
    new_project = Project(
        owner_id=current_user.id,
        title=f"Rebuild: {arch_result['title']}",
        description=arch_result['description']
    )
    db.add(new_project)
    db.commit()
    db.refresh(new_project)

    member = ProjectMember(
        project_id=new_project.id,
        user_id=current_user.id,
        role="owner",
        status="approved"
    )
    db.add(member)
    db.commit()

    # Persist Milestones and Tasks
    m_count = 0
    t_count = 0
    for idx, m_data in enumerate(arch_result.get("milestones", [])):
        m_count += 1
        milestone = Milestone(
            project_id=new_project.id,
            title=m_data.get("title", f"Milestone {idx+1}"),
            order=idx+1
        )
        db.add(milestone)
        db.commit()
        db.refresh(milestone)

        # Default tasks per milestone
        task_titles = ["Implement core module", "Add unit & integration tests", "Configure API endpoints"]
        for t_idx, t_title in enumerate(task_titles):
            t_count += 1
            task = Task(
                project_id=new_project.id,
                milestone_id=milestone.id,
                title=t_title,
                description=f"Task generated via 🔨 Rebuild for {milestone.title}",
                order=t_idx + 1
            )
            db.add(task)
    db.commit()


    # Track Rebuild action
    rebuild_record = PostRebuild(
        post_id=post.id,
        user_id=current_user.id,
        source_project_id=post.project_id,
        target_project_id=new_project.id
    )
    db.add(rebuild_record)
    db.commit()

    return RebuildResponse(
        message="Personalized project roadmap generated successfully!",
        rebuild_id=rebuild_record.id,
        new_project_id=new_project.id,
        project_title=new_project.title,
        project_description=new_project.description,
        milestones_count=m_count,
        tasks_count=t_count
    )
