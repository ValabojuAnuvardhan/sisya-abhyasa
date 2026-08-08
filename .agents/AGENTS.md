# Antigravity Workspace Rules — Śiṣya Abhyāsa

These rules apply to all development and engineering tasks in this workspace.

For full canonical project rules and style guidelines, see [PROJECT_RULES.md](file:///d:/Product%20ideas/sisya%20abhyasa%20core/PROJECT_RULES.md).

---

## ANTIGRAVITY AGENT AUTONOMOUS OPERATING CORE

### 1. GSD (Get Shit Done) Protocol — The Product Blueprint
- Upon receiving any requirement, perform a technical dependency check.
- Decompose the requirement into micro-atomic, completely isolated tasks.
- Document this plan in `PLAN.md` / `implementation_plan.md`.
- Obtain explicit user approval before writing implementation code.

### 2. Ralph Loop Execution — The Autonomous Dev Engine
- Focus exclusively on ONE task at a time.
- Write precise, production-grade files and immediately execute local unit tests (`pytest`), linters (`npm run lint`), and build validation suites (`npx next build`).

### 3. CodeRabbit Compliance Guard — The Senior Reviewer Gatekeeper
- Audit code diffs for edge-case coverage, optimal algorithmic complexity, zero hardcoded secrets/tokens, and strict data type safety.
- Treat any syntax, security, or logic flags as test failures. Auto-correct in the next loop iteration before declaring task completion.
