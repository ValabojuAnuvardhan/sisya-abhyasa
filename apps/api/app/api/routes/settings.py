from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.auth import require_principal, AuthPrincipal
from app.db.session import get_db
from app.models.user import User, StudentProfile
from app.github.models import GithubConnection

router = APIRouter(prefix="/settings", tags=["User Settings"])

class UpdateSettingsSchema(BaseModel):
    full_name: Optional[str] = None
    headline: Optional[str] = None
    bio: Optional[str] = None
    target_role: Optional[str] = None
    experience_level: Optional[str] = None
    education_year: Optional[str] = None
    location: Optional[str] = None
    profile_public: Optional[bool] = None
    notify_in_app: Optional[bool] = True
    notify_email: Optional[bool] = True

@router.get("/me")
def get_user_settings(principal: AuthPrincipal = Depends(require_principal), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == principal.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    profile = db.query(StudentProfile).filter(StudentProfile.user_id == principal.user_id).first()
    gh_conn = db.query(GithubConnection).filter(GithubConnection.user_id == principal.user_id).first()

    return {
        "id": str(user.id),
        "email": user.email,
        "full_name": user.full_name,
        "headline": profile.headline if profile else "",
        "bio": profile.bio if profile else "",
        "target_role": profile.target_role if profile else "",
        "experience_level": profile.experience_level if profile else "intermediate",
        "education_year": profile.education_year if profile else "3rd year",
        "location": profile.location if profile else "",
        "profile_public": profile.profile_public if profile else False,
        "github_connected": bool(gh_conn and gh_conn.access_token),
        "github_username": gh_conn.github_username if gh_conn else None,
        "notifications": {
            "in_app": True,
            "email": True,
            "task_due_reminders": True,
            "pr_merge_alerts": True
        }
    }

@router.patch("/me")
def update_user_settings(schema: UpdateSettingsSchema, principal: AuthPrincipal = Depends(require_principal), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == principal.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if schema.full_name is not None:
        user.full_name = schema.full_name

    profile = db.query(StudentProfile).filter(StudentProfile.user_id == principal.user_id).first()
    if not profile:
        profile = StudentProfile(user_id=principal.user_id)
        db.add(profile)

    if schema.headline is not None: profile.headline = schema.headline
    if schema.bio is not None: profile.bio = schema.bio
    if schema.target_role is not None: profile.target_role = schema.target_role
    if schema.experience_level is not None: profile.experience_level = schema.experience_level
    if schema.education_year is not None: profile.education_year = schema.education_year
    if schema.location is not None: profile.location = schema.location
    if schema.profile_public is not None: profile.profile_public = schema.profile_public

    db.commit()
    return {"message": "Settings updated successfully"}
