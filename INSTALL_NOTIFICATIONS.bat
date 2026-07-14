@echo off
echo ============================================
echo BOUCLIER - NOTIFICATION SYSTEM INSTALLER
echo ============================================
echo.

cd frontend

echo [1/3] Installing dependencies...
call npm install sonner framer-motion lucide-react

echo.
echo [2/3] Checking directory structure...
if not exist "public\sounds" mkdir "public\sounds"
if not exist "public\icons" mkdir "public\icons"

echo.
echo [3/3] Installation complete!
echo.
echo ============================================
echo NEXT STEPS:
echo ============================================
echo 1. Add sound files to: frontend\public\sounds\
echo    - alert-critical.mp3
echo    - alert-high.mp3
echo    - alert-medium.mp3
echo    - alert-info.mp3
echo.
echo 2. Test the system:
echo    - Navigate to /settings/notifications
echo    - Click "Test" buttons
echo.
echo 3. Integrate with pages:
echo    - World Monitor
echo    - Threat Monitor
echo.
echo ============================================
echo.
pause
