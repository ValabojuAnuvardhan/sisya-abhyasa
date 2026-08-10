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
from app.github.analytics_service import GitHubAnalyticsService

@pytest.fixture
def db_session():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()

def test_github_analytics_service_live_data(db_session):
    u_id = uuid.uuid4()
    p_id = uuid.uuid4()
    rand_repo_id = random.randint(1000000, 9999999)

    user = User(
        id=u_id,
        auth_subject=f"auth0|analytics_user_{u_id.hex[:8]}",
        email=f"analytics_user_{u_id.hex[:8]}@example.com",
        full_name="Analytics Tester"
    )
    db_session.add(user)
    profile = StudentProfile(user_id=user.id)
    db_session.add(profile)

    project = Project(
        id=p_id,
        creator_id=user.id,
        title="Analytics Test Project",
        description="Testing live repo analytics"
    )
    db_session.add(project)
    db_session.commit()

    conn = GithubConnection(
        user_id=user.id,
        github_user_id=f"actor_{u_id.hex[:6]}",
        username="analyticspro",
        access_token="encrypted_token"
    )
    db_session.add(conn)
    db_session.commit()

    linked_repo = ProjectGithubRepository(
        project_id=project.id,
        github_connection_id=conn.id,
        github_repo_id=str(rand_repo_id),
        repo_name="analytics-repo",
        owner="analyticspro",
        full_name="analyticspro/analytics-repo",
        html_url="https://github.com/analyticspro/analytics-repo",
        default_branch="main",
        visibility="public",
        language="TypeScript"
    )
    legacy_repo = ProjectRepository(
        project_id=project.id,
        github_installation_id=654321,
        github_repository_id=rand_repo_id,
        owner="analyticspro",
        name="analytics-repo",
        full_name="analyticspro/analytics-repo",
        html_url="https://github.com/analyticspro/analytics-repo"
    )
    db_session.add_all([linked_repo, legacy_repo])
    db_session.commit()

    # Add 2 commits and 2 PRs
    c1 = GithubCommit(
        repository_id=legacy_repo.id,
        user_id=user.id,
        sha="sha1111111111111111111111111111111111111",
        message="feat: Initial commit for analytics",
        github_actor_login="analyticspro",
        committed_at=datetime.now(timezone.utc),
        html_url="https://github.com/analyticspro/analytics-repo/commit/sha1"
    )
    c2 = GithubCommit(
        repository_id=legacy_repo.id,
        user_id=user.id,
        sha="sha2222222222222222222222222222222222222",
        message="fix: Resolve edge case in telemetry",
        github_actor_login="contributor2",
        committed_at=datetime.now(timezone.utc),
        html_url="https://github.com/analyticspro/analytics-repo/commit/sha2"
    )
    pr1 = GithubPullRequest(
        repository_id=legacy_repo.id,
        user_id=user.id,
        number=101,
        title="PR 101 Analytics integration",
        state="merged",
        merged=True,
        github_actor_login="analyticspro",
        html_url="https://github.com/analyticspro/analytics-repo/pull/101",
        updated_at_github=datetime.now(timezone.utc)
    )
    pr2 = GithubPullRequest(
        repository_id=legacy_repo.id,
        user_id=user.id,
        number=102,
        title="PR 102 Telemetry dashboard",
        state="open",
        merged=False,
        github_actor_login="contributor2",
        html_url="https://github.com/analyticspro/analytics-repo/pull/102",
        updated_at_github=datetime.now(timezone.utc)
    )
    log1 = GithubSyncLog(
        project_id=project.id,
        status="success",
        commits_synced=2,
        prs_synced=2
    )

    db_session.add_all([c1, c2, pr1, pr2, log1])
    db_session.commit()

    # 1. Overview Test
    overview = GitHubAnalyticsService.get_repository_overview(db_session, project.id)
    assert overview.repo_name == "analytics-repo"
    assert overview.total_commits == 2
    assert overview.total_pull_requests == 2
    assert overview.total_contributors == 2

    # 2. Commit Analytics Test
    commits_resp = GitHubAnalyticsService.get_commit_analytics(db_session, project.id)
    assert commits_resp.total_commits == 2
    assert commits_resp.latest_commit is not None
    assert commits_resp.latest_commit["sha"] == "sha2222"

    # 3. Pull Request Analytics Test
    pr_resp = GitHubAnalyticsService.get_pr_analytics(db_session, project.id)
    assert pr_resp.total_prs == 2
    assert pr_resp.merged == 1
    assert pr_resp.open == 1
    assert pr_resp.merge_rate == 50.0

    # 4. Branch Analytics Test
    branch_resp = GitHubAnalyticsService.get_branch_analytics(db_session, project.id)
    assert branch_resp.default_branch == "main"
    assert branch_resp.merged_branches == 1

    # 5. Contributors Test
    contrib_resp = GitHubAnalyticsService.get_contributor_analytics(db_session, project.id)
    assert contrib_resp.total_contributors == 2
    assert len(contrib_resp.contributors) == 2

    # 6. Weekly Activity Test
    activity_resp = GitHubAnalyticsService.get_weekly_activity(db_session, project.id)
    assert len(activity_resp.days) == 7

    # 7. Code Churn Test
    churn_resp = GitHubAnalyticsService.get_code_churn(db_session, project.id)
    assert churn_resp.lines_added > 0
    assert churn_resp.files_changed > 0

    # 8. Sync Health Test
    health_resp = GitHubAnalyticsService.get_sync_health(db_session, project.id)
    assert health_resp.webhook_status == "Active"
    assert health_resp.success_rate == 100.0

    # 9. Dashboard Single-Fetch Test
    dash_resp = GitHubAnalyticsService.get_dashboard_analytics(db_session, project.id)
    assert dash_resp.overview.repo_name == "analytics-repo"
    assert dash_resp.commits.total_commits == 2

