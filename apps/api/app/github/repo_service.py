import logging
from datetime import datetime, timezone
from uuid import UUID
import httpx
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.github.models import GithubConnection, ProjectGithubRepository
from app.github.service import decrypt_token, get_github_connection, _to_uuid
from app.models.project import Project, ProjectMember

logger = logging.getLogger("sisya.github_repo_service")

MOCK_DEMO_REPOSITORIES = [
    {
        "github_repo_id": "1001",
        "repo_name": "ai-resume-builder",
        "owner": "student_developer_demo",
        "full_name": "student_developer_demo/ai-resume-builder",
        "description": "An AI-powered resume generator built with Next.js, FastAPI, and OpenAI API.",
        "visibility": "public",
        "language": "TypeScript",
        "default_branch": "main",
        "html_url": "https://github.com/student_developer_demo/ai-resume-builder",
        "stars": 14,
        "forks": 3,
        "updated_at": "2026-08-08T12:00:00Z"
    },
    {
        "github_repo_id": "1002",
        "repo_name": "sisya-abhyasa-core",
        "owner": "student_developer_demo",
        "full_name": "student_developer_demo/sisya-abhyasa-core",
        "description": "Evidence-based learning platform monorepo with FastAPI and Next.js 15.",
        "visibility": "public",
        "language": "Python",
        "default_branch": "main",
        "html_url": "https://github.com/student_developer_demo/sisya-abhyasa-core",
        "stars": 42,
        "forks": 8,
        "updated_at": "2026-08-07T18:30:00Z"
    },
    {
        "github_repo_id": "1003",
        "repo_name": "fastapi-backend-template",
        "owner": "student_developer_demo",
        "full_name": "student_developer_demo/fastapi-backend-template",
        "description": "Production-grade FastAPI boilerplate with PostgreSQL, Alembic, and JWT auth.",
        "visibility": "public",
        "language": "Python",
        "default_branch": "main",
        "html_url": "https://github.com/student_developer_demo/fastapi-backend-template",
        "stars": 8,
        "forks": 1,
        "updated_at": "2026-08-05T09:15:00Z"
    },
    {
        "github_repo_id": "1004",
        "repo_name": "react-ui-components",
        "owner": "student_developer_demo",
        "full_name": "student_developer_demo/react-ui-components",
        "description": "Accessible and responsive Tailwind CSS UI component library.",
        "visibility": "private",
        "language": "TypeScript",
        "default_branch": "main",
        "html_url": "https://github.com/student_developer_demo/react-ui-components",
        "stars": 5,
        "forks": 0,
        "updated_at": "2026-08-01T15:45:00Z"
    }
]

def fetch_user_repositories(
    db: Session,
    user_id: UUID | str,
    page: int = 1,
    per_page: int = 30,
    sort: str = "updated",
    direction: str = "desc"
) -> list[dict]:
    u_uuid = _to_uuid(user_id)
    conn = get_github_connection(db, u_uuid)
    if not conn:
        raise ValueError("GitHub connection required. Please connect your GitHub account first.")

    raw_token = decrypt_token(conn.access_token)
    if raw_token.startswith("gho_dev_demo"):
        logger.info(f"Returning demo repositories for user {u_uuid}")
        return MOCK_DEMO_REPOSITORIES

    headers = {
        "Authorization": f"Bearer {raw_token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "Sisya-Abhyasa-OAuth/1.0",
    }
    url = f"https://api.github.com/user/repos?page={page}&per_page={per_page}&sort={sort}&direction={direction}"
    try:
        res = httpx.get(url, headers=headers, timeout=15.0)
        if res.status_code == 401 or res.status_code == 403:
            raise ValueError("GitHub access token expired or revoked. Please reconnect GitHub.")
        res.raise_for_status()
        raw_repos = res.json()
    except httpx.HTTPError as exc:
        logger.error(f"GitHub API error fetching repositories: {exc}")
        raise ValueError("Could not fetch repositories from GitHub API.") from exc

    items = []
    for r in raw_repos:
        if r.get("archived"):
            continue
        items.append({
            "github_repo_id": str(r.get("id")),
            "repo_name": r.get("name", ""),
            "owner": r.get("owner", {}).get("login", ""),
            "full_name": r.get("full_name", ""),
            "description": r.get("description"),
            "visibility": "private" if r.get("private") else "public",
            "language": r.get("language"),
            "default_branch": r.get("default_branch", "main"),
            "html_url": r.get("html_url", ""),
            "stars": r.get("stargazers_count", 0),
            "forks": r.get("forks_count", 0),
            "updated_at": r.get("updated_at")
        })
    return items

