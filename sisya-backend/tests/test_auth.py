import pytest
from fastapi.testclient import TestClient

from app.database import Base, engine, get_db, SessionLocal
from app.main import app
from app.models import User, Profile
from app.api.auth import extract_github_username
from app.core.security import hash_password, verify_password, create_access_token

# Ensure database tables exist in PostgreSQL
Base.metadata.create_all(bind=engine)

client = TestClient(app)


def test_extract_github_username():
    assert extract_github_username("https://github.com/student1") == "student1"
    assert extract_github_username("https://github.com/student2/") == "student2"
    assert extract_github_username("http://github.com/student3?tab=repositories") == "student3"
    assert extract_github_username("invalid_url") is None


def test_security_helpers():
    pwd = "StrongPassword123!"
    hashed = hash_password(pwd)
    assert hashed != pwd
    assert verify_password(pwd, hashed) is True
    assert verify_password("WrongPassword", hashed) is False

    token = create_access_token("test-uuid-1234")
    assert isinstance(token, str)
    assert len(token) > 20


def test_register_and_login_flow():
    db = SessionLocal()
    test_email = "test_user_sprint1@example.com"
    
    # Clean up existing test user if present
    existing = db.query(User).filter(User.email == test_email).first()
    if existing:
        db.query(Profile).filter(Profile.user_id == existing.id).delete()
        db.query(User).filter(User.id == existing.id).delete()
        db.commit()
    db.close()

    register_payload = {
        "email": test_email,
        "password": "StrongPassword123!",
        "github_url": "https://github.com/teststudent"
    }

    # 1. Register successfully
    resp = client.post("/auth/register", json=register_payload)
    assert resp.status_code == 200, f"Register failed: {resp.text}"
    data = resp.json()
    assert "token" in data
    assert "user_id" in data
    user_id = data["user_id"]

    # 2. Duplicate registration fails with 400
    resp_dup = client.post("/auth/register", json=register_payload)
    assert resp_dup.status_code == 400
    assert resp_dup.json()["detail"] == "Email already registered"

    # 3. Login successfully
    login_payload = {
        "email": test_email,
        "password": "StrongPassword123!"
    }
    resp_login = client.post("/auth/login", json=login_payload)
    assert resp_login.status_code == 200
    login_data = resp_login.json()
    assert "token" in login_data
    assert login_data["user_id"] == user_id

    # 4. Login with invalid password fails with 401
    invalid_login_payload = {
        "email": test_email,
        "password": "WrongPassword"
    }
    resp_invalid = client.post("/auth/login", json=invalid_login_payload)
    assert resp_invalid.status_code == 401
    assert resp_invalid.json()["detail"] == "Invalid credentials"
