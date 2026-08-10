import uuid
import random
from datetime import datetime, timezone
import pytest
from fastapi import HTTPException

from app.db.session import SessionLocal
from app.models.user import User
from app.models.project import Project, Milestone, Task
from app.models.github import ProjectRepository, GithubCommit, GithubPullRequest
from app.github.task_traceability.models import TaskCommit, TaskPullRequest
from app.github.task_traceability.matcher import TraceabilityMatcher
from app.github.task_traceability.service import TaskTraceabilityService
from app.github.task_traceability.schemas import (
    AssignBranchRequest,
    LinkCommitRequest,
    LinkPullRequestRequest,
)

from app.db.session import SessionLocal, engine
from app.db.base import Base

@pytest.fixture
def db_session():
    TaskCommit.__table__.drop(bind=engine, checkfirst=True)
    TaskPullRequest.__table__.drop(bind=engine, checkfirst=True)
    Base.metadata.create_all(bind=engine)
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()

def test_task_traceability_full_chain_and_references(db_session):
    u_id = uuid.uuid4()
    p_id = uuid.uuid4()
    m_id = uuid.uuid4()
    t_id = uuid.uuid4()
    rand_repo_id = random.randint(1000000, 9999999)

    user = User(
        id=u_id,
        auth_subject=f"auth0|trace_user_{u_id.hex[:8]}",
        email=f"trace_user_{u_id.hex[:8]}@example.com",
        full_name="Traceability Tester"
    )
    db_session.add(user)

    project = Project(
        id=p_id,
        creator_id=user.id,
        title="Traceability Test Project",
        description="Testing Task-PR proof chain"
    )
    db_session.add(project)

    milestone = Milestone(
        id=m_id,
        project_id=project.id,
        title="Milestone 1",
        objective="Initial Setup",
        position=1
    )
    db_session.add(milestone)

    task = Task(
        id=t_id,
        milestone_id=milestone.id,
        title="Implement Auth System",
        description="Build JWT login flow",
        completion_criteria="JWT auth working",
        position=1,
        status="todo"
    )
    db_session.add(task)

    repo = ProjectRepository(
        project_id=project.id,
        github_installation_id=12345,
        github_repository_id=rand_repo_id,
        owner="tracetester",
        name="trace-repo",
        full_name="tracetester/trace-repo",
        html_url="https://github.com/tracetester/trace-repo"
    )
    db_session.add(repo)
    db_session.commit()

    # Add synced commit and PR
    commit_sha = f"sha_trace_{u_id.hex[:8]}"
    commit = GithubCommit(
        repository_id=repo.id,
        user_id=user.id,
        sha=commit_sha,
        message="feat: Implement JWT auth (#1)",
        github_actor_login="tracetester",
        committed_at=datetime.now(timezone.utc)
    )
    pr = GithubPullRequest(
        repository_id=repo.id,
        user_id=user.id,
        number=1,
        title="Task #1 Auth System Implementation",
        state="merged",
        merged=True,
        github_actor_login="tracetester",
        html_url="https://github.com/tracetester/trace-repo/pull/1",
        updated_at_github=datetime.now(timezone.utc)
    )
    db_session.add_all([commit, pr])
    db_session.commit()

    # 1. Assign Branch (Expect 25%)
    res_b = TaskTraceabilityService.assign_branch(
        db_session, user, task.id, AssignBranchRequest(branch_name="feature/auth-system")
    )
    assert res_b.branch_assigned is True
    assert res_b.traceability_score_pct == 25

    # 2. Link Commit (Expect 50%)
    res_c = TaskTraceabilityService.link_commit(
        db_session, user, task.id, LinkCommitRequest(commit_sha=commit_sha)
    )
    assert res_c.commits_count == 1
    assert res_c.traceability_score_pct == 50

    # Verify zero metadata duplication in TaskCommit (only FK reference!)
    task_commit_rec = db_session.query(TaskCommit).filter_by(task_id=task.id).first()
    assert task_commit_rec is not None
    assert task_commit_rec.github_commit_id == commit.id

    # 3. Link Merged PR (Expect 100%)
    res_pr = TaskTraceabilityService.link_pull_request(
        db_session, user, task.id, LinkPullRequestRequest(pr_number=1)
    )
    assert res_pr.pr_linked is True
    assert res_pr.merged is True
    assert res_pr.traceability_score_pct == 100

    # Verify zero metadata duplication in TaskPullRequest (only FK reference!)
    task_pr_rec = db_session.query(TaskPullRequest).filter_by(task_id=task.id).first()
    assert task_pr_rec is not None
    assert task_pr_rec.github_pr_id == pr.id

    # 4. Retrieve Full Evidence Chain
    chain = TaskTraceabilityService.get_traceability_chain(db_session, user, task.id)
    assert chain.task_title == "Implement Auth System"
    assert chain.branch["branch_name"] == "feature/auth-system"
    assert len(chain.commits) == 1
    assert chain.pull_request["pr_number"] == 1
    assert chain.traceability_score_pct == 100

