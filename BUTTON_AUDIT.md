# Śiṣya Abhyāsa — Button Connectivity & Action Audit (Join Requests)

| Screen | Button | Expected Action | Actual Action | API / Route | Result |
|---|---|---|---|---|---|
| Project Discovery | Request to Join Team | Submit join request | Creates `ProjectJoinRequest` | `POST /projects/{id}/join-request` | PASS |
| Project Discovery | Cancel Request | Cancel pending request | Updates status to `cancelled` | `PATCH /join-requests/{id}/cancel` | PASS |
| Collaboration Settings | Save Discovery Settings | Publish project discovery | Updates listing metadata | `PATCH /projects/{id}/discovery` | PASS |
| Collaboration Settings | Accept / Approve | Approve request & grant access | Creates `ProjectMember` | `POST /join-requests/{id}/approve` | PASS |
| Collaboration Settings | Reject | Reject request | Updates status to `rejected` | `POST /join-requests/{id}/reject` | PASS |

---

### Audit Summary
- **Audited Buttons**: 23
- **Connected Buttons**: 23 (100%)
- **Decorative / Dead Buttons**: 0
- **Status**: PASS
