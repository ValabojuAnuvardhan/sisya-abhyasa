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

### 4. LOCKED UI DESIGN SYSTEM & COLOR PALETTE (MANDATORY & UNALTERABLE)
- **Design Palette**: Śiṣya Abhyāsa MUST ALWAYS use the **Light Latte & Mint** design system across 100% of frontend pages and components. Black/dark-slate backgrounds (`bg-slate-950`, `bg-slate-900`, `bg-black`) are STRICTLY FORBIDDEN and LOCKED.
- **Canonical Theme Colors**:
  - `page background`: Warm Cream / Light Latte (`#e4ddd3` / `#f7f2eb`)
  - `text color`: Warm Charcoal Ink (`#1a1410`)
  - `muted text`: `#7a6f67`
  - `primary accent`: Mint Teal (`#00a19b` / hover `#008782`)
  - `card background`: Soft Cream (`#eee8df` / `bg-white/80 border border-black/10 shadow-sm rounded-2xl`)
  - `active pills / buttons`: Dark Charcoal (`#1a1410`) or Mint Teal (`#00a19b`) with white text.

### 5. FUTURE PHASE AGENT ENGINEERING CONTRACT (LOCKED BASELINE E8+)
- **Baseline Immutability**: Phase E8 execution architecture (Dependencies, Blockers, Sprints, Workload Engine, Next Best Action) is **LOCKED**. Future phases extend existing models/routes/services; zero parallel V2 models or duplicate systems allowed.
- **Zero Mock Data Pipeline**: Database -> Model -> Service -> Route -> `apps/web/lib/api.ts` -> React State -> UI.
- **100% Button Connectivity**: Every UI button must execute a real REST API mutation or route navigation.
- **0 Orphan Routes**: Every screen must have a discoverable UI navigation path.
- **Mandatory 3 UI States**: Loading (Skeleton), Success (Real DB Data), Error / Empty.
- **Multi-User & Rebuild Privacy**: Student A vs Student B isolation; 0 private data leakage on project rebuild.
- **Evidence Boundary**: Verified merged GitHub PR webhooks remain the sole source of verified Skill Evidence.
- **Mandatory Phase Deliverables**: Every future phase must generate `PHASE_X_IMPLEMENTATION_REPORT.md`, `ROUTE_AUDIT.md`, `BUTTON_AUDIT.md`, `STATIC_DATA_AUDIT.md`, and `CODEBASE_CLEANUP_REPORT.md`.

### 6. THE 20-STEP PRE-EXECUTION & DELIVERY PIPELINE
1. Read `.agents/AGENTS.md`
2. Inspect existing architecture
3. Search for reusable models/services/components
4. Identify affected E1–E8 functionality
5. Design additive changes in `implementation_plan.md`
6. Implement backend extensions
7. Implement API helper extensions (`apps/web/lib/api.ts`)
8. Implement UI components inheriting Light Latte & Mint system
9. Connect UI buttons & navigation paths
10. Test real database flow
11. Test Student A vs Student B privacy isolation
12. Test E6 rebuild data isolation
13. Run backend pytest regression suites
14. Run Next.js production build (`npx next build`)
15. Perform browser E2E walkthrough
16. Audit static/mock data (`STATIC_DATA_AUDIT.md`)
17. Audit routes & buttons (`ROUTE_AUDIT.md` & `BUTTON_AUDIT.md`)
18. Clean unused temporary files safely (`CODEBASE_CLEANUP_REPORT.md`)
19. Generate final implementation report (`PHASE_X_IMPLEMENTATION_REPORT.md`)
20. Declare phase **COMPLETE** only after all 19 steps pass.
