# Śiṣya Abhyāsa — Operations Runbook

**Target Version:** v1.0.0  
**Target Audience:** SREs, System Administrators, Support Operations  
**Document Path:** `docs/operations/operations_runbook.md`  

---

## 1. Daily Operations Cadence
- **08:00 UTC:** Review health check metrics (`GET /api/v1/health`) and Uvicorn log error rates.
- **12:00 UTC:** Audit GitHub webhook ingestion latency (`del-*` events). Target: < 100ms.
- **18:00 UTC:** Inspect database pool connection stats.

---

## 2. Weekly Operations Cadence
- **Mondays:** Review AI `@mentor` latency and Google Gemini quota usage.
- **Wednesdays:** Execute database backup restore test on staging environment.
- **Fridays:** Perform dependency CVE audit (`pip audit` and `npm audit`).

---

## 3. Capacity & Health Monitoring Thresholds
- **CPU Utilization Threshold:** Alert at > 75% sustained over 10 minutes.
- **Memory Threshold:** Alert at > 80% RAM.
- **Database Storage Threshold:** Alert at < 20% free disk space.
