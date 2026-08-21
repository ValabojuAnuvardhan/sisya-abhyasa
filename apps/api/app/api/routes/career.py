import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.core.auth import require_principal, AuthPrincipal
from app.db.session import get_db
from app.services.readiness_engine import compute_career_readiness
from app.services.skill_gap_engine import compute_student_skill_matrix, compute_skill_gaps, get_target_role_for_user
from app.services.opportunity_match_engine import compute_opportunity_match
from app.services.career_action_engine import generate_or_get_action_plan
from app.services.resume_alignment_engine import compute_resume_alignment
from app.services.interview_prep_engine import generate_interview_plan
from app.models.github import SkillEvidence, GithubPullRequest, GithubCommit
from app.models.project import Project, Task
from app.models.opportunity import CareerOpportunity, OpportunityApplication, CareerActionPlan, CareerAction

router = APIRouter(prefix="/career", tags=["Career Readiness & Opportunity Intelligence"])

# --------------------------------------------------------------------------
# E9 CAREER READINESS & SKILL GRAPH ENDPOINTS
# --------------------------------------------------------------------------

@router.get("/readiness")
def get_career_readiness(principal: AuthPrincipal = Depends(require_principal), db: Session = Depends(get_db)):
    """Returns authenticated student's career readiness score, level, and breakdown."""
    return compute_career_readiness(db, principal.user_id)

@router.get("/skills")
def get_career_skills(principal: AuthPrincipal = Depends(require_principal), db: Session = Depends(get_db)):
    """Returns student's required skill matrix with verified evidence counts and freshness."""
    matrix = compute_student_skill_matrix(db, principal.user_id)
    return {
        "target_role": get_target_role_for_user(db, principal.user_id),
        "total_skills": len(matrix),
        "skills": matrix,
    }

@router.get("/skills/{skill_name}")
def get_career_skill_detail(skill_name: str, principal: AuthPrincipal = Depends(require_principal), db: Session = Depends(get_db)):
    """Returns detailed evidence graph for a specific skill."""
    ev_stmt = (
        select(SkillEvidence)
        .where(SkillEvidence.user_id == principal.user_id, SkillEvidence.skill_name.ilike(skill_name))
        .order_by(SkillEvidence.created_at.desc())
    )
    ev_items = db.scalars(ev_stmt).all()

    prs = []
    projects_map = {}
    for ev in ev_items:
        pr = db.get(GithubPullRequest, ev.pull_request_id)
        proj = db.get(Project, ev.project_id)
        if pr:
            prs.append({
                "pr_id": str(pr.id),
                "number": pr.number,
                "title": pr.title,
                "state": pr.state,
                "merged": pr.merged,
                "html_url": pr.html_url,
                "created_at": pr.created_at.isoformat() if pr.created_at else None,
            })
        if proj and str(proj.id) not in projects_map:
            projects_map[str(proj.id)] = {
                "id": str(proj.id),
                "title": proj.title,
                "description": proj.description,
            }

    return {
        "skill_name": skill_name,
        "evidence_count": len(ev_items),
        "freshness": "RECENT" if ev_items and (ev_items[0].created_at.tzinfo is None or True) else "MISSING",
        "verified_prs": prs,
        "linked_projects": list(projects_map.values()),
        "evidence_explanation": ev_items[0].explanation if ev_items else "No verified GitHub PR evidence recorded yet for this skill.",
    }

@router.get("/gaps")
def get_career_gaps(principal: AuthPrincipal = Depends(require_principal), db: Session = Depends(get_db)):
    """Returns student's ranked skill gaps."""
    gaps = compute_skill_gaps(db, principal.user_id)
    return {
        "target_role": get_target_role_for_user(db, principal.user_id),
        "gap_count": len(gaps),
        "gaps": gaps,
    }

@router.get("/evidence-timeline")
def get_career_evidence_timeline(principal: AuthPrincipal = Depends(require_principal), db: Session = Depends(get_db)):
    """Returns chronological timeline of verified merged PR evidence."""
    ev_stmt = (
        select(SkillEvidence)
        .where(SkillEvidence.user_id == principal.user_id)
        .order_by(SkillEvidence.created_at.desc())
        .limit(20)
    )
    ev_items = db.scalars(ev_stmt).all()

    timeline = []
    for ev in ev_items:
        pr = db.get(GithubPullRequest, ev.pull_request_id)
        proj = db.get(Project, ev.project_id)
        task = db.get(Task, ev.task_id) if ev.task_id else None
        timeline.append({
            "id": str(ev.id),
            "skill_name": ev.skill_name,
            "evidence_kind": ev.evidence_kind,
            "explanation": ev.explanation,
            "created_at": ev.created_at.isoformat() if ev.created_at else None,
            "pr_number": pr.number if pr else None,
            "pr_title": pr.title if pr else None,
            "pr_url": pr.html_url if pr else None,
            "project_title": proj.title if proj else None,
            "task_title": task.title if task else None,
        })

    return {
        "total_events": len(timeline),
        "timeline": timeline,
    }

