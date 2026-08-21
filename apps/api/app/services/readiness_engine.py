"""
Śiṣya Abhyāsa Phase E9 — Career Readiness Engine

Calculates explainable, deterministic career readiness scores, levels, metrics,
and recommendation links connecting E9 skill gaps directly to E8 task execution.
Zero mock data. Zero manufactured metrics.
"""

import uuid
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Any
from sqlalchemy.orm import Session
from sqlalchemy import select, func

from app.services.skill_gap_engine import (
    get_target_role_for_user,
    compute_student_skill_matrix,
    compute_skill_gaps,
)
from app.models.project import Project, ProjectMember, Task
from app.models.github import SkillEvidence, GithubPullRequest

def get_readiness_level(score: int) -> str:
    if score >= 85:
        return "JOB_READY"
    elif score >= 70:
        return "PROVING"
    elif score >= 50:
        return "BUILDING"
    elif score >= 25:
        return "DEVELOPING"
    else:
        return "EXPLORING"

def compute_career_readiness(db: Session, user_id: uuid.UUID) -> Dict[str, Any]:
    """
    Computes explainable career readiness score, level, breakdowns, and gaps
    strictly from database records.
    """
    target_role = get_target_role_for_user(db, user_id)
    matrix = compute_student_skill_matrix(db, user_id)

    total_required = len(matrix)
    skills_with_evidence = [s for s in matrix if s["evidence_count"] > 0]
    total_evidence_count = sum(s["evidence_count"] for s in matrix)

    # 1. Skill Coverage (% of required skills with at least 1 evidence)
    skill_coverage = int((len(skills_with_evidence) / total_required) * 100) if total_required > 0 else 0

    # 2. Evidence Strength (scaled by total verified evidence)
    evidence_strength = min(100, int(total_evidence_count * 15))

    # 3. Project Experience (count of distinct projects user is member/creator of)
    project_stmt = select(func.count(func.distinct(ProjectMember.project_id))).where(ProjectMember.user_id == user_id)
    proj_count = db.scalar(project_stmt) or 0
    creator_proj_stmt = select(func.count(Project.id)).where(Project.creator_id == user_id)
    creator_count = db.scalar(creator_proj_stmt) or 0
    total_projects = max(proj_count, creator_count)
    project_experience = min(100, total_projects * 33)

    # 4. Recent Activity (% of evidence created in past 30 days)
    now = datetime.now(timezone.utc)
    recent_cutoff = now - timedelta(days=30)
    recent_ev_stmt = (
        select(func.count(SkillEvidence.id))
        .where(SkillEvidence.user_id == user_id, SkillEvidence.created_at >= recent_cutoff)
    )
    recent_ev_count = db.scalar(recent_ev_stmt) or 0
    recent_activity = min(100, recent_ev_count * 25) if total_evidence_count > 0 else 0

    # 5. Role Alignment (weighted combination)
    role_alignment = int((skill_coverage * 0.5) + (evidence_strength * 0.5))

    # Overall Readiness Score (Weighted Average)
    raw_score = int(
        (skill_coverage * 0.35) +
        (evidence_strength * 0.25) +
        (project_experience * 0.20) +
        (recent_activity * 0.10) +
        (role_alignment * 0.10)
    )
    readiness_score = max(0, min(100, raw_score))
    readiness_level = get_readiness_level(readiness_score)

    gaps = compute_skill_gaps(db, user_id)

    return {
        "user_id": str(user_id),
        "target_role": target_role,
        "readiness_score": readiness_score,
        "readiness_level": readiness_level,
        "breakdown": {
            "skill_coverage": skill_coverage,
            "evidence_strength": evidence_strength,
            "project_experience": project_experience,
            "recent_activity": recent_activity,
            "role_alignment": role_alignment,
        },
        "total_skills": total_required,
        "skills_proven": len(skills_with_evidence),
        "total_evidence_items": total_evidence_count,
        "critical_gaps": gaps[:3],
    }
