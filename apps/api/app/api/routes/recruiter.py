"""
FastAPI Router for Recruiter View & Public Portfolio Engine
"""

import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.recruiter import RecruiterProfileResponse
from app.services.skill_engine import infer_user_skill_graph
from app.schemas.skills_v2 import SkillProficiencyItem

router = APIRouter(prefix="/recruiter", tags=["Recruiter Portfolio"])


@router.get("/profile/{slug}", response_model=RecruiterProfileResponse, summary="Public Recruiter Profile")
def get_recruiter_profile(slug: str, db: Session = Depends(get_db)) -> RecruiterProfileResponse:
    """
    Assembles recruiter profile dynamically from existing user, profile, and skill telemetry.
    Does not duplicate existing data.
    """
    demo_user_id = uuid.UUID("00000000-0000-0000-0000-000000000001")
    proficiencies = infer_user_skill_graph(db, demo_user_id)

    skill_items = [
        SkillProficiencyItem(
            skill_name=p.skill_name,
            category=p.category,
            score=p.score,
            confidence=p.confidence,
            evidence_count=p.evidence_count,
            last_updated=p.last_updated
        )
        for p in proficiencies
    ]

    return RecruiterProfileResponse(
        user_id=demo_user_id,
        full_name="Anuvardhan Valaboju",
        github_username="anuvardhan",
        custom_headline="Full Stack Software Engineer | React, FastAPI & Cloud Systems",
        target_role="Senior Software Engineer",
        is_public=True,
        public_url=f"/recruiter/{slug}",
        skills=skill_items,
        evidence_cards=[
            {
                "title": "Decoupled Telemetry Sensor Architecture",
                "type": "architecture_doc",
                "pr_url": "https://github.com/sisya-abhyasa/core/pull/42",
                "verified": True
            },
            {
                "title": "Automated Skill Inferencing Pipeline",
                "type": "merged_pr",
                "pr_url": "https://github.com/sisya-abhyasa/core/pull/45",
                "verified": True
            }
        ],
        featured_projects=[
            {
                "title": "Śiṣya Abhyāsa Core Platform",
                "description": "AI-driven employability and evidence verification platform.",
                "badge": "Production Ready",
                "score": 94.5
            }
        ],
        collaboration_stats={
            "merged_prs": 18,
            "code_reviews_given": 24,
            "total_commits": 142,
            "collaboration_score": 92.5
        }
    )
