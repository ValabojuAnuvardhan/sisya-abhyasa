from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes.health import router as health_router
from app.api.routes.me import router as me_router
from app.api.routes.skills import router as skills_router
from app.api.routes.project_discovery import router as project_discovery_router
from app.api.routes.projects import router as projects_router
from app.core.config import settings
app = FastAPI(title=settings.app_name, version="0.5.0")
app.add_middleware(CORSMiddleware, allow_origins=[settings.frontend_origin], allow_credentials=True, allow_methods=["GET","POST","PATCH","DELETE"], allow_headers=["*"])
app.include_router(health_router, prefix="/api/v1")
app.include_router(me_router, prefix="/api/v1")
app.include_router(skills_router, prefix="/api/v1")
app.include_router(project_discovery_router, prefix="/api/v1")
app.include_router(projects_router, prefix="/api/v1")
@app.get("/")
def root() -> dict[str, str]: return {"service": settings.app_name, "environment": settings.environment}
