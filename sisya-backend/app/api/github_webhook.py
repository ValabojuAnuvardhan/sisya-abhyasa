from fastapi import APIRouter, Request, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.integrations.github.webhook_handler import (
    verify_signature, is_duplicate, record_event,
    find_repository, handle_push, handle_pull_request
)

router = APIRouter()


@router.post("/webhook")
async def github_webhook(request: Request, db: Session = Depends(get_db)):
    payload_bytes = await request.body()
    signature = request.headers.get("X-Hub-Signature-256", "")
    delivery_id = request.headers.get("X-GitHub-Delivery", "")
    event_type = request.headers.get("X-GitHub-Event", "")

    # Security gate — reject unsigned payloads
    if not verify_signature(payload_bytes, signature):
        raise HTTPException(401, "Invalid webhook signature")

    # Idempotency — acknowledge but skip duplicates
    if is_duplicate(delivery_id, db):
        return {"status": "duplicate", "delivery_id": delivery_id}

    payload = await request.json()
    repo_full_name = payload.get("repository", {}).get("full_name", "")

    event = record_event(delivery_id, event_type, repo_full_name, db)
    repository = find_repository(repo_full_name, db)

    result = {"status": "accepted", "event": event_type}

    if repository:
        if event_type == "push":
            count = handle_push(payload, repository, db)
            result["commits_saved"] = count
        elif event_type == "pull_request":
            action = handle_pull_request(payload, repository, db)
            result["pr_action"] = action

    event.processed = True
    db.commit()
    return result
