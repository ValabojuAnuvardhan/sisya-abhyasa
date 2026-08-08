import uuid
import random
from datetime import datetime, timezone
import pytest
from app.db.session import SessionLocal
from app.models.user import User, StudentProfile
from app.models.project import Project
from app.github.models import (
    GithubConnection,
    ProjectGithubRepository,
    GithubSyncLog,
)
from app.models.github import (
    ProjectRepository,
    GithubCommit,
    GithubPullRequest,
)
from app.github.oauth import encrypt_token

@pytest.fixture
def db_session():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()

def test_github_sync_log_and_evidence(db_session):
    """Test creating sync log, commits, and pull requests for a project."""
    u_id = uuid.uuid4()
    p_id = uuid.uuid4()
    rand_repo_id = random.randint(1000000, 9999999)

    user = User(
        id=u_id,
        auth_subject=f"auth0|sync_user_{u_id.hex[:8]}",
        email=f"sync_user_{u_id.hex[:8]}@example.com",
        full_name="Sync Tester"
    )
    db_session.add(user)
    profile = StudentProfile(user_id=user.id)
    db_session.add(profile)

    project = Project(
        id=p_id,
        creator_id=user.id,
        title="Sync Test Project",
        description="Test Project Description"
    )
    db_session.add(project)
    db_session.commit()

    # 1. Setup GitHub Connection
    conn = GithubConnection(
        user_id=user.id,
        github_user_id=f"sync_user_{u_id.hex[:6]}",
        username="syncmaster",
        access_token=encrypt_token("mock_access_token")
    )
    db_session.add(conn)
    db_session.commit()

    # 2. Setup Linked Repository
    repo = ProjectGithubRepository(
        project_id=project.id,
        github_connection_id=conn.id,
        github_repo_id=str(rand_repo_id),
        repo_name="sync-repo",
        owner="syncmaster",
        full_name="syncmaster/sync-repo",
        html_url="https://github.com/syncmaster/sync-repo",
        default_branch="main"
    )
    legacy_repo = ProjectRepository(
        project_id=project.id,
        github_installation_id=123456,
        github_repository_id=rand_repo_id,
        owner="syncmaster",
        name="sync-repo",
        full_name="syncmaster/sync-repo",
        html_url="https://github.com/syncmaster/sync-repo"
    )
    db_session.add_all([repo, legacy_repo])
    db_session.commit()

    # 3. Add Ingested Commit & Pull Request
    commit = GithubCommit(
        repository_id=legacy_repo.id,
        user_id=user.id,
        sha=f"sha_{uuid.uuid4().hex[:16]}",
        message="feat: Implement sync pipeline",
        github_actor_login="syncmaster",
        committed_at=datetime.now(timezone.utc),
        html_url="https://github.com/syncmaster/sync-repo/commit/a1b2c3d4e5f67890"
    )
    pr = GithubPullRequest(
        repository_id=legacy_repo.id,
        user_id=user.id,
        number=1,
        title="Sync Pipeline Integration",
        state="merged",
        merged=True,
        github_actor_login="syncmaster",
        html_url="https://github.com/syncmaster/sync-repo/pull/1",
        updated_at_github=datetime.now(timezone.utc)
    )
    sync_log = GithubSyncLog(
        project_id=project.id,
        status="success",
        commits_synced=1,
        prs_synced=1
    )

    db_session.add_all([commit, pr, sync_log])
    db_session.commit()

    # 4. Verify Database Queries
    saved_commit = db_session.query(GithubCommit).filter(GithubCommit.repository_id == legacy_repo.id).first()
    saved_pr = db_session.query(GithubPullRequest).filter(GithubPullRequest.repository_id == legacy_repo.id).first()
    saved_log = db_session.query(GithubSyncLog).filter(GithubSyncLog.project_id == project.id).first()

    assert saved_commit is not None
    assert saved_pr is not None
    assert saved_pr.state == "merged"
    assert saved_log is not None
    assert saved_log.status == "success"
