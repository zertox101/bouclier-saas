
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
- **Expert Intelligence Hub**: Integrated access to 40+ high-fidelity cybersecurity datasets (IoT, Malware, IDS) for model training.
- **Real-time Telemetry**: Students see their attacks generate logs live.
- **Safe Runner**: Execution of tools (Nmap, Curl) is proxy-restricted to internal targets only.
- **Isolated Network**: Labs run in `academy-net` with no internet access.

### Adding Content
- **Seed Script**: `backend/app/utils/seed_academy.py` populates the initial catalog.
- **Intelligence Registry**: `backend/app/routes/datasets.py` manages the tactical data hub.

## 🛠 Tech Stack
- **Frontend**: Next.js 14, TailwindCSS, Framer Motion, Lucide Icons
- **Backend**: FastAPI, SQLAlchemy, Postgres, Redis (Celery)
- **AI/ML**: Scikit-learn, Pandas, Joblib (Random Forest & KNN classifiers)
- **Labs**: Docker containers (OWASP Juice Shop, etc)
