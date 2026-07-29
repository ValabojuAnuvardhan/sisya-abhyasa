# Śiṣya Abhyāsa — Deployment Runbook

**Target Version:** v1.0.0  
**Target Audience:** Release Engineers, Site Reliability Engineers (SRE)  
**Document Path:** `docs/operations/deployment_runbook.md`  

---

## 1. Pre-Deployment Verification Checklist
1. Confirm Git branch `release/v1.0.0-rc1` is tagged `v1.0.0`.
2. Confirm Playwright automated suite passed: `npx playwright test`.
3. Confirm KMS production environment secrets are injected.

---

## 2. Step-by-Step Production Deployment
1. **Pull Release Artifacts:**
   ```bash
   git checkout tags/v1.0.0
   ```
2. **Execute Database Schema Migrations:**
   ```bash
   cd apps/api && alembic upgrade head
   ```
3. **Deploy Container Image to Production Cluster:**
   ```bash
   docker build -t sisya-api:v1.0.0 apps/api/
   kubectl apply -f k8s/production/
   ```
4. **Deploy Static Frontend SPA to CDN:**
   ```bash
   cd apps/web && npm run build
   aws s3 sync dist/ s3://sisya-production-assets/
   ```

---

## 3. Post-Deployment Verification (Smoke Test)
- Query health check: `curl -I https://api.sisya.app/api/v1/health` (Expect `HTTP 200 OK`).
- Execute Playwright smoke tests: `npx playwright test --config=playwright.prod.config.js`.

---

## 4. Emergency Rollback Procedure
If p95 latency exceeds 500ms or error rates exceed 1%:
1. Revert DNS proxy to previous release target `v0.9.8`.
2. Downgrade database schema: `alembic downgrade -1`.
