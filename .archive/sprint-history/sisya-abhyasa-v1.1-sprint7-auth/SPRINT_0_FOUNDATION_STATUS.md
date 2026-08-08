# Sprint 0 Production Foundation — Alignment Check

## Planned → Implemented → Verification

- Next.js + TypeScript production frontend → scaffolded under `apps/web` → source structure checked; dependency installation/build cannot be verified in this offline environment.
- Preserve cleaned visual identity → Ice Latte/Mint/Deep Dark direction and V1.1 three-path start retained → source reviewed.
- FastAPI backend → scaffolded under `apps/api` with `/api/v1/health` → Python source syntax compiled successfully.
- PostgreSQL foundation → local Postgres 17 Docker Compose + database URL configuration → configuration present; runtime DB not started in this environment.
- Typed environment configuration → `pydantic-settings` + `.env.example` → no real credentials included.
- Server-side AI boundary → no AI provider call exists in new Next frontend → source search required before release.
- GitHub evidence → intentionally NOT implemented yet → must remain disabled until GitHub App/webhook sprint.
- Authentication → intentionally NOT implemented yet → Sprint 1.

## Important scope check

Project Discovery V1.1 remains in the production information architecture. The three entry paths are preserved. Community project discovery is a later V1 extension; professor/company/open-source publishing remains V2+.

## Legacy prototype

The cleaned Vite prototype remains at repository root only as a visual/reference implementation during migration. New production work belongs under `apps/web` and `apps/api`. Do not add new product features to the legacy Vite app.

## Next

1. Install production dependencies locally.
2. Verify `apps/web` build and `apps/api` health test.
3. Add Alembic configuration and initial User/Skill/Profile models.
4. Implement authentication + onboarding (Sprint 1).
