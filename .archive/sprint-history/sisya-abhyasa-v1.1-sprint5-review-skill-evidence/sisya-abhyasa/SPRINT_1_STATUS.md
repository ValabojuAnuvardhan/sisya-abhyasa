# Sprint 1 — Authentication & Student Onboarding

## Alignment checkpoint
- V1/V1.1 student-first onboarding: implemented.
- Profile fields: education year, target role, experience level, interests, current skills.
- Profile privacy: remains private by default in the database.
- Canonical skills endpoint: implemented.
- GET/PATCH `/api/v1/me`: implemented.
- Three-path activation dashboard: implemented.
- GitHub connection: correctly deferred to the GitHub integration stage.

## Authentication status
A deliberate development-only auth adapter is implemented so local onboarding can be exercised end-to-end. It accepts `X-Dev-Auth-Subject` only when `SISYA_ENVIRONMENT=development` and `SISYA_ALLOW_DEV_AUTH=true`.

**Production authentication is NOT marked complete.** The production path fails closed until a mature OIDC/JWT identity provider is selected/configured. We will not ship the development header mechanism to production as authentication.

## Verification
- Backend Python compilation: required at this checkpoint.
- Static source drift scan: no Peer Score / Build Score / fake verification / browser AI provider calls in production apps.
- Full DB/API integration requires local PostgreSQL + migrations.
- Next.js build requires npm dependencies.

## Next
Verify local database/API/UI, select/configure the production auth provider, then begin Sprint 2 Project Start Choice + A0 Project Discovery Agent.
