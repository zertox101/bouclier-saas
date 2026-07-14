@echo off
echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║   BOUCLIER SAAS - ARRET DOCKER                          ║
echo ║   Advanced Cyber Defense Platform                       ║
echo ╚══════════════════════════════════════════════════════════╝
echo.

echo [1/2] Arret des services Docker...
docker-compose down

if %errorlevel% neq 0 (
    echo.
    echo [ERREUR] Echec de l'arret des services
    pause
    exit /b 1
)

echo.
echo [2/2] Verification...
docker ps

echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║   SERVICES ARRETES AVEC SUCCES                          ║
echo ╚══════════════════════════════════════════════════════════╝
echo.
echo Pour redemarrer les services:
echo   start_docker.bat
echo.
echo Pour supprimer aussi les volumes (donnees):
echo   docker-compose down -v
echo.
pause
