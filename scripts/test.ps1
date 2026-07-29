$ErrorActionPreference = "Stop"

Write-Host "=== Running Śiṣya Abhyāsa Automated Test Suites ===" -ForegroundColor Green

Write-Host "[1/2] Running API Unit Tests..." -ForegroundColor Cyan
Set-Location apps/api
if (Test-Path "venv\Scripts\Activate.ps1") {
    & ".\venv\Scripts\Activate.ps1"
}
pytest tests/
Set-Location ..\..

Write-Host "[2/2] Running Playwright E2E Tests..." -ForegroundColor Cyan
npx playwright test

Write-Host "=== All Test Suites Executed Successfully! ===" -ForegroundColor Green
