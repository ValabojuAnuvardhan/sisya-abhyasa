# Śiṣya Abhyāsa — Incident Response Plan

**Target Version:** v1.0.0  
**Target Audience:** Incident Commanders, On-Call Engineers, SRE Team  
**Document Path:** `docs/operations/incident_response.md`  

---

## 1. Incident Severity Matrix

| Severity Level | Definition / Impact | Target Response Time | Escalation Path |
| :--- | :--- | :---: | :--- |
| **P1 — Critical** | Complete service outage, authentication failure, or data breach. | **< 15 Minutes** | On-Call SRE → CTO → CISO |
| **P2 — Major** | Degraded performance, GitHub webhook failures, or AI guidance downtime. | **< 30 Minutes** | On-Call SRE → DevOps Lead |
| **P3 — Minor** | UI cosmetic glitch or non-blocking support query. | **< 4 Hours** | Support Engineer → Dev Team |

---

## 2. Incident Workflow Steps
1. **Triage:** Acknowledge alert, declare incident channel `#inc-v1-0-0`.
2. **Containment:** Isolate affected cluster nodes or switch traffic to standby replica.
3. **Remediation:** Apply hotfix or rollback to last stable release tag.
4. **Postmortem:** Conduct blameless postmortem within 48 hours and publish report.
