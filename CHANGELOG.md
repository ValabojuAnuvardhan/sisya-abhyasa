# Changelog

All notable changes to **Śiṣya Abhyāsa** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-07-30

### Added
- **Core Platform Architecture**: Initial production release of Śiṣya Abhyāsa featuring FastAPI backend and Next.js / React frontend baseline.
- **Three-Path Project Journey**: Experience paths for Guided Learning, Bring-Your-Own Project, and Open Source / Community Discovery.
- **Authentication & Sessions**: JWT session authentication (`/api/v1/auth`) with bcrypt password security.
- **Community & Project Discovery**: Public project discovery API (`/api/v1/community`), join requests, and project creation endpoints.
- **Team Space Context**: Context-aware team space chat, real-time activity feeds, and milestone collaboration tools.
- **Evidence Collection & Proof-of-Work**: Automated GitHub telemetry collection (`sensor.py`), signed commit evidence verification, and proof publishing UI.
- **Alembic Database Migrations**: 10 incremental database migrations (`0001` through `0010`) covering users, profiles, skills, projects, tasks, reviews, and evidence tracking.
- **Enterprise Open-Source Infrastructure**: CI/CD workflows, automated testing scripts, security policy (`SECURITY.md`), contributor guide (`CONTRIBUTING.md`), and comprehensive repository audit.

---

## [Unreleased]

### Planned
- Real-time WebSockets integration for team space chat.
- GitHub App webhook integration for direct PR review feedback.
- AI Mentor automated code review suggestions via local LLM orchestrator.
