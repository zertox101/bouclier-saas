@echo off
echo ============================================
echo BOUCLIER - TEST NOTIFICATIONS
echo ============================================
echo.

echo [INFO] Ce script va ouvrir les pages de test
echo.

echo [1/3] Demarrage du navigateur...
timeout /t 2 /nobreak >nul

echo [2/3] Ouverture des pages...
start http://localhost:3000/settings/notifications
timeout /t 2 /nobreak >nul
start http://localhost:3000/world-monitor
timeout /t 2 /nobreak >nul
start http://localhost:3000/threat-monitor

echo.
echo [3/3] Pages ouvertes!
echo.
echo ============================================
echo INSTRUCTIONS DE TEST:
echo ============================================
echo.
echo 1. Page Settings (onglet 1):
echo    - Cliquer sur "Test CRITICAL"
echo    - Cliquer sur "Test HIGH"
echo    - Verifier: Son + Desktop + Toast
echo.
echo 2. Page World Monitor (onglet 2):
echo    - Attendre detection d'attaques
echo    - Verifier notifications pour Critical/High
echo.
echo 3. Page Threat Monitor (onglet 3):
echo    - Attendre evenements SSE
echo    - Verifier notifications pour HIGH/CRITICAL
echo.
echo 4. Retour Settings:
echo    - Desactiver "Sound Alerts"
echo    - Cliquer "Save Changes"
echo    - Retester - Pas de son mais Toast OK
echo.
echo 5. Tester filtrage:
echo    - Severite minimale: CRITICAL
echo    - Retester - Seulement CRITICAL notifie
echo.
echo ============================================
echo.
echo Appuyez sur une touche pour fermer...
pause >nul
