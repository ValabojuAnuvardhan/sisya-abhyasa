# Śiṣya Abhyāsa — Administrator Guide

**Target Version:** v1.0.0  
**Target Audience:** System Administrators, DevOps Engineers, Operations Staff  
**Document Path:** `docs/admin/admin_guide.md`  

---

## 1. System Architecture & Topology
- **Frontend:** React 19 Single Page Application served via Vite CDN proxy.
- **Backend:** FastAPI Python REST API running on Uvicorn worker threads.
- **Database:** Managed PostgreSQL 16 instance.
- **Secrets Management:** Cloud KMS secret injection (`SISYA_SECRET_KEY`, `DATABASE_URL`, `SISYA_WEBHOOK_SECRET`).

---

## 2. Environment Variables & Secret Configuration
- Ensure `.env` or KMS secret store contains:
  ```env
  SISYA_ENVIRONMENT=production
  SISYA_ALLOW_DEV_AUTH=false
  DATABASE_URL=postgresql+psycopg://sisya_prod:Secret@db.prod.internal:5432/sisya_production
  SISYA_SECRET_KEY=<32-byte-hex>
  SISYA_SESSION_SECRET=<32-byte-hex>
  SISYA_WEBHOOK_SECRET=<32-byte-hex>
  SISYA_GEMINI_API_KEY=<gemini-key>
  ```

---

## 3. Database Maintenance & Alembic Migrations
- Execute schema migrations:
  ```bash
  alembic upgrade head
  ```
- Rollback one migration:
  ```bash
  alembic downgrade -1
  ```

---

## 4. Backups, Restore & Disaster Recovery
- **Daily Automated Backup:** PostgreSQL pg_dump snapshot configured at 02:00 UTC.
- **Restore Dry-Run Procedure:**
  ```bash
  pg_restore -h db.staging.internal -U sisya_stage -d sisya_staging backup_snapshot.dump
  ```
- **RTO:** < 30 Minutes | **RPO:** < 5 Minutes (WAL shipping enabled).
