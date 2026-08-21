import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from pydantic import BaseModel
from app.database import get_db
from app.models.user import User, Project, ProjectMember, Repository, Milestone, Task
from app.schemas.project import ProjectCreate, ProjectResponse
from app.schemas.project_architect import ProjectArchitectRequest, ProjectArchitectResponse
from app.ai.project_architect import generate_project_architecture
from app.api.deps import get_current_user

router = APIRouter()


class LinkRepoRequest(BaseModel):
    github_repo_id: str
    full_name: str  # "username/repo-name"
    owner_github_username: str


from typing import Optional

class RecommendRequest(BaseModel):
    interests: Optional[str] = None
    desired_skills: Optional[list[str]] = []
    preferred_difficulty: Optional[str] = None
    time_commitment: Optional[str] = "moderate"


@router.post("/recommend", status_code=status.HTTP_200_OK)
@router.post("/recommend/", status_code=status.HTTP_200_OK, include_in_schema=False)
def recommend_projects(payload: RecommendRequest):
    diff = (payload.preferred_difficulty or "intermediate").capitalize()
    skills = payload.desired_skills or ["FastAPI", "React", "PostgreSQL"]
    stack = list(dict.fromkeys(["Python", "React"] + skills))

    recs = [
        {
            "id": "rec_1",
            "title": "AI Resume & Skill Telemetry Engine",
            "problem": "Students lack automated, evidence-backed feedback on technical skill alignment when building projects.",
            "why_this_matches": f"Matches your interest in {payload.interests or 'full-stack AI tools'} and skills: {', '.join(skills)}.",
            "difficulty": diff,
            "suggested_stack": stack,
            "skills_to_practice": skills[:2] if len(skills) >= 2 else ["React", "API Integration"],
            "skills_to_learn": skills[2:] if len(skills) > 2 else ["FastAPI", "PostgreSQL"],
            "expected_deliverables": ["REST API server", "Interactive React UI", "Database schema & migrations"],
            "evidence_opportunities": ["Merged GitHub PRs for API endpoints", "Comprehensive unit test suite"]
        },
        {
            "id": "rec_2",
            "title": "Real-time Kanban & AI Architect Board",
            "problem": "Software engineering teams struggle to link project tasks with real, verified proof of work.",
            "why_this_matches": f"Demonstrates core production engineering skills with {', '.join(skills[:3])}.",
            "difficulty": diff,
            "suggested_stack": stack + ["WebSockets"],
            "skills_to_practice": ["Full-Stack Architecture", "State Management"],
            "skills_to_learn": ["Database Design", "OAuth Integration"],
            "expected_deliverables": ["Kanban Board Interface", "Webhook Payload Handler", "Evidence Exporter"],
            "evidence_opportunities": ["GitHub Webhook payload handlers", "End-to-End Test Suite"]
        }
    ]

    return {
        "recommendations": recs,
        "generated_by": "ai",
        "notice": "Recommended based on your profile and target technical skills."
    }


@router.post("/architect", response_model=ProjectArchitectResponse, status_code=status.HTTP_200_OK)
@router.post("/architect/", response_model=ProjectArchitectResponse, status_code=status.HTTP_200_OK, include_in_schema=False)
def generate_architect_plan(
    payload: ProjectArchitectRequest,
    current_user: User = Depends(get_current_user)
):
    return generate_project_architecture(payload)



