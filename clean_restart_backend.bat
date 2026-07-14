@echo off
echo ========================================
echo   CLEAN RESTART - Backend
echo ========================================
echo.

echo [Step 1] Cleaning Python cache...
cd backend
if exist app\__pycache__ (
    rmdir /s /q app\__pycache__
    echo ✓ Cleaned app\__pycache__
)
if exist app\routers\__pycache__ (
    rmdir /s /q app\routers\__pycache__
    echo ✓ Cleaned app\routers\__pycache__
)
if exist app\routes\__pycache__ (
    rmdir /s /q app\routes\__pycache__
    echo ✓ Cleaned app\routes\__pycache__
)

echo.
echo [Step 2] Starting backend with clean cache...
echo.
python -m uvicorn app.main:app --host 0.0.0.0 --port 8005 --reload
