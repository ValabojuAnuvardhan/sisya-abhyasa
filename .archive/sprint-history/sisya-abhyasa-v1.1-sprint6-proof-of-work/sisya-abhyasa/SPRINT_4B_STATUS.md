# Sprint 4B — Real GitHub Evidence Foundation

## Implemented
- Migration `0004_github_evidence.py`.
- One verified GitHub repository connection per project.
- GitHub App installation-token verification before a repository is linked.
- Raw-body `X-Hub-Signature-256` webhook verification.
- `X-GitHub-Delivery` idempotency.
- Real `push` commit ingestion and `pull_request` upsert ingestion.
- Pull-request author mapping only when the student's immutable GitHub user ID is verified.
- GitHub App user OAuth flow to verify and store `github_user_id` + username.
- Project contribution timeline and explicit PR → task linking.
- Private repository flag is retained and no code/diff content is exposed in this checkpoint.

## Deliberately not implemented
- AI PR review (next sprint; source evidence must exist first).
- Commit-count scoring, Peer Score, Build Score, or leaderboard.
- Public Proof-of-Work publication.
- Background queue. Webhook work is intentionally small/synchronous for the pilot; move expensive work off-request before scale.

## Trust rules
GitHub is authoritative for repository/PR state. The model does not create GitHub facts. Duplicate deliveries do not duplicate evidence. An unmapped GitHub actor remains unmapped rather than being guessed from a display name.