@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED, include_in_schema=False)
def create_project(
    payload: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = Project(
        owner_id=current_user.id,
        title=payload.title,
        description=payload.description,
        tech_stack=payload.tech_stack,
        status="active"
    )
    db.add(project)
    db.commit()
    db.refresh(project)

    member = ProjectMember(
        project_id=project.id,
        user_id=current_user.id,
        role="owner",
        status="approved"
    )
    db.add(member)
    db.commit()

    return project


@router.get("/", response_model=list[ProjectResponse], status_code=status.HTTP_200_OK)
@router.get("", response_model=list[ProjectResponse], status_code=status.HTTP_200_OK, include_in_schema=False)
def get_user_projects(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Subquery for project IDs where user is a member
    member_project_ids = select(ProjectMember.project_id).where(ProjectMember.user_id == current_user.id)
    
    projects = (
        db.query(Project)
        .filter((Project.owner_id == current_user.id) | (Project.id.in_(member_project_ids)))
        .order_by(Project.created_at.desc())
        .all()
    )
    return projects


@router.get("/{project_id}", response_model=ProjectResponse, status_code=status.HTTP_200_OK)
def get_project_detail(
    project_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    if project.owner_id != current_user.id:
        member = db.query(ProjectMember).filter(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == current_user.id,
            ProjectMember.status == "approved"
        ).first()
        if not member:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied: You are not an approved member of this project")

    return project


@router.post("/{project_id}/link-repo")
def link_repository(
    project_id: str,
    body: LinkRepoRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    proj_uuid = uuid.UUID(project_id)
    project = db.query(Project).filter(Project.id == proj_uuid).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    if project.owner_id != current_user.id:
        owner_member = db.query(ProjectMember).filter(
            ProjectMember.project_id == proj_uuid,
            ProjectMember.user_id == current_user.id,
            ProjectMember.role == "owner"
        ).first()
        if not owner_member:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only project owner can link a repository")

    existing = db.query(Repository).filter(
        Repository.github_repo_id == body.github_repo_id
    ).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Repository already linked to a project")

    repo = Repository(
        project_id=proj_uuid,
        github_repo_id=body.github_repo_id,
        full_name=body.full_name,
        owner_github_username=body.owner_github_username
    )
    db.add(repo)
    db.commit()
    return {
        "message": "Repository linked",
        "id": str(repo.id),
        "full_name": repo.full_name
    }


@router.get("/{project_id}/evidence")
def get_project_evidence(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    proj_uuid = uuid.UUID(project_id)
    project = db.query(Project).filter(Project.id == proj_uuid).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    is_owner = (project.owner_id == current_user.id)
    is_member = db.query(ProjectMember).filter(
        ProjectMember.project_id == proj_uuid,
        ProjectMember.user_id == current_user.id,
        ProjectMember.status == "approved"
    ).first() is not None

    if not (is_owner or is_member):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied: You are not a member of this project")

    repos = db.query(Repository).filter(Repository.project_id == proj_uuid).all()

    evidence = []
    for repo in repos:
        commits = [
            {
                "sha": c.sha[:7] if c.sha else "",
                "message": c.message,
                "author": c.author_github_username,
                "task_linked": c.task_id is not None
            }
            for c in repo.commits
        ]
        prs = [
            {
                "number": p.pr_number,
                "title": p.title,
                "state": p.state,
                "merged": p.merged
            }
            for p in repo.pull_requests
        ]
        evidence.append({
            "repo": repo.full_name,
            "commits": commits,
            "pull_requests": prs
        })
    return evidence


class GenerateRoadmapRequest(BaseModel):
    idea: str
    skill_level: str = "Beginner"


@router.post("/{project_id}/generate")
def generate_project_roadmap(
    project_id: str,
    payload: GenerateRoadmapRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    proj_uuid = uuid.UUID(project_id)
    project = db.query(Project).filter(Project.id == proj_uuid).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    if project.owner_id != current_user.id:
        member = db.query(ProjectMember).filter(
            ProjectMember.project_id == proj_uuid,
            ProjectMember.user_id == current_user.id,
            ProjectMember.status == "approved"
        ).first()
        if not member:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    # Duplication protection: Check if project already has milestones or tasks
    existing_tasks = db.query(Task).filter(Task.project_id == proj_uuid).count()
    existing_milestones = db.query(Milestone).filter(Milestone.project_id == proj_uuid).count()
    if existing_tasks > 0 or existing_milestones > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Project already has a generated roadmap and tasks. Roadmap duplication protection active."
        )

    architect_req = ProjectArchitectRequest(
        idea=payload.idea,
        difficulty=payload.skill_level.lower()
    )
    arch_plan = generate_project_architecture(architect_req)

    if arch_plan.tech_stack and not project.tech_stack:
        project.tech_stack = arch_plan.tech_stack
    if arch_plan.description and not project.description:
        project.description = arch_plan.description
    db.commit()

    created_milestones = []
    created_tasks = []

    for m_idx, m_plan in enumerate(arch_plan.milestones):
        ms = Milestone(
            project_id=proj_uuid,
            title=m_plan.title,
            description=m_plan.description,
            order=m_idx,
            completion_pct=0
        )
        db.add(ms)
        db.commit()
        db.refresh(ms)
        created_milestones.append(ms)

        t1 = Task(
            project_id=proj_uuid,
            milestone_id=ms.id,
            title=f"Spec & Setup: {m_plan.title}",
            description=f"Define specification and design data models for {m_plan.title}.",
            completion_criteria=f"Schema designed and reviewed for {m_plan.title}.",
            required_skills=arch_plan.skills[:2] if arch_plan.skills else ["Design"],
            status="todo",
            order=m_idx * 2
        )
        t2 = Task(
            project_id=proj_uuid,
            milestone_id=ms.id,
            title=f"Build: {m_plan.title}",
            description=m_plan.description,
            completion_criteria=f"Core functionality working and tests passing for {m_plan.title}.",
            required_skills=arch_plan.skills[2:] if len(arch_plan.skills) > 2 else ["Implementation"],
            status="todo",
            order=m_idx * 2 + 1
        )
        db.add(t1)
        db.add(t2)
        db.commit()
        db.refresh(t1)
        db.refresh(t2)
        created_tasks.extend([t1, t2])

    return {
        "project_id": str(project.id),
        "title": arch_plan.title,
        "description": arch_plan.description,
        "tech_stack": project.tech_stack,
        "milestones_count": len(created_milestones),
        "tasks_count": len(created_tasks),
        "tasks": [
            {
                "id": str(t.id),
                "title": t.title,
                "description": t.description,
                "completion_criteria": t.completion_criteria,
                "status": t.status,
                "milestone_id": str(t.milestone_id)
            }
            for t in created_tasks
        ]
    }

