---
name: local-software-tester
description: Equips the agent to completely test software applications running on a local host machine (localhost). It covers local server discovery, environment variables, full-stack test generation, browser execution, and test self-healing.
---

# Localhost Full-Stack Software Testing Skill

## 1. Local Pre-Flight & Server Validation
- **Find the Port**: Scan the local file system (e.g., `package.json`, `docker-compose.yml`, `.env`) to find out which local port the application runs on (e.g., `3000`, `8080`).
- **Check Server Status**: Check if the local development server is already running on that port. 
- **Start if Necessary**: If the server is offline, use your terminal permissions to safely run the startup command (e.g., `npm run dev` or `python main.py`) as a background process. Wait until the local endpoint resolves cleanly before launching any tests.

## 2. Test Setup & Guardrails
- **Zero Production Mutations**: Never hardcode production URLs. Force the test configuration to point explicitly to `http://localhost:<PORT>` as the `baseURL`.
- **Dependency Injections**: Ensure testing frameworks (like Playwright, PyTest, or Jest) are fully installed in the local path. If missing, automatically run the local installer (e.g., `npm i -D @playwright/test` or `pip install pytest`).
- **Isolate Local State**: If the tests alter data, prioritize using isolated test databases or mock API payloads to prevent breaking local developer workspace data.

## 3. Intelligent E2E & Component Testing
- **Visual Mapping**: Use visual scanning capabilities or layout structures to interact with the UI elements naturally like a human user.
- **Resilient Locators**: Always output tests using modern accessibility roles (e.g., `getByRole`, `getByPlaceholder`, `getByText`) instead of highly fragile CSS selectors or long XPath strings.
- **Web-First Assertions**: Ensure every single written test uses modern `await expect()` states to naturally handle local network rendering delays.

## 4. Local Execution & Self-Healing Workflow
- **Execute via Terminal**: Trigger the local testing runner (e.g., `npx playwright test` or `pytest tests/`).
- **Diagnose on Failure**: If a test case fails, do not give up immediately. Read the local stdout error stream, check if a UI selector changed or a button timed out, patch the code autonomously (Self-Healing), and re-run.
- **Generate Local Artifacts**: Capture visual screenshots or execution traces of local failures and save them explicitly inside the `.agents/artifacts/` folder for review.

## Verification Checklist
- [ ] Local application server is active and verified via an HTTP ping.
- [ ] Test scripts successfully write into an isolated testing directory.
- [ ] Selectors completely bypass fragile classes and use stable human roles.
- [ ] Entire test lifecycle runs, heals, and closes local processes without causing local server memory leaks.
