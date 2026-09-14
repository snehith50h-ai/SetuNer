# NE-ROUTE Background Service Starter
$projectRoot = Split-Path -Parent $PSScriptRoot
$apiDir = Join-Path $projectRoot "apps\api"
$webDir = Join-Path $projectRoot "apps\web"
$logsDir = Join-Path $projectRoot "logs"

if (-not (Test-Path $logsDir)) {
    New-Item -ItemType Directory -Path $logsDir | Out-Null
}

$apiLog = Join-Path $logsDir "api.log"
$webLog = Join-Path $logsDir "web.log"

Write-Host "Checking NE-ROUTE service status..." -ForegroundColor Cyan

# Check Port 8008 (API)
$apiConn = Get-NetTCPConnection -LocalPort 8008 -ErrorAction SilentlyContinue
if ($apiConn) {
    Write-Host "[API] FastAPI backend is already running on port 8008 (PID: $($apiConn.OwningProcess[0]))" -ForegroundColor Green
} else {
    Write-Host "[API] Starting FastAPI backend on port 8008 in background..." -ForegroundColor Yellow
    $uvicornExe = Join-Path $apiDir ".venv\Scripts\uvicorn.exe"
    if (-not (Test-Path $uvicornExe)) {
        $found = Get-Command uvicorn -ErrorAction SilentlyContinue
        $uvicornExe = if ($found) { $found.Source } else { "uvicorn" }
    }
    $apiCmd = "Set-Location '$apiDir'; & '$uvicornExe' src.main:app --host 0.0.0.0 --port 8008 *> '$apiLog'"
    Start-Process powershell -ArgumentList "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", $apiCmd -WindowStyle Hidden
}

# Check Port 3000 (Web Frontend)
$webConn = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($webConn) {
    Write-Host "[WEB] Next.js frontend is already running on port 3000 (PID: $($webConn.OwningProcess[0]))" -ForegroundColor Green
} else {
    Write-Host "[WEB] Starting Next.js frontend on port 3000 in background..." -ForegroundColor Yellow
    $npmExe = (Get-Command npm.cmd -ErrorAction SilentlyContinue).Source
    if (-not $npmExe) {
        $npmExe = (Get-Command npm -ErrorAction SilentlyContinue).Source
    }
    if (-not $npmExe) { $npmExe = "npm" }
    $webCmd = "Set-Location '$webDir'; & '$npmExe' run start *> '$webLog'"
    Start-Process powershell -ArgumentList "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", $webCmd -WindowStyle Hidden
}

Start-Sleep -Seconds 2

# Verification
try {
    $resApi = Invoke-RestMethod -Uri "http://127.0.0.1:8008/health" -TimeoutSec 3 -ErrorAction Stop
    Write-Host "[API Health] $($resApi.status) - $($resApi.service)" -ForegroundColor Green
} catch {
    Write-Host "[API Health] Initializing (Logs: $apiLog)" -ForegroundColor Gray
}

try {
    $resWeb = Invoke-WebRequest -Uri "http://127.0.0.1:3000" -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
    Write-Host "[WEB Health] HTTP $($resWeb.StatusCode) - Ready" -ForegroundColor Green
} catch {
    Write-Host "[WEB Health] Initializing (Logs: $webLog)" -ForegroundColor Gray
}

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "NE-ROUTE services are active in background:" -ForegroundColor Cyan
Write-Host "  * Web Application : http://localhost:3000" -ForegroundColor White
Write-Host "  * API Backend     : http://localhost:8008" -ForegroundColor White
Write-Host "  * API Docs        : http://localhost:8008/docs" -ForegroundColor White
Write-Host "=========================================" -ForegroundColor Cyan
