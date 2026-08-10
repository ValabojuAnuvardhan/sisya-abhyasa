from abc import ABC, abstractmethod
from typing import Dict, Any
from app.models.github import GithubCommit, GithubPullRequest

class BaseSourceAdapter(ABC):
    @abstractmethod
    def normalize_commit(self, commit: Any) -> Dict[str, Any]:
        pass

    @abstractmethod
    def normalize_pull_request(self, pr: Any) -> Dict[str, Any]:
        pass

class GithubAdapter(BaseSourceAdapter):
    def normalize_commit(self, commit: GithubCommit) -> Dict[str, Any]:
        return {
            "source": "github",
            "artifact_type": "commit",
            "artifact_reference": str(commit.id),
            "provider_entity_id": commit.sha,
            "origin": "sync",
            "created_from": "Github Sync Pipeline",
            "metadata": {
                "sha": commit.sha,
                "short_sha": commit.sha[:7] if commit.sha else "",
                "message": commit.message or "",
                "author": commit.github_actor_login or "contributor",
                "committed_at": commit.committed_at.isoformat() if commit.committed_at else None
            }
        }

    def normalize_pull_request(self, pr: GithubPullRequest) -> Dict[str, Any]:
        return {
            "source": "github",
            "artifact_type": "pull_request",
            "artifact_reference": str(pr.id),
            "provider_entity_id": str(pr.number),
            "origin": "sync",
            "created_from": "Github Sync Pipeline",
            "metadata": {
                "pr_number": pr.number,
                "title": pr.title or "",
                "state": pr.state or "open",
                "merged": pr.merged,
                "author": pr.github_actor_login or "contributor"
            }
        }
