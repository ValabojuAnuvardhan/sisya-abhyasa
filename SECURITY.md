# Security Policy

Śiṣya Abhyāsa takes security seriously. We appreciate responsible disclosure from security researchers and the open-source community to keep our platform, users, and infrastructure safe.

---

## Supported Versions

Only the latest major/minor release of Śiṣya Abhyāsa receives security updates.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

---

## Reporting a Vulnerability

**Please do NOT create a public GitHub issue for security vulnerabilities.**

If you discover a security vulnerability in Śiṣya Abhyāsa, please disclose it responsibly by following these steps:

1. **Email Security Team**: Send a detailed report to `security@sisya-abhyasa.org` or open a confidential Security Advisory on GitHub via the **Security** tab -> **Report a vulnerability**.
2. **Include Key Details**:
   - Description of the vulnerability and potential impact.
   - Exact steps or proof-of-concept (PoC) to reproduce the issue.
   - Affected component(s) (`apps/api`, `apps/web`, authentication, API routes).
   - Any suggested mitigations or patches.

### Response SLA

- **Acknowledgment**: Within 24-48 hours.
- **Triage & Status Update**: Within 5 business days.
- **Fix & Patch Advisory**: Delivered within 30 days depending on severity level.

---

## Security Practices

Śiṣya Abhyāsa implements multi-layered security controls:
- **Authentication**: JWT-based session security with bcrypt password hashing.
- **Environment Isolation**: Strict segregation between production, dev, and test secrets.
- **Automated Scanning**: Dependabot automated security updates and GitHub CodeQL analysis.
- **API Protection**: Input validation via Pydantic & FastAPI parameter validation.