def test_github_analytics_unlinked_project(db_session):
    empty_pid = uuid.uuid4()
    overview = GitHubAnalyticsService.get_repository_overview(db_session, empty_pid)
    assert overview.repo_name == "No Linked Repository"
    assert overview.total_commits == 0
    assert overview.total_pull_requests == 0

    dash = GitHubAnalyticsService.get_dashboard_analytics(db_session, empty_pid)
    assert dash.overview.total_commits == 0
    assert dash.commits.total_commits == 0
    assert dash.sync_health.webhook_status == "Inactive"

def test_github_analytics_project_isolation(db_session):
    u_id = uuid.uuid4()
    p_id_a = uuid.uuid4()
    p_id_b = uuid.uuid4()

    user = User(
        id=u_id,
        auth_subject=f"auth0|iso_user_{u_id.hex[:8]}",
        email=f"iso_user_{u_id.hex[:8]}@example.com",
        full_name="Iso Tester"
    )
    db_session.add(user)
    proj_a = Project(id=p_id_a, creator_id=user.id, title="Project A", description="Desc A")
    proj_b = Project(id=p_id_b, creator_id=user.id, title="Project B", description="Desc B")
    db_session.add_all([proj_a, proj_b])
    db_session.commit()

    conn = GithubConnection(
        user_id=user.id,
        github_user_id=f"iso_{u_id.hex[:6]}",
        username="isomaster",
        access_token="token"
    )
    db_session.add(conn)
    db_session.commit()

    repo_id_a = random.randint(1000000, 9999999)
    repo_id_b = random.randint(1000000, 9999999)
    linked_a = ProjectGithubRepository(project_id=p_id_a, github_connection_id=conn.id, github_repo_id=str(repo_id_a), repo_name="repo-a", owner="iso", full_name="iso/repo-a", html_url="http://repo-a", default_branch="main")
    linked_b = ProjectGithubRepository(project_id=p_id_b, github_connection_id=conn.id, github_repo_id=str(repo_id_b), repo_name="repo-b", owner="iso", full_name="iso/repo-b", html_url="http://repo-b", default_branch="main")
    repo_a = ProjectRepository(project_id=p_id_a, github_installation_id=1, github_repository_id=repo_id_a, owner="iso", name="repo-a", full_name="iso/repo-a", html_url="http://repo-a")
    repo_b = ProjectRepository(project_id=p_id_b, github_installation_id=1, github_repository_id=repo_id_b, owner="iso", name="repo-b", full_name="iso/repo-b", html_url="http://repo-b")
    db_session.add_all([linked_a, linked_b, repo_a, repo_b])
    db_session.commit()

    # Add 3 commits to A, 1 commit to B
    for i in range(3):
        db_session.add(GithubCommit(repository_id=repo_a.id, user_id=user.id, sha=f"sha_a_{i}", message=f"Commit A {i}", github_actor_login="isomaster"))
    db_session.add(GithubCommit(repository_id=repo_b.id, user_id=user.id, sha="sha_b_0", message="Commit B 0", github_actor_login="isomaster"))
    db_session.commit()

    overview_a = GitHubAnalyticsService.get_repository_overview(db_session, p_id_a)
    overview_b = GitHubAnalyticsService.get_repository_overview(db_session, p_id_b)

    assert overview_a.total_commits == 3
    assert overview_b.total_commits == 1

def test_github_analytics_read_only_guarantee(db_session):
    p_id = uuid.uuid4()
    
    # Count initial rows
    initial_commits = db_session.query(GithubCommit).count()
    initial_prs = db_session.query(GithubPullRequest).count()
    initial_logs = db_session.query(GithubSyncLog).count()

    # Execute all analytics computations
    GitHubAnalyticsService.get_dashboard_analytics(db_session, p_id)
    GitHubAnalyticsService.get_repository_overview(db_session, p_id)
    GitHubAnalyticsService.get_commit_analytics(db_session, p_id)
    GitHubAnalyticsService.get_pr_analytics(db_session, p_id)
    GitHubAnalyticsService.get_branch_analytics(db_session, p_id)
    GitHubAnalyticsService.get_contributor_analytics(db_session, p_id)
    GitHubAnalyticsService.get_weekly_activity(db_session, p_id)
    GitHubAnalyticsService.get_code_churn(db_session, p_id)
    GitHubAnalyticsService.get_sync_health(db_session, p_id)

    # Verify zero DB row changes (read-only guarantee)
    assert db_session.query(GithubCommit).count() == initial_commits
    assert db_session.query(GithubPullRequest).count() == initial_prs
    assert db_session.query(GithubSyncLog).count() == initial_logs
