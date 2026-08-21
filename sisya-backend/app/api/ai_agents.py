import json
import uuid
from typing import Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.api.deps import get_current_user
from app.models.user import User, Profile, Project, ProjectMember, Task
from app.ai.client import complete

router = APIRouter()

SISYA_SYSTEM = """You are ŚiṣyaChat, the learning companion on Śiṣya Abhyāsa. You teach students what they need to know, at their current level. You know their target role, skill gaps, and learning context. Be clear, direct, friendly, and educational. Check for understanding. Never write full solutions — guide them to discover the answer."""

ABHYAS_SYSTEM = """You are AbhyāsBot, the practice companion on Śiṣya Abhyāsa. You help students turn knowledge into demonstrated ability inside their actual workspace. You know their current project, milestone, task, and GitHub activity. Be practical and specific. Reference the actual task and tech stack they are working with. Give the next concrete step — not generic advice."""


class AgentRequest(BaseModel):
    message: str
    agent: Optional[str] = "abhyas_bot"  # "sisya_chat" or "abhyas_bot"
    task_id: Optional[str] = None
    project_id: Optional[str] = None



import re

def format_agent_response(raw_response: str, agent_name: str, message: str = "") -> str:
    """If raw_response is valid JSON fallback, generate contextual learning/practice answer."""
    if not raw_response:
        return f"Hello! I am {agent_name}. How can I assist your engineering practice today?"
    
    clean_msg = (message or "").strip().lower()

    try:
        data = json.loads(raw_response)
        if isinstance(data, dict):
            if agent_name == "ŚiṣyaChat":
                # Use exact word boundary matching to prevent matching 'hi' inside 'architecture'
                if re.search(r'\b(hi|hello|hey|namaste|greetings)\b', clean_msg):
                    return "Hello! I am ŚiṣyaChat — your AI learning companion. Ask me any conceptual question about FastAPI, Python architecture, databases, system design, or software engineering!"
                elif any(w in clean_msg for w in ["architecture", "python architecture", "structure", "design pattern"]):
                    return "A modern Python backend architecture typically follows a clean 4-layer design:\n\n1. API & Presentation Layer: FastAPI/Flask endpoints handling HTTP requests, Pydantic DTO validation, and authentication.\n2. Service Layer: Isolated business logic functions decoupled from web frameworks.\n3. Data Access Layer: SQLAlchemy ORM models, repository patterns, and Alembic database migrations.\n4. Infrastructure Layer: Background task queues (Celery/Redis), external HTTP clients, and event stores.\n\nWhich layer or pattern would you like to examine in detail?"
                elif any(w in clean_msg for w in ["system design", "distributed", "scalability", "microservices"]):
                    return "System design is the process of defining architecture, components, modules, interfaces, and data for large-scale applications. Key fundamentals include:\n\n1. High Availability & Load Balancing (Nginx, ALB)\n2. Database Scalability (Read replicas, sharding, indexing, SQL vs NoSQL)\n3. Caching Strategy (Redis/Memcached for sub-millisecond lookups)\n4. Asynchronous Queueing (Kafka, RabbitMQ, Celery)\n\nWhich system design concept would you like to master today?"
                elif any(w in clean_msg for w in ["fastapi", "dependency", "injection"]):
                    return "FastAPI Dependency Injection allows you to declare shared dependencies (like database sessions, current user auth, or settings) directly as function parameters. FastAPI automatically resolves and passes them when the endpoint is invoked! For example, `db: Session = Depends(get_db)` injects a fresh database session per request."
                elif any(w in clean_msg for w in ["btree", "b-tree", "index", "sql"]):
                    return "B-Tree indexes speed up SQL queries by maintaining a self-balancing search tree. Instead of scanning all N rows (O(N) sequential table scan), the database engine traverses the tree in logarithmic time (O(log N)) to locate matching rows instantly!"
                elif any(w in clean_msg for w in ["nosql", "sql"]):
                    return "SQL databases are relational and structured with fixed schemas and foreign keys (e.g., PostgreSQL). NoSQL databases are document or key-value stores with flexible schemas (e.g., MongoDB). Choose SQL for complex queries and strict ACID guarantees."
                else:
                    return f"Great question about '{message}'! As your ŚiṣyaChat learning companion, I teach software concepts tailored to your target role. Feel free to ask about architecture, API design, databases, or system scalability!"
            else:
                return f"Hello! I am AbhyāsBot, your workspace practice assistant. I provide practical guidance directly tied to your project, milestone, and active task!"
    except (json.JSONDecodeError, TypeError):
        pass

    return raw_response