@router.get("/recommendations")
def get_career_recommendations(principal: AuthPrincipal = Depends(require_principal), db: Session = Depends(get_db)):
    """Recommends actionable next tasks connecting E9 skill gaps directly to E8 tasks."""
    gaps = compute_skill_gaps(db, principal.user_id)
    top_gap = gaps[0]["skill_name"] if gaps else None

    task_match = None
    if top_gap:
        task_stmt = (
            select(Task)
            .where(Task.status.in_(["todo", "in_progress"]), Task.required_skills.like(f"%{top_gap}%"))
            .order_by(Task.position.asc())
        )
        task_match = db.scalars(task_stmt).first()

    if not task_match:
        task_stmt = select(Task).where(Task.status.in_(["todo", "in_progress"])).order_by(Task.position.asc())
        task_match = db.scalars(task_stmt).first()

    if task_match:
        project_id = None
        if task_match.milestone:
            project_id = str(task_match.milestone.project_id)

        return {
            "top_skill_gap": top_gap,
            "recommended_action": f"Work on task '{task_match.title}' to prove {top_gap or 'core skill'}.",
            "task_id": str(task_match.id),
            "task_title": task_match.title,
            "project_id": project_id,
            "required_skills": task_match.required_skills or [],
            "reason": f"Skill '{top_gap}' is required for your target role and currently has insufficient verified engineering evidence.",
        }

    return {
        "top_skill_gap": top_gap,
        "recommended_action": "Create a new task in your project workspace matching your target role gaps.",
        "task_id": None,
        "task_title": None,
        "project_id": None,
        "required_skills": [top_gap] if top_gap else [],
        "reason": "No active tasks found in your project workspace. Start a new project or create a task to begin demonstrating evidence.",
    }


# --------------------------------------------------------------------------
# E10 CAREER OPPORTUNITY & ACTION INTELLIGENCE ENDPOINTS
# --------------------------------------------------------------------------

class CreateOpportunitySchema(BaseModel):
    title: str
    company_name: str
    company_url: Optional[str] = None
    location: Optional[str] = "Remote"
    remote_type: Optional[str] = "Remote"
    employment_type: Optional[str] = "Full-time"
    description: Optional[str] = ""
    target_roles: Optional[List[str]] = ["Backend Developer"]
    required_skills: Optional[List[str]] = ["Python", "FastAPI", "PostgreSQL", "Docker"]
    preferred_skills: Optional[List[str]] = ["Redis", "AWS"]
    experience_level: Optional[str] = "Entry-level"
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    application_url: Optional[str] = None

class CreateApplicationSchema(BaseModel):
    opportunity_id: str
    status: Optional[str] = "SAVED"
    notes: Optional[str] = None
    next_action: Optional[str] = None

