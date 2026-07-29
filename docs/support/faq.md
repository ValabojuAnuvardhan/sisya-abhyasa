# Śiṣya Abhyāsa — Frequently Asked Questions (FAQ)

**Target Version:** v1.0.0  
**Target Audience:** Students, Mentors, Administrators, Developers  
**Document Path:** `docs/support/faq.md`  

---

## 1. Student FAQ
- **Q: Is my code visible to the public on my Proof-of-Work profile?**  
  *A:* No. Public profiles hide raw repository URLs, raw commit SHAs, and source code. Only verified skill evidence tags are displayed.

---

## 2. Developer & Admin FAQ
- **Q: How does webhook idempotency work?**  
  *A:* Database enforces a unique constraint on `GithubWebhookEvent.delivery_id`. Replayed deliveries return `{"accepted": true, "duplicate": true}`.
