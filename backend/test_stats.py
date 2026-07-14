import sys
import os

backend_root = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_root)

from app.core.database import SessionLocal
from app.routes.soc_expert import get_telemetry_stats

db = SessionLocal()
import asyncio
try:
    res = asyncio.run(get_telemetry_stats(db=db, force_refresh=True))
    print("Success:")
except Exception as e:
    import traceback
    traceback.print_exc()
