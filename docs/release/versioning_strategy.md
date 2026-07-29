# Śiṣya Abhyāsa — Versioning & Release Strategy

**Target Version:** v1.0.0  
**Document Path:** `docs/release/versioning_strategy.md`  

---

## 1. Semantic Versioning (SemVer 2.0.0)
- **MAJOR (`v1.0.0`):** Incompatible API schema changes or architectural overhauls.
- **MINOR (`v1.1.0`):** Backward-compatible feature additions (e.g. self-serve password reset).
- **PATCH (`v1.0.1`):** Backward-compatible bug fixes and security hotfixes.

---

## 2. Branching & Cadence Strategy
- **`main` Branch:** Always production-ready and tagged.
- **`release/vX.Y.Z` Branch:** Prepared during Code Freeze for QA and staging qualification.
- **Hotfix Process:** Hotfixes branch off `main`, tag patch release, and merge back to `main`.
