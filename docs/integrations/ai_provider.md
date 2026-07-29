# Śiṣya Abhyāsa — AI Guidance Provider Guide

**Target Version:** v1.0.0  
**Target Audience:** AI Engineers, Backend Developers, DevOps  
**Document Path:** `docs/integrations/ai_provider.md`  

---

## 1. Provider & Model Configuration
- **Provider:** Google Gemini API (`gemini-2.5-flash-lite`)
- **Key Injection:** Secret `SISYA_GEMINI_API_KEY` injected via Cloud KMS
- **Role System Prompt:** Enforces role as `@mentor` for Śiṣya Abhyāsa.

---

## 2. Timeouts & Fallback Management
- **Timeout Threshold:** 15 Seconds
- **Exponential Backoff:** Max 3 retries.
- **Fallback Behavior:** Returns local architectural guidance if API key is missing or service degrades.
