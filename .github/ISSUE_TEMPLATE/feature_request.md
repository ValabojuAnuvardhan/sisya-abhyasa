name: ✨ Feature Request
description: Suggest an idea or new feature for Śiṣya Abhyāsa.
title: "[FEAT]: "
labels: ["enhancement"]
assignees: []
body:
  - type: markdown
    attributes:
      value: |
        Thank you for suggesting a feature! Please provide as much detail as possible.

  - type: textarea
    id: problem
    attributes:
      label: Is your feature request related to a problem?
      description: A clear description of what the problem or limitation is.
    validations:
      required: true

  - type: textarea
    id: solution
    attributes:
      label: Proposed Solution
      description: A clear description of what you want to happen.
    validations:
      required: true

  - type: textarea
    id: alternatives
    attributes:
      label: Alternatives Considered
      description: Any alternative solutions or features you have considered.

  - type: dropdown
    id: category
    attributes:
      label: Feature Category
      options:
        - AI Mentorship & Code Review
        - Team Space & Collaboration
        - Evidence Engine & Proof-of-Work
        - Community Discovery
        - Developer Experience / Tooling
    validations:
      required: true
