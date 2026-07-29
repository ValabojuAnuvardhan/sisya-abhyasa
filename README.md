# Śiṣya Abhyāsa — V1.1 Production & Integration Repository

This repository contains the full production architecture and frontend/backend baseline for Śiṣya Abhyāsa.

## Current Architecture & Status

- **Frontend**: React / Next.js UI (`apps/web`) with clean component system and evidence-backed skill claims.
- **Backend API**: FastAPI (`apps/api`) with Alembic database migrations and PostgreSQL/SQLite support.
- **Integrations**: GitHub App integration & evidence collection telemetry (`sensor.py`).

## Key Features

- Three-path project start experience
- Project discovery and bring-your-own project flows
- Community project collaboration and team space context
- Evidence-backed proof-of-work publishing and review flows
- GitHub integration for telemetry and evidence collection

## Development Setup

### Web App (`apps/web`)
```bash
npm install
npm run dev
```

### API Service (`apps/api`)
```bash
cd apps/api
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Testing & Verification

```bash
npm run lint
npm run build
npx playwright test
```

