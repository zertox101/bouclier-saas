@echo off
setlocal enabledelayedexpansion

echo 🛡️  [Bouclier SaaS] - Initializing Enterprise Stack...
echo ----------------------------------------------------

:: Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not running. Please start Docker Desktop first.
    pause
    exit /b
)

echo [+] Starting Docker containers...
docker compose up -d --build

echo [+] Waiting for services to initialize...
timeout /t 10 /nobreak >nul

echo 🛡️  Stack Status:
echo ----------------------------------------------------
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo.
echo [+] PLATFORM ACCESS:
echo ----------------------------------------------------
echo [Frontend] : http://localhost:3000 (Redirects to 3001)
echo [GUI Port] : http://localhost:3001
echo [API Core] : http://localhost:8005
echo [Tools API]: http://localhost:8100
echo.
echo [Postgres] : localhost:5433 (shield_db)
echo [Redis]    : localhost:6380
echo [Ollama AI]: localhost:11434
echo ----------------------------------------------------
echo Success: Enterprise Command Center is ready.
pause
