import json
import re
from app.ai.client import complete
from app.schemas.project_architect import (
    ProjectArchitectRequest,
    ProjectArchitectResponse,
)


SYSTEM_PROMPT = """You are an expert software architect and technical project advisor for student developers.
Your job is to transform a student's project idea into a realistic, structured, actionable project blueprint.

You MUST respond with ONLY a raw, valid JSON object without any preamble or markdown explanation.
The JSON object MUST follow this exact schema:

{
  "title": "Clear, Professional Project Title",
  "description": "Comprehensive 2-3 sentence project overview describing core problem and solution.",
  "tech_stack": ["Technology1", "Technology2", "Technology3", "Technology4"],
  "skills": ["Skill1", "Skill2", "Skill3", "Skill4"],
  "estimated_weeks": 6,
  "milestones": [
    {
      "title": "Milestone 1: Project Setup & Data Modeling",
      "description": "Set up project repository, environment configuration, database schemas, and initial API routes.",
      "estimated_weeks": 1
    },
    {
      "title": "Milestone 2: Core Feature Implementation",
      "description": "Build primary business logic and essential data persistence flows.",
      "estimated_weeks": 2
    }
  ]
}
"""


def generate_project_architecture(request: ProjectArchitectRequest) -> ProjectArchitectResponse:
    user_prompt = (
        f"Project Idea: {request.idea}\n"
        f"Target Users: {request.target_users}\n"
        f"Target Difficulty Level: {request.difficulty}\n"
        f"Available Timeframe: {request.available_weeks} weeks\n\n"
        "Generate a structured technical architecture plan matching the JSON schema."
    )

    raw_response = complete(prompt=user_prompt, system_prompt=SYSTEM_PROMPT)

    # Clean markdown code blocks if returned
    clean_json = raw_response.strip()
    if clean_json.startswith("```"):
        clean_json = re.sub(r"^```(?:json)?\s*", "", clean_json)
        clean_json = re.sub(r"\s*```$", "", clean_json)
    clean_json = clean_json.strip()

    data = json.loads(clean_json)
    return ProjectArchitectResponse.model_validate(data)


def generate_project_structure(prompt: str) -> dict:
    req = ProjectArchitectRequest(idea=prompt, target_users="Students", difficulty="intermediate", available_weeks=6)
    res = generate_project_architecture(req)
    return res.model_dump()

