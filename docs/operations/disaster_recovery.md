# Śiṣya Abhyāsa — Disaster Recovery Plan (DRP)

**Target Version:** v1.0.0  
**Target Audience:** SREs, Infrastructure Leads, Enterprise Architects  
**Document Path:** `docs/operations/disaster_recovery.md`  

---

## 1. Objectives & Metrics
- **Recovery Time Objective (RTO):** `< 30 Minutes` (Complete system restoration)
- **Recovery Point Objective (RPO):** `< 5 Minutes` (WAL shipping enabled for PostgreSQL)

---

## 2. Backup & Restore Procedures
- **Database Backup:** Daily PostgreSQL `pg_dump` snapshot stored in cross-region S3 bucket.
- **Restore Execution:**
  ```bash
  pg_restore -h db.disaster-recovery.internal -U sisya_prod -d sisya_production snapshot.dump
  ```
- **Object Storage Recovery:** Cross-region AWS S3 bucket replication enabled.
