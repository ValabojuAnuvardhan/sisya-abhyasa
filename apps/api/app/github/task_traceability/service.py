import uuid
from typing import Dict, Any
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.user import User
from app.models.github import GithubCommit, GithubPullRequest
from app.github.task_traceability.models import TaskGitBranch, TaskCommit, TaskPullRequest
from app.github.task_traceability.schemas import (
    AssignBranchRequest,
    LinkCommitRequest,
    LinkPullRequestRequest,
    TaskTraceabilityStatusResponse,
    TaskTraceabilityChainResponse,
)
from app.github.task_traceability.validators import (
    validate_task_and_project_access,
    validate_commit_repo_match,
    validate_pr_repo_match,
)
from app.github.task_traceability.matcher import TraceabilityMatcher

class TaskTraceabilityService:
    @classmethod
    def assign_branch(cls, db: Session, user: User, task_id: uuid.UUID, payload: AssignBranchRequest) -> TaskTraceabilityStatusResponse:
        task, milestone, project = validate_task_and_project_access(db, user, task_id)

        existing = db.scalar(
            select(TaskGitBranch).where(
                TaskGitBranch.task_id == task.id,
                TaskGitBranch.branch_name == payload.branch_name
            )
        )
        if not existing:
            branch_rec = TaskGitBranch(
                task_id=task.id,
                project_id=project.id,
                branch_name=payload.branch_name
            )
            db.add(branch_rec)
            if task.status in ['todo', 'draft']:
                task.status = 'in_progress'
            db.commit()

        return cls.get_task_traceability_status(db, user, task_id)

    @classmethod
    def link_commit(cls, db: Session, user: User, task_id: uuid.UUID, payload: LinkCommitRequest) -> TaskTraceabilityStatusResponse:
        task, milestone, project = validate_task_and_project_access(db, user, task_id)
        gh_commit = validate_commit_repo_match(db, project.id, payload.commit_sha)

        existing = db.scalar(
            select(TaskCommit).where(
                TaskCommit.task_id == task.id,
                TaskCommit.github_commit_id == gh_commit.id
            )
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Commit '{gh_commit.sha[:7]}' is already linked to this task"
            )

        # Store FK reference only (zero metadata duplication)
        commit_rec = TaskCommit(
            task_id=task.id,
            github_commit_id=gh_commit.id
        )
        db.add(commit_rec)
        if task.status in ['todo', 'draft']:
            task.status = 'in_progress'
        db.commit()

        return cls.get_task_traceability_status(db, user, task_id)

    @classmethod
    def link_pull_request(cls, db: Session, user: User, task_id: uuid.UUID, payload: LinkPullRequestRequest) -> TaskTraceabilityStatusResponse:
        task, milestone, project = validate_task_and_project_access(db, user, task_id)
        gh_pr = validate_pr_repo_match(db, project.id, payload.pr_number)

        existing_other = db.scalar(
            select(TaskPullRequest).where(
                TaskPullRequest.github_pr_id == gh_pr.id,
                TaskPullRequest.task_id != task.id
            )
        )
        if existing_other:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Pull Request #{payload.pr_number} is already linked to another task"
            )

        task_pr = db.scalar(select(TaskPullRequest).where(TaskPullRequest.task_id == task.id))
        if not task_pr:
            # Store FK reference only (zero metadata duplication)
            task_pr = TaskPullRequest(
                task_id=task.id,
                github_pr_id=gh_pr.id
            )
            db.add(task_pr)
        else:
            task_pr.github_pr_id = gh_pr.id

        # Update legacy/synchronization model for reverse compatibility
        gh_pr.task_id = task.id

        if gh_pr.merged:
            task.status = 'done'
        elif task.status in ['todo', 'in_progress']:
            task.status = 'in_review'

        db.commit()

        return cls.get_task_traceability_status(db, user, task_id)

    @classmethod
    def auto_link_evidence(cls, db: Session, user: User, task_id: uuid.UUID) -> TaskTraceabilityStatusResponse:
        task, milestone, project = validate_task_and_project_access(db, user, task_id)

        candidates = TraceabilityMatcher.auto_detect_evidence(db, project.id, task)

        # Auto-assign first candidate branch if unassigned
        existing_branch = db.scalar(select(TaskGitBranch).where(TaskGitBranch.task_id == task.id))
        if not existing_branch and candidates["candidate_branches"]:
            branch_rec = TaskGitBranch(
                task_id=task.id,
                project_id=project.id,
                branch_name=candidates["candidate_branches"][0]
            )
            db.add(branch_rec)

        # Auto-link candidate commits
        candidate_commits = TraceabilityMatcher.find_commit_candidates(db, project.id, task)
        for c in candidate_commits:
            already = db.scalar(select(TaskCommit).where(TaskCommit.task_id == task.id, TaskCommit.github_commit_id == c.id))
            if not already:
                db.add(TaskCommit(task_id=task.id, github_commit_id=c.id))

        # Auto-link candidate PR
        candidate_prs = TraceabilityMatcher.find_pr_candidates(db, project_id=project.id, task=task)
        if candidate_prs:
            target_pr = candidate_prs[0]
            already_pr = db.scalar(select(TaskPullRequest).where(TaskPullRequest.task_id == task.id))
            if not already_pr:
                db.add(TaskPullRequest(task_id=task.id, github_pr_id=target_pr.id))
                target_pr.task_id = task.id
                if target_pr.merged:
                    task.status = 'done'

        db.commit()
        return cls.get_task_traceability_status(db, user, task_id)

    @classmethod
    def unlink_pull_request(cls, db: Session, user: User, task_id: uuid.UUID) -> Dict[str, Any]:
        task, milestone, project = validate_task_and_project_access(db, user, task_id)
        task_pr = db.scalar(select(TaskPullRequest).where(TaskPullRequest.task_id == task.id))
        if not task_pr:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No active pull request linked to this task")

        db.delete(task_pr)
        db.commit()
        return {"unlinked": True, "message": "Pull request unlinked successfully"}

    @classmethod
    def get_task_traceability_status(cls, db: Session, user: User, task_id: uuid.UUID) -> TaskTraceabilityStatusResponse:
        task, milestone, project = validate_task_and_project_access(db, user, task_id)

        branch = db.scalar(select(TaskGitBranch).where(TaskGitBranch.task_id == task.id))
        commits = db.scalars(select(TaskCommit).where(TaskCommit.task_id == task.id)).all()
        task_pr = db.scalar(select(TaskPullRequest).where(TaskPullRequest.task_id == task.id))

        has_branch = bool(branch)
        has_commits = len(commits) > 0
        has_pr = bool(task_pr)

        is_merged = False
        if task_pr:
            gh_pr = db.scalar(select(GithubPullRequest).where(GithubPullRequest.id == task_pr.github_pr_id))
            if gh_pr and gh_pr.merged:
                is_merged = True

        # Traceability Score % Computation (0%, 25%, 50%, 75%, 100%)
        if is_merged:
            score = 100
            display_status = "Merged"
        elif has_pr:
            score = 75
            display_status = "In Review"
        elif has_commits:
            score = 50
            display_status = "In Progress"
        elif has_branch:
            score = 25
            display_status = "In Progress"
        else:
            score = 0
            display_status = "Not Started"

        return TaskTraceabilityStatusResponse(
            task_id=str(task.id),
            status=display_status,
            traceability_score_pct=score,
            branch_assigned=has_branch,
            commits_count=len(commits),
            pr_linked=has_pr,
            merged=is_merged,
        )

    @classmethod
    def get_traceability_chain(cls, db: Session, user: User, task_id: uuid.UUID) -> TaskTraceabilityChainResponse:
        task, milestone, project = validate_task_and_project_access(db, user, task_id)

        branch_rec = db.scalar(select(TaskGitBranch).where(TaskGitBranch.task_id == task.id))
        
        # Dynamically join with GithubCommit table (zero metadata duplication!)
        commit_links = db.scalars(select(TaskCommit).where(TaskCommit.task_id == task.id)).all()
        commit_ids = [cl.github_commit_id for cl in commit_links]
        gh_commits = db.scalars(select(GithubCommit).where(GithubCommit.id.in_(commit_ids)).order_by(GithubCommit.committed_at.desc())).all() if commit_ids else []

        # Dynamically join with GithubPullRequest table
        task_pr = db.scalar(select(TaskPullRequest).where(TaskPullRequest.task_id == task.id))
        gh_pr = db.scalar(select(GithubPullRequest).where(GithubPullRequest.id == task_pr.github_pr_id)) if task_pr else None

        branch_data = {
            "branch_name": branch_rec.branch_name,
            "created_at": branch_rec.created_at.isoformat()
        } if branch_rec else None

        commits_data = [
            {
                "id": str(c.id),
                "commit_sha": c.sha[:7],
                "full_sha": c.sha,
                "author": c.github_actor_login or 'contributor',
                "message": c.message,
                "committed_at": c.committed_at.isoformat() if c.committed_at else c.created_at.isoformat()
            } for c in gh_commits
        ]

        pr_data = {
            "id": str(gh_pr.id),
            "pr_number": gh_pr.number,
            "status": gh_pr.state,
            "merged": gh_pr.merged,
            "review_state": "approved" if gh_pr.merged else "pending",
            "created_at": gh_pr.created_at.isoformat()
        } if gh_pr else None

        status_info = cls.get_task_traceability_status(db, user, task_id)

        return TaskTraceabilityChainResponse(
            task_id=str(task.id),
            task_title=task.title,
            project_id=str(project.id),
            branch=branch_data,
            commits=commits_data,
            pull_request=pr_data,
            traceability_score_pct=status_info.traceability_score_pct,
            status=status_info.status,
        )
