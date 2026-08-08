import uuid
import random
import hashlib
from datetime import datetime, timedelta, timezone
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.db.session import SessionLocal
from app.models.user import User, StudentProfile, AuthSession
from app.models.project import Project
from app.github.service import save_github_connection

client = TestClient(app)

@pytest.fixture
def db_session():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()

def _create_user_session_and_project(db_session: Session):
    u_id = uuid.uuid4()
    p_id = uuid.uuid4()

    user = User(
        id=u_id,
        auth_subject=f"auth0|repo_test_{u_id.hex[:8]}",
        email=f"repo_test_{u_id.hex[:8]}@example.com",
        full_name="Repo Tester"
    )
    db_session.add(user)

    profile = StudentProfile(user_id=user.id)
    db_session.add(profile)

    token_raw = f"session_token_{user.id.hex}"
    token_hash = hashlib.sha256(token_raw.encode()).hexdigest()
    sess = AuthSession(
        id=uuid.uuid4(),
        user_id=user.id,
        token_hash=token_hash,
        expires_at=datetime.now(timezone.utc) + timedelta(days=1)
    )
    db_session.add(sess)

    project = Project(
        id=p_id,
        creator_id=u_id,
        title="Test Sprint 2 Project",
        description="A test project for GitHub repository linking."
    )
    db_session.add(project)

    db_session.commit()
    db_session.refresh(user)
    db_session.refresh(project)

    return user, project, token_raw

def _random_gh_profile():
    r_id = random.randint(10000000, 99999999)
    return {"id": r_id, "login": f"student_developer_demo_{r_id}", "avatar_url": f"https://avatars.githubusercontent.com/u/{r_id}"}

def test_get_repositories_requires_oauth(db_session: Session):
    user, project, token_raw = _create_user_session_and_project(db_session)

    res = client.get(
        "/api/v1/github/repositories",
        headers={"Authorization": f"Bearer {token_raw}"}
    )
    assert res.status_code == 400
    assert "GitHub connection required" in res.json()["detail"]

def test_get_repositories_and_search_success(db_session: Session):
    user, project, token_raw = _create_user_session_and_project(db_session)
    save_github_connection(db_session, user.id, "gho_dev_demo_access_token_12345", _random_gh_profile())

    res = client.get(
        "/api/v1/github/repositories",
        headers={"Authorization": f"Bearer {token_raw}"}
    )
    assert res.status_code == 200
    data = res.json()
    assert "repositories" in data
    assert len(data["repositories"]) > 0
    assert data["repositories"][0]["github_repo_id"] == "1001"

    # Search
    res_search = client.get(
        "/api/v1/github/repositories/search?q=sisya",
        headers={"Authorization": f"Bearer {token_raw}"}
    )
    assert res_search.status_code == 200
    search_data = res_search.json()
    assert len(search_data["repositories"]) >= 1
    assert "sisya-abhyasa-core" in search_data["repositories"][0]["repo_name"]

def test_link_get_replace_unlink_repository_lifecycle(db_session: Session):
    user, project, token_raw = _create_user_session_and_project(db_session)
    save_github_connection(db_session, user.id, "gho_dev_demo_access_token_12345", _random_gh_profile())

    # 1. Initially no linked repo
    res_curr = client.get(
        f"/api/v1/github/repositories/current/{project.id}",
        headers={"Authorization": f"Bearer {token_raw}"}
    )
    assert res_curr.status_code == 200
    assert res_curr.json()["linked"] is False

    # 2. Link Repository ID 1001
    res_link = client.post(
        "/api/v1/github/repositories/link",
        json={"project_id": str(project.id), "repository_id": "1001"},
        headers={"Authorization": f"Bearer {token_raw}"}
    )
    assert res_link.status_code == 200
    link_data = res_link.json()
    assert link_data["linked"] is True
    assert link_data["repository"]["repo_name"] == "ai-resume-builder"

    # 3. Get Current Linked Repo
    res_curr2 = client.get(
        f"/api/v1/github/repositories/current/{project.id}",
        headers={"Authorization": f"Bearer {token_raw}"}
    )
    assert res_curr2.status_code == 200
    assert res_curr2.json()["linked"] is True
    assert res_curr2.json()["repository"]["repo_name"] == "ai-resume-builder"

    # 4. Replace Repository with ID 1002
    res_replace = client.post(
        "/api/v1/github/repositories/link",
        json={"project_id": str(project.id), "repository_id": "1002"},
        headers={"Authorization": f"Bearer {token_raw}"}
    )
    assert res_replace.status_code == 200
    assert res_replace.json()["repository"]["repo_name"] == "sisya-abhyasa-core"

    # 5. Unlink Repository
    res_unlink = client.delete(
        f"/api/v1/github/repositories/unlink/{project.id}",
        headers={"Authorization": f"Bearer {token_raw}"}
    )
    assert res_unlink.status_code == 200
    assert res_unlink.json()["unlinked"] is True

    # 6. Verify unlinked state
    res_curr3 = client.get(
        f"/api/v1/github/repositories/current/{project.id}",
        headers={"Authorization": f"Bearer {token_raw}"}
    )
    assert res_curr3.status_code == 200
    assert res_curr3.json()["linked"] is False

def test_reject_unauthorized_project_access(db_session: Session):
    user1, project1, token1 = _create_user_session_and_project(db_session)
    user2, project2, token2 = _create_user_session_and_project(db_session)

    save_github_connection(db_session, user2.id, "gho_dev_demo_access_token_12345", _random_gh_profile())

    # User 2 tries to link User 1's project
    res = client.post(
        "/api/v1/github/repositories/link",
        json={"project_id": str(project1.id), "repository_id": "1001"},
        headers={"Authorization": f"Bearer {token2}"}
    )
    assert res.status_code == 400
    assert "permission to modify this project" in res.json()["detail"]

def test_reject_invalid_repository_id(db_session: Session):
    user, project, token_raw = _create_user_session_and_project(db_session)
    save_github_connection(db_session, user.id, "gho_dev_demo_access_token_12345", _random_gh_profile())

    res = client.post(
        "/api/v1/github/repositories/link",
        json={"project_id": str(project.id), "repository_id": "invalid_repo_99999"},
        headers={"Authorization": f"Bearer {token_raw}"}
    )
    assert res.status_code == 400
    assert "Repository not found or not accessible" in res.json()["detail"]
