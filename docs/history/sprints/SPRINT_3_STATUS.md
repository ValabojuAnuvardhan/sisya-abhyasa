# Sprint 3 — A1 Project Architect checkpoint

## Implemented
- Both V1 entry paths converge on `/projects/new`: selected discovery recommendation or student's own idea.
- A1 Project Architect endpoint returns a bounded, structured plan.
- Plan Review is mandatory before persistence.
- Accepted plans persist to PostgreSQL as Projects → Milestones → Tasks.
- Project detail reloads the accepted plan from the backend.
- Ownership is enforced server-side on project reads.
- Local demo architect keeps the project runnable at $0 while preserving a server-side AI boundary for later provider integration.

## Deliberately deferred
- Real provider-backed A1 generation and resource URL retrieval/validation.
- Kanban task transitions, assignment, contextual mentor.
- GitHub App/evidence.
- Production identity provider.

## Alignment check
No Peer Score, Build Score, fake internship status, fake GitHub evidence, or browser-side AI keys. AI guidance does not establish verification facts.

## Demo 3 acceptance path
Onboard → Find project OR Bring own idea → Project draft → Generate plan → inspect milestones/tasks/completion criteria → edit/regenerate if needed → Accept & create → reload persisted project.
