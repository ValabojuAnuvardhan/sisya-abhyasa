import re
import uuid
from typing import List, Dict, Any
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.project import Task
from app.models.github import ProjectRepository, GithubCommit, GithubPullRequest

class TraceabilityMatcher:
    @classmethod
    def _get_project_repo_id(cls, db: Session, project_id: uuid.UUID) -> uuid.UUID | None:
        repo = db.scalar(select(ProjectRepository).where(ProjectRepository.project_id == project_id))
        return repo.id if repo else None

    @classmethod
    def find_branch_candidates(cls, db: Session, project_id: uuid.UUID, task: Task) -> List[str]:
        repo_id = cls._get_project_repo_id(db, project_id)
        if not repo_id:
            return []

        # Generate search patterns from task title & position/id
        clean_title = re.sub(r'[^a-zA-Z0-9\s-]', '', task.title.lower()).replace(' ', '-')
        patterns = [
            f"feature/{clean_title}",
            f"task-{task.position}",
            f"task/{clean_title}",
            f"feature/task-{task.position}"
        ]

        # Query unique author/actor logins or commit messages for potential branch hints
        commits = db.scalars(
            select(GithubCommit).where(GithubCommit.repository_id == repo_id).limit(100)
        ).all()

        found_branches = set()
        for c in commits:
            msg_lower = (c.message or '').lower()
            if f"task-{task.position}" in msg_lower or clean_title in msg_lower:
                found_branches.add(f"feature/{clean_title}")

        if not found_branches and patterns:
            found_branches.add(patterns[0])

        return list(found_branches)

    @classmethod
    def find_commit_candidates(cls, db: Session, project_id: uuid.UUID, task: Task) -> List[GithubCommit]:
        repo_id = cls._get_project_repo_id(db, project_id)
        if not repo_id:
            return []

        commits = db.scalars(
            select(GithubCommit).where(GithubCommit.repository_id == repo_id)
        ).all()

        task_num_str = str(task.position)
        task_title_words = [w.lower() for w in task.title.split() if len(w) > 3]

        matched = []
        for c in commits:
            msg = c.message or ''
            msg_lower = msg.lower()

            # Check matching patterns: #21, TASK-21, Task 21, Fixes #21
            num_match = (
                f"#{task_num_str}" in msg or
                f"task-{task_num_str}" in msg_lower or
                f"task {task_num_str}" in msg_lower
            )

            # Check matching keywords from task title
            title_match = any(word in msg_lower for word in task_title_words) if task_title_words else False

            if num_match or title_match:
                matched.append(c)

        return matched

    @classmethod
    def find_pr_candidates(cls, db: Session, project_id: uuid.UUID, task: Task) -> List[GithubPullRequest]:
        repo_id = cls._get_project_repo_id(db, project_id)
        if not repo_id:
            return []

        prs = db.scalars(
            select(GithubPullRequest).where(GithubPullRequest.repository_id == repo_id)
        ).all()

        task_num_str = str(task.position)
        task_title_words = [w.lower() for w in task.title.split() if len(w) > 3]

        matched = []
        for pr in prs:
            title = pr.title or ''
            title_lower = title.lower()

            num_match = (
                f"#{task_num_str}" in title or
                f"task-{task_num_str}" in title_lower or
                f"task {task_num_str}" in title_lower
            )

            title_match = any(word in title_lower for word in task_title_words) if task_title_words else False

            if num_match or title_match:
                matched.append(pr)

        return matched

    @classmethod
    def auto_detect_evidence(cls, db: Session, project_id: uuid.UUID, task: Task) -> Dict[str, Any]:
        branches = cls.find_branch_candidates(db, project_id, task)
        commits = cls.find_commit_candidates(db, project_id, task)
        prs = cls.find_pr_candidates(db, project_id, task)

        return {
            "candidate_branches": branches,
            "candidate_commits": [c.sha for c in commits],
            "candidate_prs": [pr.number for pr in prs],
        }
