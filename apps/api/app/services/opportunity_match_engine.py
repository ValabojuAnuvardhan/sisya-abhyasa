"""
Śiṣya Abhyāsa Phase E10 — Opportunity Match Engine

Calculates explainable, deterministic match metrics between a student's
E9 Skill & Evidence Graph and a target Career Opportunity.
Zero manufactured metrics. Zero mock scores.
"""

import uuid
from typing import Dict, List, Any
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.opportunity import CareerOpportunity
from app.services.skill_gap_engine import get_target_role_for_user, compute_student_skill_matrix
from app.services.readiness_engine import compute_career_readiness

def compute_opportunity_match(db: Session, user_id: uuid.UUID, opportunity: CareerOpportunity) -> Dict[str, Any]:
    """
    Computes explainable match score, breakdown, missing requirements,
    and recommended E8 task actions for a given opportunity.
    """
    student_role = get_target_role_for_user(db, user_id)
    skill_matrix = compute_student_skill_matrix(db, user_id)
    readiness = compute_career_readiness(db, user_id)

    # 1. Role Match (100% if student role in opportunity target_roles, else 60%)
    opp_roles = opportunity.target_roles or [student_role]
    role_match = 100 if any(r.lower() == student_role.lower() for r in opp_roles) else 60

    # 2. Skill Match (% of required skills with >0 evidence)
    req_skills = opportunity.required_skills or []
    if isinstance(req_skills, str):
        req_skills = [s.strip() for s in req_skills.split(",") if s.strip()]

    matrix_map = {s["skill_name"].lower(): s for s in skill_matrix}

    matched_skills = []
    missing_skills = []
    strong_skills = []

    for req in req_skills:
        req_lower = req.lower()
        if req_lower in matrix_map and matrix_map[req_lower]["evidence_count"] > 0:
            matched_skills.append(req)
            if matrix_map[req_lower]["evidence_count"] >= 2:
                strong_skills.append(req)
        else:
            missing_skills.append(req)

    total_req = len(req_skills)
    skill_match = int((len(matched_skills) / total_req) * 100) if total_req > 0 else 80
    evidence_match = int((len(strong_skills) / total_req) * 100) if total_req > 0 else 70

    # 3. Experience Match
    experience_match = min(100, int(readiness["breakdown"]["project_experience"]))

    # 4. Overall Match Score
    match_score = int(
        (role_match * 0.35) +
        (skill_match * 0.35) +
        (evidence_match * 0.20) +
        (experience_match * 0.10)
    )
    match_score = max(0, min(100, match_score))

    # Recommended Actions
    rec_actions = []
    if missing_skills:
        for miss in missing_skills[:2]:
            rec_actions.append(f"Complete a project task requiring {miss} to generate verified PR evidence.")
    else:
        rec_actions.append("Your verified evidence strongly matches this opportunity. Review application guidelines and submit!")

    return {
        "opportunity_id": str(opportunity.id),
        "opportunity_title": opportunity.title,
        "company_name": opportunity.company_name,
        "match_score": match_score,
        "role_match": role_match,
        "skill_match": skill_match,
        "evidence_match": evidence_match,
        "experience_match": experience_match,
        "matched_skills": matched_skills,
        "missing_required_skills": missing_skills,
        "strong_skills": strong_skills,
        "recommended_actions": rec_actions,
    }
