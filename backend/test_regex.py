import re, httpx

# Get fresh job
r = httpx.post("http://tools-api:8100/tools/run",
    headers={"X-Api-Key": "BOUCLIER_ALPHA_SESSION_2026"},
    json={"tool_id": "nmap_advanced", "input": {"target": "scanme.nmap.org"}},
    timeout=10)
job_id = r.json()["job_id"]
import time
time.sleep(8)

r = httpx.get(f"http://tools-api:8100/tools/jobs/{job_id}", timeout=10)
data = r.json()
logs = data.get("logs", [])

print(f"Job {job_id} status={data.get('status')}")
print(f"Total logs: {len(logs)}")
print()

all_msgs = []
for i, log in enumerate(logs):
    msg = log.get("message", "")
    all_msgs.append(msg)
    # Check if it matches our regex
    m = re.search(r"^(\d+)/tcp\s+(open|filtered|closed)\s+(\S+)", msg.strip(), re.IGNORECASE)
    if m:
        print(f"  MATCH [{i}]: port={m.group(1)} state={m.group(2)} svc={m.group(3)}")
    # Also try multi-line
    for line in msg.split("\n"):
        m2 = re.search(r"^(\d+)/tcp\s+(open|filtered|closed)\s+(\S+)", line.strip(), re.IGNORECASE)
        if m2:
            print(f"  ML-MATCH [{i}]: port={m2.group(1)} state={m2.group(2)} svc={m2.group(3)}")

print(f"\nTotal messages collected: {len(all_msgs)}")

# Try the EXACT regex from the backend code
ports = []
for line in all_msgs:
    m = re.search(r"^(\d+)/tcp\s+(open|filtered|closed)\s+(\S+)", line.strip(), re.IGNORECASE)
    if m:
        ports.append({"port": int(m.group(1)), "state": m.group(2).lower(), "service": m.group(3)})
        print(f"  PARSED: port {m.group(1)} {m.group(2)} {m.group(3)}")

print(f"\nParsed ports: {len(ports)}")
for p in ports:
    print(f"  {p}")
