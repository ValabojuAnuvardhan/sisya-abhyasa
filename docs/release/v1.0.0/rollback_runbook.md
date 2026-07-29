# Śiṣya Abhyāsa — Emergency Rollback Runbook (v1.0.0)

**Target Release:** `v1.0.0`  
**Document Path:** `docs/release/v1.0.0/rollback_runbook.md`  

---

## 1. Emergency Rollback Triggers
- Any P1 service outage lasting > 15 minutes post-cutover.
- Data corruption during database migration.
- Security vulnerability discovered during live validation.

---

## 2. Step-by-Step Rollback Execution
1. **Revert DNS Router to Blue Environment:**
   ```bash
   aws route53 change-resource-record-sets --hosted-zone-id Z12345 --change-batch file://k8s/rollback_dns.json
   ```
2. **Downgrade Database Schema Version:**
   ```bash
   cd apps/api && alembic downgrade -1
   ```
3. **Restore PostgreSQL Database Snapshot (If Data Corrupted):**
   ```bash
   pg_restore -h db.prod.internal -U sisya_prod -d sisya_production pre_deploy_v1.0.0.dump
   ```
4. **Notify Team & Stakeholders:** Post incident update to `#announcements`.
