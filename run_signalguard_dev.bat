@echo off
echo ==============================================
echo    SIGNALGUARD - HUMAN LAYER SECURITY (DEV)
echo ==============================================

echo [+] Installing API Gateway dependencies...
pip install -r humanlayer\apps\api-gateway\requirements.txt

echo [+] Starting SignalGuard API Gateway (Port 8000)...
start "SignalGuard API" cmd /k "cd humanlayer\apps\api-gateway && uvicorn app:app --reload --port 8000"

echo [+] Starting Frontend (Port 3002)...
cd frontend
docker-compose down
echo [!] Ensure you have Node.js installed locally. Starting dev server...
npm install
npm run dev

pause
