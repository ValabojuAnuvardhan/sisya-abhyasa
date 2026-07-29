#!/usr/bin/env bash
set -e

echo "=== Running Śiṣya Abhyāsa Automated Test Suites ==="

echo "[1/2] Running API Unit Tests..."
cd apps/api
if [ -d "venv" ]; then
    source venv/bin/activate
fi
pytest tests/
cd ../..

echo "[2/2] Running Playwright E2E Tests..."
npx playwright test

echo "=== All Test Suites Executed Successfully! ==="
