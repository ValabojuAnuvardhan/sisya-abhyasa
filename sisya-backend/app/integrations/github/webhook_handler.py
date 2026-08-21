import hashlib
import hmac
import os
import datetime
import re
import uuid
from sqlalchemy.orm import Session
from app.models.user import (
    WebhookEvent, Repository, Commit, PullRequest, Task
)


def verify_signature(payload_bytes: bytes, signature_header: str) -> bool:
    """HMAC-SHA256 validation. Reject anything that fails."""
    if not signature_header or not signature_header.startswith("sha256="):
        return False
    secret = os.getenv("GITHUB_WEBHOOK_SECRET", "test-secret-for-unit-tests").encode()
    expected = hmac.new(secret, payload_bytes, hashlib.sha256).hexdigest()
    received = signature_header.removeprefix("sha256=")
    return hmac.compare_digest(expected, received)


def is_duplicate(delivery_id: str, db: Session) -> bool:
    """Return True if this delivery was already processed."""
    return db.query(WebhookEvent).filter(
        WebhookEvent.delivery_id == delivery_id
    ).first() is not None


def record_event(delivery_id: str, event_type: str,
                 repo_full_name: str, db: Session) -> WebhookEvent:
    event = WebhookEvent(
        delivery_id=delivery_id,
        event_type=event_type,
        repository_full_name=repo_full_name,
        processed=False
    )
    db.add(event)
    db.flush()
    return event


def find_repository(repo_full_name: str, db: Session):
    return db.query(Repository).filter(
        Repository.full_name == repo_full_name
    ).first()


def extract_task_reference(message: str):
    """Parse #TASK-uuid from commit messages with strict UUID validation."""
    match = re.search(r'#TASK-([a-f0-9-]+)', message or "", re.IGNORECASE)
    if match:
        raw_val = match.group(1)
        try:
            val_uuid = uuid.UUID(raw_val)
            return str(val_uuid)
        except ValueError:
            return None
    return None


def handle_push(payload: dict, repository, db: Session):
    """Ingest commits from a push event."""
    commits_saved = 0
    for commit_data in payload.get("commits", []):
        sha = commit_data.get("id")
        if not sha:
            continue
        existing = db.query(Commit).filter(Commit.sha == sha).first()
        if existing:
            continue

        message = commit_data.get("message", "")
        task_ref = extract_task_reference(message)
        task_id = None
        if task_ref:
            try:
                task = db.query(Task).filter(Task.id == uuid.UUID(task_ref)).first()
                if task:
                    task_id = task.id
            except Exception:
                task_id = None

        commit = Commit(
            repository_id=repository.id,
            sha=sha,
            author_github_username=commit_data.get("author", {}).get("username", "") or commit_data.get("author", {}).get("name", ""),
            message=message,
            committed_at=datetime.datetime.fromisoformat(
                commit_data.get("timestamp", "").replace("Z", "+00:00")
            ) if commit_data.get("timestamp") else datetime.datetime.now(datetime.timezone.utc),
            files_changed=(
                commit_data.get("added", []) +
                commit_data.get("modified", []) +
                commit_data.get("removed", [])
            ),
            task_id=task_id
        )
        db.add(commit)
        commits_saved += 1
    return commits_saved


def handle_pull_request(payload: dict, repository, db: Session):
    """Ingest a PR event."""
    pr_data = payload.get("pull_request", {})
    pr_number = pr_data.get("number")

    if not pr_number:
        return "ignored"

    existing = db.query(PullRequest).filter(
        PullRequest.repository_id == repository.id,
        PullRequest.pr_number == pr_number
    ).first()

    merged_at_raw = pr_data.get("merged_at")
    merged_at = None
    if merged_at_raw:
        merged_at = datetime.datetime.fromisoformat(
            merged_at_raw.replace("Z", "+00:00")
        )

    if existing:
        existing.state = pr_data.get("state", existing.state)
        existing.merged = pr_data.get("merged", existing.merged)
        existing.merged_at = merged_at or existing.merged_at
        return "updated"

    pr = PullRequest(
        repository_id=repository.id,
        pr_number=pr_number,
        title=pr_data.get("title"),
        author_github_username=pr_data.get("user", {}).get("login", ""),
        state=pr_data.get("state", "open"),
        merged=pr_data.get("merged", False),
        merged_at=merged_at,
        base_branch=pr_data.get("base", {}).get("ref"),
        head_branch=pr_data.get("head", {}).get("ref"),
        opened_at=datetime.datetime.fromisoformat(
            pr_data.get("created_at", "").replace("Z", "+00:00")
        ) if pr_data.get("created_at") else datetime.datetime.now(datetime.timezone.utc)
    )
    db.add(pr)
    return "created"
