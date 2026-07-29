#!/usr/bin/env bash
set -e

echo "=== Śiṣya Abhyāsa Deployment Build & Validation ==="

echo "[1/3] Building Web Production Assets..."
cd apps/web
npm run build
cd ../..

echo "[2/3] Validating API Dependencies..."
cd apps/api
python -m py_compile app/main.py
cd ../..

echo "[3/3] Deployment Validation Completed Successfully!"
