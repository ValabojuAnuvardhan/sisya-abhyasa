# Śiṣya Abhyāsa — Public Launch Risk Register

**Target Release:** `v1.0.0`  
**Document Path:** `docs/release/v1.0.0/public_launch/launch_risk_register.md`  

---

## Launch Risk Matrix

| Risk Description | Probability | Impact | Severity | Risk Owner | Technical Mitigation |
| :--- | :---: | :---: | :---: | :--- | :--- |
| **R1: Unexpected Public Traffic Spike** | Low | Medium | Low | SRE Lead | Kubernetes pod autoscaling (4 → 12 pods). |
| **R2: GitHub OAuth Rate Limits** | Low | Low | Low | Backend Lead | Cached OAuth user tokens & efficient API calls. |
| **R3: User Confusion on Skill Tagging** | Low | Low | Low | PM Lead | Inline tooltip hints on onboarding modal. |
