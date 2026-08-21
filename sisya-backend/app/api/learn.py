from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.api.deps import get_optional_current_user
from app.models import User, Profile, SkillEvidence, Project
from app.schemas.learn import (
    SisyachatRequest,
    SisyachatResponse,
    LearningDashboardResponse,
    SkillGapItem
)
from app.ai.sisya_chat import generate_sisya_chat_response

router = APIRouter(prefix="/learn", tags=["learn"])


@router.get("/dashboard", response_model=LearningDashboardResponse)
def get_learning_dashboard(
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
) -> LearningDashboardResponse:
    if current_user:
        profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
        target_role = profile.target_role if (profile and profile.target_role) else "Software Developer"
        evidences = db.query(SkillEvidence).filter(SkillEvidence.student_id == current_user.id).all()
        strong_skills = list(set([ev.skill for ev in evidences]))
        user_projects = db.query(Project).filter(Project.owner_id == current_user.id).all()
        project_count = len(user_projects)
        readiness_pct = min(100, project_count * 25 + len(strong_skills) * 15)
    else:
        target_role = "Backend Developer"
        strong_skills = []
        project_count = 0
        readiness_pct = 0

    return LearningDashboardResponse(
        target_role=target_role,
        skill_readiness_percentage=readiness_pct,
        strong_skills=strong_skills,
        skill_gaps=[],
        continue_learning=[],
        recommended_resources=[],
        explore_topics=[
            {"id": "exp-1", "name": "GraphQL APIs", "category": "API Paradigms"},
            {"id": "exp-2", "name": "gRPC Microservices", "category": "Networking"},
            {"id": "exp-3", "name": "Kubernetes Orchestration", "category": "DevOps"}
        ],
        next_action=f"Build projects for target role: {target_role}" if project_count == 0 else "Continue project milestones"
    )


@router.post("/chat", response_model=SisyachatResponse)
def sisyachat_endpoint(
    payload: SisyachatRequest,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
) -> SisyachatResponse:
    if not payload.message.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Message cannot be empty.")

    active_target_role = payload.target_role
    if current_user:
        profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
        if profile and profile.target_role:
            active_target_role = profile.target_role

    result = generate_sisya_chat_response(
        user_message=payload.message,
        target_role=active_target_role,
        skill_gaps=payload.skill_gaps,
        learning_stage=payload.learning_stage,
        chat_history=payload.chat_history
    )

    return SisyachatResponse(**result)
