import uuid
from typing import List, Dict, Any
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload
from app.models.user import User, StudentProfile
from app.models.learn import LearningRoadmap, LearningRoadmapNode

def generate_roadmap_nodes_for_profile(role: str, experience: str, skills: List[str]) -> List[Dict[str, Any]]:
    role_lower = (role or "").lower()
    
    if "backend" in role_lower or "python" in role_lower or "api" in role_lower or "fastapi" in role_lower:
        return [
            {
                "phase_number": 1,
                "phase_title": "Core Foundations & Async Programming",
                "topic_name": "AsyncIO & FastAPI Dependency Injection",
                "why_it_matters": "High-throughput APIs require non-blocking IO and clean dependency inversion.",
                "prerequisite": "Python Syntax & Basic Data Structures",
                "learning_objective": "Build async route handlers and reusable dependency injectors in FastAPI.",
                "estimated_hours": 6,
                "order_index": 1
            },
            {
                "phase_number": 1,
                "phase_title": "Core Foundations & Async Programming",
                "topic_name": "SQLAlchemy 2.0 ORM & Connection Pooling",
                "why_it_matters": "Efficient ORM patterns prevent N+1 queries and connection leaks under load.",
                "prerequisite": "SQL Fundamentals",
                "learning_objective": "Implement async session handling, migrations with Alembic, and indexed models.",
                "estimated_hours": 8,
                "order_index": 2
            },
            {
                "phase_number": 2,
                "phase_title": "Database Optimization & Caching",
                "topic_name": "PostgreSQL B-Tree Indexing & Query Analysis",
                "why_it_matters": "Slow database queries are the #1 performance bottleneck in web applications.",
                "prerequisite": "SQLAlchemy ORM",
                "learning_objective": "Use EXPLAIN ANALYZE to identify unindexed scans and create compound indexes.",
                "estimated_hours": 10,
                "order_index": 3
            },
            {
                "phase_number": 2,
                "phase_title": "Database Optimization & Caching",
                "topic_name": "Redis In-Memory Caching & Rate Limiting",
                "why_it_matters": "Caching frequently accessed endpoints reduces database load by up to 90%.",
                "prerequisite": "FastAPI Routing",
                "learning_objective": "Implement TTL key expiration, cache invalidation hooks, and sliding-window rate limiters.",
                "estimated_hours": 7,
                "order_index": 4
            },
            {
                "phase_number": 3,
                "phase_title": "System Architecture & Production Deployment",
                "topic_name": "Docker Multi-Stage Builds & Containerization",
                "why_it_matters": "Containers guarantee environment consistency from local dev to cloud production.",
                "prerequisite": "Linux Terminal Basics",
                "learning_objective": "Write optimized Dockerfiles with non-root security principles and docker-compose services.",
                "estimated_hours": 12,
                "order_index": 5
            }
        ]
    elif "frontend" in role_lower or "react" in role_lower or "next" in role_lower or "web" in role_lower:
        return [
            {
                "phase_number": 1,
                "phase_title": "Modern Frontend Architecture",
                "topic_name": "Next.js App Router & Server Components",
                "why_it_matters": "Server components reduce client bundle size and enable instant page loading.",
                "prerequisite": "React Hooks & JSX",
                "learning_objective": "Build dynamic routes with layout inheritance and server-side data fetching.",
                "estimated_hours": 8,
                "order_index": 1
            },
            {
                "phase_number": 1,
                "phase_title": "Modern Frontend Architecture",
                "topic_name": "Tailwind CSS & Modern Design Systems",
                "why_it_matters": "Design systems enforce visual consistency and responsive UI performance.",
                "prerequisite": "CSS Flexbox & Grid",
                "learning_objective": "Implement glassmorphism, responsive grid layouts, and custom theme tokens.",
                "estimated_hours": 6,
                "order_index": 2
            },
            {
                "phase_number": 2,
                "phase_title": "State Management & API Integration",
                "topic_name": "TanStack Query & Global Auth Context",
                "why_it_matters": "Client-side cache synchronization prevents redundant API re-fetching.",
                "prerequisite": "Next.js App Router",
                "learning_objective": "Manage JWT session tokens, background revalidation, and optimistic UI mutations.",
                "estimated_hours": 10,
                "order_index": 3
            },
            {
                "phase_number": 3,
                "phase_title": "Performance Optimization & Testing",
                "topic_name": "Web Vitals Optimization & Playwright E2E",
                "why_it_matters": "High Core Web Vitals directly improve user conversion and search engine ranking.",
                "prerequisite": "TanStack Query",
                "learning_objective": "Audit LCP/CLS metrics and write end-to-end user journey tests with Playwright.",
                "estimated_hours": 9,
                "order_index": 4
            }
        ]
    elif "ai" in role_lower or "machine learning" in role_lower or "ml" in role_lower or "llm" in role_lower:
        return [
            {
                "phase_number": 1,
                "phase_title": "AI & Vector Foundations",
                "topic_name": "Python Vectorized Compute (NumPy/Pandas)",
                "why_it_matters": "Vectorized matrix operations form the numerical bedrock of all machine learning models.",
                "prerequisite": "Python Core Syntax",
                "learning_objective": "Perform array broadcasting, tensor manipulation, and memory-efficient data filtering.",
                "estimated_hours": 8,
                "order_index": 1
            },
            {
                "phase_number": 1,
                "phase_title": "AI & Vector Foundations",
                "topic_name": "PyTorch Neural Networks & Backpropagation",
                "why_it_matters": "Deep learning frameworks enable custom model building and fine-tuning.",
                "prerequisite": "Vector Compute",
                "learning_objective": "Build custom autograd modules, loss functions, and gradient descent training loops.",
                "estimated_hours": 12,
                "order_index": 2
            },
            {
                "phase_number": 2,
                "phase_title": "LLMs & Retrieval-Augmented Generation",
                "topic_name": "Embeddings, Vector Databases & RAG Pipelines",
                "why_it_matters": "RAG enables AI models to query external documentation accurately without hallucinations.",
                "prerequisite": "PyTorch Basics",
                "learning_objective": "Implement HNSW vector indexing, semantic search, and context chunking.",
                "estimated_hours": 10,
                "order_index": 3
            },
            {
                "phase_number": 3,
                "phase_title": "Production AI Deployment",
                "topic_name": "vLLM Inference Server & Model Quantization",
                "why_it_matters": "Optimized inference engines decrease GPU latency and hosting costs by 80%.",
                "prerequisite": "RAG Pipelines",
                "learning_objective": "Deploy quantized GGUF/AWQ models with streaming tokens over FastAPI WebSockets.",
                "estimated_hours": 14,
                "order_index": 4
            }
        ]
    elif "data" in role_lower or "etl" in role_lower or "spark" in role_lower:
        return [
            {
                "phase_number": 1,
                "phase_title": "Data Engineering Foundations",
                "topic_name": "SQL Data Warehousing & Star Schemas",
                "why_it_matters": "Dimensional data modeling powers analytical queries and BI dashboards.",
                "prerequisite": "Basic SQL",
                "learning_objective": "Design fact and dimension tables with surrogate keys and slowly changing dimensions.",
                "estimated_hours": 8,
                "order_index": 1
            },
            {
                "phase_number": 2,
                "phase_title": "Distributed Processing & Pipelines",
                "topic_name": "Apache Spark DataFrames & PySpark",
                "why_it_matters": "Processing terabyte-scale datasets requires distributed memory computing.",
                "prerequisite": "Data Warehousing",
                "learning_objective": "Write PySpark transformations, partition pruning, and broadcast joins.",
                "estimated_hours": 12,
                "order_index": 2
            },
            {
                "phase_number": 3,
                "phase_title": "Orchestration & Data Quality",
                "topic_name": "Apache Airflow DAGs & Great Expectations",
                "why_it_matters": "Automated pipeline orchestration ensures timely data delivery and data validation.",
                "prerequisite": "PySpark",
                "learning_objective": "Build DAG workflows with retries, SLA alerts, and schema assertion checks.",
                "estimated_hours": 10,
                "order_index": 3
            }
        ]
    else:
        return [
            {
                "phase_number": 1,
                "phase_title": "Full-Stack System Engineering",
                "topic_name": "RESTful API Architecture & OpenAPI Specs",
                "why_it_matters": "Clear API contracts enable seamless frontend and backend integration.",
                "prerequisite": "HTTP Fundamentals",
                "learning_objective": "Design clean API endpoints with Pydantic validation schemas.",
                "estimated_hours": 8,
                "order_index": 1
            },
            {
                "phase_number": 1,
                "phase_title": "Full-Stack System Engineering",
                "topic_name": "Relational Data Modeling & Migrations",
                "why_it_matters": "Proper schema design prevents data corruption and scaling bottlenecks.",
                "prerequisite": "RESTful API Architecture",
                "learning_objective": "Model foreign keys, cascade rules, and automated schema migrations.",
                "estimated_hours": 10,
                "order_index": 2
            },
            {
                "phase_number": 2,
                "phase_title": "Full-Stack Integration & Deployment",
                "topic_name": "Git Branching, Pull Requests & CI/CD",
                "why_it_matters": "Continuous integration guarantees that every pull request passes automated tests.",
                "prerequisite": "Relational Data Modeling",
                "learning_objective": "Set up GitHub Actions workflows to run linters, pytests, and build verification.",
                "estimated_hours": 8,
                "order_index": 3
            }
        ]

