import time
import hashlib
from datetime import datetime, timedelta, timezone
import pytest
from uuid import uuid4
from fastapi.testclient import TestClient
from sqlalchemy import select
from app.main import app
from app.db.session import SessionLocal
from app.models.user import User, StudentProfile, AuthSession
from app.github.models import GithubConnection
from app.github.oauth import generate_oauth_state, verify_oauth_state, get_authorization_url
from app.github.service import encrypt_token, decrypt_token, save_github_connection, disconnect_github

client = TestClient(app)

@pytest.fixture
def db_session():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()

def _create_user_and_session(db_session):
    user_id = uuid4()
    auth_sub = f"test_sub_{user_id}"
    user = User(id=user_id, auth_subject=auth_sub, email=f"{user_id}@example.com", full_name="OAuth Student")
    db_session.add(user)
    profile = StudentProfile(user_id=user.id)
    db_session.add(profile)

    token_raw = f"test-token-{user_id}"
    token_hash = hashlib.sha256(token_raw.encode()).hexdigest()
    sess = AuthSession(
        id=uuid4(),
        user_id=user.id,
        token_hash=token_hash,
        expires_at=datetime.now(timezone.utc) + timedelta(days=1)
    )
    db_session.add(sess)
    db_session.commit()
    db_session.refresh(user)
    return user, token_raw

def test_token_encryption_and_decryption():
    raw_token = "gho_1234567890abcdefghijklmnopqrstuvwxyz"
    encrypted = encrypt_token(raw_token)
    assert encrypted != raw_token
    decrypted = decrypt_token(encrypted)
    assert decrypted == raw_token

def test_oauth_state_signature_and_expiration():
    user_id = str(uuid4())
    state = generate_oauth_state(user_id)
    assert state is not None

    # Verification passes
    verified_user_id = verify_oauth_state(state)
    assert verified_user_id == user_id

    # Invalid state fails
    with pytest.raises(ValueError):
        verify_oauth_state("invalid_state_string_xyz")

    # Expired state fails
    with pytest.raises(ValueError):
        verify_oauth_state(state, max_age_seconds=-1)

def test_github_status_disconnected_and_connect(db_session):
    user, token_raw = _create_user_and_session(db_session)

    # 1. Connect endpoint returns authorization URL or 503 if client_id not set
    res_conn = client.post(
        "/api/v1/github/connect",
        headers={"Authorization": f"Bearer {token_raw}"}
    )
    assert res_conn.status_code in (200, 503)
    if res_conn.status_code == 200:
        data = res_conn.json()
        assert "authorization_url" in data
        assert "github.com" in data["authorization_url"] or "dev_demo_oauth_code" in data["authorization_url"]

def test_save_and_disconnect_github_connection(db_session):
    user, token_raw = _create_user_and_session(db_session)

    # Save connection
    gh_id = str(int(time.time() * 1000))
    gh_profile = {
        "id": gh_id,
        "login": f"octocat_{gh_id}",
        "avatar_url": "https://github.com/images/error/octocat_happy.gif"
    }
    conn = save_github_connection(db_session, user.id, "gho_test_token_secret_123", gh_profile)
    assert conn is not None
    assert conn.username == f"octocat_{gh_id}"
    assert conn.github_user_id == gh_id

    # Confirm decrypted token matches
    raw_decrypted = decrypt_token(conn.access_token)
    assert raw_decrypted == "gho_test_token_secret_123"

    # Confirm student profile sync
    profile = db_session.scalar(select(StudentProfile).where(StudentProfile.user_id == user.id))
    assert profile.github_username == f"octocat_{gh_id}"
    assert profile.github_user_id == gh_id

    # Status endpoint when connected
    res_status = client.get(
        "/api/v1/github/status",
        headers={"Authorization": f"Bearer {token_raw}"}
    )
    assert res_status.status_code == 200
    st_data = res_status.json()
    assert st_data["connected"] is True
    assert st_data["username"] == f"octocat_{gh_id}"
    assert st_data["avatar"] == "https://github.com/images/error/octocat_happy.gif"

    # Disconnect
    dc_res = disconnect_github(db_session, user.id)
    assert dc_res is True

    # Check connection deleted
    conn_after = db_session.scalar(select(GithubConnection).where(GithubConnection.user_id == user.id))
    assert conn_after is None

    # Check profile cleared
    db_session.refresh(profile)
    assert profile.github_username is None

    # Status endpoint after disconnect
    res_status_after = client.get(
        "/api/v1/github/status",
        headers={"Authorization": f"Bearer {token_raw}"}
    )
    assert res_status_after.status_code == 200
    assert res_status_after.json()["connected"] is False
