# Śiṣya Abhyāsa — Student User Guide

**Target Version:** v1.0.0  
**Target Audience:** Undergraduate Computer Science & Engineering Students  
**Document Path:** `docs/user-guide/student_guide.md`  

---

## 1. Introduction & Platform Overview
**Śiṣya Abhyāsa** is an AI-powered project-based learning platform where students build real collaborative software projects, receive contextual AI guidance via `@mentor`, generate GitHub-backed skill evidence, and publish verified Proof-of-Work profiles.

---

## 2. Account Registration & Login Workflow
1. **Registration:** Click **Sign Up**, enter your full name, university email, and a secure password.
2. **Email Verification:** Check your inbox for a 24-hour verification link/token and verify your account.
3. **Login:** Log in with your email and password. Your session cookie (`sisya_session`) is securely issued over HttpOnly/TLS.

---

## 3. Student Onboarding & Profile Setup
- Complete your student profile by specifying your **Target Career Role** (e.g. *Full Stack Developer*, *Backend Engineer*), **Experience Level**, and **Existing / Target Skill Tags** (e.g. *Python*, *React*, *FastAPI*).

---

## 4. AI Project Architect
- Use the **Project Architect** to generate or select a 6-week project roadmap.
- Each milestone contains tasks with explicit **Completion Criteria** and **Learning Resource Links**.

---

## 5. Community Discovery & Join Requests
1. Navigate to the **Community Marketplace** tab.
2. Browse active student projects. Each project card displays a transparent **AI Match Explanation** (*"You already have Python; You could learn FastAPI; Full Stack match"*).
3. Click **Request to Join Team**, enter your pitch, and submit your request.

---

## 6. Workspace & Task Board
- Once accepted by the Project Owner, access the project **Workspace**.
- View assigned tasks on the Kanban board and transition task state (`To Do` → `In Progress`).

---

## 7. Team Space & `@mentor` AI Guidance
- Access **Team Space** chat to talk with team members.
- Reference tasks using `#task-id` syntax (e.g., *"Working on #task-1"*).
- Type `@mentor <your question>` to invoke the AI Mentor for contextual architectural advice.
- Access the team **Google Meet** link for live syncs.

---

## 8. GitHub Identity Linking & Pull Requests
1. Navigate to the **GitHub Integration** tab and click **Authorize GitHub Account**.
2. Link your GitHub username (e.g., `@priya-code`) via OAuth identity binding.
3. Create a feature branch (`feat/task-1-geojson`), commit code, and open a Pull Request on GitHub referencing `#task-1`.
4. When the Project Owner merges your PR, Śiṣya's webhook engine automatically processes the signed event and marks your task `Completed`.

---

## 9. Evidence Engine & Proof-of-Work Portfolio
- The **Evidence Engine** reviews merged PR diffs against completion criteria and generates **Demonstrated Skill Cards**.
- Preview your private **Proof-of-Work Profile**, verify demonstrated skills, and click **Publish Profile**.
- Share your public profile link (`/proof/{user_id}`) on LinkedIn or resume portfolios. Private repo URLs and raw code remain hidden.

---

## 10. FAQ & Troubleshooting
- **Q: Why didn't my PR generate skill evidence?**  
  *A:* Ensure your GitHub account is linked via OAuth and your PR title or commit message references `#task-id`.
- **Q: Can outsiders view my private codebase?**  
  *A:* No. Public Proof-of-Work profiles display verified skill tags and diff summaries, never private repository URLs or source code lines.
