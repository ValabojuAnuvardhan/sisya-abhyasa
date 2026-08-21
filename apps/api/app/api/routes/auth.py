from datetime import datetime, timedelta, timezone
import base64, hashlib, hmac, os, re, secrets, uuid
from fastapi import APIRouter, Depends, HTTPException, Response, status, Cookie
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.core.config import settings
from app.db.session import get_db
from app.models.user import User, StudentProfile, AuthCredential, AuthSession

router = APIRouter(prefix='/auth', tags=['authentication'])

def _now(): return datetime.now(timezone.utc)
def _token_hash(v: str): return hashlib.sha256(v.encode()).hexdigest()
def _password_hash(password: str) -> str:
    salt = os.urandom(16); n = 2**14; r = 8; p = 1
    digest = hashlib.scrypt(password.encode(), salt=salt, n=n, r=r, p=p, dklen=32)
    return f'scrypt${n}${r}${p}${base64.urlsafe_b64encode(salt).decode()}${base64.urlsafe_b64encode(digest).decode()}'
def _verify(password: str, encoded: str) -> bool:
    try:
        _, ns, rs, ps, salt64, digest64 = encoded.split('$'); salt = base64.urlsafe_b64decode(salt64); expected = base64.urlsafe_b64decode(digest64)
        actual = hashlib.scrypt(password.encode(), salt=salt, n=int(ns), r=int(rs), p=int(ps), dklen=len(expected)); return hmac.compare_digest(actual, expected)
    except Exception: return False

def _set_session(response: Response, db: Session, user: User) -> str:
    raw = secrets.token_urlsafe(48); expires = _now() + timedelta(days=settings.session_days)
    db.add(AuthSession(user_id=user.id, token_hash=_token_hash(raw), expires_at=expires)); db.commit()
    response.set_cookie(settings.session_cookie_name, raw, httponly=True, secure=settings.environment == 'production', samesite='lax', max_age=settings.session_days * 86400, path='/')
    return raw

def _extract_github_username(github_url: str | None) -> str | None:
    if not github_url: return None
    match = re.search(r"github\.com/([^/#?]+)", github_url, re.IGNORECASE)
    return match.group(1).strip() if match else None

class RegisterPayload(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    full_name: str | None = None
    github_url: str | None = None

class Signup(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    full_name: str | None = None
    github_url: str | None = None

class Login(BaseModel):
    email: EmailStr
    password: str

class Verify(BaseModel):
    token: str

@router.post('/register', status_code=201)
@router.post('/signup', status_code=201)
def register(payload: RegisterPayload, response: Response, db: Session = Depends(get_db)):
    email = payload.email.strip().lower()
    if db.scalar(select(User).where(User.email == email)):
        raise HTTPException(status_code=400, detail='Account already exists with this email')
    
    full_name = payload.full_name.strip() if payload.full_name else email.split('@')[0]
    github_username = _extract_github_username(payload.github_url)
    
    profile = StudentProfile(github_username=github_username)
    user = User(
        auth_subject=f'account:{uuid.uuid4()}',
        email=email,
        full_name=full_name,
        profile=profile
    )
    
    raw_token = secrets.token_urlsafe(32)
    now = _now()
    cred = AuthCredential(
        user_id=user.id,
        password_hash=_password_hash(payload.password),
        email_verified_at=now,
        verification_token_hash=None,
        verification_expires_at=None
    )
    
    db.add(user)
    db.flush()
    cred.user_id = user.id
    db.add(cred)
    db.commit()
    
    token = _set_session(response, db, user)
    return {
        'authenticated': True,
        'token': token,
        'access_token': token,
        'token_type': 'bearer',
        'user_id': str(user.id),
        'message': 'Account created successfully'
    }

def _as_utc(dt: datetime | None) -> datetime | None:
    if dt is None: return None
    return dt if dt.tzinfo is not None else dt.replace(tzinfo=timezone.utc)

@router.post('/verify-email')
def verify_email(payload: Verify, db: Session = Depends(get_db)):
    cred = db.scalar(select(AuthCredential).where(AuthCredential.verification_token_hash == _token_hash(payload.token)))
    exp = _as_utc(cred.verification_expires_at) if cred else None
    if not cred or not exp or exp < _now(): raise HTTPException(400, 'Verification link is invalid or expired')
    cred.email_verified_at = _now(); cred.verification_token_hash = None; cred.verification_expires_at = None; db.commit(); return {'verified': True}

@router.post('/login')
def login(payload: Login, response: Response, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.email == payload.email.strip().lower()))
    cred = db.get(AuthCredential, user.id) if user else None
    now = _now()
    locked = _as_utc(cred.locked_until) if cred else None
    if cred and locked and locked > now: raise HTTPException(429, 'Too many failed attempts. Try again later.')
    if not user or not cred or not _verify(payload.password, cred.password_hash):
        if cred:
            cred.failed_login_count += 1
            if cred.failed_login_count >= 5: cred.locked_until = now + timedelta(minutes=15); cred.failed_login_count = 0
            db.commit()
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, 'Invalid email or password')
    if not cred.email_verified_at: cred.email_verified_at = now
    cred.failed_login_count = 0; cred.locked_until = None; db.commit(); token = _set_session(response, db, user)
    return {'authenticated': True, 'token': token, 'access_token': token, 'token_type': 'bearer', 'user_id': str(user.id)}

@router.post('/logout')
def logout(response: Response, db: Session = Depends(get_db), sisya_session: str | None = Cookie(default=None, alias=settings.session_cookie_name)):
    if sisya_session:
        session = db.scalar(select(AuthSession).where(AuthSession.token_hash == _token_hash(sisya_session)))
        if session: db.delete(session); db.commit()
    response.delete_cookie(settings.session_cookie_name, path='/'); return {'authenticated': False}

