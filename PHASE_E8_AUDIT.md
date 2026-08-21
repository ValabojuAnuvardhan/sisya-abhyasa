# PHASE E8 — ARCHITECTURAL AUDIT & REGRESSION PROTECTION STRATEGY

## 1. Existing Architecture & Inventory

### Database Models (`apps/api/app/models/`)
- **`Project`** (`apps/api/app/models/project.py`):
  - Primary model with `id`, `creator_id`, `title`, `description`, `source`, `difficulty`, `status`, `plan_status`, `discoverable`, `collaboration_pitch`, `skills_needed`, `collaboration_mode` (`SOLO`, `TEAM`), `team_capacity` (max 5).
- **`Milestone`** (`apps/api/app/models/project.py`):
  - `id`, `project_id`, `title`, `objective`, `position`.
- **`Task`** (`apps/api/app/models/project.py`):
  - `id`, `milestone_id`, `title`, `description`, `completion_criteria`, `required_skills`, `resources`, `status` (`todo`, `in_progress`, `in_review`, `done`), `position`, `assigned_user_id`.
- **`TaskGitBranch`, `TaskCommit`, `TaskPullRequest`** (`apps/api/app/github/task_traceability/models.py`):
  - Existing task-to-GitHub traceability models linking `Task` to `GithubCommit` and `GithubPullRequest`.
- **`SkillEvidence`** (`apps/api/app/models/github.py`):
  - Verifiable evidence records generated exclusively by merged PR webhooks.

---

## 2. Reusable vs. Missing Components

### Reusable Components (Do Not Rebuild)
- ✅ **Task Table (`tasks`)**: Extend additively; do not create duplicate task models.
- ✅ **Task Traceability Models**: Reuse `TaskGitBranch`, `TaskCommit`, `TaskPullRequest`.
- ✅ **GitHub Telemetry & Evidence Engine**: Reuse E7 HMAC signature validation & attributable `SkillEvidence` generation.
- ✅ **Team Collaboration Model**: Reuse `ProjectMember` (`SOLO` vs `TEAM` 2–5 members).
- ✅ **Community & Rebuild**: Reuse E6 DTO isolation engine.

### Missing Components (To Be Added in E8)
- ❌ **Task Priority & Estimation**: `priority` (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), `estimated_hours`, `actual_hours`, `due_date`, `sprint_id`, `branch_name`.
- ❌ **`TaskDependency` Model**: `task_id`, `depends_on_task_id`, `dependency_type` (`BLOCKS`, `REQUIRES`).
- ❌ **`TaskBlocker` Model**: `task_id`, `created_by_user_id`, `reason`, `status` (`ACTIVE`, `RESOLVED`), `ai_resolution_suggestion`.
- ❌ **`ProjectSprint` Model**: `project_id`, `name`, `goal`, `start_date`, `end_date`, `status` (`PLANNING`, `ACTIVE`, `COMPLETED`), `capacity_hours`.
- ❌ **Deterministic Dependency Engine**: DAG graph validator, cycle detection, critical path calculator (`apps/api/app/services/dependency_engine.py`).
- ❌ **AI Next Best Action Engine**: Deterministic recommendation engine with AI explanation (`apps/api/app/services/task_planner.py`).
- ❌ **Workload & Capacity Engine**: Individual & team capacity calculation & overload alerts (`apps/api/app/services/workload_engine.py`).
- ❌ **Dedicated `/settings` Route**: Settings page (`apps/web/app/settings/page.tsx`).
- ❌ **Execution Command Center Widgets**: Upgraded `/dashboard` widgets.

---

## 3. Database & API Changes

### Database Changes (Additive Migration)
- Add columns to `tasks` table: `priority` (default `'MEDIUM'`), `estimated_hours` (default `0`), `actual_hours` (default `0`), `due_date` (nullable), `sprint_id` (nullable FK), `branch_name` (nullable).
- Create table `task_dependencies` (`id`, `task_id`, `depends_on_task_id`, `dependency_type`, `created_at`).
- Create table `task_blockers` (`id`, `task_id`, `created_by_user_id`, `reason`, `status`, `resolved_at`, `ai_resolution_suggestion`, `created_at`, `updated_at`).
- Create table `project_sprints` (`id`, `project_id`, `name`, `goal`, `start_date`, `end_date`, `status`, `capacity_hours`, `created_at`, `updated_at`).

### API Endpoint Additions (`apps/api/app/api/routes/execution.py` & `settings.py`)
- `GET/PATCH /api/v1/settings/me`
- `GET /api/v1/projects/{id}/dependencies`
- `POST /api/v1/tasks/{id}/dependencies`
- `DELETE /api/v1/tasks/{id}/dependencies/{dep_id}`
- `POST /api/v1/tasks/{id}/blockers`
- `PATCH /api/v1/blockers/{id}/resolve`
- `GET/POST /api/v1/projects/{id}/sprints`
- `PATCH /api/v1/sprints/{id}`
- `GET /api/v1/projects/{id}/workload`
- `GET /api/v1/projects/{id}/next-action`
- `POST /api/v1/tasks/{id}/github/pr`

---

## 4. Risks & Regression Protection Strategy

1. **Evidence Protection**: E8 task operations, blockers, and sprints produce **0 evidence**. Evidence remains 100% E7-authoritative via merged GitHub PR webhooks.
2. **Rebuild Isolation**: Rebuilt `Project B` starts with 0 sprints, 0 blockers, 0 dependencies, 0 repositories, 0 PRs, and 0 commits.
3. **Task State Preservation**: Existing task statuses (`todo`, `in_progress`, `in_review`, `done`) remain valid in DB. Frontend maps `BLOCKED` status dynamically when active blockers exist.
4. **Historical Test Regression**: All pytest suites (E1–E7) will be run and verified to pass with 0 failures before declaring E8 complete.
