$ErrorActionPreference = "Stop"

Write-Host "=== Running Code Quality & Linting Verification ===" -ForegroundColor Green

Write-Host "[1/2] Running ESLint..." -ForegroundColor Cyan
npm run lint

Write-Host "[2/2] Checking Python Syntax..." -ForegroundColor Cyan
Set-Location apps/api
if (Test-Path "venv\Scripts\Activate.ps1") {
    & ".\venv\Scripts\Activate.ps1"
}
python -m py_compile app/main.py
Set-Location ..\..

Write-Host "=== All Lint Checks Passed Cleanly! ===" -ForegroundColor Green
