# 🛡️ Bouclier SaaS - Operations & Troubleshooting Guide

Had l-guide fih kamel l-awamir (commands) bach t-demarré o t-troubleshooti l-platform mzyan.

---

## 🛰️ Service Mapping (mapin-Ports)

| Service | Port | Description |
| :--- | :--- | :--- |
| **Frontend UI** | `3002` | Dashboard principal (Next.js) |
| **Backend Core** | `8005` | API principal dial l-intelligence |
| **Tools API** | `8100` | Exécution dial nmap, nuclei, etc. |
| **Ollama AI** | `11434` | L'moteur dial Sentinel AI |
| **Redirection** | `3000` | (Daba désactivé bach t-khdem f 3002 direct) |
| **PostgreSQL** | `5433` | Database dial l-platform |
| **Redis** | `6380` | Cache o Real-time streaming |
| **ZAP Scanner** | `8081` | Web Security Scanner |
| **OpenVAS (GVM)** | `9392` | Network Vulnerability Management |

---

## ⚡ Quick Start (Docker) - 

Bach t-demarré kolchi b-mra waheda:

```powershell
# 1. Demarrage dial kolchi
docker-compose up -d

# 2. Ila bghiti t-rebuildi chi haja jdida (men ba3d l-modification)
docker-compose up -d --build

# 3. Bach t-habet kolchi (Stop)
docker-compose down
```

---

## 👨‍💻 Development Mode (Manual Start)

Ila bghiti t-demarré chque service bohdou bach t-chouf l-erreurs direct:

### 1. Frontend (Next.js)
```powershell
cd frontend
npm install
npx prisma generate
npm run dev -- -p 3002
```

### 2. Backend (FastAPI)
```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python -m app.main
```

### 3. Tools API (Tactical Tools)
```powershell
cd tools-api
pip install -r requirements.txt
python app.py
```

---

## 🔍 Troubleshooting (Salla7 l-machakil)

### 🚨 Problem: "Port is already allocated"
Had l-mouchkil kay-kon hit chi service b9a kheddam f l-background.

**L-Hal:**
```powershell
# 1. Habat Docker kamel
docker-compose down

# 2. Ila bghiti t-9tel ga3 l-node processes (Frontend)
taskkill /F /IM node.exe

# 3. Checki les ports li khedamin
netstat -ano | findstr :3002
netstat -ano | findstr :8005
```

### 🧱 Problem: "PrismaClient not found"
Kat-kon hit l-client dial Prisma ma m-generich.

**L-Hal:**
```powershell
cd frontend
npx prisma generate
```

### 🧠 Problem: "Sentinel AI ma kay-jawbech"
Checki wach Ollama kheddam o fih l-modèle:

**L-Hal:**
```powershell
# Checki l-container status
docker ps | findstr bouclier-ai

# Jareb t-jawbou direct (Health Check)
curl http://localhost:11434/api/tags
```

### 📦 Problem: "Backend ma bghach y-starti hit chi module na9ess"
Checki les logs dial l-backend:

```powershell
docker logs bouclier-api --tail 100
```

---

## 🩺 System Health Checks (Check-up)

Kopiyi hadu f l-browser dialk bach t-checki wach services kheddamin:

- **API Core**: `http://localhost:8005/health` (Khass t-chouf "healthy")
- **Tools API**: `http://localhost:8100/health` (Khass t-chouf "ok")
- **Frontend**: [http://localhost:3002/dashboard](http://localhost:3002/dashboard)

---

## 🛠️ Data Maintenance
Ila bghiti t-msa7 kolchi o t-bda mn z-zero (DANGER: Kat-msa7 ga3 l-data):

```powershell
docker-compose down -v
docker-compose up -d --build
```

---
**Guide Version**: 1.0.0 (MA-PREMIUM)  
**Region**: Casablanca Core 🇲🇦
