# Architecture & System Design: Śiṣya Abhyāsa

**Śiṣya Abhyāsa** (*"Student Practice"*) is a full-stack, enterprise-grade open-source platform designed to bridge academic software development with production engineering through evidence-backed skill verification, contextual AI mentorship, and GitHub commit telemetry.

---

## 1. High-Level Architecture Overview

Śiṣya Abhyāsa is structured as a modern monorepo with a decoupled client-server architecture:

```mermaid
graph TD
    User([Student / Developer]) --> Web[Apps Web - Next.js 15 App Router]
    Web --> API[Apps API - FastAPI Backend]

    subgraph Backend Engine (apps/api)
        API --> Auth[JWT & Cookie Session Auth]
        API --> Routers[Community, Projects, Team Space, Proof Routers]
        Routers --> DB[(PostgreSQL / SQLite + Alembic Migrations)]
    end

    subgraph GitHub Telemetry & Evidence Engine
        API --> Sensor[Sensor Telemetry - sensor.py]
        Sensor --> GH[GitHub API & App Webhooks]
        GH --> Evidence[Demonstrated Skill Evidence Extractor]
    end

    subgraph Contextual AI Mentor
        API --> AIMentor[Task & Project Scoped AI Mentor Service]
    end
```

---

## 2. Monorepo Package Breakdown

```text
.
├── apps/
│   ├── api/                   # FastAPI Python Backend
│   │   ├── alembic/           # Alembic DB Migrations
│   │   ├── app/
│   │   │   ├── api/routes/    # API Endpoint Controllers (auth, me, projects, team_space, etc.)
│   │   │   ├── core/          # Security, Config & Auth Dependencies
│   │   │   ├── db/            # Database Engine & Session Factory
│   │   │   ├── models/        # SQLAlchemy ORM Models
│   │   │   ├── schemas/       # Pydantic Request/Response Data Transfer Objects
│   │   │   └── services/      # AI Mentor, Evaluation & Skill Verification Services
│   │   └── tests/             # Pytest Backend Unit & Integration Suite
│   └── web/                   # Next.js 15 React Web Application
│       ├── app/               # Next.js App Router Pages (dashboard, auth, projects, proof, etc.)
│       ├── components/        # Reusable UI Components (Navbar, Breadcrumbs, ErrorState, etc.)
│       └── lib/               # Global API Client Wrapper & AuthContext Provider
├── docs/                      # Technical Documentation & Sprint History
├── scripts/                   # Cross-Platform Environment Setup & Validation Scripts
└── tests/                     # Playwright End-to-End Test Suite
```

---

## 3. Core Subsystems

### 3.1 Authentication & Session Subsystem
- **Dual-Mode Authentication**: Supports HTTP-Only `sisya_session` cookies alongside `Authorization: Bearer <token>` headers for seamless cross-origin development and production security.
- **Session Store**: `AuthSession` records tracked in PostgreSQL/SQLite with configurable expiration (`settings.session_days`).

### 3.2 Dynamic Student Dashboard
- **State-Aware Command Center**: Built around the primary question *"What should this student do next?"*.
- **Live Widgets**: Active Project Focus, Pending Assigned Tasks, Proof-of-Work Readiness Bar, and Proactive AI Mentor Observations.

### 3.3 GitHub Telemetry & Evidence Verification Engine
- **Telemetry Ingestion**: Ingests commit telemetry and merged pull requests via GitHub App integration.
- **Privacy-Safe Evidence Extraction**: Maps merged code contributions to specific project task criteria while maintaining strict code privacy (code contents and secrets are never exposed on public recruiter profiles).

---

## 4. Technology Stack & Decision Rationale

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js 15 (React 19, TypeScript) | Server-side rendering, fast client routing, and strong typing. |
| **Backend Framework** | FastAPI (Python 3.10+) | High performance async endpoints, automatic OpenAPI documentation. |
| **Database & ORM** | PostgreSQL / SQLite + SQLAlchemy 2.0 | ACIS compliance, explicit schema models, easy migration handling. |
| **Database Migrations** | Alembic | Version-controlled, reproducible schema updates. |
| **E2E Testing** | Playwright | Robust cross-browser integration testing. |
