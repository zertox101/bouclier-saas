import time
import requests

API_BASE = "http://localhost:8005"


def post_event(event_type, status):
    payload = {
        "user": "alice",
        "host": "host-1",
        "src_ip": "10.0.0.5",
        "event_type": event_type,
        "status": status,
        "severity": "medium",
        "details": {"source": "smoke"},
    }
    res = requests.post(f"{API_BASE}/api/events/ingest", json=payload, timeout=5)
    res.raise_for_status()
    return res.json()["id"]


def run():
    print("Posting events...")
    event_ids = [
        post_event("auth", "fail"),
        post_event("auth", "success"),
        post_event("privilege_change", "success"),
    ]

    time.sleep(3)

    print("Checking correlated alerts...")
    alerts = requests.get(f"{API_BASE}/api/alerts/correlated", timeout=5).json()
    assert isinstance(alerts, list)

    print("Checking explain endpoint...")
    explain = requests.post(
        f"{API_BASE}/api/explain",
        json={"event_id": event_ids[0], "question": "Explain this event", "top_k": 2},
        timeout=5,
    ).json()
    assert explain.get("event_id") == event_ids[0]
    assert "analysis" in explain

    print("Checking online features...")
    features = requests.get(
        f"{API_BASE}/api/features/online",
        params={"entity": "alice:host-1"},
        timeout=5,
    ).json()
    assert "total_events" in features

    print("Smoke test ok.")


if __name__ == "__main__":
    run()
