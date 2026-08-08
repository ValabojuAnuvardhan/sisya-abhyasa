# Changelog

All notable changes to **Śiṣya Abhyāsa** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.1.0] - 2026-08-08

### Added
- **Dynamic Student Dashboard**: Complete overhaul of `/dashboard` into a dynamic command center answering *"What should this student do next?"* with active project hero cards, task queue, proof progress bar, and AI mentor feed.
- **Universal Navigation System**: Persistent top `<Navbar />` and `<Breadcrumbs />` components rendered across all application routes.
- **Dual-Mode Authentication**: Supported `Authorization: Bearer <token>` headers alongside HTTP-only session cookies in `require_principal()`. Added `access_token` to login payload.
- **Global Auth Provider**: Client-side `AuthProvider` and `useAuth()` hook in `apps/web/lib/auth-context.tsx`.
- **Reusable Error Component**: Created `components/ErrorState.tsx` with actionable error suggestions and retry support.
- **Repository Governance Suite**: Added `ARCHITECTURE.md`, `RELEASE_PROCESS.md`, and `.github/CODEOWNERS`.

### Fixed
- **Authentication Dev Fallback Leak**: Fixed `apps/api/app/core/auth.py` to prevent returning the first database user identity when session cookie is absent.
- **API Fetch Wrapper**: Updated `apps/web/lib/api.ts` to attach Bearer tokens automatically from local storage.
- **Task Workspace Layout**: Re-aligned `/tasks/[id]` into a 2-column spec grid and AI Mentor panel.

---

## [1.0.0] - 2026-07-30

### Added
- **Core Platform Architecture**: Initial release featuring FastAPI backend and Next.js / React frontend baseline.
- **Three-Path Project Journey**: Experience paths for Guided Learning, Bring-Your-Own Project, and Community Discovery.
- **Authentication & Sessions**: Session authentication (`/api/v1/auth`) with scrypt password security.
- **Community & Project Discovery**: Public project discovery API (`/api/v1/community`), join requests, and project creation endpoints.
- **Team Space Context**: Context-aware team space chat, real-time activity feeds, and milestone collaboration tools.
- **Evidence Collection & Proof-of-Work**: Automated GitHub telemetry collection (`sensor.py`), signed commit evidence verification, and proof publishing UI.
- **Alembic Database Migrations**: Incremental database migrations covering users, profiles, skills, projects, tasks, reviews, and evidence tracking.
