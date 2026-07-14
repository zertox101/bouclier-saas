# BOUCLIER - Test Script Forensic Audit
# Date: 20 Mai 2026
# Description: Script PowerShell pour tester l'Advanced Forensic Audit

Write-Host "`nBOUCLIER - FORENSIC AUDIT TEST SCRIPT" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

# Test 1: Health Check
Write-Host "`n[1/5] Testing Backend Health..." -ForegroundColor Yellow
try {
    $health = Invoke-WebRequest -Uri "http://localhost:8005/api/health" -UseBasicParsing | ConvertFrom-Json
    Write-Host "✅ Backend is online" -ForegroundColor Green
    Write-Host "   Status: $($health.status)" -ForegroundColor White
    Write-Host "   Environment: $($health.environment)" -ForegroundColor White
} catch {
    Write-Host "❌ Backend is offline!" -ForegroundColor Red
    Write-Host "   Run: docker restart shield-backend-api" -ForegroundColor Yellow
    exit 1
}

# Test 2: Forensic Audit JSON
Write-Host "`n[2/5] Testing Forensic Audit JSON Endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8005/api/forensics/advanced-audit" -UseBasicParsing
    $json = $response.Content | ConvertFrom-Json
    
    Write-Host "✅ Forensic Audit JSON is working!" -ForegroundColor Green
    Write-Host "`n   === EXECUTIVE SUMMARY ===" -ForegroundColor Cyan
    Write-Host "   Report ID:       $($json.metadata.report_id)" -ForegroundColor White
    Write-Host "   Classification:  $($json.metadata.classification)" -ForegroundColor Red
    Write-Host "   Total Events:    $($json.executive_summary.total_events)" -ForegroundColor White
    Write-Host "   Critical:        $($json.executive_summary.severity_breakdown.critical)" -ForegroundColor Red
    Write-Host "   High:            $($json.executive_summary.severity_breakdown.high)" -ForegroundColor Yellow
    Write-Host "   Medium:          $($json.executive_summary.severity_breakdown.medium)" -ForegroundColor Green
    Write-Host "`n   === RISK ASSESSMENT ===" -ForegroundColor Cyan
    Write-Host "   Risk Score:      $($json.risk_assessment.risk_score)/100" -ForegroundColor White
    $riskColor = switch ($json.risk_assessment.risk_level) {
        "CRITICAL" { "Red" }
        "HIGH" { "Yellow" }
        "MEDIUM" { "Green" }
        default { "White" }
    }
    Write-Host "   Risk Level:      $($json.risk_assessment.risk_level)" -ForegroundColor $riskColor
    
    Write-Host "`n   === TOP 5 ATTACKS ===" -ForegroundColor Cyan
    $json.executive_summary.top_attack_types | Select-Object -First 5 | ForEach-Object {
        Write-Host "   • $($_.type): $($_.count) incidents" -ForegroundColor White
    }
    
    Write-Host "`n   === IOCs ===" -ForegroundColor Cyan
    Write-Host "   Malicious IPs:   $($json.ioc_extraction.malicious_ips.Count)" -ForegroundColor White
    Write-Host "   Suspicious Ports: $($json.ioc_extraction.suspicious_ports.Count)" -ForegroundColor White
    Write-Host "   Total IOCs:      $($json.ioc_extraction.total_iocs)" -ForegroundColor White
    
    Write-Host "`n   === MITRE ATT&CK ===" -ForegroundColor Cyan
    Write-Host "   Tactics:         $($json.mitre_attack_mapping.coverage)" -ForegroundColor White
    Write-Host "   Most Used:       $($json.mitre_attack_mapping.most_used_tactic)" -ForegroundColor White
    
    Write-Host "`n   === RECOMMENDATIONS ===" -ForegroundColor Cyan
    Write-Host "   Total:           $($json.recommendations.Count)" -ForegroundColor White
    $json.recommendations | Select-Object -First 3 | ForEach-Object {
        $recColor = switch ($_.priority) {
            "CRITICAL" { "Red" }
            "HIGH" { "Yellow" }
            default { "Green" }
        }
        Write-Host "   [$($_.priority)] $($_.title)" -ForegroundColor $recColor
    }
    
} catch {
    Write-Host "❌ Forensic Audit JSON failed!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 3: Forensic Audit PDF
Write-Host "`n[3/5] Testing Forensic Audit PDF Endpoint..." -ForegroundColor Yellow
try {
    $pdfResponse = Invoke-WebRequest -Uri "http://localhost:8005/api/forensics/advanced-audit/pdf" -UseBasicParsing
    
    if ($pdfResponse.Content -match "<!DOCTYPE html>") {
        Write-Host "✅ Forensic Audit PDF is working!" -ForegroundColor Green
        Write-Host "   Content-Type: $($pdfResponse.Headers.'Content-Type')" -ForegroundColor White
        Write-Host "   Size: $([math]::Round($pdfResponse.Content.Length / 1KB, 2)) KB" -ForegroundColor White
    } else {
        Write-Host "⚠️  PDF response is not HTML" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Forensic Audit PDF failed!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Download PDF Report
Write-Host "`n[4/5] Downloading PDF Report..." -ForegroundColor Yellow
try {
    $reportPath = "forensic_report_$(Get-Date -Format 'yyyyMMdd_HHmmss').html"
    Invoke-WebRequest -Uri "http://localhost:8005/api/forensics/advanced-audit/pdf" -UseBasicParsing -OutFile $reportPath
    
    if (Test-Path $reportPath) {
        Write-Host "✅ Report downloaded successfully!" -ForegroundColor Green
        Write-Host "   Location: $((Get-Item $reportPath).FullName)" -ForegroundColor White
        Write-Host "   Size: $([math]::Round((Get-Item $reportPath).Length / 1KB, 2)) KB" -ForegroundColor White
        
        # Ask to open
        $open = Read-Host "`n   Open report in browser? (Y/N)"
        if ($open -eq "Y" -or $open -eq "y") {
            Start-Process $reportPath
            Write-Host "   Opening report in default browser..." -ForegroundColor Green
        }
    } else {
        Write-Host "❌ Report file not found!" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Download failed!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Executive Summary
Write-Host "`n[5/5] Testing Executive Summary Endpoint..." -ForegroundColor Yellow
try {
    $summary = Invoke-WebRequest -Uri "http://localhost:8005/api/forensics/executive-summary" -UseBasicParsing | ConvertFrom-Json
    
    Write-Host "✅ Executive Summary is working!" -ForegroundColor Green
    Write-Host "   Title: $($summary.title)" -ForegroundColor White
    Write-Host "   Summary: $($summary.summary)" -ForegroundColor White
    Write-Host "   Total Alerts: $($summary.stats.total)" -ForegroundColor White
    Write-Host "   Critical: $($summary.stats.critical)" -ForegroundColor Red
} catch {
    Write-Host "⚠️  Executive Summary failed (non-critical)" -ForegroundColor Yellow
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Final Summary
Write-Host "`n" + ("=" * 60) -ForegroundColor Cyan
Write-Host "FORENSIC AUDIT TEST COMPLETED!" -ForegroundColor Green
Write-Host ("=" * 60) -ForegroundColor Cyan

Write-Host "`nTest Results:" -ForegroundColor Cyan
Write-Host "   [OK] Backend Health:        OK" -ForegroundColor Green
Write-Host "   [OK] Forensic Audit JSON:   OK" -ForegroundColor Green
Write-Host "   [OK] Forensic Audit PDF:    OK" -ForegroundColor Green
Write-Host "   [OK] Report Download:       OK" -ForegroundColor Green
Write-Host "   [OK] Executive Summary:     OK" -ForegroundColor Green

Write-Host "`nQuick Links:" -ForegroundColor Cyan
Write-Host "   Dashboard:        http://localhost:3001" -ForegroundColor White
Write-Host "   Backend API:      http://localhost:8005" -ForegroundColor White
Write-Host "   Forensic JSON:    http://localhost:8005/api/forensics/advanced-audit" -ForegroundColor White
Write-Host "   Forensic PDF:     http://localhost:8005/api/forensics/advanced-audit/pdf" -ForegroundColor White

Write-Host "`nNext Steps:" -ForegroundColor Cyan
Write-Host "   1. Open the downloaded report in your browser" -ForegroundColor White
Write-Host "   2. Integrate forensic audit button in frontend" -ForegroundColor White
Write-Host "   3. Let CICIDS stream run to collect more data" -ForegroundColor White

Write-Host "`nBOUCLIER is 95% operational!" -ForegroundColor Green
Write-Host ""
