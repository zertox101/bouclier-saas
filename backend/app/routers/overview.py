from fastapi import APIRouter

router = APIRouter(prefix="/api/overview", tags=["overview"])

# Re-use existing telemetry stats and slice recent alerts
from app.routers.telemetry import get_telemetry_stats

@router.get("/")
async def get_overview():
    """Return a concise overview for the UI.
    Includes total counters, severity distribution, and the 10 most recent alerts.
    """
    stats = await get_telemetry_stats()
    # Take the first 10 alerts (already most recent)
    recent = stats.get("alerts", [])[:10]
    return {
        "counters": stats.get("counters", {}),
        "severity": stats.get("severity", {}),
        "recent_events": recent,
    }
