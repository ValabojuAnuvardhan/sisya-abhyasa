import re
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, Profile
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse
from app.core.security import hash_password, verify_password, create_access_token

router = APIRouter()


def extract_github_username(github_url: str) -> str | None:
    if not github_url:
        return None
    match = re.search(r"github\.com/([^/#?]+)", github_url, re.IGNORECASE)
    if match:
        username = match.group(1).strip()
        return username if username else None
    return None


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_200_OK)
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    github_username = extract_github_username(request.github_url)
    password_hash = hash_password(request.password)

    user = User(email=request.email, password_hash=password_hash)
    db.add(user)
    db.commit()
    db.refresh(user)

    profile = Profile(
        user_id=user.id,
        github_username=github_username,
        completion_pct=0
    )
    db.add(profile)
    db.commit()

    token = create_access_token(str(user.id))
    return TokenResponse(token=token, user_id=str(user.id))


@router.post("/login", response_model=TokenResponse, status_code=status.HTTP_200_OK)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    if not user or not verify_password(request.password, user.password_hash) or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    token = create_access_token(str(user.id))
    return TokenResponse(token=token, user_id=str(user.id))
