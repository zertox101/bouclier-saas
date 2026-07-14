# 🔧 Routing Fix - Telemetry Endpoint

## Problem
Frontend was calling `/api/telemetry/stats` but getting **mock data** from `app.routers.telemetry` instead of **real data** from `app.routes.soc_expert`.

## Root Cause
Two routers were mounted:
1. `app.routers.telemetry` - mounted with prefix `/api/telemetry` (MOCK DATA)
2. `app.routes.soc_expert` - mounted without prefix (REAL DATA at `/telemetry/stats`)

Frontend called `/api/telemetry/stats` → hit the mock router first.

## Solution
1. **Disabled** `app.routers.telemetry` router (commented out in main.py)
2. **Added prefix** `/api` to `soc_expert` router
3. Now `/api/telemetry/stats` → real database data from `soc_expert`

## Changes Made

### backend/app/main.py
```python
# BEFORE:
from app.routers.telemetry import router as telemetry_router
app.include_router(telemetry_router)  # Mock data at /api/telemetry/stats

from app.routes.soc_expert import router as soc_expert_router
app.include_router(soc_expert_router)  # Real data at /telemetry/stats

# AFTER:
# Telemetry router — DISABLED
# from app.routers.telemetry import router as telemetry_router
# app.include_router(telemetry_router)

from app.routes.soc_expert import router as soc_expert_router
app.include_router(soc_expert_router, prefix="/api")  # Real data at /api/telemetry/stats
```

## Result
✅ `/api/telemetry/stats` now returns **real database data**
✅ `/api/soc-expert/summary` still works
✅ `/api/soc-expert/telemetry/stats` also works (alias)

## Endpoints Now Available
- `/api/telemetry/stats` - Real telemetry (from DB)
- `/api/telemetry/stream` - SSE stream (from DB)
- `/api/soc-expert/summary` - SOC dashboard data
- `/api/soc-expert/telemetry/stats` - Same as /api/telemetry/stats

## Testing
```bash
# Start backend
cd backend
uvicorn app.main:app --reload --port 8005

# Test endpoint
curl http://localhost:8005/api/telemetry/stats

# Should return real data with:
# - counters: {events, alerts, incidents}
# - severity: {critical, high, medium, low}
# - attack_types, top_talkers, etc.
```

## Pages Affected
✅ **Overview** (`/overview`) - Now gets real data
✅ **Threat Intelligence** (`/threat-monitor`) - Now gets real data
✅ **SOC Expert** (`/operation-soc-expert`) - Still works

---

**Status**: ✅ **FIXED**
**Date**: 2024
