# Release Process & Deployment Guide

This document outlines the official release process for **Śiṣya Abhyāsa**, detailing versioning standards, quality assurance checklists, database migration protocols, and deployment procedures.

---

## 1. Versioning Standard

Śiṣya Abhyāsa adheres to [Semantic Versioning 2.0.0 (SemVer)](https://semver.org/):
- **MAJOR (`X.0.0`)**: Breaking architectural changes, incompatible API updates.
- **MINOR (`1.X.0`)**: Backwards-compatible new features (e.g., new Sprint capabilities, AI Mentor upgrades).
- **PATCH (`1.0.X`)**: Backwards-compatible bug fixes and security patches.

---

## 2. Pre-Release Verification Checklist

Before tagging or releasing any version, all steps in this checklist **MUST PASS**:

### 1. Code Quality & Formatting
- [ ] Run linter on web app: `cd apps/web && npm run lint`
- [ ] Check TypeScript type validity: `cd apps/web && npx tsc --noEmit`

### 2. Backend Test Suite
- [ ] Execute full pytest suite: `cd apps/api && python -m pytest tests/`
- [ ] Verify 100% test pass rate with zero errors.

### 3. Database Migration Integrity
- [ ] Test Alembic migrations on a clean database:
  ```bash
  cd apps/api
  alembic upgrade head
  ```

### 4. Frontend Production Build
- [ ] Execute optimized Next.js build:
  ```bash
  cd apps/web
  npm run build
  ```
- [ ] Confirm all static and dynamic pages compile without build warnings or errors.

### 5. Playwright E2E Integration Suite
- [ ] Execute Playwright end-to-end user journey tests:
  ```bash
  npx playwright test
  ```

---

## 3. Release Sequence & Tagging

1. **Update Release Metadata**:
   - Update `version` in `apps/api/app/main.py`.
   - Update `version` in `apps/web/package.json`.
   - Append release highlights to `CHANGELOG.md`.

2. **Commit Release Preparation**:
   ```bash
   git add .
   git commit -m "chore(release): prepare v1.1.0 release"
   ```

3. **Tag Version in Git**:
   ```bash
   git tag -a v1.1.0 -m "Release v1.1.0 - Community Discovery & Team Space"
   git push origin main --tags
   ```

---

## 4. Deployment Environments

### Production Frontend (Vercel)
- Continuous deployment triggers automatically on `main` push.
- Build command: `cd apps/web && npm run build`.

### Production Backend (FastAPI / Cloud Container)
- Execute container build: `docker-compose build`.
- Run migrations: `alembic upgrade head`.
- Start Uvicorn worker process: `uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4`.
