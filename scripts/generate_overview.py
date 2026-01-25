"""Generate the CyberDetect project overview into out/PROJECT_OVERVIEW.md."""

from pathlib import Path

OUTPUT = Path(__file__).resolve().parent.parent / "out" / "PROJECT_OVERVIEW.md"

CONTENT = """# CyberDetect Project Overview

## 1. Product description
CyberDetect is an enterprise-grade SaaS that centralizes defensive telemetry, Purple Team tooling, and SOC workflows behind a polished Security Operations dashboard (see docs/SECURITY_TOOLS_README.md and ENHANCEMENT_SUMMARY.md). It pairs a FastAPI analytics/alerting backend with a Next.js 14 dashboard, an offensive-facing tools API, and simulated attackers/loggers so teams can detect intrusions, triage alerts, and document outcomes from a single pane.

## 2. Target users & use cases
- SOC analysts who need real-time visibility into network events, telemetry health, and correlated incidents.
- Incident responders needing guided triage (alerts → incidents → evidence) plus exportable incident packs.
- Purple Team leads validating detections with the Kali-based traffic generator and documented scenarios (PURPLE_TEAM_SCENARIOS.md).
- Threat hunters and compliance teams tracking sensors/agents, assets, and rule coverage (docs/SECURITY_TOOLS_README.md).

## 3. Feature list
**MVP features**
- Dashboard with KPI cards, search, filter chips, SSE-driven traffic stream, and tables of alerts/tools (frontend/src/app/(dashboard)/tools/page.tsx and frontend/src/lib/mock-tools-data.ts).
- Alerts/events ingestion via FastAPI routers (/api/events, /api/alerts, /api/explain, /api/features) plus auth flows (backend/app/routes/).
- Tools execution API (tools-api/app.py) that orchestrates over 60 Kali/defensive tools (tshark, sqlmap, hashcat, recon-ng).
- Postgres + Redis (backend/app/models/sql.py) storing AlertEvent, EventLog, CorrelatedAlert, MlAlert, and User data.

**Advanced capabilities**
- Sentinel LLM assistant and analytics engines (backend/app/services/llm.py, app/services/analytics.py) that power behavior detection and chat support.
- Purple Team automation, CSV exports, and scenario documentation (docs/PURPLE_TEAM_SCENARIOS.md, docs/SECURITY_TOOLS_INVENTORY.md).
- Tools API gating via environment variables and the Kali attacker container generating telemetry for validation.

## 4. Architecture overview
- docker-compose.yml stitches Postgres, Redis, Ollama, FastAPI backend (8005), tools API (8100), Next.js frontend (3001), Kali attacker, and nginx redirector (3000).
- Backend (FastAPI + SQLAlchemy) orchestrates ingestion, ML scoring, and alert creation; Tools API is a separate uvicorn service managing security tooling; frontend (Next.js 14) renders dashboards using SSE and REST.
- Supporting scripts (backend/agent.py, scripts/*) seed data, monitor health, and mimic endpoint telemetry.

## 5. Data flow
1. Sensors (frontend websockets, tools API commands, Kali attacker, agent.py) emit events/metric streams into FastAPI endpoints and Redis streams.
2. Backend stores events in Postgres tables (AlertEvent, CorrelatedAlert, MlAlert, EventLog) and caches realtime metrics in Redis, while analytics services analyze spikes (app/services/analytics.py).
3. Detection logic (rule scoring + ML anomaly detector) flags threats and writes alerts or correlates incidents (app/routes/alerts.py).
4. UI (Next.js) fetches alerts/incidents and displays KPI cards, triage queue, timeline, and export panels.
5. Operators move from Alert → Incident → Evidence to Reports/Export, matching the workflows in docs/SECURITY_TOOLS_README.md.

## 6. Key tech stack
- FastAPI (uvicorn server) + SQLAlchemy + Redis for backend event/alert management.
- Next.js 14 (React/TypeScript) for the dashboard, with SSE, tables, and interactive charts.
- Node 18/npm tooling, Python 3.9 services, and Python dependencies listed in backend/requirements.txt.
- Databases: Postgres 15, Redis 7 (see docker-compose.yml).
- AI/ML: Ollama for LLM, custom analytics service (isolation forest + prompt guard).
- Tools: tools-api runs CLI pentest/IDS binaries (tshark, hydra, etc.) plus Kali attacker container.

## 7. How to run locally
```bash
cd bouclier-saas
docker compose up -d --build
# stop/reset
docker compose down
```
Frontend: http://localhost:3001 (redirected from 3000). Tools API: http://localhost:8100. Backend: http://localhost:8005.

## 8. Risks / gaps / technical debt
1. npm run lint warns because Next 14 still passes removed ESLint flags (useEslintrc, extensions); the script cannot run headlessly.
2. No Suricata/Zeek/Falco ingestion service yet; telemetry remains CLI-driven (tools-api) without dedicated IDS streams.
3. Detection logic is hard-coded; there is no runtime rule engine or Sigma rule repository.
4. Sensor health/tamper views described in docs are not yet implemented in code.
5. JWT authentication is mentioned (app/main.py) but the JWT middleware is not enabled.
6. Tools API lacks structured auditing of executed commands or user context.
7. Kali container generates traffic but backend correlation is manual.
8. Previous shield-* Docker containers still exist and can conflict on ports.
9. Frontend falls back to mock data (frontend/src/lib/mock-tools-data.ts) when APIs are unreachable.
10. There is no dedicated metrics/observability stack (Prometheus/Grafana) beyond SSE charts.

## 9. Ten concrete next improvements
1. Introduce a runtime rule engine (Sigma-style) so detections can be updated without redeploying backend services (app/services currently minimal).
2. Add Suricata/Zeek/Falco telemetry ingestion pipelines and map their metadata into Postgres/ClickHouse (per docs/ARCHITECTURE_UPDATE.md).
3. Surface sensor health/tamper gaps by emitting heartbeat events from agents (backend/agent.py) and visualizing them in the dashboard.
4. Rework npm run lint or pin ESLint 8.x so Next.js stops injecting removed CLI flags.
5. Provide API documentation (OpenAPI/Swagger) for /api/events, /api/alerts, /tools/run.
6. Replace mock front-end tool data with live responses from /tools and /tools/jobs.
7. Record every tool execution in a dedicated audit table with user, timestamp, command, and exit code.
8. Build the 1-click incident pack exporter (PCAP snippet + hashes + timeline) referenced in docs.
9. Add onboarding flows for sensors/agents with tokens and telemetry registration metadata.
10. Add long-term storage (ClickHouse/MinIO) for PCAPs and aggregated event metrics as envisioned in ARCHITECTURE_UPDATE.md.
"""


def main():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(CONTENT, encoding="utf-8")
    print(f"Wrote {OUTPUT}")


if __name__ == "__main__":
    main()
