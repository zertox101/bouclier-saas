@echo off
REM Script de démarrage rapide pour tester les corrections
REM Network Dissector et Red Team Ops

echo.
echo ========================================
echo   BOUCLIER SaaS - Services Corriges
echo   Network Dissector ^& Red Team
echo ========================================
echo.

REM Vérifier si Python est installé
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERREUR] Python n'est pas installe ou pas dans le PATH
    pause
    exit /b 1
)

echo [INFO] Python detecte
echo.

REM Vérifier si Node.js est installé
node --version >nul 2>&1
if errorlevel 1 (
    echo [AVERTISSEMENT] Node.js n'est pas installe - Frontend ne pourra pas demarrer
) else (
    echo [INFO] Node.js detecte
)
echo.

REM Demander quel service démarrer
echo Que voulez-vous demarrer?
echo.
echo 1. Backend seulement (port 8005)
echo 2. Frontend seulement (port 3001)
echo 3. Les deux (Backend + Frontend)
echo 4. Tests automatiques
echo 5. Quitter
echo.

set /p choice="Votre choix (1-5): "

if "%choice%"=="1" goto backend
if "%choice%"=="2" goto frontend
if "%choice%"=="3" goto both
if "%choice%"=="4" goto tests
if "%choice%"=="5" goto end

echo [ERREUR] Choix invalide
pause
exit /b 1

:backend
echo.
echo ========================================
echo   Demarrage du Backend (port 8005)
echo ========================================
echo.
cd backend
echo [INFO] Installation des dependances...
pip install -r requirements.txt >nul 2>&1
echo [INFO] Demarrage du serveur...
echo.
echo Backend disponible sur: http://localhost:8005
echo API Health: http://localhost:8005/api/health
echo Network Dissector API: http://localhost:8005/api/network/interfaces
echo Red Team API: http://localhost:8005/api/saas/control/redteam/status
echo.
echo Appuyez sur Ctrl+C pour arreter
echo.
python -m uvicorn app.main:app --reload --port 8005
goto end

:frontend
echo.
echo ========================================
echo   Demarrage du Frontend (port 3001)
echo ========================================
echo.
cd frontend
echo [INFO] Installation des dependances...
call npm install >nul 2>&1
echo [INFO] Demarrage du serveur...
echo.
echo Frontend disponible sur: http://localhost:3001
echo Network Dissector: http://localhost:3001/network-dissector
echo Red Team: http://localhost:3001/red-team
echo.
echo Appuyez sur Ctrl+C pour arreter
echo.
call npm run dev
goto end

:both
echo.
echo ========================================
echo   Demarrage Backend + Frontend
echo ========================================
echo.
echo [INFO] Demarrage du Backend en arriere-plan...
cd backend
start "Backend API" cmd /k "python -m uvicorn app.main:app --reload --port 8005"
timeout /t 5 /nobreak >nul

echo [INFO] Demarrage du Frontend...
cd ..\frontend
start "Frontend Dev" cmd /k "npm run dev"

echo.
echo ========================================
echo   Services demarres!
echo ========================================
echo.
echo Backend: http://localhost:8005
echo Frontend: http://localhost:3001
echo.
echo Pages corrigees:
echo - Network Dissector: http://localhost:3001/network-dissector
echo - Red Team Ops: http://localhost:3001/red-team
echo.
echo Fermez les fenetres pour arreter les services
echo.
pause
goto end

:tests
echo.
echo ========================================
echo   Execution des Tests
echo ========================================
echo.
echo [INFO] Verification que le backend est demarre...
curl -s http://localhost:8005/api/health >nul 2>&1
if errorlevel 1 (
    echo [ERREUR] Le backend n'est pas demarre!
    echo Veuillez d'abord demarrer le backend (option 1 ou 3)
    pause
    goto end
)

echo [INFO] Backend detecte, execution des tests...
echo.
python test_fixes.py
echo.
pause
goto end

:end
echo.
echo Au revoir!
exit /b 0
