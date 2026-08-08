# Sprint 6 — Proof-of-Work & Privacy-Safe Publishing

## Implemented
- Private authenticated Proof-of-Work preview.
- Explicit publish/unpublish control; profiles remain private by default.
- Stable opaque public slug generated only when publishing is requested.
- Public evidence projection based only on merged PRs attributed to the student and existing SkillEvidence.
- Private repository URLs, commit URLs, PR URLs, source code/diffs, raw webhook payloads, OAuth data and secrets are excluded from public output.
- Public profile labels skills as Demonstrated, never expertise scores or certificates.
- Dashboard entry to My Proof-of-Work.

## Acceptance target
Private preview -> publish -> public page -> verify safe evidence -> unpublish -> public URL returns 404 -> republish -> same safe profile becomes available again.

## Deliberately deferred
- Recruiter/company dashboards.
- Certificates/badges.
- External AI review of private code.
- Public repository deep links (kept out of this first safe projection for a uniform privacy boundary).
