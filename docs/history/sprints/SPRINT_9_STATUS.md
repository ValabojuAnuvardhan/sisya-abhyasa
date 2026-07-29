# Sprint 9 — Community Project Discovery + Join Requests

## Goal
Connect discovery to the already-proven team authorization model without exposing private project data.

## Implemented
- Owner-controlled discoverable flag and collaboration pitch.
- Skills-needed list and bounded team capacity (2–12).
- Safe authenticated community listing projection.
- Profile-aware, transparent match explanation (existing skills / skills to learn / target role).
- Join request with optional short message.
- Owner accept/reject workflow.
- Accepted requests activate/create contributor membership and immediately inherit Sprint 8A/8B authorization.
- Rejected/pending students receive no private project access.
- Capacity is checked both when requesting and accepting to avoid overfilling teams.
- Historical removed memberships can be safely reactivated only by owner acceptance.

## Privacy boundary
Discovery does not return task internals, chat, meeting URL, GitHub repository URL/details, PR/commit evidence, webhook data, or private Proof-of-Work.

## Deliberately deferred
- Automated inactivity removal.
- Sophisticated ML ranking.
- Company/recruiter listings.
- Public anonymous project browsing.
- Chat/meeting activity as skill evidence.

## Acceptance gate
A publishes safe listing -> B discovers -> B requests -> A accepts -> B gains workspace/team-space access. Rejected C remains isolated. Unpublishing removes listing without removing existing members.
