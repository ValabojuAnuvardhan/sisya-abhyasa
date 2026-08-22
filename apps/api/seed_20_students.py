import uuid
from datetime import datetime, timezone
from app.db.session import SessionLocal
from app.models.user import User, StudentProfile, AuthCredential, AuthSession
from app.api.routes.auth import _password_hash

STUDENTS = [
    {"email": "student1@gmail.com", "name": "Alex Rivera", "role": "Full Stack Engineer", "github": "alex-rivera-dev", "year": 3, "skills": ["React", "TypeScript", "Python", "FastAPI"]},
    {"email": "student2@gmail.com", "name": "Priya Patel", "role": "AI & Machine Learning Engineer", "github": "priya-ml-ai", "year": 4, "skills": ["Python", "PyTorch", "FastAPI", "Transformers"]},
    {"email": "student3@gmail.com", "name": "Arun Sharma", "role": "Backend Systems Architect", "github": "arun-sharma-backend", "year": 4, "skills": ["Go", "PostgreSQL", "Docker", "Kubernetes"]},
    {"email": "student4@gmail.com", "name": "Sophia Chen", "role": "Frontend UI/UX Developer", "github": "sophia-uiux", "year": 2, "skills": ["Next.js", "TailwindCSS", "React", "Figma"]},
    {"email": "student5@gmail.com", "name": "David Miller", "role": "DevOps & Cloud Specialist", "github": "david-devops", "year": 3, "skills": ["AWS", "Terraform", "Docker", "CI/CD"]},
    {"email": "student6@gmail.com", "name": "Ananya Roy", "role": "Data Engineer", "github": "ananya-data", "year": 3, "skills": ["Python", "Spark", "SQL", "Airflow"]},
    {"email": "student7@gmail.com", "name": "Liam Wilson", "role": "Mobile App Developer", "github": "liam-flutter", "year": 2, "skills": ["Flutter", "Dart", "Firebase", "iOS"]},
    {"email": "student8@gmail.com", "name": "Zara Ahmed", "role": "Cybersecurity & Security Engineer", "github": "zara-sec", "year": 4, "skills": ["Python", "Ethical Hacking", "Cryptography", "OAuth"]},
    {"email": "student9@gmail.com", "name": "Marcus Vance", "role": "Distributed Systems Engineer", "github": "marcus-dist", "year": 4, "skills": ["Rust", "gRPC", "Kafka", "Linux"]},
    {"email": "student10@gmail.com", "name": "Elena Rostova", "role": "QA Automation Engineer", "github": "elena-qa", "year": 3, "skills": ["Playwright", "Python", "Pytest", "Jest"]},
    {"email": "student11@gmail.com", "name": "Rohan Gupta", "role": "Cloud Native Specialist", "github": "rohan-cloud", "year": 3, "skills": ["GCP", "Docker", "Next.js", "GraphQL"]},
    {"email": "student12@gmail.com", "name": "Emma Watson", "role": "Product Engineer", "github": "emma-product", "year": 2, "skills": ["React", "Node.js", "Product Analytics", "CSS"]},
    {"email": "student13@gmail.com", "name": "Karthik Nair", "role": "Embedded & IoT Developer", "github": "karthik-iot", "year": 4, "skills": ["C++", "Python", "Raspberry Pi", "MQTT"]},
    {"email": "student14@gmail.com", "name": "Chloe Bennett", "role": "Frontend Performance Specialist", "github": "chloe-perf", "year": 3, "skills": ["JavaScript", "Web Vitals", "React", "Redux"]},
    {"email": "student15@gmail.com", "name": "Vikram Singh", "role": "Database Architect", "github": "vikram-db", "year": 4, "skills": ["PostgreSQL", "Redis", "Elasticsearch", "SQL"]},
    {"email": "student16@gmail.com", "name": "Maya Lin", "role": "NLP & Large Language Models Engineer", "github": "maya-llm", "year": 4, "skills": ["LangChain", "Python", "OpenAI", "Vector DBs"]},
    {"email": "student17@gmail.com", "name": "Noah Taylor", "role": "Site Reliability Engineer", "github": "noah-sre", "year": 3, "skills": ["Prometheus", "Grafana", "Python", "Bash"]},
    {"email": "student18@gmail.com", "name": "Aaliyah Khan", "role": "Microservices Architect", "github": "aaliyah-micro", "year": 4, "skills": ["Java", "Spring Boot", "Docker", "RabbitMQ"]},
    {"email": "student19@gmail.com", "name": "James O'Connor", "role": "Blockchain & Smart Contracts Developer", "github": "james-web3", "year": 3, "skills": ["Solidity", "Ethers.js", "TypeScript", "Hardhat"]},
    {"email": "student20@gmail.com", "name": "Tanya Verma", "role": "Core Software Engineering Specialist", "github": "tanya-core", "year": 4, "skills": ["C++", "Algorithms", "System Design", "Python"]}
]

def seed_students():
    db = SessionLocal()
    now = datetime.now(timezone.utc)
    created_count = 0
    updated_count = 0

    for s in STUDENTS:
        email = s["email"].lower()
        user = db.query(User).filter(User.email == email).first()
        if not user:
            profile = StudentProfile(github_username=s["github"])
            user = User(
                auth_subject=f"account:{uuid.uuid4()}",
                email=email,
                full_name=s["name"],
                profile=profile
            )
            db.add(user)
            db.flush()
            cred = AuthCredential(
                user_id=user.id,
                password_hash=_password_hash("Password123!"),
                email_verified_at=now
            )
            db.add(cred)
            created_count += 1
        else:
            user.full_name = s["name"]
            if user.profile:
                user.profile.github_username = s["github"]
            cred = db.query(AuthCredential).filter(AuthCredential.user_id == user.id).first()
            if cred:
                cred.password_hash = _password_hash("Password123!")
                cred.failed_login_count = 0
                cred.locked_until = None
            updated_count += 1

    db.commit()
    db.close()
    print(f"Successfully seeded 20 student accounts! Created: {created_count}, Updated: {updated_count}")

if __name__ == "__main__":
    seed_students()
