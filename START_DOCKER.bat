@echo off
echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║   BOUCLIER SAAS - DEMARRAGE DOCKER                      ║
echo ║   Advanced Cyber Defense Platform                       ║
echo ╚══════════════════════════════════════════════════════════╝
echo.

REM Vérifier si Docker est installé
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERREUR] Docker n'est pas installé ou n'est pas dans le PATH
    echo.
    echo Veuillez installer Docker Desktop depuis:
    echo https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo [1/5] Verification de Docker...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERREUR] Docker n'est pas demarre
    echo.
    echo Veuillez demarrer Docker Desktop et reessayer
    pause
    exit /b 1
)
echo [OK] Docker est demarre
echo.

echo [2/5] Verification des fichiers .env...
if not exist .env (
    echo [ATTENTION] Fichier .env manquant
    echo Creation du fichier .env par defaut...
    (
        echo DB_HOST=db
        echo DB_PORT=5432
        echo DB_USER=bouclier_user
        echo DB_PASSWORD=bouclier_password_prod
        echo DB_NAME=bouclier_data
        echo REDIS_HOST=redis
        echo REDIS_PORT=6379
        echo LLM_BASE_URL=http://ai-gateway:8200
        echo LLM_MODEL=llama3.2:3b
        echo TOOLS_API_SECRET=BOUCLIER_ALPHA_SESSION_2026
    ) > .env
    echo [OK] Fichier .env cree
) else (
    echo [OK] Fichier .env existe
)
echo.

echo [3/5] Arret des anciens containers...
docker-compose down >nul 2>&1
echo [OK] Anciens containers arretes
echo.

echo [4/5] Demarrage des services Docker...
echo.
echo Cela peut prendre quelques minutes la premiere fois...
echo.
docker-compose up -d

if %errorlevel% neq 0 (
    echo.
    echo [ERREUR] Echec du demarrage des services
    echo.
    echo Verifiez les logs avec: docker-compose logs
    pause
    exit /b 1
)

echo.
echo [5/5] Verification des services...
timeout /t 5 /nobreak >nul

docker ps

echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║   SERVICES DEMARRES AVEC SUCCES                         ║
echo ╚══════════════════════════════════════════════════════════╝
echo.
echo Acces aux services:
echo.
echo   Frontend:        http://localhost:3001
echo   Backend API:     http://localhost:8005/docs
echo   AI Gateway:      http://localhost:8200
echo   Tools API:       http://localhost:8100
echo.
echo Pour voir les logs:
echo   docker-compose logs -f
echo.
echo Pour arreter les services:
echo   docker-compose down
echo.
pause
