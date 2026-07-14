@echo off
echo Killing backend process (PID: 29124)...
taskkill /F /PID 29124
timeout /t 2 /nobreak >nul
echo.
echo Checking if port 8005 is free...
netstat -ano | findstr :8005
echo.
echo If port is still occupied, wait 5 seconds and run this script again.
pause
