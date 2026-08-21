"""
Śiṣya Abhyāsa Phase E9 — Skill Gap Engine

Provides canonical role-to-skill mappings and computes deterministic skill proficiency,
evidence count, and skill gap status strictly from database records (SkillEvidence).
Zero manufactured evidence. Zero mock static metrics.
"""

import uuid
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Any
from sqlalchemy.orm import Session
from sqlalchemy import select, func

from app.models.user import StudentProfile, User
from app.models.github import SkillEvidence, GithubPullRequest
from app.models.evaluations import UserSkillProficiency

# Canonical supported target roles & required skills configuration
ROLE_SKILL_MAP: Dict[str, List[str]] = {
    "Backend Developer": ["Python", "FastAPI", "PostgreSQL", "REST APIs", "Git", "Testing", "Docker"],
    "Frontend Developer": ["React", "TypeScript", "Next.js", "CSS", "Git", "REST APIs", "Testing"],
    "Full Stack Developer": ["Python", "FastAPI", "React", "TypeScript", "PostgreSQL", "Git", "Testing", "Docker"],
    "AI/ML Engineer": ["Python", "PyTorch", "Data Analysis", "REST APIs", "Git", "Testing", "Docker"],
    "DevOps Engineer": ["Docker", "Git", "CI/CD", "Linux", "Python", "Cloud Architecture", "Testing"],
}

DEFAULT_ROLE = "Backend Developer"

def get_target_role_for_user(db: Session, user_id: uuid.UUID) -> str:
    """Returns the student's target role from StudentProfile or default."""
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == user_id).first()
    if profile and profile.target_role and profile.target_role in ROLE_SKILL_MAP:
        return profile.target_role
    return DEFAULT_ROLE

def compute_evidence_freshness(last_date: datetime | None) -> str:
    """Categorizes evidence timestamp into RECENT, AGING, HISTORICAL, or MISSING."""
    if not last_date:
        return "MISSING"
    now = datetime.now(timezone.utc)
    if last_date.tzinfo is None:
        last_date = last_date.replace(tzinfo=timezone.utc)
    diff_days = (now - last_date).days
    if diff_days < 14:
        return "RECENT"
    elif diff_days <= 60:
        return "AGING"
    else:
        return "HISTORICAL"

def compute_student_skill_matrix(db: Session, user_id: uuid.UUID) -> List[Dict[str, Any]]:
    """
    Computes a deterministic skill matrix for the student's target role based strictly
    on real database records (SkillEvidence).
    """
    target_role = get_target_role_for_user(db, user_id)
    required_skills = ROLE_SKILL_MAP.get(target_role, ROLE_SKILL_MAP[DEFAULT_ROLE])

    # Fetch real SkillEvidence count and latest timestamp per skill for user
    evidence_stmt = (
        select(
            SkillEvidence.skill_name,
            func.count(SkillEvidence.id).label("ev_count"),
            func.max(SkillEvidence.created_at).label("last_created")
        )
        .where(SkillEvidence.user_id == user_id)
        .group_by(SkillEvidence.skill_name)
    )
    evidence_rows = db.execute(evidence_stmt).all()
    evidence_map = {row.skill_name: {"count": row.ev_count, "last_updated": row.last_created} for row in evidence_rows}

    skill_matrix = []
    for skill in required_skills:
        ev_info = evidence_map.get(skill, {"count": 0, "last_updated": None})
        count = ev_info["count"]
        last_date = ev_info["last_updated"]
        freshness = compute_evidence_freshness(last_date)

        if count >= 3:
            state = "STRONG"
            proficiency = "Advanced"
        elif count >= 1:
            state = "DEVELOPING"
            proficiency = "Intermediate"
        else:
            state = "CRITICAL_GAP"
            proficiency = "Missing Evidence"

        skill_matrix.append({
            "skill_name": skill,
            "category": "Core Tech",
            "required": True,
            "evidence_count": count,
            "freshness": freshness,
            "state": state,
            "proficiency": proficiency,
            "last_updated": last_date.isoformat() if last_date else None,
        })

    return skill_matrix

def compute_skill_gaps(db: Session, user_id: uuid.UUID) -> List[Dict[str, Any]]:
    """Returns ranked skill gaps (CRITICAL_GAP first, then DEVELOPING)."""
    matrix = compute_student_skill_matrix(db, user_id)
    gaps = [s for s in matrix if s["state"] in ("CRITICAL_GAP", "DEVELOPING")]
    # Rank: CRITICAL_GAP first, then DEVELOPING
    gaps.sort(key=lambda x: (0 if x["state"] == "CRITICAL_GAP" else 1, x["evidence_count"]))
    return gaps
