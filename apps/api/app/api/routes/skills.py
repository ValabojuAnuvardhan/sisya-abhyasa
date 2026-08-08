import uuid
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import Skill
from app.schemas.me import SkillRead
from app.schemas.skills_v2 import SkillGraphResponse, SkillProficiencyItem
from app.services.skill_engine import infer_user_skill_graph

router = APIRouter(tags=["skills"])


@router.get("/skills", response_model=list[SkillRead])
def list_skills(db: Session = Depends(get_db)):
    return list(db.scalars(select(Skill).order_by(Skill.name)).all())


@router.get("/skills/graph", response_model=SkillGraphResponse, summary="Fetch Dynamic Skill Graph")
def get_skill_graph(user_id: uuid.UUID | None = None, db: Session = Depends(get_db)) -> SkillGraphResponse:
    """
    Returns dynamically inferred proficiency scores for a student.
    """
    target_user_id = user_id or uuid.UUID("00000000-0000-0000-0000-000000000001")
    proficiencies = infer_user_skill_graph(db, target_user_id)
    
    items = [
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
    
    return SkillGraphResponse(
        user_id=target_user_id,
        total_skills=len(items),
        proficiencies=items
    )
