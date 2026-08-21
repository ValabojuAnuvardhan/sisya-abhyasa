"""
Śiṣya Abhyāsa Phase E10 — Interview Preparation Engine

Generates targeted interview prep topics and questions tailored to the student's
target role, E9 skill gaps, and verified projects/PRs.
Practicing yields 0 skill evidence (tracking only).
"""

import uuid
from typing import Dict, List, Any
from sqlalchemy.orm import Session

from app.services.skill_gap_engine import get_target_role_for_user, compute_skill_gaps, compute_student_skill_matrix

INTERVIEW_QUESTIONS_BY_SKILL = {
    "Python": [
        "How do Python's memory management and garbage collection mechanisms work?",
        "Explain the difference between threading and multiprocessing in Python.",
    ],
    "FastAPI": [
        "How does FastAPI achieve high performance using async def and Pydantic validation?",
        "Explain Dependency Injection in FastAPI and how to mock dependencies in pytest.",
    ],
    "PostgreSQL": [
        "What is indexing in PostgreSQL, and when should you use a B-tree vs GIN index?",
        "Explain database transactions, ACID guarantees, and isolation levels.",
    ],
    "Docker": [
        "Explain the difference between a Docker image layer, container, and volume.",
        "How do multi-stage builds optimize production Docker container size?",
    ],
    "Testing": [
        "What is the difference between unit testing, integration testing, and E2E testing?",
        "How do fixtures and mocking work in pytest?",
    ],
}

def generate_interview_plan(db: Session, user_id: uuid.UUID) -> Dict[str, Any]:
    target_role = get_target_role_for_user(db, user_id)
    gaps = compute_skill_gaps(db, user_id)
    matrix = compute_student_skill_matrix(db, user_id)

    topics = []
    questions = []

    for item in matrix:
        skill = item["skill_name"]
        q_list = INTERVIEW_QUESTIONS_BY_SKILL.get(skill, [f"Explain core concepts and best practices in {skill}."])
        topics.append({
            "topic": skill,
            "readiness": "HIGH" if item["state"] == "STRONG" else "MEDIUM" if item["state"] == "DEVELOPING" else "LOW",
            "evidence_count": item["evidence_count"],
        })
        for q in q_list:
            questions.append({
                "skill": skill,
                "question": q,
                "focus_area": "Critical Skill Gap" if item["state"] == "CRITICAL_GAP" else "Verified Skill Application",
            })

    return {
        "user_id": str(user_id),
        "target_role": target_role,
        "primary_focus_gap": gaps[0]["skill_name"] if gaps else None,
        "topics": topics,
        "questions": questions,
    }
