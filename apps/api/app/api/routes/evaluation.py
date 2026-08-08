"""
FastAPI Router for Reproducible AI Project Evaluation
"""

import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.evaluation import ProjectEvaluationResponse
from app.services.evaluation_engine import evaluate_project_completion

router = APIRouter(prefix="/evaluation", tags=["AI Project Evaluation"])


@router.post("/projects/{project_id}", response_model=ProjectEvaluationResponse, summary="Evaluate Completed Project")
def trigger_project_evaluation(project_id: uuid.UUID, db: Session = Depends(get_db)) -> ProjectEvaluationResponse:
    """
    Evaluates project completion across 10 dimensions and generates career readiness assets.
    Stores evaluation version and AI model used for 100% reproducibility.
    """
    return evaluate_project_completion(db, project_id)


@router.get("/projects/{project_id}", response_model=ProjectEvaluationResponse, summary="Fetch Project Evaluation")
def get_project_evaluation(project_id: uuid.UUID, db: Session = Depends(get_db)) -> ProjectEvaluationResponse:
    """
    Fetches reproducible project evaluation audit results.
    """
    return evaluate_project_completion(db, project_id)
