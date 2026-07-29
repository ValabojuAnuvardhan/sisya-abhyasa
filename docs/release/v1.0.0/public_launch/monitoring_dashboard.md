# Śiṣya Abhyāsa — Production Monitoring Dashboard Specifications

**Target Release:** `v1.0.0`  
**Document Path:** `docs/release/v1.0.0/public_launch/monitoring_dashboard.md`  

---

## 1. Technical Health Dashboards
- **API Latency (p95):** Target < 50ms | Alert > 200ms
- **HTTP Error Rate:** Target < 0.05% | Alert > 1.0%
- **Database Query Latency:** Target < 5ms | Alert > 50ms
- **GitHub Webhook Ingestion Latency:** Target < 100ms | Alert > 500ms
- **AI Guidance Response Latency:** Target < 2.0s | Alert > 5.0s

---

## 2. Business & Product Dashboards
- **Daily Active Registrations:** Live counter of email-verified students
- **Projects Created & Joined:** Real-time count of active project teams
- **Merged PR Evidence Count:** Real-time counter of verified PR merges
- **Proof-of-Work Profiles Published:** Real-time count of public `/proof/{id}` profiles