def test_traceability_matcher_candidates(db_session):
    u_id = uuid.uuid4()
    p_id = uuid.uuid4()
    m_id = uuid.uuid4()
    t_id = uuid.uuid4()
    rand_repo_id = random.randint(1000000, 9999999)

    user = User(id=u_id, auth_subject=f"auth0|match_{u_id.hex[:6]}", email=f"match_{u_id.hex[:6]}@example.com", full_name="Match Tester")
    project = Project(id=p_id, creator_id=user.id, title="Match Project", description="D")
    milestone = Milestone(id=m_id, project_id=project.id, title="M1", objective="O", position=1)
    task = Task(id=t_id, milestone_id=milestone.id, title="Database Migration", description="D", completion_criteria="C", position=5)
    repo = ProjectRepository(project_id=project.id, github_installation_id=1, github_repository_id=rand_repo_id, owner="match", name="match-repo", full_name="match/match-repo", html_url="http://match")
    db_session.add_all([user, project, milestone, task, repo])
    db_session.commit()

    commit = GithubCommit(repository_id=repo.id, user_id=user.id, sha="sha_match_99", message="feat: task-5 database migration", github_actor_login="match")
    pr = GithubPullRequest(repository_id=repo.id, user_id=user.id, number=5, title="Task #5 Migration", state="open", merged=False, github_actor_login="match", html_url="http://pr5")
    db_session.add_all([commit, pr])
    db_session.commit()

    matched_commits = TraceabilityMatcher.find_commit_candidates(db_session, project.id, task)
    assert len(matched_commits) == 1
    assert matched_commits[0].sha == "sha_match_99"

    matched_prs = TraceabilityMatcher.find_pr_candidates(db_session, project.id, task)
    assert len(matched_prs) == 1
    assert matched_prs[0].number == 5

    # Test auto_link_evidence
    status_resp = TaskTraceabilityService.auto_link_evidence(db_session, user, task.id)
    assert status_resp.branch_assigned is True
    assert status_resp.commits_count == 1
    assert status_resp.pr_linked is True
    assert status_resp.traceability_score_pct == 75

def test_task_traceability_validations(db_session):
    u_id = uuid.uuid4()
    p_id = uuid.uuid4()
    m_id = uuid.uuid4()
    t_id = uuid.uuid4()
    rand_repo_id = random.randint(1000000, 9999999)

    user = User(
        id=u_id,
        auth_subject=f"auth0|val_user_{u_id.hex[:8]}",
        email=f"val_user_{u_id.hex[:8]}@example.com",
        full_name="Validation Tester"
    )
    db_session.add(user)

    project = Project(id=p_id, creator_id=user.id, title="Val Project", description="Desc")
    milestone = Milestone(id=m_id, project_id=project.id, title="M1", objective="Obj", position=1)
    task = Task(id=t_id, milestone_id=milestone.id, title="Task 1", description="D", completion_criteria="C", position=1)
    repo = ProjectRepository(project_id=project.id, github_installation_id=1, github_repository_id=rand_repo_id, owner="val", name="val-repo", full_name="val/val-repo", html_url="http://val")

    db_session.add_all([project, milestone, task, repo])
    db_session.commit()

    # Reject non-existent commit
    with pytest.raises(HTTPException) as exc_commit:
        TaskTraceabilityService.link_commit(db_session, user, task.id, LinkCommitRequest(commit_sha="non_existent_sha"))
    assert exc_commit.value.status_code == 400

    # Reject non-existent PR
    with pytest.raises(HTTPException) as exc_pr:
        TaskTraceabilityService.link_pull_request(db_session, user, task.id, LinkPullRequestRequest(pr_number=999))
    assert exc_pr.value.status_code == 400

def test_task_traceability_unauthorized(db_session):
    u1_id = uuid.uuid4()
    u2_id = uuid.uuid4()
    p_id = uuid.uuid4()
    m_id = uuid.uuid4()
    t_id = uuid.uuid4()

    owner = User(id=u1_id, auth_subject=f"auth0|owner_{u1_id.hex[:6]}", email=f"owner_{u1_id.hex[:6]}@example.com", full_name="Owner")
    stranger = User(id=u2_id, auth_subject=f"auth0|stranger_{u2_id.hex[:6]}", email=f"stranger_{u2_id.hex[:6]}@example.com", full_name="Stranger")
    db_session.add_all([owner, stranger])

    project = Project(id=p_id, creator_id=owner.id, title="Private Project", description="Desc")
    milestone = Milestone(id=m_id, project_id=project.id, title="M1", objective="Obj", position=1)
    task = Task(id=t_id, milestone_id=milestone.id, title="Private Task", description="D", completion_criteria="C", position=1)
    db_session.add_all([project, milestone, task])
    db_session.commit()

    # Stranger attempts access -> 403 Forbidden
    with pytest.raises(HTTPException) as exc:
        TaskTraceabilityService.assign_branch(db_session, stranger, task.id, AssignBranchRequest(branch_name="hacker-branch"))
    assert exc.value.status_code == 403
