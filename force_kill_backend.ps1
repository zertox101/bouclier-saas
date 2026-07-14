# Force kill backend process
Write-Host "Attempting to kill backend process (PID: 29124)..." -ForegroundColor Yellow

try {
    # Try to stop the process
    Stop-Process -Id 29124 -Force -ErrorAction Stop
    Write-Host "✓ Process killed successfully" -ForegroundColor Green
    Start-Sleep -Seconds 2
    
    # Verify port is free
    $portCheck = netstat -ano | Select-String ":8005" | Select-String "LISTENING"
    if ($portCheck) {
        Write-Host "! Port 8005 is still occupied. Trying again..." -ForegroundColor Red
        Start-Sleep -Seconds 3
        
        # Get new PID if changed
        $newPid = ($portCheck | Select-Object -First 1) -replace '.*\s+(\d+)$', '$1'
        Write-Host "Killing process $newPid..." -ForegroundColor Yellow
        Stop-Process -Id $newPid -Force -ErrorAction Stop
    } else {
        Write-Host "✓ Port 8005 is now free" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please run this script as Administrator:" -ForegroundColor Yellow
    Write-Host "Right-click → Run as Administrator" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
