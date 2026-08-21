# Śiṣya Abhyāsa — Codebase Cleanup & File Hygiene Audit (Join Requests)

| File / Directory | Action | Reason | Safe? |
|---|---|---|---|
| `apps/api/app/models/project.py` | Extended | Reused existing `ProjectJoinRequest` & `ProjectMember` models | Yes |
| `apps/api/app/api/routes/community.py` | Extended | Added canonical join-request endpoints (`request_join`, `cancel`, `approve`, `reject`, `list_requests`, `my_requests`) | Yes |
| `apps/web/lib/api.ts` | Extended | Added typed Join Request helpers & DTOs | Yes |
| `apps/web/app/projects/discover/page.tsx` | Extended | Added Cancel Request button to pending card | Yes |
| `apps/web/app/projects/[id]/collaboration/page.tsx` | Extended | Connected owner/admin join request approval & rejection queue | Yes |
| `apps/api/tests/test_join_requests.py` | Added | 38-point automated test suite | Yes |

---

### File Hygiene Rules Checklist
- [x] **No Parallel Architectures Created**: Reused existing `ProjectJoinRequest`, `ProjectMember`, `Project`, and `User`. Zero V2 models or duplicate services created.
- [x] **No Orphan Routes Created**: `/projects/discover` and `/projects/[id]/collaboration` fully reachable via UI navigation.
- [x] **No Unnecessary Folders**: Zero scratch folders or temporary test outputs left behind.
- [x] **No Breaking Changes**: All historical E1–E10 models, routers, and 32/32 unit test files remain 100% intact.
