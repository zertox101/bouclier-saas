@echo off
setlocal
title BOUCLIER SAAS - DOCKERIZED INFRASTRUCTURE
color 0E

echo =================================================================
echo        BOUCLIER SAAS - DOCKERIZED INFRASTRUCTURE
echo =================================================================
echo.

:: Set environment variables for the frontend to find the services
set NEXT_PUBLIC_API_URL=http://localhost:8005
set NEXT_PUBLIC_TOOLS_API_URL=http://localhost:8100
set NEXT_PUBLIC_WORLD_MONITOR_URL=http://localhost:3050

echo [+] Stopping any existing containers...
docker-compose down --remove-orphans

echo [+] Building and launching all-in-one stack...
docker-compose up -d --build

echo.
echo [+] Launching Local Frontend (Vite/Next.js Mode)...
cd frontend
start "BOUCLIER - Dashboard (3000)" cmd /k "npm run dev"
cd ..

echo.
echo =================================================================
echo   DOCKER STACK DEPLOYED!
echo =================================================================
echo   Dashboard:   http://localhost:3000
echo   API Gateway: http://localhost:8005
echo   PostgreSQL:  localhost:5432
echo   Redis:       localhost:6379
echo =================================================================
echo.
pause
