# Śiṣya Abhyāsa — Complete Product Architecture & Functionality Blueprint

The locked-in architecture for **Śiṣya Abhyāsa**, combining the 5 platform layers, 3 dedicated AI agent personas, the Evidence Engine, Public Proof-of-Work Profiles, the Network Hub with the 🔨 **Rebuild** flywheel, and Career matching.

---

## 1. Central Product Flywheel

```
Learn ➔ Build ➔ Prove ➔ Share ➔ Collaborate ➔ Rebuild ➔ Learn again
```

```
                     ┌───────────────┐
                     │    LEARN      │
                     │  🧠 ŚiṣyaChat │
                     └───────┬───────┘
                             │
                             ▼
                     ┌───────────────┐
                     │     BUILD     │
                     │ ⚒️ AbhyāsBot  │
                     └───────┬───────┘
                             │
                             ▼
                     ┌───────────────┐
                     │     PROVE     │
                     │ 🧪 Evidence   │
                     └───────┬───────┘
                             │
                             ▼
                     ┌───────────────┐
                     │     SHARE     │
                     │ 🌐 Network    │
                     └───────┬───────┘
                             │
                             ▼
                     ┌───────────────┐
                     │ COLLABORATE   │
                     │ Teams/People  │
                     └───────┬───────┘
                             │
                             ▼
                     ┌───────────────┐
                     │    REBUILD    │
                     │   🔨 Remix     │
                     └───────┬───────┘
                             │
                             ▼
                         NEW BUILD
                             │
                             └───────────────↺
```

---

## 2. Five Core Product Layers

1. **LEARNING LAYER**: Dashboard, Career / Skill Diagnosis, Roadmap, Skill Gaps, Recommended Resources, ŚiṣyaChat.
2. **BUILDING LAYER**: Project Hub, My Projects, Discover, AI Project Architect, Project Workspace (Overview, Architecture, Milestones, Kanban, Team, GitHub, Activity, Evidence), AbhyāsBot.
3. **EVIDENCE LAYER**: GitHub Webhooks, Commits, PRs, TaskStatusHistory, AI PR Review Agent, Skill Evidence, Evidence Dashboard.
4. **PROFESSIONAL LAYER**: Profile (`/profile`), Public Proof-of-Work Profile (`/p/[userId]`), Śiṣya Abhyāsa Network Hub (`/network`, Feed, Work Posts, Likes, Comments, Shares, 🔨 Rebuild).
5. **CAREER LAYER**: Jobs (`/jobs`), Matching, Applications, Future Interview Studio (Project-based questions).

---

## 3. The 3 Dedicated AI Personas

| AI Persona | Layer | Primary Responsibility | Context & Boundaries |
| :--- | :--- | :--- | :--- |
| **🧠 ŚiṣyaChat** | 📚 Learn | Teach concepts, diagnose skill gaps, quiz students, recommend learning resources | Reads student profile & roadmap. Does NOT assist with active code building tasks. |
| **⚒️ AbhyāsBot** | 🚀 Build | Guide implementation, break down task steps, debug errors, verify task criteria | Contextually bound to active `task_id`, `project_id`, criteria, and tech stack. |
| **🧪 PR Review Agent** | 🧪 Evidence | Review merged PR metadata, extract skill signals, generate advisory evidence | Token-efficient review of PR title, diff summary, commit logs, and task context. |

---

## 4. Navigation Architecture

Header: `Home | 📚 Learn | 🚀 Build | 🌐 Network | 🧪 Evidence | 💼 Jobs | 💬 🔔 👤 Me`

- **Learn**: `/learn`, `/learn/chat`, `/learn/roadmap`, `/learn/skills`
- **Build**: `/projects`, `/projects/new`, `/projects/discover`, `/projects/[id]`, `/projects/[id]/team`
- **Evidence**: `/evidence`, `/evidence/reviews`, `/p/[userId]`
- **Network**: `/network`, `/network/people`, `/network/projects`, `/network/communities`, `/network/posts`
- **Profile**: `/profile`, `/profile/edit`, `/p/[userId]`
- **Career**: `/jobs`, `/jobs/[id]`, `/applications`, `/interview`

---

## 5. Verification & Implementation Roadmap

- **Task 1**: Update Database Models (`TaskStatusHistory`, `WorkPost`, `PostLike`, `PostComment`, `PostShare`, `PostRebuild`, `UserConnection`, `Community`).
- **Task 2**: Implement AI Agent Personas (`SisyachatService`, `AbhyasbotService`, `AiArchitectService`, `PrReviewAgent`).
- **Task 3**: Build REST API endpoints for `/api/v1/learn`, `/api/v1/network`, and 🔨 `/api/v1/network/rebuild/{post_id}`.
- **Task 4**: Create Next.js Frontend views (`/learn`, `/network`, `/projects/[id]`, `/p/[userId]`, `/jobs`).
- **Task 5**: Automated Pytest execution & Next.js build validation.
