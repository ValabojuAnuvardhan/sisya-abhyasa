# Śiṣya Abhyāsa — Release Notes (v1.0.0)

**Release Tag:** `v1.0.0`  
**Release Date:** July 29, 2026  
**Document Path:** `docs/release/release_notes_v1.0.0.md`  

---

## 1. Feature Highlights
- **Student Identity & Authentication:** `scrypt` password hashing, email verification, 5-attempt rate-limiting lockout, HttpOnly cookies.
- **AI Project Architect:** 6-week roadmap generator with task completion criteria and resource links.
- **Community Marketplace:** Project discovery cards with transparent **AI Match Explanations**.
- **Team Space & `@mentor` Chat:** Real-time team chat with `#task-id` tag referencing, `@mentor` AI guidance, and Google Meet integration.
- **GitHub Signed Webhooks:** HMAC SHA-256 webhook validation, identity mapping, duplicate protection guard (`delivery_id`).
- **Evidence Engine:** Automatic Demonstrated Skill Evidence extraction upon verified PR merge.
- **Proof-of-Work Profiles:** Private preview, public publishing, unpublish 404 controls, and PII protection.

---

## 2. Deferred Features
- Self-serve password reset endpoint (`/auth/forgot-password`) — Deferred to v1.1.0.
- JSON structured stdout logging — Deferred to v1.1.0.
