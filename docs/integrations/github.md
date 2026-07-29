# Śiṣya Abhyāsa — GitHub Integration Guide

**Target Version:** v1.0.0  
**Target Audience:** Integration Engineers, DevOps, System Administrators  
**Document Path:** `docs/integrations/github.md`  

---

## 1. OAuth Identity Binding
- **Start Route:** `/api/v1/github/identity/start`
- **Callback Route:** `/api/v1/github/identity/callback`
- **Function:** Links GitHub username (e.g., `@priya-code`) to `StudentProfile`.

---

## 2. GitHub App & Webhook Ingestion
- **Webhook Endpoint:** `/api/v1/github/webhooks`
- **Signature Security:** `verify_signature()` verifies HMAC SHA-256 over `X-Hub-Signature-256`.
- **Idempotency Guard:** `GithubWebhookEvent.delivery_id` unique constraint rejects duplicate events.
