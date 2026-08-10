import uuid
import random
from datetime import datetime, timezone
import pytest

from app.db.session import SessionLocal, engine
from app.db.base import Base
from app.models.user import User
from app.models.project import Project, Milestone, Task
from app.models.github import ProjectRepository, GithubCommit, GithubPullRequest
from app.github.evidence_graph.models import EvidenceIdentity, EvidenceRecord, EvidenceLink, EvidenceEvent
from app.github.evidence_graph.identity import EvidenceIdentityResolver
from app.github.evidence_graph.collector import GitHubCollector
from app.github.evidence_graph.builder import RelationshipBuilder
from app.github.evidence_graph.service import EvidenceStoreService
from app.github.evidence_graph.schemas import EvidenceDecisionRequest

@pytest.fixture
def db_session():
    Base.metadata.create_all(bind=engine)
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()

def test_evidence_identity_deduplication(db_session):
    u_id = uuid.uuid4()
    p_id = uuid.uuid4()

    user = User(id=u_id, auth_subject=f"auth0|ident_{u_id.hex[:6]}", email=f"ident_{u_id.hex[:6]}@example.com", full_name="Ident User")
    project = Project(id=p_id, creator_id=user.id, title="Ident Project", description="D")
    db_session.add_all([user, project])
    db_session.commit()

    ident1 = EvidenceIdentityResolver.resolve_or_create(db_session, project.id, "github", "sha_1234567")
    ident2 = EvidenceIdentityResolver.resolve_or_create(db_session, project.id, "github", "sha_1234567")

    assert ident1.id == ident2.id
    assert ident1.identity_hash == ident2.identity_hash

def test_github_collector_and_store(db_session):
    u_id = uuid.uuid4()
    p_id = uuid.uuid4()
    rand_repo_id = random.randint(1000000, 9999999)

    user = User(id=u_id, auth_subject=f"auth0|coll_{u_id.hex[:6]}", email=f"coll_{u_id.hex[:6]}@example.com", full_name="Coll User")
    project = Project(id=p_id, creator_id=user.id, title="Coll Project", description="D")
    repo = ProjectRepository(project_id=project.id, github_installation_id=1, github_repository_id=rand_repo_id, owner="coll", name="coll-repo", full_name="coll/coll-repo", html_url="http://coll")
    db_session.add_all([user, project, repo])
    db_session.commit()

    commit = GithubCommit(repository_id=repo.id, user_id=user.id, sha=f"sha_coll_{u_id.hex[:6]}", message="feat: Initial setup", github_actor_login="coll")
    pr = GithubPullRequest(repository_id=repo.id, user_id=user.id, number=10, title="Initial setup PR", state="merged", merged=True, github_actor_login="coll", html_url="http://pr10")
    db_session.add_all([commit, pr])
    db_session.commit()

    collector = GitHubCollector()
    records = collector.collect(db_session, project.id, user.id)
    assert len(records) == 2

    summary = EvidenceStoreService.get_project_summary(db_session, user, project.id)
    assert summary.total_records == 2
    assert summary.total_identities == 2
    assert summary.total_events == 2

def test_relationship_builder_and_decisions(db_session):
    u_id = uuid.uuid4()
    p_id = uuid.uuid4()
    m_id = uuid.uuid4()
    t_id = uuid.uuid4()
    rand_repo_id = random.randint(1000000, 9999999)

    user = User(id=u_id, auth_subject=f"auth0|rel_{u_id.hex[:6]}", email=f"rel_{u_id.hex[:6]}@example.com", full_name="Rel User")
    project = Project(id=p_id, creator_id=user.id, title="Rel Project", description="D")
    milestone = Milestone(id=m_id, project_id=project.id, title="M1", objective="O", position=1)
    task = Task(id=t_id, milestone_id=milestone.id, title="Auth Task", description="D", completion_criteria="C", position=1)
    repo = ProjectRepository(project_id=project.id, github_installation_id=1, github_repository_id=rand_repo_id, owner="rel", name="rel-repo", full_name="rel/rel-repo", html_url="http://rel")
    db_session.add_all([user, project, milestone, task, repo])
    db_session.commit()

    pr = GithubPullRequest(repository_id=repo.id, user_id=user.id, number=20, title="Auth PR", state="merged", merged=True, github_actor_login="rel", html_url="http://pr20")
    db_session.add(pr)
    db_session.commit()

    collector = GitHubCollector()
    collected = collector.collect(db_session, project.id, user.id)
    assert len(collected) == 1
    pr_record = collected[0]

    # Create task evidence record
    task_ident = EvidenceIdentityResolver.resolve_or_create(db_session, project.id, "sisya", str(task.id))
    task_record = EvidenceRecord(
        project_id=project.id,
        student_id=user.id,
        identity_id=task_ident.id,
        source="sisya",
        artifact_type="task",
        artifact_reference=str(task.id),
        origin="api",
        created_from="Task Creator"
    )
    db_session.add(task_record)
    db_session.commit()

    # Create typed relationship: Task -> implemented_by -> PR
    link = RelationshipBuilder.create_link(
        db=db_session,
        project_id=project.id,
        evidence_a_id=task_record.id,
        evidence_b_id=pr_record.id,
        relationship="implemented_by",
        confidence=0.95,
        performed_by=user.id
    )
    assert link.relationship == "implemented_by"
    assert link.confidence == 0.95

    # Human decision approval
    dec_resp = EvidenceStoreService.record_human_decision(
        db_session, user, pr_record.id, EvidenceDecisionRequest(decision="approved", reason="Verified by mentor")
    )
    assert dec_resp.decision == "approved"
    assert dec_resp.status == "verified"

    # Get dynamic EvidenceBundleDTO
    bundle = EvidenceStoreService.get_task_evidence_bundle(db_session, user, task.id)
    assert bundle.task_id == str(task.id)
    assert bundle.completion_pct == 100
    assert bundle.status == "merged"
