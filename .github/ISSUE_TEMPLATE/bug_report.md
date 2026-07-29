name: 🐛 Bug Report
description: Create a report to help us reproduce and fix a bug in Śiṣya Abhyāsa.
title: "[BUG]: "
labels: ["bug", "triage"]
assignees: []
body:
  - type: markdown
    attributes:
      value: |
        Thank you for reporting a bug! Please fill out the form below to help us investigate.

  - type: textarea
    id: description
    attributes:
      label: Bug Description
      description: A clear and concise description of what the bug is.
      placeholder: Describe what happened...
    validations:
      required: true

  - type: textarea
    id: steps
    attributes:
      label: Steps To Reproduce
      description: Steps to reproduce the behavior.
      placeholder: |
        1. Go to '...'
        2. Click on '....'
        3. Scroll down to '....'
        4. See error
    validations:
      required: true

  - type: textarea
    id: expected
    attributes:
      label: Expected Behavior
      description: A clear description of what you expected to happen.
    validations:
      required: true

  - type: dropdown
    id: component
    attributes:
      label: Component Affected
      options:
        - Frontend (`apps/web`)
        - Backend API (`apps/api`)
        - GitHub Integration / Sensor (`sensor.py`)
        - Database & Alembic Migrations
        - Documentation / Infrastructure
    validations:
      required: true

  - type: textarea
    id: environment
    attributes:
      label: Environment Info
      description: OS, Node.js version, Python version, Browser, etc.
      placeholder: |
        - OS: Windows / macOS / Linux
        - Node version: v20.x
        - Python version: 3.11
