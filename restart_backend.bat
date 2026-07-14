@echo off
echo ========================================
echo   BOUCLIER SAAS - Backend Restart
echo ========================================
echo.

echo [1/3] Killing old backend process...
taskkill /F /PID 29124 2>nul
if %errorlevel% equ 0 (
    echo ✓ Process killed successfully
) else (
    echo ! Process may already be stopped or requires admin rights
)
timeout /t 3 /nobreak >nul

echo.
echo [2/3] Verifying port 8005 is free...
netstat -ano | findstr :8005 >nul
if %errorlevel% equ 0 (
    echo ! Port 8005 is still occupied. Waiting 5 more seconds...
    timeout /t 5 /nobreak >nul
) else (
    echo ✓ Port 8005 is free
)

echo.
echo [3/3] Starting backend server...
echo.
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8005 --reload
