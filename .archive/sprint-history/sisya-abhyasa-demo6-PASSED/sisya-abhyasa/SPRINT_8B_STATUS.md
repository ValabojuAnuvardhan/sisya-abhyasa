# Sprint 8B — Project-aware Team Space

Implemented on the verified Sprint 8A baseline.

## Included
- Project-member-only team chat persisted in PostgreSQL.
- Structured message references to real project tasks, GitHub pull requests, and active team members.
- `Task #N` and `PR #N` are resolved to real project objects when a message is created; stored references keep stable object IDs.
- `@mentor` creates contextual guidance using the referenced task completion criteria and trusted PR metadata available to Śiṣya.
- Mentor explicitly avoids claims about tests, code correctness, or private diffs when those facts are unavailable.
- Owner-managed Google Meet link; active members can open Join Meeting.
- Removed/non-members lose Team Space, chat history, and meeting-link access through the existing project membership authorization boundary.
- Chat messages and meeting activity do not create skill evidence, Proof-of-Work, scores, or verification claims.

## Deliberately deferred
- Native video/WebRTC.
- Google Calendar/Meet API meeting creation.
- Realtime WebSocket delivery/read receipts/typing indicators.
- Chat-derived performance scoring.
- External AI access to private repository code.

## Migration
Apply Alembic revision `0009` after `0008`.
