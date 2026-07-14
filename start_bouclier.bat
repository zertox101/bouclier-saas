@echo off
setlocal
title BOUCLIER SAAS - REAL SECURITY INFRASTRUCTURE
color 0B

echo =================================================================
echo        BOUCLIER SAAS - 100%% REAL SECURITY INFRASTRUCTURE
echo =================================================================
echo.
echo [!] REQUIS: Python 3.12, Node.js, Redis (optionnel pour remedia), Ollama
echo.

:: 0. Ensure Ollama LLM Engine is running with llama3.2:3b
echo [+] Checking Ollama LLM Engine status...
ollama list >nul 2>&1
if errorlevel 1 (
    echo [!] Ollama is not running. Starting Ollama service...
    start "BOUCLIER - Ollama LLM Engine" cmd /k "ollama serve"
    echo     Waiting for Ollama to initialize...
    timeout /t 5 /nobreak >nul
) else (
    echo [+] Ollama LLM Engine is already running.
)

echo [+] Ensuring llama3.2:3b model is warm and ready...
ollama list | findstr "llama3.2:3b" >nul 2>&1
if errorlevel 1 (
    echo [!] llama3.2:3b model not found. Pulling model...
    ollama pull llama3.2:3b
) else (
    echo [+] llama3.2:3b model is available.
)

:: Warm up the model
echo [+] Warming up llama3.2:3b model...
ollama run llama3.2:3b "Hello, this is a warmup. Respond with OK." --nowarm >nul 2>&1
echo [+] LLM Engine ready!

echo.

:: 1. Backend Core (Port 8005)
echo [+] Starting Backend Core (FastAPI)...
cd backend
start "BOUCLIER - Backend API (8005)" cmd /k "python -m app.main"
cd ..

:: 2. CICIDS Ingestor (Real Data Stream)
echo [+] Starting Real-Data Ingestor (CICIDS-2017)...
cd backend
start "BOUCLIER - CICIDS Ingestor" cmd /k "python -u cicids_ingestor.py"
cd ..

:: 3. Tools API - Mythos AI (Port 8100)
echo [+] Starting Mythos AI / Red Team API (8100)...
cd tools-api
start "BOUCLIER - Tools API (8100)" cmd /k "python -m uvicorn app:app --port 8100 --reload"
cd ..

:: 4. Auto-Remediation (PowerShell/Windows Firewall)
echo [+] Starting Auto-Remediation Engine (Requires Admin)...
cd backend
start "BOUCLIER - Remediation Engine" cmd /k "python auto_remediation.py"
cd ..

:: 5. Frontend Dashboard (Port 3000)
echo [+] Starting Frontend Dashboard (Next.js)...
cd frontend
start "BOUCLIER - Dashboard (3000)" cmd /k "npm run dev"
cd ..

echo.
echo =================================================================
echo   ALL SYSTEMS GO!
echo =================================================================
echo   Dashboard: http://localhost:3000
echo   API Core:  http://localhost:8005
echo   Mythos:    http://localhost:8100
echo =================================================================
echo.
pause