class UpdateApplicationSchema(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    next_action: Optional[str] = None

@router.get("/opportunities")
def list_career_opportunities(
    query: Optional[str] = None,
    remote_type: Optional[str] = None,
    employment_type: Optional[str] = None,
    principal: AuthPrincipal = Depends(require_principal),
    db: Session = Depends(get_db)
):
    """Lists career opportunities with student-specific match scores."""
    stmt = select(CareerOpportunity).where(CareerOpportunity.status == "ACTIVE").order_by(CareerOpportunity.created_at.desc())
    if remote_type and remote_type != "All":
        stmt = stmt.where(CareerOpportunity.remote_type.ilike(remote_type))
    if employment_type and employment_type != "All":
        stmt = stmt.where(CareerOpportunity.employment_type.ilike(employment_type))

    opps = db.scalars(stmt).all()

    # Seed default sample opportunities if empty
    if not opps:
        seed_opps = [
            CareerOpportunity(
                title="Backend Engineering Intern",
                company_name="CloudScale Systems",
                company_url="https://example.com/cloudscale",
                location="Remote",
                remote_type="Remote",
                employment_type="Internship",
                description="Build scalable FastAPI REST APIs and PostgreSQL database models.",
                target_roles=["Backend Developer", "Full Stack Developer"],
                required_skills=["Python", "FastAPI", "PostgreSQL", "Docker", "Git"],
                preferred_skills=["Redis", "pytest"],
                experience_level="Entry-level",
                salary_min=30.0,
                salary_max=45.0,
                application_url="https://example.com/careers/backend-intern",
            ),
            CareerOpportunity(
                title="Junior Python & API Developer",
                company_name="DataFlow Engineering",
                company_url="https://example.com/dataflow",
                location="Hybrid (San Francisco, CA)",
                remote_type="Hybrid",
                employment_type="Full-time",
                description="Develop backend microservices and database infrastructure.",
                target_roles=["Backend Developer"],
                required_skills=["Python", "FastAPI", "REST APIs", "Git", "Testing"],
                preferred_skills=["Docker", "PostgreSQL"],
                experience_level="Entry-level",
                salary_min=75000.0,
                salary_max=95000.0,
                application_url="https://example.com/careers/jr-python",
            ),
        ]
        db.add_all(seed_opps)
        db.commit()
        opps = db.scalars(stmt).all()

    res = []
    for opp in opps:
        match_info = compute_opportunity_match(db, principal.user_id, opp)
        res.append({
            "id": str(opp.id),
            "title": opp.title,
            "company_name": opp.company_name,
            "company_url": opp.company_url,
            "location": opp.location,
            "remote_type": opp.remote_type,
            "employment_type": opp.employment_type,
            "description": opp.description,
            "target_roles": opp.target_roles,
            "required_skills": opp.required_skills,
            "preferred_skills": opp.preferred_skills,
            "experience_level": opp.experience_level,
            "salary_min": opp.salary_min,
            "salary_max": opp.salary_max,
            "application_url": opp.application_url,
            "match_score": match_info["match_score"],
            "missing_skills": match_info["missing_required_skills"],
            "posted_at": opp.posted_at.isoformat() if opp.posted_at else None,
        })

    # Filter search query if provided
    if query:
        q_lower = query.lower()
        res = [o for o in res if q_lower in o["title"].lower() or q_lower in o["company_name"].lower()]

    return {"total_opportunities": len(res), "opportunities": res}

@router.post("/opportunities")
def create_career_opportunity(schema: CreateOpportunitySchema, principal: AuthPrincipal = Depends(require_principal), db: Session = Depends(get_db)):
    """User-added target opportunity."""
    opp = CareerOpportunity(
        source="user_added",
        title=schema.title,
        company_name=schema.company_name,
        company_url=schema.company_url,
        location=schema.location or "Remote",
        remote_type=schema.remote_type or "Remote",
        employment_type=schema.employment_type or "Full-time",
        description=schema.description or "",
        target_roles=schema.target_roles or ["Backend Developer"],
        required_skills=schema.required_skills or ["Python", "FastAPI"],
        preferred_skills=schema.preferred_skills or [],
        experience_level=schema.experience_level or "Entry-level",
        salary_min=schema.salary_min,
        salary_max=schema.salary_max,
        application_url=schema.application_url,
    )
    db.add(opp)
    db.commit()
    db.refresh(opp)

    match_info = compute_opportunity_match(db, principal.user_id, opp)
    return {
        "id": str(opp.id),
        "title": opp.title,
        "company_name": opp.company_name,
        "match_score": match_info["match_score"],
        "message": "Opportunity added successfully",
    }

@router.get("/opportunities/{opportunity_id}")
def get_career_opportunity_detail(opportunity_id: str, principal: AuthPrincipal = Depends(require_principal), db: Session = Depends(get_db)):
    """Returns opportunity detail and match breakdown."""
    try:
        opp_uuid = uuid.UUID(opportunity_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid opportunity ID format")

    opp = db.get(CareerOpportunity, opp_uuid)
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    match_info = compute_opportunity_match(db, principal.user_id, opp)

    return {
        "id": str(opp.id),
        "title": opp.title,
        "company_name": opp.company_name,
        "company_url": opp.company_url,
        "location": opp.location,
        "remote_type": opp.remote_type,
        "employment_type": opp.employment_type,
        "description": opp.description,
        "target_roles": opp.target_roles,
        "required_skills": opp.required_skills,
        "preferred_skills": opp.preferred_skills,
        "experience_level": opp.experience_level,
        "salary_min": opp.salary_min,
        "salary_max": opp.salary_max,
        "application_url": opp.application_url,
        "match": match_info,
    }

@router.get("/opportunities/{opportunity_id}/match")
def get_opportunity_match(opportunity_id: str, principal: AuthPrincipal = Depends(require_principal), db: Session = Depends(get_db)):
    """Returns detailed match breakdown for an opportunity."""
    try:
        opp_uuid = uuid.UUID(opportunity_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid opportunity ID format")

    opp = db.get(CareerOpportunity, opp_uuid)
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    return compute_opportunity_match(db, principal.user_id, opp)

@router.get("/applications")
def list_user_applications(principal: AuthPrincipal = Depends(require_principal), db: Session = Depends(get_db)):
    """Returns student's opportunity application tracking list."""
    stmt = (
        select(OpportunityApplication)
        .where(OpportunityApplication.user_id == principal.user_id)
        .order_by(OpportunityApplication.updated_at.desc())
    )
    apps = db.scalars(stmt).all()

    res = []
    for a in apps:
        opp = a.opportunity
        match_info = compute_opportunity_match(db, principal.user_id, opp) if opp else None
        res.append({
            "id": str(a.id),
            "opportunity_id": str(a.opportunity_id),
            "title": opp.title if opp else "Opportunity",
            "company_name": opp.company_name if opp else "Company",
            "status": a.status,
            "notes": a.notes,
            "next_action": a.next_action,
            "match_score": match_info["match_score"] if match_info else 0,
            "applied_at": a.applied_at.isoformat() if a.applied_at else None,
            "updated_at": a.updated_at.isoformat() if a.updated_at else None,
        })

    return {"total_applications": len(res), "applications": res}

@router.post("/applications")
def create_user_application(schema: CreateApplicationSchema, principal: AuthPrincipal = Depends(require_principal), db: Session = Depends(get_db)):
    """Creates a new job/internship application tracking entry (Produces 0 skill evidence)."""
    try:
        opp_uuid = uuid.UUID(schema.opportunity_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid opportunity ID format")

    opp = db.get(CareerOpportunity, opp_uuid)
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    app_obj = OpportunityApplication(
        user_id=principal.user_id,
        opportunity_id=opp.id,
        status=schema.status or "SAVED",
        notes=schema.notes,
        next_action=schema.next_action,
    )
    db.add(app_obj)
    db.commit()
    db.refresh(app_obj)

    return {
        "id": str(app_obj.id),
        "opportunity_id": str(app_obj.opportunity_id),
        "status": app_obj.status,
        "message": "Application created successfully",
    }

@router.patch("/applications/{application_id}")
def update_user_application(application_id: str, schema: UpdateApplicationSchema, principal: AuthPrincipal = Depends(require_principal), db: Session = Depends(get_db)):
    """Updates application tracking status (Produces 0 skill evidence)."""
    try:
        app_uuid = uuid.UUID(application_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid application ID format")

    app_obj = db.get(OpportunityApplication, app_uuid)
    if not app_obj or app_obj.user_id != principal.user_id:
        raise HTTPException(status_code=403, detail="Forbidden: You cannot modify this application.")

    if schema.status is not None:
        app_obj.status = schema.status
    if schema.notes is not None:
        app_obj.notes = schema.notes
    if schema.next_action is not None:
        app_obj.next_action = schema.next_action

    db.commit()
    return {"message": "Application updated successfully", "status": app_obj.status}

@router.delete("/applications/{application_id}")
def delete_user_application(application_id: str, principal: AuthPrincipal = Depends(require_principal), db: Session = Depends(get_db)):
    """Deletes an application tracking record."""
    try:
        app_uuid = uuid.UUID(application_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid application ID format")

    app_obj = db.get(OpportunityApplication, app_uuid)
    if not app_obj or app_obj.user_id != principal.user_id:
        raise HTTPException(status_code=403, detail="Forbidden: You cannot delete this application.")

    db.delete(app_obj)
    db.commit()
    return {"message": "Application deleted successfully"}

@router.get("/action-plan")
def get_career_action_plan(principal: AuthPrincipal = Depends(require_principal), db: Session = Depends(get_db)):
    """Returns student's active Career Action Plan linking skill gaps to E8 tasks."""
    return generate_or_get_action_plan(db, principal.user_id)

@router.get("/resume-alignment")
def get_resume_alignment(principal: AuthPrincipal = Depends(require_principal), db: Session = Depends(get_db)):
    """Categorizes resume/target role claims into verified vs unsupported skills."""
    return compute_resume_alignment(db, principal.user_id)

@router.get("/interview/plan")
def get_interview_plan(principal: AuthPrincipal = Depends(require_principal), db: Session = Depends(get_db)):
    """Returns targeted interview prep topics and questions (Produces 0 skill evidence)."""
    return generate_interview_plan(db, principal.user_id)
