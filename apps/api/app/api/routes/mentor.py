"""
FastAPI Router for Proactive AI Mentor 2.0
"""

import uuid
from typing import Sequence
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.mentor import MentorObservationResponse, DailyGoalCreate, DailyGoalResponse
from app.services.ai_mentor_service import generate_proactive_observations

router = APIRouter(prefix="/mentor", tags=["AI Mentor 2.0"])


@router.get("/observations", response_model=list[MentorObservationResponse], summary="Fetch Proactive Mentor Feed")
def get_mentor_observations(db: Session = Depends(get_db)) -> Sequence[MentorObservationResponse]:
    """
    Returns proactive mentor observations and guidance feed for the current user.
    """
    # Demo/Fallback user ID if auth context not present
    demo_user_id = uuid.UUID("00000000-0000-0000-0000-000000000001")
    return generate_proactive_observations(db, demo_user_id)


@router.post("/daily-goals", response_model=DailyGoalResponse, summary="Create Daily Goal")
def create_daily_goal(payload: DailyGoalCreate, db: Session = Depends(get_db)) -> DailyGoalResponse:
    """
    Creates a new daily coding goal recommendation.
    """
    return DailyGoalResponse(
        id=uuid.uuid4(),
        title=payload.title,
        status="pending",
        target_minutes=payload.target_minutes,
        created_at=payload.target_minutes
    )
