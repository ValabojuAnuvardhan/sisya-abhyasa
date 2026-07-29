# Śiṣya Abhyāsa — Developer Guide

**Target Version:** v1.0.0  
**Target Audience:** Core Contributors, Software Engineers, Maintainers  
**Document Path:** `docs/developer/developer_guide.md`  

---

## 1. Repository Structure & Folder Organization
```
sisya-abhyasa/
├── apps/
│   ├── api/                # FastAPI Backend Application
│   │   ├── app/
│   │   │   ├── api/routes/ # REST API Controllers (auth, me, projects, community, github, proof)
│   │   │   ├── core/       # Security, DB sessions, Config
│   │   │   ├── models/     # SQLAlchemy ORM Models
│   │   │   └── schemas/    # Pydantic Schemas
│   │   └── alembic/        # DB Schema Migrations (0001 - 0010)
│   └── web/                # React 19 Frontend SPA
│       └── app/            # Next.js / Vite SPA routes
├── tests/                  # Playwright E2E Test Suite
└── docs/                   # Operations & System Documentation
```

---

## 2. Technology Stack
- **Frontend:** React 19, TypeScript, Vanilla CSS design tokens.
- **Backend:** FastAPI, Python 3.14 / 3.12, Pydantic v2, Uvicorn.
- **Database:** PostgreSQL 16, SQLAlchemy ORM, Alembic migrations.
- **Testing:** Playwright E2E (`npx playwright test`), Pytest (`python -m pytest`).

---

## 3. Local Development Setup
1. Clone repository: `git clone https://github.com/sisya-community/sisya-abhyasa.git`
2. Install API dependencies: `cd apps/api && pip install -r requirements.txt`
3. Run migrations: `alembic upgrade head`
4. Start API server: `python -m uvicorn app.main:app --reload --port 8000`
5. Run Playwright E2E suite: `npx playwright test`
