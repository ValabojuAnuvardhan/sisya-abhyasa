#!/usr/bin/env bash
set -e

echo "=== Running Code Quality & Linting Verification ==="

echo "[1/2] Running ESLint..."
npm run lint

echo "[2/2] Checking Python Syntax..."
cd apps/api
if [ -d "venv" ]; then
    source venv/bin/activate
fi
python -m py_compile app/main.py
cd ../..

echo "=== All Lint Checks Passed Cleanly! ==="
