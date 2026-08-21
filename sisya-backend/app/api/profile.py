from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, Profile
from app.schemas.profile import ProfileUpdate, ProfileResponse
from app.api.deps import get_current_user

router = APIRouter()


def calculate_completion_pct(profile: Profile) -> int:
    score = 0
    if profile.github_username and profile.github_username.strip():
        score += 20
    if profile.education_year is not None:
        score += 20
    if profile.skills and len(profile.skills) > 0:
        score += 20
    if profile.interests and len(profile.interests) > 0:
        score += 20
    if profile.target_role and profile.target_role.strip():
        score += 20
    return min(100, score)


@router.put("/me", response_model=ProfileResponse, status_code=status.HTTP_200_OK)
@router.put("/me/", response_model=ProfileResponse, status_code=status.HTTP_200_OK, include_in_schema=False)
def update_profile(
    payload: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    update_data = payload.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        if value is not None:
            setattr(profile, field, value)

    profile.completion_pct = calculate_completion_pct(profile)
    db.commit()
    db.refresh(profile)

    return profile


@router.get("/me", response_model=ProfileResponse, status_code=status.HTTP_200_OK)
@router.get("/me/", response_model=ProfileResponse, status_code=status.HTTP_200_OK, include_in_schema=False)
def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = Profile(user_id=current_user.id, completion_pct=0)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    else:
        profile.completion_pct = calculate_completion_pct(profile)
        db.commit()
        db.refresh(profile)

    return profile
