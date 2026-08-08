# Product Requirements Document & Task Specification

> **Project**: Śiṣya Abhyāsa Core Platform (शिष्य अभ्यास)
> **Task File**: `docs/tasks/PRD.md`
> **Progress File**: `docs/tasks/progress.txt`
> **Status**: Ready for Ralph Loop Execution

---

## Objective
Consolidate workspace assets, verify backend FastAPI endpoints and GitHub telemetry sensors, align React/Next.js frontend tabs, and validate test suites under the GSD workflow.

---

## Tasks

### Phase 1: Environment & Workspace Consolidation
- [ ] **Task 1.1**: Verify environment configuration files (`apps/api/.env`, `apps/web/.env`) and standardize configuration keys.
- [ ] **Task 1.2**: Validate root workspace dependencies and scripts (`scripts/validate-all.ps1`).

### Phase 2: Backend API & Telemetry Verification
- [ ] **Task 2.1**: Audit FastAPI routes in `apps/api/app/api/routes` for authentication, projects, and proof models.
- [ ] **Task 2.2**: Verify `sensor.py` telemetry extraction for GitHub commits, PRs, and skill score generation.

### Phase 3: Frontend Integration & UI Alignment
- [ ] **Task 3.1**: Inspect `ProgressTab.jsx`, `ProjectsTab.jsx`, `SolutionsTab.jsx`, and `HomeTab.jsx` components for visual & functional accuracy.
- [ ] **Task 3.2**: Ensure seamless REST integration between frontend application and backend API.

### Phase 4: Automated Testing & Quality Assurance
- [ ] **Task 4.1**: Execute backend test suite (`pytest` in `apps/api`).
- [ ] **Task 4.2**: Execute Playwright E2E browser tests (`npx playwright test`).

---

## Acceptance Criteria
- All tasks in Phase 1 through Phase 4 are checked off.
- `progress.txt` documents iteration steps and completion timestamps.
- Zero errors during build and test runs.
