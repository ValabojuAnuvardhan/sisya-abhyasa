import uuid
from datetime import datetime, timezone
from typing import Dict, Any
import httpx
from sqlalchemy.orm import Session

from app.github.models import (
    GithubConnection,
    ProjectGithubRepository,
    GithubSyncLog,
)
from app.models.github import GithubCommit, GithubPullRequest, ProjectRepository
from app.github.oauth import decrypt_token

GITHUB_API_BASE = "https://api.github.com"

class GitHubSyncService:
    @staticmethod
    def sync_project_repository(db: Session, project_id: uuid.UUID) -> Dict[str, Any]:
        sync_log = GithubSyncLog(
            project_id=project_id,
            status="in_progress",
            started_at=datetime.now(timezone.utc)
        )
        db.add(sync_log)
        db.commit()
        db.refresh(sync_log)

        try:
            linked_repo = db.query(ProjectGithubRepository).filter(
                ProjectGithubRepository.project_id == project_id
            ).first()

            if not linked_repo:
                raise ValueError("No GitHub repository linked to this project.")

            conn = db.query(GithubConnection).filter(
                GithubConnection.id == linked_repo.github_connection_id
            ).first()

            if not conn:
                raise ValueError("No active GitHub OAuth connection found.")

            # Ensure baseline ProjectRepository record exists for relational FKs
            legacy_repo = db.query(ProjectRepository).filter(
                ProjectRepository.project_id == project_id
            ).first()
            if not legacy_repo:
                try:
                    repo_id_int = int(linked_repo.github_repo_id) if linked_repo.github_repo_id.isdigit() else 100000 + hash(linked_repo.repo_name) % 800000
                except ValueError:
                    repo_id_int = 100001

                legacy_repo = ProjectRepository(
                    project_id=project_id,
                    github_installation_id=123456,
                    github_repository_id=repo_id_int,
                    owner=linked_repo.owner,
                    name=linked_repo.repo_name,
                    full_name=linked_repo.full_name,
                    html_url=linked_repo.html_url,
                    is_private=(linked_repo.visibility == 'private')
                )
                db.add(legacy_repo)
                db.commit()
                db.refresh(legacy_repo)

            raw_token = decrypt_token(conn.access_token)
            headers = {
                "Authorization": f"Bearer {raw_token}",
                "Accept": "application/vnd.github.v3+json",
                "User-Agent": "Sisya-Abhyasa-App"
            }

            owner = linked_repo.owner
            repo = linked_repo.repo_name

            # 1. Fetch Commits
            commits_synced = 0
            try:
                commit_resp = httpx.get(
                    f"{GITHUB_API_BASE}/repos/{owner}/{repo}/commits",
                    headers=headers,
                    params={"per_page": 30},
                    timeout=10.0
                )
                if commit_resp.status_code == 200:
                    commit_data = commit_resp.json()
                    for item in commit_data:
                        sha = item.get("sha")
                        if not sha:
                            continue
                        existing_commit = db.query(GithubCommit).filter(
                            GithubCommit.repository_id == legacy_repo.id,
                            GithubCommit.sha == sha
                        ).first()
                        commit_meta = item.get("commit", {})
                        author_meta = commit_meta.get("author", {})
                        
                        commit_date_str = author_meta.get("date")
                        commit_date = datetime.fromisoformat(commit_date_str.replace("Z", "+00:00")) if commit_date_str else datetime.now(timezone.utc)

                        if not existing_commit:
                            new_commit = GithubCommit(
                                repository_id=legacy_repo.id,
                                user_id=conn.user_id,
                                github_actor_login=author_meta.get("name", conn.username),
                                sha=sha,
                                message=commit_meta.get("message", "Commit update"),
                                html_url=item.get("html_url", f"{linked_repo.html_url}/commit/{sha}"),
                                committed_at=commit_date
                            )
                            db.add(new_commit)
                            commits_synced += 1
            except Exception as e:
                print(f"[Sync Warning] Commits fetch fallback: {e}")

            # 2. Fetch Pull Requests
            prs_synced = 0
            try:
                pr_resp = httpx.get(
                    f"{GITHUB_API_BASE}/repos/{owner}/{repo}/pulls",
                    headers=headers,
                    params={"state": "all", "per_page": 30},
                    timeout=10.0
                )
                if pr_resp.status_code == 200:
                    pr_data = pr_resp.json()
                    for item in pr_data:
                        pr_num = item.get("number")
                        if not pr_num:
                            continue
                        existing_pr = db.query(GithubPullRequest).filter(
                            GithubPullRequest.repository_id == legacy_repo.id,
                            GithubPullRequest.number == pr_num
                        ).first()

                        created_str = item.get("created_at")
                        created_date = datetime.fromisoformat(created_str.replace("Z", "+00:00")) if created_str else datetime.now(timezone.utc)

                        state = "merged" if item.get("merged_at") else item.get("state", "open")

                        if not existing_pr:
                            new_pr = GithubPullRequest(
                                repository_id=legacy_repo.id,
                                user_id=conn.user_id,
                                github_actor_login=item.get("user", {}).get("login", conn.username),
                                number=pr_num,
                                title=item.get("title", f"Pull Request #{pr_num}"),
                                state=state,
                                merged=bool(item.get("merged_at")),
                                html_url=item.get("html_url", f"{linked_repo.html_url}/pull/{pr_num}"),
                                updated_at_github=created_date
                            )
                            db.add(new_pr)
                            prs_synced += 1
                        else:
                            existing_pr.state = state
                            existing_pr.merged = bool(item.get("merged_at"))
            except Exception as e:
                print(f"[Sync Warning] PRs fetch fallback: {e}")

            # Update sync log & connection last sync time
            sync_log.status = "success"
            sync_log.commits_synced = commits_synced
            sync_log.prs_synced = prs_synced
            sync_log.completed_at = datetime.now(timezone.utc)
            conn.last_sync = datetime.now(timezone.utc)

            db.commit()

            return {
                "status": "success",
                "project_id": str(project_id),
                "commits_synced": commits_synced,
                "prs_synced": prs_synced,
                "synced_at": sync_log.completed_at.isoformat()
            }

        except Exception as err:
            db.rollback()
            sync_log.status = "failed"
            sync_log.error_message = str(err)
            sync_log.completed_at = datetime.now(timezone.utc)
            db.commit()
            raise err

    @staticmethod
    def get_sync_status(db: Session, project_id: uuid.UUID) -> Dict[str, Any]:
        log = db.query(GithubSyncLog).filter(
            GithubSyncLog.project_id == project_id
        ).order_by(GithubSyncLog.started_at.desc()).first()

        legacy_repo = db.query(ProjectRepository).filter(
            ProjectRepository.project_id == project_id
        ).first()

        commit_count = db.query(GithubCommit).filter(GithubCommit.repository_id == legacy_repo.id).count() if legacy_repo else 0
        pr_count = db.query(GithubPullRequest).filter(GithubPullRequest.repository_id == legacy_repo.id).count() if legacy_repo else 0

        if not log:
            return {
                "status": "idle",
                "commits_synced": commit_count,
                "prs_synced": pr_count,
                "last_sync": None
            }

        return {
            "status": log.status,
            "commits_synced": commit_count,
            "prs_synced": pr_count,
            "last_sync": log.completed_at.isoformat() if log.completed_at else log.started_at.isoformat(),
            "error": log.error_message
        }
