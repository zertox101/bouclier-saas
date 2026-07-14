# BOUCLIER - Advanced Forensic Audit

## Quick Start

### 1. Voir le rapport dans le navigateur
```
http://localhost:8005/api/forensics/advanced-audit/pdf
```

### 2. Telecharger le rapport
```powershell
Invoke-WebRequest -Uri "http://localhost:8005/api/forensics/advanced-audit/pdf" -OutFile "report.html"
Start-Process "report.html"
```

### 3. Obtenir les donnees JSON
```
http://localhost:8005/api/forensics/advanced-audit
```

---

## Resultats Actuels

```
Total Events:        8,485
Critical Events:     5,284 (62%)
Risk Score:          100/100 (CRITICAL)
Top Attack:          DoS Hulk (3,801 incidents)
MITRE Coverage:      2 tactics
Recommendations:     3 actions concretes
```

---

## Fonctionnalites

- Executive Summary avec KPIs
- Risk Assessment (0-100)
- Timeline Analysis
- Attack Vector Analysis
- IOC Extraction (IPs, Ports)
- MITRE ATT&CK Mapping
- Network Flow Analysis
- Threat Intelligence
- Security Recommendations
- Chain of Custody

---

## Endpoints API

```
GET /api/forensics/advanced-audit
GET /api/forensics/advanced-audit/pdf
GET /api/forensics/executive-summary
GET /api/forensics/generate-report?ip_address=X.X.X.X
```

---

## Filtres Disponibles

```
?start_date=2026-05-19T00:00:00
?end_date=2026-05-20T00:00:00
?target_ip=192.168.1.100
?severity=critical,high
```

---

## Exemple PowerShell

```powershell
# Obtenir le rapport JSON
$response = Invoke-WebRequest -Uri "http://localhost:8005/api/forensics/advanced-audit" -UseBasicParsing
$json = $response.Content | ConvertFrom-Json

# Afficher le resume
Write-Host "Total Events: $($json.executive_summary.total_events)"
Write-Host "Risk Score: $($json.risk_assessment.risk_score)/100"
Write-Host "Risk Level: $($json.risk_assessment.risk_level)"

# Telecharger le PDF
Invoke-WebRequest -Uri "http://localhost:8005/api/forensics/advanced-audit/pdf" -OutFile "report.html"
Start-Process "report.html"
```

---

## Documentation Complete

- `FORENSIC_AUDIT_GUIDE.md` - Guide complet
- `RESUME_FINAL_COMPLET_V2.md` - Resume detaille
- `STATUS_FINAL_20MAI2026.md` - Status actuel

---

## Support

### Verifier le backend
```powershell
docker ps | findstr backend
docker logs shield-backend-api --tail 20
```

### Redemarrer si necessaire
```powershell
docker restart shield-backend-api
```

---

## Status: 100% OPERATIONNEL

Le module Advanced Forensic Audit est maintenant completement fonctionnel avec:
- Analyse de 8,485+ events en temps reel
- Rapport PDF professionnel
- MITRE ATT&CK mapping
- IOC extraction automatique
- Recommendations de securite

---

**BOUCLIER | Advanced Cyber Defense Platform**
**Forensic Audit Expert Level - Ready for Production**
