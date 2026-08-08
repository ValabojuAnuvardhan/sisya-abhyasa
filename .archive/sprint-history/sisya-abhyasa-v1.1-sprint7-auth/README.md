# Śiṣya Abhyāsa — V1.1 Frontend Baseline

This repository is the cleaned frontend prototype for the approved V1.1 product direction.

## Current status

Sprint 0 cleanup baseline. The UI is still React + Vite and uses local prototype data. It is **not** the final production architecture.

Removed from the active V1 UI:
- internship-first navigation
- BuildScore / Peer Score
- fake verification and badge claims
- simulated GitHub scoring
- browser-side LLM provider calls
- professor/open-source/company marketplace controls (V2+)

Preserved/introduced:
- existing visual identity and reusable UI
- three-path project start experience
- lightweight project idea discovery prototype
- bring-your-own project flow
- community-project collaboration foundation
- Proof-of-Work placeholder designed for future real evidence

## Planned production architecture

- Next.js + TypeScript frontend
- FastAPI backend
- PostgreSQL + Alembic
- server-side AI orchestration
- GitHub App + signed webhooks
- evidence-backed skill claims

## Run

```bash
npm install
npm run dev
```

## Verify

```bash
npm run lint
npm run build
npx playwright test
```
