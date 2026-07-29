# Śiṣya Abhyāsa — Launch-Specific Incident Runbook

**Target Release:** `v1.0.0`  
**Document Path:** `docs/release/v1.0.0/public_launch/launch_incident_runbook.md`  

---

## 1. Traffic Spike / Load Overload Mitigation
- **Symptom:** API latency > 500ms or 503 Service Unavailable errors.
- **Action:** Scale container pod replicas from 4 to 12 (`kubectl scale deployment sisya-api --replicas=12`).

---

## 2. GitHub Webhook Delivery Outage
- **Symptom:** Merged PRs not triggering evidence generation.
- **Action:** Verify GitHub App secret integrity and inspect `X-Hub-Signature-256` log outputs. Re-queue unprocessed webhook payloads via retry script.

---

## 3. AI Guidance Provider Rate Limit
- **Symptom:** `@mentor` prompts return 429 Too Many Requests.
- **Action:** Fallback logic automatically serves local architectural guidance templates without hanging client UI.
