# Śiṣya Abhyāsa Master Documentation Hub

Welcome to the **Śiṣya Abhyāsa** documentation hub. This central portal provides navigation, architectural references, operational runbooks, and developer guides for the platform.

---

## 📑 Documentation Index

### 1. Developer Guides & API References (`docs/developer/`)
- **[Developer Guide](developer/developer_guide.md)**: Environment setup, repository layout, conventions, and coding patterns.
- **[API Reference](developer/api_reference.md)**: OpenAPI endpoints, request schemas, authentication tokens, and response models.

### 2. Admin & User Documentation (`docs/admin/`, `docs/user-guide/`)
- **[Admin Guide](admin/admin_guide.md)**: Platform configuration, database maintenance, and administrative operations.
- **[Student Guide](user-guide/student_guide.md)**: Walkthrough for students creating projects, discovering teams, and publishing evidence portfolios.
- **[Mentor Guide](user-guide/mentor_guide.md)**: Guide for mentors reviewing pull requests, evaluating evidence claims, and offering feedback.

### 3. Operations & Release Runbooks (`docs/operations/`, `docs/release/`)
- **[Operations Runbook](operations/operations_runbook.md)**: Monitoring, logging, service recovery, and operational procedures.
- **[Deployment Runbook](operations/deployment_runbook.md)**: Step-by-step production deployment instructions.
- **[Disaster Recovery](operations/disaster_recovery.md)**: Backup procedures, database restore procedures, and failover strategy.
- **[Incident Response](operations/incident_response.md)**: Incident classification, triage, and mitigation protocols.
- **[Release Notes v1.0.0](release/release_notes_v1.0.0.md)**: Release features, breaking changes, and migration details.
- **[Versioning Strategy](release/versioning_strategy.md)**: Semantic versioning policy and deprecation cycles.

### 4. Integrations (`docs/integrations/`)
- **[GitHub Integration](integrations/github.md)**: GitHub Webhooks, OAuth, App permissions, and telemetry tracking (`sensor.py`).
- **[AI Provider Integration](integrations/ai_provider.md)**: LLM orchestration service architecture and context management.

### 5. Sprint Development History (`docs/history/sprints/`)
- **[Sprint History Index](history/sprints/SPRINT_9_STATUS.md)**: Complete chronological archive of development status from Sprint 0 through Sprint 9.

---

## 🔍 Module Matrix

| Module | Location | Primary Language | Description |
| ------ | -------- | ---------------- | ----------- |
| **Backend API** | `apps/api/` | Python (FastAPI) | Core API routes, DB session management, JWT auth, Alembic migrations. |
| **Frontend Web** | `apps/web/` | TypeScript (Next.js) | Production web application dashboard, team spaces, and proof cards. |
| **Telemetry Sensor** | `sensor.py` | Python | Local development tracker & commit evidence collector. |
| **E2E Suite** | `tests/` | JavaScript (Playwright) | Automated end-to-end user flow integration tests. |
| **DevOps & Scripts** | `scripts/` & `.github/` | Bash / PowerShell / YAML | Multi-platform bootstrap scripts, CI workflows, and release tools. |
