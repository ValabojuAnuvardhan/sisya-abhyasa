# Contributing to Śiṣya Abhyāsa

Thank you for your interest in contributing to **Śiṣya Abhyāsa**! We welcome contributions from developers, designers, writers, educators, and open-source enthusiasts around the world.

---

## Code of Conduct

All contributors are expected to adhere to our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before participating in our community.

---

## How Can I Contribute?

- **Reporting Bugs**: Submit a structured bug report via [GitHub Issues](.github/ISSUE_TEMPLATE/bug_report.md).
- **Suggesting Features**: Share your ideas via [Feature Requests](.github/ISSUE_TEMPLATE/feature_request.md).
- **Code & Documentation**: Submit pull requests for bug fixes, new features, or documentation enhancements.

---

## Local Development Setup

### Prerequisites
- Node.js >= 18.0.0 & npm >= 9.0.0
- Python >= 3.10 & pip
- Git

### Initial Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ValabojuAnuvardhan/sisya-abhyasa.git
   cd sisya-abhyasa
   ```

2. **Automated Environment Setup**:
   On Linux / macOS:
   ```bash
   chmod +x scripts/setup.sh
   ./scripts/setup.sh
   ```
   On Windows (PowerShell):
   ```powershell
   .\scripts\setup.ps1
   ```

3. **Manual Setup (Alternative)**:
   - Frontend setup:
     ```bash
     cd apps/web
     npm install
     cp .env.example .env
     npm run dev
     ```
   - API setup:
     ```bash
     cd apps/api
     python -m venv venv
     source venv/bin/activate # or venv\Scripts\Activate.ps1 on Windows
     pip install -r requirements.txt
     cp .env.example .env
     uvicorn app.main:app --reload
     ```

---

## Branching & Commit Conventions

### Branch Strategy
- `main`: Production-ready branch.
- `feat/feature-name`: New features.
- `fix/bug-description`: Bug fixes.
- `docs/doc-update`: Documentation changes.

### Commit Message Format
We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```text
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

**Types**:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

---

## Pull Request Checklist

Before submitting a Pull Request, please ensure:
1. All lint checks pass (`./scripts/lint.sh` or `.\scripts\lint.ps1`).
2. Unit and E2E tests pass (`./scripts/test.sh` or `.\scripts\test.ps1`).
3. You have referenced applicable issue numbers.
4. Your commits follow Conventional Commits formatting.
