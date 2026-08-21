"""
Śiṣya Abhyāsa Phase E10 — Resume Alignment Engine

Inspects student's verified evidence graph and compares against resume/target role claims.
Categorizes claims into supported_skills (backed by verified PRs) and unsupported_claims.
Zero manufactured claims.
"""

import uuid
from typing import Dict, List, Any
from sqlalchemy.orm import Session

from app.services.skill_gap_engine import compute_student_skill_matrix

def compute_resume_alignment(db: Session, user_id: uuid.UUID) -> Dict[str, Any]:
    matrix = compute_student_skill_matrix(db, user_id)

    supported_skills = []
    missing_skills = []
    unsupported_claims = []

    for item in matrix:
        if item["evidence_count"] > 0:
            supported_skills.append({
                "skill": item["skill_name"],
                "evidence_count": item["evidence_count"],
                "status": "VERIFIED_EVIDENCE",
                "explanation": f"Supported by {item['evidence_count']} merged PR webhook(s)",
            })
        else:
            missing_skills.append(item["skill_name"])
            unsupported_claims.append({
                "claim": f"Proficient in {item['skill_name']}",
                "status": "UNSUPPORTED",
                "warning": f"No verified engineering PR evidence found for {item['skill_name']}.",
            })

    total = len(matrix)
    supported_pct = int((len(supported_skills) / total) * 100) if total > 0 else 0

    return {
        "user_id": str(user_id),
        "supported_percentage": supported_pct,
        "supported_skills": supported_skills,
        "missing_skills": missing_skills,
        "unsupported_claims": unsupported_claims,
    }