def generate_roadmap_for_user(user: User, db: Session, force_regenerate: bool = False) -> LearningRoadmap:
    profile = db.scalar(select(StudentProfile).where(StudentProfile.user_id == user.id))
    role = (profile.target_role if profile and profile.target_role else "Software Developer")
    experience = (profile.experience_level if profile and profile.experience_level else "intermediate")
    
    # Check for existing roadmap
    existing = db.scalar(
        select(LearningRoadmap)
        .where(LearningRoadmap.user_id == user.id)
        .options(selectinload(LearningRoadmap.nodes))
    )

    if existing and not force_regenerate and existing.target_role == role:
        return existing

    if existing:
        db.delete(existing)
        db.commit()

    user_skills = [s.name for s in user.skills] if hasattr(user, "skills") and user.skills else []
    summary = f"Personalized AI Learning Roadmap for {user.full_name or 'Student'} targeting {role} ({experience} level)."

    roadmap = LearningRoadmap(user_id=user.id, target_role=role, summary=summary)
    db.add(roadmap)
    db.commit()
    db.refresh(roadmap)

    node_specs = generate_roadmap_nodes_for_profile(role, experience, user_skills)
    for idx, spec in enumerate(node_specs, start=1):
        node = LearningRoadmapNode(
            roadmap_id=roadmap.id,
            phase_number=spec["phase_number"],
            phase_title=spec["phase_title"],
            topic_name=spec["topic_name"],
            why_it_matters=spec["why_it_matters"],
            prerequisite=spec["prerequisite"],
            learning_objective=spec["learning_objective"],
            estimated_hours=spec["estimated_hours"],
            order_index=idx,
            status="not_started"
        )
        db.add(node)

    db.commit()
    return db.scalar(
        select(LearningRoadmap)
        .where(LearningRoadmap.id == roadmap.id)
        .options(selectinload(LearningRoadmap.nodes))
    )
