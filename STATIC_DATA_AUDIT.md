# Śiṣya Abhyāsa — Static Data & Production UI Audit (Join Requests)

| Component / Screen | Code Search Query | Found Item | Classification | Action Taken |
|---|---|---|---|---|
| Community Discover | `discover` | Real DB query for open project cards | SAFE REAL DATA | Connected to `/community/projects` |
| Public Project Card | `public_project_card` | Real DB card with requester status | SAFE REAL DATA | Connected to `/community/projects/{id}` |
| Join Request Submission | `request_join` | Real DB `ProjectJoinRequest` creation | SAFE REAL DATA | Connected to `/projects/{id}/join-request` |
| Requester Requests List | `get_my_join_requests` | Real DB requests query | SAFE REAL DATA | Connected to `/join-requests/me` |
| Owner Requests Queue | `list_requests` | Real DB `ProjectJoinRequest` join `User` | SAFE REAL DATA | Connected to `/projects/{id}/join-requests` |
| Approve / Reject | `decide` | Real DB atomic `ProjectMember` creation | SAFE REAL DATA | Connected to `/join-requests/{id}/approve` |
| Cancel Request | `cancel_join_request` | Real DB status update to `cancelled` | SAFE REAL DATA | Connected to `/join-requests/{id}/cancel` |

---

### Audit Summary
- **Hardcoded Pending Requests**: 0
- **Manufactured Skill Evidence**: 0 (Join request actions produce 0 evidence).
- **Fake Member Counts**: 0
- **Zero Mock Policy Status**: PASS
