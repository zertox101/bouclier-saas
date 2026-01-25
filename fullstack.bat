@echo off
echo ==========================================
echo    BOUCLIER SAAS - FULL STACK STARTER
echo ==========================================
echo.

echo [+] Cleaning up any existing containers...
docker-compose down

echo [+] Building and starting services...
docker-compose up -d --build

echo.
echo [+] Stack is starting up!
echo [+] Frontend: http://localhost:3001 (Redirected from http://localhost:3000)
echo [+] Backend API: http://localhost:8005
echo [+] Tools API: http://localhost:8100
echo.
echo [!] Note: If ports are already in use, ensure other Docker projects are stopped.
echo.
pause
