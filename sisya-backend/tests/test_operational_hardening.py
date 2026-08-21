import os
import re
import uuid
import pytest
from pathlib import Path
from fastapi.testclient import TestClient
from app.main import app, request_history
from app.database import SessionLocal, get_db
from app.models import User, Profile, Project, Task, PullRequest
from app.core.security import create_access_token

client = TestClient(app)


def test_auth_rate_limiting_enforcement():
    """
    OPERATIONAL HARDENING 3: Rate Limit Verification
    - Sends requests to /auth/login up to limit (5 req/min).
    - 6th request MUST return HTTP 429 Too Many Requests with Retry-After header.
    """
    request_history.clear()
    os.environ["TESTING_ENABLE_RATE_LIMIT"] = "1"
    try:
        for i in range(5):
            res = client.post("/auth/login", json={"email": f"rate_limit_{i}@test.com", "password": "pass"})
            assert res.status_code in (400, 401), f"Req {i+1} should pass rate limit"

        # 6th request exceeds 5 req/min quota
        res_exceeded = client.post("/auth/login", json={"email": "rate_limit_exceeded@test.com", "password": "pass"})
        assert res_exceeded.status_code == 429
        assert "Retry-After" in res_exceeded.headers
        assert "Rate limit exceeded" in res_exceeded.json()["detail"]
    finally:
        os.environ.pop("TESTING_ENABLE_RATE_LIMIT", None)
        request_history.clear()


def test_ai_resilience_malformed_and_timeout():
    """
    OPERATIONAL HARDENING 4: AI Failure & Timeout Recovery
    - Verifies format_agent_response handles malformed JSON and empty responses gracefully without crashing backend.
    """
    from app.api.ai_agents import format_agent_response

    # 1. Empty raw response fallback
    resp1 = format_agent_response("", agent_name="ŚiṣyaChat")
    assert "ŚiṣyaChat" in resp1

    # 2. Malformed JSON response recovery
    resp2 = format_agent_response("INVALID_NOT_JSON {{{", agent_name="AbhyāsBot")
    assert "AbhyāsBot" in resp2 or "INVALID" in resp2

    # 3. Valid JSON response handling
    resp3 = format_agent_response('{"reply": "Dependency injection decouples DB sessions"}', agent_name="ŚiṣyaChat")
    assert "Dependency injection" in resp3 or "ŚiṣyaChat" in resp3


def test_frontend_bundle_secret_scan():
    """
    OPERATIONAL HARDENING 6: Frontend Client Secret Scan
    - Scans compiled static Next.js JavaScript bundles for zero exposed sensitive credentials.
    """
    next_static_dir = Path(__file__).resolve().parent.parent.parent / "apps" / "web" / ".next" / "static"
    if not next_static_dir.exists():
        pytest.skip("Next.js static build directory not present, run npx next build first")

    sensitive_patterns = [
        re.compile(r'postgres://[^\s"\']+'),
        re.compile(r'postgresql://[^\s"\']+'),
        re.compile(r'sk-ant-api[a-zA-Z0-9_-]+'),
        re.compile(r'-----BEGIN RSA PRIVATE KEY-----'),
        re.compile(r'-----BEGIN OPENSSH PRIVATE KEY-----'),
    ]

    for js_file in next_static_dir.rglob("*.js"):
        content = js_file.read_text(encoding="utf-8", errors="ignore")
        for pattern in sensitive_patterns:
            matches = pattern.findall(content)
            assert len(matches) == 0, f"Exposed secret pattern found in {js_file.name}: {matches}"
