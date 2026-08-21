import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.models import (
    User, Profile, Project, ProjectMember, Milestone, Task, TaskStatusHistory,
    Repository, WebhookEvent, Commit, PullRequest, PRReview, SkillEvidence
)
from app.api.auth import router as auth_router
from app.api.profile import router as profile_router
from app.api.projects import router as projects_router
from app.api.tasks import router as tasks_router
from app.api.team import router as team_router
from app.api.github_webhook import router as github_webhook_router
from app.api.evidence import router as evidence_router
from app.api.ai_agents import router as ai_agents_router
from app.api.learn import router as learn_router
from app.api.network import router as network_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Śiṣya Abhyāsa API",
    version="1.0.0"
)

raw_frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
allowed_origins_set = {
    raw_frontend_url.rstrip("/"),
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
}
# Filter out empty or wildcard origins when credentials are enabled
allowed_origins = [origin for origin in allowed_origins_set if origin and origin != "*"]

import time
from collections import defaultdict
from fastapi import Request, Response
from fastapi.responses import JSONResponse

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-GitHub-Event", "X-Hub-Signature-256", "X-GitHub-Delivery"],
)

RATE_LIMITS = {
    "/auth/register": (5, 60),
    "/auth/login": (5, 60),
    "/ai/chat": (10, 60),
    "/api/v1/learn/chat": (10, 60),
    "/evidence/pr-review": (5, 60),
    "/projects/architect": (3, 60),
    "generate_roadmap": (3, 60),
}

request_history = defaultdict(list)

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    if os.getenv("TESTING_DISABLE_RATE_LIMIT") == "1" or (os.getenv("PYTEST_CURRENT_TEST") and os.getenv("TESTING_ENABLE_RATE_LIMIT") != "1"):
        return await call_next(request)

    path = request.url.path
    limit_rule = None
    rule_key = path

    for route_prefix, rule in RATE_LIMITS.items():
        if route_prefix == "generate_roadmap" and (path.endswith("/generate") or "/generate" in path):
            limit_rule = rule
            rule_key = "generate_roadmap"
            break
        elif route_prefix != "generate_roadmap" and (path == route_prefix or path.startswith(route_prefix)):
            limit_rule = rule
            rule_key = route_prefix
            break

    if limit_rule:
        max_reqs, window_sec = limit_rule
        client_ip = request.client.host if request.client else "127.0.0.1"
        key = f"{client_ip}:{rule_key}"
        now = time.time()
        
        # Clean up old timestamps outside window
        timestamps = [t for t in request_history[key] if now - t < window_sec]
        request_history[key] = timestamps

        if len(timestamps) >= max_reqs:
            retry_after = int(window_sec - (now - timestamps[0]))
            return JSONResponse(
                status_code=429,
                content={"detail": f"Rate limit exceeded. Try again in {retry_after} seconds."},
                headers={"Retry-After": str(max(1, retry_after))}
            )

        request_history[key].append(now)

    return await call_next(request)

app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(profile_router, prefix="/profile", tags=["profile"])
app.include_router(profile_router, prefix="", tags=["profile"])

app.include_router(projects_router, prefix="/projects", tags=["projects"])
app.include_router(projects_router, prefix="/project-ideas", tags=["project-ideas"])

app.include_router(tasks_router, prefix="/tasks", tags=["tasks"])
app.include_router(team_router, prefix="/projects", tags=["team"])
app.include_router(github_webhook_router, prefix="/github", tags=["github"])
app.include_router(evidence_router, prefix="/evidence", tags=["evidence"])
app.include_router(ai_agents_router, prefix="/ai", tags=["ai-agents"])
app.include_router(ai_agents_router, prefix="/api/v1/abhyas", tags=["abhyas"])
app.include_router(learn_router, prefix="/api/v1", tags=["learn"])

app.include_router(learn_router, prefix="", tags=["learn"])
app.include_router(network_router, prefix="/api/v1", tags=["network"])
app.include_router(network_router, prefix="", tags=["network"])

@app.get("/")
def root():
    return {
        "service": "Śiṣya Abhyāsa API",
        "status": "online",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Śiṣya Abhyāsa API",
        "version": "1.0.0",
        "database": "connected"
    }





