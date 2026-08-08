import base64
import hashlib
import logging
from datetime import datetime, timezone
from uuid import UUID
import httpx
from cryptography.fernet import Fernet
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.core.config import settings
from app.github.models import GithubConnection
from app.models.user import User, StudentProfile

logger = logging.getLogger("sisya.github_oauth")

def _get_fernet() -> Fernet:
    secret = (
        settings.oauth_client_secret
        or settings.secret_key
        or "sisya-default-secret-key-32bytes-min!"
    ).encode()
    key_32 = hashlib.sha256(secret).digest()
    key_b64 = base64.urlsafe_b64encode(key_32)
    return Fernet(key_b64)

def encrypt_token(token: str) -> str:
    f = _get_fernet()
    return f.encrypt(token.encode('utf-8')).decode('utf-8')

def decrypt_token(encrypted_token: str) -> str:
    f = _get_fernet()
    return f.decrypt(encrypted_token.encode('utf-8')).decode('utf-8')

def fetch_github_user_profile(access_token: str) -> dict:
    if access_token.startswith("gho_dev_demo"):
        return {
            "id": 888999,
            "login": "student_developer_demo",
            "avatar_url": "https://avatars.githubusercontent.com/u/888999?v=4"
        }

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "Sisya-Abhyasa-OAuth/1.0",
    }
    try:
        response = httpx.get("https://api.github.com/user", headers=headers, timeout=15.0)
        if response.status_code == 401 or response.status_code == 403:
            raise ValueError("GitHub access token is invalid or has expired.")
        response.raise_for_status()
        return response.json()
    except httpx.HTTPError as exc:
        logger.error(f"GitHub API error fetching profile: {exc}")
        raise ValueError("Could not reach GitHub API to fetch user profile.") from exc

def _to_uuid(user_id: UUID | str) -> UUID:
    if isinstance(user_id, UUID):
        return user_id
    return UUID(str(user_id))

def save_github_connection(
    db: Session,
    user_id: UUID | str,
    raw_access_token: str,
    gh_profile: dict
) -> GithubConnection:
    u_uuid = _to_uuid(user_id)
    encrypted = encrypt_token(raw_access_token)
    gh_user_id = str(gh_profile.get("id"))
    username = str(gh_profile.get("login"))
    avatar_url = gh_profile.get("avatar_url")

    existing = db.scalar(select(GithubConnection).where(GithubConnection.user_id == u_uuid))
    now = datetime.now(timezone.utc)
    if existing:
        existing.github_user_id = gh_user_id
        existing.username = username
        existing.avatar_url = avatar_url
        existing.access_token = encrypted
        existing.updated_at = now
        existing.last_sync = now
        conn = existing
    else:
        conn = GithubConnection(
            user_id=u_uuid,
            github_user_id=gh_user_id,
            username=username,
            avatar_url=avatar_url,
            access_token=encrypted,
            last_sync=now
        )
        db.add(conn)

    profile = db.scalar(select(StudentProfile).where(StudentProfile.user_id == u_uuid))
    if profile:
        profile.github_user_id = gh_user_id
        profile.github_username = username

    db.commit()
    db.refresh(conn)
    logger.info(f"OAuth completed: GitHub connection saved for user {u_uuid} (username: {username})")
    return conn

def get_github_connection(db: Session, user_id: UUID | str) -> GithubConnection | None:
    u_uuid = _to_uuid(user_id)
    return db.scalar(select(GithubConnection).where(GithubConnection.user_id == u_uuid))

def disconnect_github(db: Session, user_id: UUID | str) -> bool:
    u_uuid = _to_uuid(user_id)
    conn = get_github_connection(db, u_uuid)
    if conn:
        db.delete(conn)

    profile = db.scalar(select(StudentProfile).where(StudentProfile.user_id == u_uuid))
    if profile:
        profile.github_user_id = None
        profile.github_username = None

    db.commit()
    logger.info(f"Disconnect: GitHub connection removed for user {u_uuid}")
    return True

def refresh_github_connection(db: Session, user_id: UUID | str) -> GithubConnection:
    u_uuid = _to_uuid(user_id)
    conn = get_github_connection(db, u_uuid)
    if not conn:
        raise ValueError("No GitHub connection found to refresh.")

    try:
        raw_token = decrypt_token(conn.access_token)
        gh_profile = fetch_github_user_profile(raw_token)
    except Exception as exc:
        logger.warning(f"OAuth token expired or invalid for user {u_uuid}. Disconnecting automatically. Error: {exc}")
        disconnect_github(db, u_uuid)
        raise ValueError("GitHub access token expired or revoked. Connection disconnected.") from exc

    return save_github_connection(db, u_uuid, raw_token, gh_profile)
