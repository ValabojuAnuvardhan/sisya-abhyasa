# Sprint 0 Audit — V1.1 Alignment

## Planned → Current → Decision

- Student-first core loop → prototype had internship-first navigation → **corrected**.
- Project Discovery V1.1 → prototype had generic world-problem cards → **retained temporarily as clearly labeled discovery prototype; personalized A0 backend still missing**.
- Bring your own idea → prototype already has project creation → **keep and later connect to backend**.
- Community joining → prototype had four-source marketplace → **restricted active V1 UI to Community projects; professor/open-source/company publishing remains V2+**.
- Evidence-backed skills → prototype used BuildScore/Peer Score → **scores removed from active code/UI**.
- GitHub App evidence → prototype fetched public profile data → **old scoring view replaced with Proof-of-Work placeholder; real GitHub App backend still missing**.
- Server-side AI → prototype called Anthropic directly from browser → **browser provider call removed; local prototype plan only until FastAPI AI endpoints exist**.
- Trust claims → prototype used internship/badge language and fake scale metrics → **removed from active V1 UI**.
- Production frontend → current app is React/Vite JS → **not yet aligned; migration to Next.js + TypeScript is next foundation task**.
- Backend/database → absent → **missing; FastAPI + PostgreSQL/Alembic required next**.

## Verification

- ESLint passed after cleanup before dependency folder was removed for packaging.
- Search confirms no browser Anthropic endpoint remains.
- Old inactive internship component/data were removed.
- Build verification could not be rerun after removing the bundled `node_modules`; dependency reinstall exceeded the execution window. Run `npm install && npm run build` locally.

## Do not reintroduce in V1

Internship-first navigation, fake user/project counts, BuildScore, Peer Score, commit-count ranking, fake verification badges, direct browser LLM keys/calls, or professor/company marketplace claims.

## Next engineering task

Create the production foundation: Next.js + TypeScript frontend shell, FastAPI backend, PostgreSQL/Alembic, environment configuration, and health checks while preserving the cleaned visual identity.
