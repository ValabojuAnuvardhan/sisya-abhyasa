from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import Skill
from app.schemas.me import SkillRead
router=APIRouter(tags=["skills"])
@router.get("/skills",response_model=list[SkillRead])
def list_skills(db:Session=Depends(get_db)):
    return list(db.scalars(select(Skill).order_by(Skill.name)).all())
