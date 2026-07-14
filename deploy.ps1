<#
.SYNOPSIS
  Bouclier SaaS — Deployment Script
.DESCRIPTION
  Build + deploy l'infrastructure complète Bouclier SaaS.

  Usage:
    .\deploy.ps1              # Build & start tout
    .\deploy.ps1 -noCache     # Build sans cache
    .\deploy.ps1 -down        # Stop tout
    .\deploy.ps1 -restart     # Restart tout
    .\deploy.ps1 -logs        # Follow logs
    .\deploy.ps1 -profile full  # Démarrer avec ZAP + DVWA
#>
param(
  [switch]$down,
  [switch]$restart,
  [switch]$logs,
  [switch]$noCache,
  [string]$profile = "default"
)

$ROOT = $PSScriptRoot
$COMPOSE_FILE = "$ROOT\docker-compose.yml"
$ENV_FILE = "$ROOT\.env"
$PROJECT = "bouclier"

function Test-DockerEngine {
  try {
    $null = docker info 2>&1
    Write-Host "[OK] Docker Engine accessible" -ForegroundColor Green
  } catch {
    Write-Host "[FAIL] Docker Engine indisponible" -ForegroundColor Red
    exit 1
  }
}

function Test-EnvFile {
  if (-not (Test-Path $ENV_FILE)) {
    Write-Host "[WARN] .env introuvable. Copie depuis .env.example..." -ForegroundColor Yellow
    Copy-Item "$ROOT\.env.example" $ENV_FILE
    Write-Host "[WARN] Modifiez .env avant de deployer en production !" -ForegroundColor Yellow
  }
  Write-Host "[OK] .env present" -ForegroundColor Green
}

function Invoke-Build {
  $cmd = @("compose", "-f", $COMPOSE_FILE, "--project-name", $PROJECT, "--env-file", $ENV_FILE, "build")
  if ($noCache) { $cmd += "--no-cache" }
  Write-Host ">>> Building images (profile: $profile)..." -ForegroundColor Cyan
  & docker @cmd 2>&1
  if ($LASTEXITCODE -ne 0) {
    Write-Host "[FAIL] Build failed" -ForegroundColor Red
    exit 1
  }
  Write-Host "[OK] Build termine" -ForegroundColor Green
}

function Invoke-Start {
  $cmd = @("compose", "-f", $COMPOSE_FILE, "--project-name", $PROJECT, "--env-file", $ENV_FILE, "up", "-d", "--remove-orphans")
  if ($profile -ne "default") {
    $cmd += "--profile"; $cmd += $profile
  }
  Write-Host ">>> Demarrage des conteneurs (profile: $profile)..." -ForegroundColor Cyan
  & docker @cmd 2>&1
  if ($LASTEXITCODE -ne 0) {
    Write-Host "[FAIL] Start failed" -ForegroundColor Red
    exit 1
  }
  Write-Host "[OK] Conteneurs demarres" -ForegroundColor Green
  Write-Host "  Frontend : http://localhost:3002" -ForegroundColor Magenta
  Write-Host "  Backend   : http://localhost:8005" -ForegroundColor Magenta
  Write-Host "  Tools-API : http://localhost:8100" -ForegroundColor Magenta
}

function Invoke-Stop {
  Write-Host ">>> Arret des conteneurs..." -ForegroundColor Cyan
  docker compose -f $COMPOSE_FILE --project-name $PROJECT --env-file $ENV_FILE down --remove-orphans 2>&1
  Write-Host "[OK] Conteneurs arretes" -ForegroundColor Green
}

# --- Main ---
Write-Host "=== Bouclier SaaS - Deployment ===" -ForegroundColor Cyan
Test-DockerEngine

if ($down) { Invoke-Stop; exit 0 }
if ($restart) {
  Invoke-Stop
  Start-Sleep -Seconds 2
  Test-EnvFile
  Invoke-Start
  docker compose -f $COMPOSE_FILE --project-name $PROJECT --env-file $ENV_FILE ps
  exit 0
}
if ($logs) {
  docker compose -f $COMPOSE_FILE --project-name $PROJECT --env-file $ENV_FILE logs -f
  exit 0
}

Test-EnvFile
Invoke-Build
Invoke-Start
docker compose -f $COMPOSE_FILE --project-name $PROJECT --env-file $ENV_FILE ps

Write-Host "[OK] Deploiement termine !" -ForegroundColor Green
Write-Host "  Logs  : .\deploy.ps1 -logs" -ForegroundColor Gray
Write-Host "  Stop  : .\deploy.ps1 -down" -ForegroundColor Gray
