# GSD PLAN: Śiṣya Abhyāsa v1.1.0 — Non-Breaking Extension

> **Target Version**: v1.1.0 (Extension of v1.0.0 Production Base)
> **Backward Compatibility Guarantee**: Zero changes to existing v1.0.0 database tables, routes, or UI components.

---

## Wave 1: Database Schema Foundations (Additive Only)

- [ ] **Task 1.1: v1.1.0 Models** (`apps/api/app/models/evaluations.py`, `skills_v2.py`)
  - Create `UserSkillProficiency` model (`user_id`, `skill_id`, `proficiency_score` 0-100%, `evidence_count`).
  - Create `MentorObservation` model (`user_id`, `type`, `title`, `content`, `action_url`, `is_read`).
  - Create `ProjectEvaluation` model (`project_id`, 10 dimension scores, strengths, weaknesses, `resume_bullets`, `linkedin_summary`, `interview_questions`, `badge_level`).
  - Create `RecruiterProfile` model (`user_id`, `public_slug`, `featured_projects`, `bio`).

- [ ] **Task 1.2: Alembic Migration** (`apps/api/alembic/versions/0003_v1_1_0_schema.py`)
  - Additive migration creating new tables without modifying existing v1.0.0 columns or tables.

- [ ] **Task 1.3: Pydantic Schemas** (`apps/api/app/schemas/mentor.py`, `evaluation.py`, `recruiter.py`, `skills_v2.py`)
  - Request/response schemas for mentor recommendations, skill graph, recruiter profile, and evaluations.

---

## Wave 2: AI Services & Inferencing Logic

- [ ] **Task 2.1: Proactive AI Mentor Service** (`apps/api/app/services/ai_mentor_service.py`)
  - Observes user commits/PRs and emits daily goals, architecture tips, and code review suggestions.

- [ ] **Task 2.2: Dynamic Skill Inferencing Engine** (`apps/api/app/services/skill_engine.py`)
  - Inferencing algorithm calculating proficiency percentages from commit volume, code reviews, PRs, and proof cards.

- [ ] **Task 2.3: Project Graduation Evaluation Engine** (`apps/api/app/services/evaluation_engine.py`)
  - Automated project evaluation scoring 10 dimensions upon project completion and generating employability assets.

---

## Wave 3: Backend REST APIs (New Routers)

- [ ] **Task 3.1: Mentor Routes** (`apps/api/app/api/routes/mentor.py`)
  - `GET /api/v1/mentor/observations`
  - `POST /api/v1/mentor/daily-goals`

- [ ] **Task 3.2: Dynamic Skill Routes** (`apps/api/app/api/routes/skills.py`)
  - `GET /api/v1/skills/graph`
  - `POST /api/v1/skills/recalculate`

- [ ] **Task 3.3: Recruiter Portfolio Routes** (`apps/api/app/api/routes/recruiter.py`)
  - `GET /api/v1/recruiter/profile/{slug}`
  - `GET /api/v1/recruiter/export/pdf/{slug}`

- [ ] **Task 3.4: Team Analytics & Risk Routes** (`apps/api/app/api/routes/analytics.py`)
  - `GET /api/v1/analytics/team/{team_id}`
  - `GET /api/v1/analytics/risk-alerts`

- [ ] **Task 3.5: AI Project Evaluation Routes** (`apps/api/app/api/routes/evaluation.py`)
  - `POST /api/v1/evaluation/projects/{project_id}`
  - `GET /api/v1/evaluation/projects/{project_id}`

---

## Wave 4: Frontend UI Extensions

- [ ] **Task 4.1: Dynamic Skill Graph Component** (`SkillGraphTab.jsx` / `apps/web/components/SkillGraph.tsx`)
- [ ] **Task 4.2: Recruiter Public Profile View** (`RecruiterViewTab.jsx` / `apps/web/app/recruiter/[slug]/page.tsx`)
- [ ] **Task 4.3: Team Analytics & Risk Dashboard** (`TeamAnalyticsTab.jsx` / `apps/web/app/analytics/page.tsx`)
- [ ] **Task 4.4: Proactive AI Mentor Panel** (`AIMentorPanel.jsx` / `apps/web/components/AIMentorPanel.tsx`)
- [ ] **Task 4.5: Project Graduation Evaluation Modal** (`ProjectEvaluationModal.jsx`)

---

## Wave 5: Verification & Quality Assurance

- [ ] **Task 5.1: Backend Pytest Suite** (`apps/api/tests/test_v1_1_0_features.py`)
- [ ] **Task 5.2: CodeRabbit Security Audit**
- [ ] **Task 5.3: Playwright E2E Verification Script** (`tests/v1_1_0_e2e.spec.js`)
