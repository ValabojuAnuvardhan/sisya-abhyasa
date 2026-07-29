#!/usr/bin/env bash
set -e

echo "=== Śiṣya Abhyāsa Automated Environment Setup ==="

# Root & Web installation
echo "[1/3] Installing Root & Web Dependencies..."
npm install
cd apps/web && npm install && cd ../..

# API Virtualenv & Dependencies
echo "[2/3] Setting up Python Virtual Environment..."
cd apps/api
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
cd ../..

# Copy .env.example if .env missing
echo "[3/3] Initializing Environment Files..."
if [ ! -f "apps/web/.env" ] && [ -f "apps/web/.env.example" ]; then
    cp apps/web/.env.example apps/web/.env
    echo "Created apps/web/.env"
fi

if [ ! -f "apps/api/.env" ] && [ -f "apps/api/.env.example" ]; then
    cp apps/api/.env.example apps/api/.env
    echo "Created apps/api/.env"
fi

echo "=== Setup Completed Successfully! ==="
