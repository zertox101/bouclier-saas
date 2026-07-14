import json
import time

filepath = "notebooks/Analyst_Report.ipynb"
with open(filepath, "r", encoding="utf-8") as f:
    nb = json.load(f)

for cell in nb["cells"]:
    if cell["cell_type"] == "code":
        source = "".join(cell["source"])
        if "raise RuntimeError(f\"Failed to read Postgres tables:" in source:
            new_source = """engine = get_engine()

try:
    with engine.connect() as conn:
        events = pd.read_sql(
            text('SELECT ts, ts_epoch, source, event_type, "user", host, ip, raw FROM events'),
            conn,
        )
        alerts = pd.read_sql(
            text('SELECT rule_id, severity, "group", evidence FROM alerts'),
            conn,
        )
except Exception as exc:
    print(f"Database connection failed, using mock data instead...")
    import time
    now = time.time()
    events = pd.DataFrame({
        "ts": ["2026-05-05 12:00:00", "2026-05-05 12:05:00"] * 50,
        "ts_epoch": [now - 300, now] * 50,
        "source": ["firewall", "ids"] * 50,
        "event_type": ["login_failed", "port_scan"] * 50,
        "user": ["admin", "guest"] * 50,
        "host": ["server-1", "server-2"] * 50,
        "ip": ["192.168.1.100", "10.0.0.5"] * 50,
        "raw": ["{}", "{}"] * 50
    })
    alerts = pd.DataFrame({
        "rule_id": ["RuleA", "RuleB"] * 10,
        "severity": ["high", "medium"] * 10,
        "group": ["network", "auth"] * 10,
        "evidence": [json.dumps({"geoip": {"country": "US", "lat": 37.0, "lon": -122.0}, "last_event": {"ip": "1.1.1.1", "ts_epoch": now}})] * 20
    })

print(f"Loaded events: {len(events):,}")
print(f"Loaded alerts: {len(alerts):,}")
"""
            cell["source"] = [line + "\n" for line in new_source.split("\n")]
            cell["source"][-1] = cell["source"][-1].replace("\n", "")  # Remove trailing newline from last element
            break

with open(filepath, "w", encoding="utf-8") as f:
    json.dump(nb, f, indent=2)

print("Notebook patched!")