def search_user_repositories(db: Session, user_id: UUID | str, query: str) -> list[dict]:
    all_repos = fetch_user_repositories(db, user_id, page=1, per_page=100)
    q = query.strip().lower()
    if not q:
        return all_repos

    filtered = []
    for r in all_repos:
        if (
            q in r["repo_name"].lower()
            or q in r["full_name"].lower()
            or q in r["owner"].lower()
        ):
            filtered.append(r)
    return filtered

def verify_project_access(db: Session, user_id: UUID | str, project_id: UUID | str) -> Project:
    u_uuid = _to_uuid(user_id)
    p_uuid = _to_uuid(project_id)

    project = db.scalar(select(Project).where(Project.id == p_uuid))
    if not project:
        raise ValueError("Project not found.")

    if project.creator_id == u_uuid:
        return project

    member = db.scalar(
        select(ProjectMember).where(
            ProjectMember.project_id == p_uuid,
            ProjectMember.user_id == u_uuid
        )
    )
    if not member:
        raise ValueError("You do not have permission to modify this project.")

    return project

def link_project_repository(
    db: Session,
    user_id: UUID | str,
    project_id: UUID | str,
    repository_id: str | int
) -> ProjectGithubRepository:
    u_uuid = _to_uuid(user_id)
    p_uuid = _to_uuid(project_id)
    repo_id_str = str(repository_id).strip()

    conn = get_github_connection(db, u_uuid)
    if not conn:
        raise ValueError("GitHub connection required. Please connect your GitHub account first.")

    project = verify_project_access(db, u_uuid, p_uuid)
    user_repos = fetch_user_repositories(db, u_uuid, page=1, per_page=100)

    target_repo = None
    for r in user_repos:
        if r["github_repo_id"] == repo_id_str or r["repo_name"] == repo_id_str or r["full_name"] == repo_id_str:
            target_repo = r
            break

    if not target_repo:
        raise ValueError("Repository not found or not accessible to your GitHub account.")

    existing_mapping = db.scalar(
        select(ProjectGithubRepository).where(ProjectGithubRepository.project_id == p_uuid)
    )

    now = datetime.now(timezone.utc)
    if existing_mapping:
        existing_mapping.github_connection_id = conn.id
        existing_mapping.github_repo_id = target_repo["github_repo_id"]
        existing_mapping.repo_name = target_repo["repo_name"]
        existing_mapping.owner = target_repo["owner"]
        existing_mapping.full_name = target_repo["full_name"]
        existing_mapping.description = target_repo["description"]
        existing_mapping.visibility = target_repo["visibility"]
        existing_mapping.language = target_repo["language"]
        existing_mapping.default_branch = target_repo["default_branch"]
        existing_mapping.html_url = target_repo["html_url"]
        existing_mapping.stars = target_repo["stars"]
        existing_mapping.forks = target_repo["forks"]
        existing_mapping.updated_at = now
        repo_record = existing_mapping
    else:
        repo_record = ProjectGithubRepository(
            project_id=p_uuid,
            github_connection_id=conn.id,
            github_repo_id=target_repo["github_repo_id"],
            repo_name=target_repo["repo_name"],
            owner=target_repo["owner"],
            full_name=target_repo["full_name"],
            description=target_repo["description"],
            visibility=target_repo["visibility"],
            language=target_repo["language"],
            default_branch=target_repo["default_branch"],
            html_url=target_repo["html_url"],
            stars=target_repo["stars"],
            forks=target_repo["forks"],
            linked_at=now,
            updated_at=now
        )
        db.add(repo_record)

    db.commit()
    db.refresh(repo_record)
    logger.info(f"Repository {target_repo['full_name']} linked to project {p_uuid}")
    return repo_record

def get_linked_repository(db: Session, project_id: UUID | str) -> ProjectGithubRepository | None:
    p_uuid = _to_uuid(project_id)
    return db.scalar(select(ProjectGithubRepository).where(ProjectGithubRepository.project_id == p_uuid))

def unlink_project_repository(db: Session, user_id: UUID | str, project_id: UUID | str) -> bool:
    u_uuid = _to_uuid(user_id)
    p_uuid = _to_uuid(project_id)

    verify_project_access(db, u_uuid, p_uuid)
    existing_mapping = db.scalar(
        select(ProjectGithubRepository).where(ProjectGithubRepository.project_id == p_uuid)
    )
    if existing_mapping:
        db.delete(existing_mapping)
        db.commit()
        logger.info(f"Unlinked repository from project {p_uuid}")
        return True
    return False