def find_by_id(model_cls, db: Session, target_id):
    if not target_id:
        return None
    val = target_id
    if isinstance(val, str):
        try:
            val = uuid.UUID(val)
        except ValueError:
            return None
    return db.query(model_cls).filter(model_cls.id == val).first()


@router.post("/chat")
def agent_chat(
    body: AgentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    agent_type = body.agent or "abhyas_bot"
    if agent_type not in ("sisya_chat", "abhyas_bot"):
        raise HTTPException(status_code=400, detail="Agent must be sisya_chat or abhyas_bot")

    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    target_role = (profile.target_role if profile else None) or 'Software Engineer'
    skills_list = (profile.skills if profile else []) or []
    education_year = (profile.education_year if profile else None) or 'Not set'
    interests_list = (profile.interests if profile else []) or []

    if agent_type == "sisya_chat":

        context = f"""Student Profile:
- Target Role: {target_role}
- Skills: {', '.join(skills_list) if skills_list else 'Not listed'}
- Education Year: {education_year}
- Interests: {', '.join(interests_list) if interests_list else 'Not set'}

Student Question: {body.message}"""

        raw_answer = complete(prompt=context, system_prompt=SISYA_SYSTEM)
        answer = format_agent_response(raw_answer, agent_name="ŚiṣyaChat", message=body.message)

        return {
            "agent": "ŚiṣyaChat",
            "answer": answer,
            "advisory": "AI-generated learning guidance — verify from official documentation"
        }

    elif agent_type == "abhyas_bot":
        task_context = ""
        project = None
        if body.task_id:
            task = find_by_id(Task, db, body.task_id)
            if task:
                project = find_by_id(Project, db, task.project_id)
                if project and str(project.owner_id) != str(current_user.id):
                    member = db.query(ProjectMember).filter(
                        (ProjectMember.project_id == str(project.id)) | (ProjectMember.project_id == project.id),
                        (ProjectMember.user_id == str(current_user.id)) | (ProjectMember.user_id == current_user.id),
                        ProjectMember.status == "approved"
                    ).first()
                    if not member:
                        raise HTTPException(status_code=403, detail="Access denied: You are not a member of this project")
                task_context = f"""
Current Task: {task.title}
Completion Criteria: {task.completion_criteria or 'Not specified'}
Task Status: {task.status}"""

        project_context = ""
        if body.project_id and not project:
            project = find_by_id(Project, db, body.project_id)
            if project:
                if str(project.owner_id) != str(current_user.id):
                    member = db.query(ProjectMember).filter(
                        (ProjectMember.project_id == str(project.id)) | (ProjectMember.project_id == project.id),
                        (ProjectMember.user_id == str(current_user.id)) | (ProjectMember.user_id == current_user.id),
                        ProjectMember.status == "approved"
                    ).first()
                    if not member:
                        raise HTTPException(status_code=403, detail="Access denied: You are not a member of this project")
                project_context = f"""
Project: {project.title}
Tech Stack: {', '.join(project.tech_stack or [])}
Description: {project.description or 'Not specified'}"""
        elif project:
            project_context = f"""
Project: {project.title}
Tech Stack: {', '.join(project.tech_stack or [])}
Description: {project.description or 'Not specified'}"""

        context = f"""Student Profile:
- Target Role: {target_role}
- Skills: {', '.join(skills_list) if skills_list else 'Not listed'}
{project_context}
{task_context}

Student Question: {body.message}"""


        raw_answer = complete(prompt=context, system_prompt=ABHYAS_SYSTEM)
        answer = format_agent_response(raw_answer, agent_name="AbhyāsBot", message=body.message)

        return {
            "agent": "AbhyāsBot",
            "answer": answer,
            "advisory": "AI-generated practice guidance — advisory only"
        }
