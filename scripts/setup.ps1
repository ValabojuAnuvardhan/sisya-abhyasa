$ErrorActionPreference = "Stop"

Write-Host "=== Śiṣya Abhyāsa Automated Environment Setup ===" -ForegroundColor Green

Write-Host "[1/3] Installing Root & Web Dependencies..." -ForegroundColor Cyan
npm install
Set-Location apps/web
npm install
Set-Location ..\..

Write-Host "[2/3] Setting up Python Virtual Environment..." -ForegroundColor Cyan
Set-Location apps/api
if (-not (Test-Path "venv")) {
    python -m venv venv
}
& ".\venv\Scripts\Activate.ps1"
pip install --upgrade pip
pip install -r requirements.txt
Set-Location ..\..

Write-Host "[3/3] Initializing Environment Files..." -ForegroundColor Cyan
if (-not (Test-Path "apps/web/.env") -and (Test-Path "apps/web/.env.example")) {
    Copy-Item "apps/web/.env.example" "apps/web/.env"
    Write-Host "Created apps/web/.env" -ForegroundColor Yellow
}

if (-not (Test-Path "apps/api/.env") -and (Test-Path "apps/api/.env.example")) {
    Copy-Item "apps/api/.env.example" "apps/api/.env"
    Write-Host "Created apps/api/.env" -ForegroundColor Yellow
}

Write-Host "=== Setup Completed Successfully! ===" -ForegroundColor Green
