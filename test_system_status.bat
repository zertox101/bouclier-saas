@echo off
echo ============================================================
echo    SHIELD SYSTEM STATUS CHECK
echo ============================================================
echo.

echo [1] Checking Docker Containers...
docker ps --format "table {{.Names}}\t{{.Status}}" | findstr /C:"shield-"
echo.

echo [2] Checking AI Gateway Health...
docker exec shield-ai-gateway curl -s http://localhost:8200/health
echo.
echo.

echo [3] Checking Ollama Models...
docker exec shield-ollama-core ollama list
echo.

echo [4] Checking Redis Cache...
docker exec shield-redis redis-cli INFO stats | findstr /C:"total_commands" /C:"keyspace_hits" /C:"keyspace_misses"
echo.

echo [5] Checking Backend API...
curl -s http://localhost:8005/api/health
echo.
echo.

echo [6] Checking Recent Backend Logs (last 10 lines)...
docker logs shield-backend-api --tail 10
echo.

echo ============================================================
echo    TEST COMPLETE
echo ============================================================
pause
