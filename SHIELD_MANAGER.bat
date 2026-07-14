@echo off
TITLE BOUCLIER SOC MANAGER // OMEGA-1
COLOR 0B
SETLOCAL EnableDelayedExpansion

:MENU
cls
echo ===============================================================================
echo   🛡️  BOUCLIER SOC PLATFORM // MASTER CONTROL CENTER
echo ===============================================================================
echo   [1] 📊 CHECK SYSTEM STATUS (DOCKER DASHBOARD)
echo   [2] ⚔️  MONITOR KALI SCANNER (OFFENSIVE LOGS)
echo   [3] 📈 DATASET FLOW & TELEMETRY STATS
echo   [4] 🧪 RUN FULL SYSTEM AUDIT (HEALTH CHECK)
echo   [5] 🔄 RESTART ALL CORE SERVICES
echo   [6] 🛠️  ACCESS KALI SHELL (TOOLS-API)
echo   [7] 📢 SYSTEM VOICE: MUTE/UNMUTE (AI SENTINEL)
echo   [8] ❌ EXIT
echo ===============================================================================
set /p choice="ENTER YOUR SELECTION (1-8): "

if "%choice%"=="1" goto STATUS
if "%choice%"=="2" goto KALI
if "%choice%"=="3" goto DATASET
if "%choice%"=="4" goto AUDIT
if "%choice%"=="5" goto RESTART
if "%choice%"=="6" goto SHELL
if "%choice%"=="7" goto MUTE
if "%choice%"=="8" exit

:STATUS
cls
echo [*] SCANNING ACTIVE CONTAINERS...
docker-compose ps
echo.
pause
goto MENU

:KALI
cls
echo [*] STREAMING KALI SCANNER LOGS (CTRL+C TO STOP)...
docker-compose logs -f kali-scanner
pause
goto MENU

:DATASET
cls
echo [*] CHECKING DATASET INGESTION FLOW...
docker-compose logs --tail=20 backend | findstr "Ingested"
if %ERRORLEVEL% NEQ 0 (
    echo [!] No active ingestion detected.
    echo [*] Checking Ingestor Status...
    docker-compose exec backend ps aux | findstr "cicids"
)
echo.
echo [*] PINGING TELEMETRY API...
curl -s http://localhost/api/traffic/stats | findstr "total_packets"
echo.
pause
goto MENU

:AUDIT
cls
echo [*] INITIATING NEURAL SHIELD SYSTEM AUDIT...
python scratch/system_audit.py
echo.
pause
goto MENU

:RESTART
cls
echo [!] WARNING: THIS WILL RESTART ALL SECURITY NODES.
set /p confirm="ARE YOU SURE? (Y/N): "
if /i "%confirm%"=="Y" (
    docker-compose restart
    echo [+] RESTART COMPLETE.
)
pause
goto MENU

:SHELL
cls
echo [*] CONNECTING TO KALI OFFENSIVE CORE...
docker exec -it shield-tools-engine bash
goto MENU

:MUTE
cls
echo [*] CONFIGURING AI SENTINEL VOICE...
echo Note: This applies to the next session refresh.
echo [1] MUTE VOICE
echo [2] UNMUTE VOICE
set /p mchoice="Select: "
if "%mchoice%"=="1" (
    echo localStorage.setItem('sentinel_voice_muted', 'true'); > scratch/mute_config.txt
    echo [+] VOICE MUTED (Changes will reflect in Dashboard).
) else (
    echo localStorage.setItem('sentinel_voice_muted', 'false'); > scratch/mute_config.txt
    echo [+] VOICE UNMUTED.
)
pause
goto MENU
