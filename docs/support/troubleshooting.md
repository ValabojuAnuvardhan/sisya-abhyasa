# Śiṣya Abhyāsa — Support Troubleshooting Guide

**Target Version:** v1.0.0  
**Target Audience:** Support Engineers, Help Desk, System Administrators  
**Document Path:** `docs/support/troubleshooting.md`  

---

## 1. Common Issues & Solutions

| Category | Issue Description | Diagnostic Step | Resolution / Fix |
| :--- | :--- | :--- | :--- |
| **Auth** | Login fails with `401 Unauthorized`. | Check 5-attempt brute force lock (`locked_until`). | Wait 15 mins or reset lock in DB. |
| **GitHub** | PR merged on GitHub, but evidence not showing. | Inspect `/api/v1/github/webhooks` logs for `delivery_id`. | Verify GitHub account linked via OAuth & `#task-id` tagged. |
| **AI Mentorship**| `@mentor` chat prompt timed out. | Check Uvicorn stdout for Gemini API 15s timeout. | System automatically retries or returns fallback. |
