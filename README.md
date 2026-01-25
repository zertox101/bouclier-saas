
# CyberDetect / Bouclier - Unified Security Platform

Enterprise-grade Blue Team & Training Platform.

## 🚀 Quick Start (Production)

1. **Start Core Services**:
   ```bash
   docker-compose up -d --build
   ```
   Access Dashboard: http://localhost:3000
   API Docs: http://localhost:8005/docs

2. **Start Academy Labs (Isolated)**:
   ```bash
   docker-compose -f docker-compose.academy.yml up -d
   ```
   This spins up `academy-net` with isolated vulnerable targets (Juice Shop, vampi, etc).

## 🎓 CyberDetect Academy Module

A complete Learning Management System (LMS) integrated into the SOC dashboard.

### Features
- **Real-time Telemetry**: Students see their attacks generate logs live.
- **Safe Runner**: Execution of tools (Nmap, Curl) is proxy-restricted to internal targets only.
- **Isolated Network**: Labs run in `academy-net` with no internet access.

### Adding Content
- **Seed Script**: `backend/app/utils/seed_academy.py` populates the initial catalog.
- **New Labs**: Add service to `docker-compose.academy.yml` and register in DB via seed or Admin API.

### Safety Architecture
1. **Internal Network**: Targets are unreachable from the host machine or public internet.
2. **Tools Allowlist**: Only specific binaries (nmap, curl) are allowed via `tools-api`.
3. **Audit Logging**: Every tool execution and flag submission is logged to `academy_audit_events`.

## 🛠 Tech Stack
- **Frontend**: Next.js 14, TailwindCSS, Recharts
- **Backend**: FastAPI, SQLAlchemy, Postgres
- **Labs**: Docker containers (OWASP Juice Shop, etc)
