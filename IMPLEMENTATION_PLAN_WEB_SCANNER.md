# Implementation Plan: Web Security Scanner Module

## 1. Overview
We are adding a "Web Scanner" subsystem to CyberDetect (Bouclier). This module provides legal, containerized, real-time web security scanning using OWASP ZAP (daemon) and Nuclei.

**Objectives:**
- **Containerized ZAP**: Run ZAP in headless daemon mode.
- **Nuclei Integration**: Use existing `tools-api` runner.
- **Persistence**: Store scan jobs and normalized findings in Postgres.
- **Real-time**: Stream scan events via SSE.
- **Security**: Default private targets only. RESTRICT public scanning.

## 2. Infrastructure Changes
- **docker-compose.yml**: Add `zap` service (zaproxy/zap-stable).
- **Networks**: Ensure `backend` can talk to `zap` and `tools-api`.

## 3. Database Schema (Postgres)
We will add two new models in `backend/app/models/scans_sql.py`:
1.  **ScanJob**: Tracks execution state (pending, running, completed, failed), target, tool (zap/nuclei).
2.  **Finding**: Stores vulnerability details (title, severity, evidence, remediation).

## 4. Backend Implementation (FastAPI)
- **Models**: SQLAlchemy models.
- **Schemas**: Pydantic schemas for API I/O.
- **Service (`ScanService`)**:
    - `create_scan(target, tool)`: Validates private IP, creates DB job, triggers docker/api call.
    - `run_zap_scan`: Calls ZAP API (spider -> ascan -> alerts).
    - `run_nuclei_scan`: Calls `tools-api` endpoints.
    - `stop_scan`: Cancels execution.
- **Router (`/api/scans`)**:
    - `POST /`: Start scan.
    - `GET /`: List scans.
    - `GET /{id}`: Details.
    - `GET /{id}/findings`: Findings list.
    - `GET /{id}/events`: SSE stream (proxies tool output).

## 5. Frontend Implementation (Next.js)
- **Page**: `app/(dashboard)/scans/page.tsx`
- **Components**:
    - `ScanList`: Status chips, simple table.
    - `ScanDrawer`: Slide-over for "Live Console" and findings.
    - `NewScanModal`: Form with target validation.
    - `FindingsTable`: Sortable/filterable vulnerability list.

## 6. Security Controls
- **Target Validation**: `is_private_ip(target)` check before execution.
- **Authorization**: Only authenticated users (existing middleware).

## 7. Execution Plan
1.  **Docker**: Add ZAP service.
2.  **Backend**: Add Models -> Schemas -> Service -> Router -> Main.
3.  **Frontend**: Add Page -> Components.
4.  **Verify**: Run scan against local target (e.g., `frontend` container or `external-db`).

