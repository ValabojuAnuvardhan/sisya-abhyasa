# Sprint 7 — Production Authentication & Authorization Gate

## Implemented
- Real email/password accounts with scrypt password hashing and per-password random salts.
- Email verification state. Development exposes a one-click local verification token; production does not expose verification tokens and requires an email delivery integration before pilot launch.
- Opaque random server-side sessions stored hashed in PostgreSQL; browser receives HttpOnly cookie only.
- Login throttling/temporary lock after repeated failures.
- Sign-out cookie invalidation boundary.
- Existing X-Dev-Auth adapter remains available only when environment=development AND allow_dev_auth=true.
- Canonical Next.js client now uses credentialed session requests and no longer injects a hard-coded dev identity.
- Migration 0007 owns auth schema.

## Required acceptance gate
1. Apply Alembic 0007 to PostgreSQL.
2. Create and verify Student A, sign in, complete onboarding, sign out, verify protected APIs return 401.
3. Create and verify Student B.
4. Attempt direct-ID access from B to A's project/task/GitHub evidence/private proof endpoints. Every private request must be denied (403/404).
5. Confirm public Proof-of-Work remains intentionally accessible only when published.
6. Set SISYA_ALLOW_DEV_AUTH=false and verify X-Dev-Auth-Subject cannot authenticate.
7. Production email delivery remains a pilot blocker; development verification is not a production email system.
