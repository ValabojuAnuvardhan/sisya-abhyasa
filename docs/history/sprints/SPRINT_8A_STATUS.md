# Sprint 8A — Minimal Teams

## Implemented
- Explicit project membership with `owner` and `contributor` roles.
- Existing project creators are backfilled as owners by Alembic migration `0008`.
- Owner can add an existing authenticated student by email.
- Owner can remove a contributor without deleting historical membership/evidence.
- Owner can assign/unassign tasks to active members.
- Active contributors can see the shared project, tasks, Kanban, mentor context, and GitHub evidence.
- Contributors can update task workflow state but cannot add/remove members, assign tasks, or connect/replace the project repository.
- Contributors may link only their own attributed PRs; owners retain project management authority.
- Non-members receive 404 for private project/task access.

## Intentionally deferred
- Project discovery and join requests (Sprint 9).
- Project chat and Google Meet link (Sprint 8B).
- Automatic inactivity removal.
- Meeting/chat activity as skill evidence (explicitly prohibited).

## Acceptance gate
Use three real authenticated accounts: owner A, contributor B, outsider C. Verify B gains shared access only after membership, C remains isolated, owner-only operations reject B, task assignment persists, and removing B revokes access while historical membership/evidence rows remain.
