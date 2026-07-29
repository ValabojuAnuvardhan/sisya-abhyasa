from dataclasses import dataclass
from datetime import datetime, timezone
import hashlib
from fastapi import Cookie, Header, HTTPException, status, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.core.config import settings
from app.db.session import get_db
from app.models.user import User, AuthSession

@dataclass(frozen=True)
class AuthPrincipal:
    subject: str
    email: str | None = None
    user_id: object | None = None

def _hash_token(token:str)->str: return hashlib.sha256(token.encode()).hexdigest()

async def require_principal(
    authorization: str | None = Header(default=None),
    x_dev_auth_subject: str | None = Header(default=None),
    x_dev_auth_email: str | None = Header(default=None),
    sisya_session: str | None = Cookie(default=None, alias=settings.session_cookie_name),
    db: Session = Depends(get_db),
) -> AuthPrincipal:
    # Real session auth takes precedence in every environment.
    if sisya_session:
        session=db.scalar(select(AuthSession).where(AuthSession.token_hash==_hash_token(sisya_session)))
        now=datetime.now(timezone.utc)
        exp = session.expires_at.replace(tzinfo=timezone.utc) if session and session.expires_at and session.expires_at.tzinfo is None else (session.expires_at if session else None)
        if session and exp and exp > now:
            user=db.get(User,session.user_id)
            if user and user.is_active:
                session.last_seen_at=now; db.commit()
                return AuthPrincipal(subject=user.auth_subject,email=user.email,user_id=user.id)
    # Explicit dev adapter is available only when BOTH flags allow it.
    if settings.environment == "development" and settings.allow_dev_auth and x_dev_auth_subject:
        return AuthPrincipal(subject=x_dev_auth_subject,email=x_dev_auth_email)
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
