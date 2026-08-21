from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload
from app.core.auth import AuthPrincipal, require_principal
from app.db.session import get_db
from app.models.user import User, StudentProfile, Skill
from app.schemas.me import MeRead, ProfileUpdate, SkillRead

router = APIRouter(tags=["student-profile"])

def _get_or_create_user(db: Session, principal: AuthPrincipal) -> User:
    user = db.scalar(select(User).where(User.auth_subject == principal.subject))
    if user is None:
        user = User(auth_subject=principal.subject, email=principal.email, profile=StudentProfile())
        db.add(user); db.commit(); db.refresh(user)
    return user

def _load_user(db: Session, user_id):
    return db.scalar(select(User).where(User.id == user_id).options(selectinload(User.profile), selectinload(User.skills)))

def _read(user: User) -> MeRead:
    p = user.profile or StudentProfile()
    return MeRead(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        headline=getattr(p, "headline", None),
        bio=getattr(p, "bio", None),
        location=getattr(p, "location", None),
        avatar_url=getattr(p, "avatar_url", None),
        education_year=p.education_year,
        target_role=p.target_role,
        experience_level=p.experience_level,
        interests=p.interests,
        github_username=getattr(p, "github_username", None),
        profile_public=p.profile_public,
        onboarding_completed=p.onboarding_completed,
        skills=[SkillRead.model_validate(s) for s in user.skills]
    )

@router.get("/me", response_model=MeRead)
def get_me(principal: AuthPrincipal=Depends(require_principal), db: Session=Depends(get_db)):
    user=_get_or_create_user(db,principal); return _read(_load_user(db,user.id))

@router.patch("/me", response_model=MeRead)
def patch_me(payload: ProfileUpdate, principal: AuthPrincipal=Depends(require_principal), db: Session=Depends(get_db)):
    user=_get_or_create_user(db,principal); user=_load_user(db,user.id)
    if payload.full_name is not None: user.full_name=payload.full_name.strip() or None
    p=user.profile
    if p is None:
        p = StudentProfile(user_id=user.id)
        db.add(p)
        user.profile = p
    for field in ("headline", "bio", "location", "avatar_url", "education_year", "target_role", "experience_level", "interests", "github_username"):
        value=getattr(payload,field)
        if value is not None: setattr(p,field,value.strip() or None)
    if payload.profile_public is not None:
        p.profile_public = payload.profile_public
    if payload.onboarding_completed is not None:
        p.onboarding_completed = payload.onboarding_completed
    if payload.skill_slugs is not None:
        slugs=sorted(set(x.strip().lower() for x in payload.skill_slugs if x.strip()))
        if slugs:
            user.skills=list(db.scalars(select(Skill).where(Skill.slug.in_(slugs))).all())
        else:
            user.skills=[]
    db.commit(); return _read(_load_user(db,user.id))
