# Sprint 2 — A0 Project Discovery Agent

## Implemented
- `POST /api/v1/project-ideas/recommend` behind the existing authenticated student boundary.
- Recommendations use persisted onboarding context: target role, experience, interests and canonical skills.
- Optional desired skills, difficulty and time commitment inputs.
- Strict structured recommendation contract: problem, match reason, stack, practice/learn skills, deliverables and evidence opportunities.
- Server-side Gemini adapter when `SISYA_GEMINI_API_KEY` is configured.
- Safe deterministic local Demo 2 engine when no provider key is configured, so student development remains $0 and the demo is still testable.
- Basic per-process recommendation rate limit (8/minute/identity). Production distributed rate limiting remains a hardening task.
- Provider failure falls back to the local engine instead of breaking activation.
- Discovery UI renders 3–5 recommendations and clearly labels whether results came from AI or the local demo engine.
- No browser-side provider keys/calls.

## Alignment check
- Project Discovery V1.1: ON PLAN.
- Beginner empty-screen problem: addressed.
- Evidence-first direction: recommendations explicitly include evidence opportunities.
- Trust: recommendations do not claim employer demand, sponsorship, internship status, certification or guaranteed hiring outcomes.
- Privacy: profile context stays behind authenticated API; no recommendation is public automatically.
- Scope: recommendations are not persisted yet. Persistence begins when the selected idea becomes a draft project in Sprint 3.

## Demo 2 acceptance path
1. Complete Demo 1 onboarding.
2. Open **Find me a project**.
3. Confirm saved role/level/skills are shown.
4. Add optional interests/desired skills.
5. Generate recommendations.
6. Confirm 3–5 realistic cards appear.
7. Confirm every card shows match reason, difficulty, stack, skills, deliverables and evidence opportunities.
8. Choose a project; it should route to the existing project-creation placeholder with the recommendation title in the URL.

## Deliberately not implemented yet
- Persisting selected recommendation as a Project (Sprint 3).
- A1 Project Architect / milestones / tasks / resources (Sprint 3).
- Advanced matching or marketplace ranking.
- Company/professor/open-source project sources.
- Production-grade distributed rate limiting.
