# Śiṣya Abhyāsa — Production Deployment Checklist (v1.0.0)

**Target Release:** `v1.0.0`  
**Document Path:** `docs/release/v1.0.0/deployment_checklist.md`  

---

## 1. Pre-Deployment Phase (T-60 to T-15)
- [x] **Git Release Tag:** Verified tag `v1.0.0` exists on clean commit `c89f210a`.
- [x] **Automated Tests:** Verified Playwright E2E suite (`8/8 passed`).
- [x] **Secrets Audit:** Verified 100% of production secrets injected via Cloud KMS.
- [x] **Database Snapshot:** Taken pre-deployment PostgreSQL dump (`pre_deploy_v1.0.0.dump`).

---

## 2. Deployment Cutover Phase (T0 to T+30)
- [x] **Alembic Schema Migrations:** Applied migrations `0001` through `0010`.
- [x] **Backend Container Deployment:** Deployed `sisya-api:v1.0.0` to Green cluster.
- [x] **Frontend SPA Sync:** Synced static assets to CDN S3 bucket and purged cache.
- [x] **DNS Switch:** Switched production router to Green cluster (`api.sisya.app`).

---

## 3. Post-Deployment Phase (T+30 to T+60)
- [x] **Health Check:** `GET /api/v1/health` returning `200 OK`.
- [x] **Automated Smoke Tests:** Executed live production Playwright tests.
- [x] **Monitoring Active:** Verified log aggregation and metric alerts.
