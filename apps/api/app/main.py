from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes.health import router as health_router
from app.api.routes.me import router as me_router
from app.api.routes.skills import router as skills_router
from app.api.routes.project_discovery import router as project_discovery_router
from app.api.routes.projects import router as projects_router
from app.api.routes.github import router as github_router
from app.github.routes import router as github_oauth_router
from app.api.routes.proof import router as proof_router
from app.api.routes.auth import router as auth_router
from app.api.routes.team_space import router as team_space_router
from app.api.routes.community import router as community_router
from app.api.routes.mentor import router as mentor_router
from app.api.routes.recruiter import router as recruiter_router
from app.api.routes.analytics import router as analytics_router
from app.api.routes.evaluation import router as evaluation_router
from app.api.routes.learn import router as learn_router
from app.api.routes.network import router as network_router
from app.api.routes.execution import router as execution_router
from app.api.routes.settings import router as settings_router
from app.api.routes.career import router as career_router
from app.github.task_traceability.routes import router as task_traceability_router
from app.github.evidence_graph.routes import router as evidence_graph_router
from app.core.config import settings

app = FastAPI(title=settings.app_name, version="1.1.0")
origins = [settings.frontend_origin, "http://localhost:3000", "http://127.0.0.1:3000"]
app.add_middleware(CORSMiddleware, allow_origins=list(set(origins)), allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.include_router(health_router, prefix="/api/v1")
app.include_router(auth_router, prefix="/api/v1")
app.include_router(auth_router)
app.include_router(learn_router, prefix="/api/v1")
app.include_router(learn_router)
app.include_router(network_router, prefix="/api/v1")
app.include_router(network_router)
app.include_router(me_router, prefix="/api/v1")
app.include_router(skills_router, prefix="/api/v1")
app.include_router(career_router, prefix="/api/v1")
app.include_router(project_discovery_router, prefix="/api/v1")
app.include_router(projects_router, prefix="/api/v1")
app.include_router(execution_router, prefix="/api/v1")
app.include_router(settings_router, prefix="/api/v1")
app.include_router(github_router, prefix="/api/v1")
app.include_router(github_oauth_router, prefix="/api/v1")
app.include_router(task_traceability_router, prefix="/api/v1")
app.include_router(evidence_graph_router, prefix="/api/v1")
app.include_router(proof_router, prefix="/api/v1")
app.include_router(proof_router)
app.include_router(team_space_router, prefix="/api/v1")
app.include_router(community_router, prefix="/api/v1")
app.include_router(community_router)
app.include_router(mentor_router, prefix="/api/v1")
app.include_router(recruiter_router, prefix="/api/v1")
app.include_router(analytics_router, prefix="/api/v1")
app.include_router(evaluation_router, prefix="/api/v1")

@app.get("/")
def root() -> dict[str, str]: return {"service": settings.app_name, "version": "1.1.0", "environment": settings.environment}

