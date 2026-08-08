# Sprint 5 — PR Review + Skill Evidence

## Implemented
- Migration `0005_pr_reviews_skill_evidence.py`.
- Persistent PR evidence reviews and skill-evidence records.
- Review eligibility requires: owned project, connected repo, mapped student PR, and explicit task link.
- Local evidence interpreter uses only trusted GitHub metadata + persisted task context.
- It explicitly does **not** claim code correctness, test execution, or expertise.
- Skill evidence is derived from the linked task's required skills and traces to a specific PR/task.
- Project workspace shows review, limitations, and demonstrated skill evidence.
- External/private-code AI review remains disabled by default (`SISYA_EXTERNAL_AI_CODE_REVIEW_ENABLED=false`).

## Trust boundary
GitHub supplies facts. Sprint 5 interprets only those facts plus project/task context. No private repository diff is transmitted to an external AI provider in this checkpoint.

## Deferred
Provider-backed code-diff review, test/CI evidence ingestion, human mentor verification, public Proof-of-Work publishing.
