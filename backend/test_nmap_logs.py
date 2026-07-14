import httpx
import re

# Get job logs directly
r = httpx.get("http://tools-api:8100/tools/jobs/d333c800-9e28-40cc-ba5f-16ecc18aa163", timeout=10)
data = r.json()
logs = data.get("logs", [])
print(f"Status: {data.get('status')}")
print(f"Logs: {len(logs)}")
print()

# Find the latest log that has port information
for log in logs:
    msg = log.get("message", "")
    if any(kw in msg.lower() for kw in ["port", "open", "tcp", "nmap scan"]):
        print(f"[{log.get('level')}] {msg}")

print("\n--- All logs with /tcp ---")
for log in logs:
    msg = log.get("message", "")
    m = re.search(r"(\d+)/tcp", msg)
    if m:
        print(f"  MATCH: {msg}")

print("\n--- Trying different regex ---")
for log in logs:
    msg = log.get("message", "")
    # Try matching the nmap-style port line
    m = re.search(r"^(\d+)/(tcp|udp)\s+(\w+)\s+(\w+)", msg, re.MULTILINE)
    if m:
        print(f"  REGEX2: port={m.group(1)}/{m.group(2)} state={m.group(3)} svc={m.group(4)}")

print("\n--- Looking for lines with port-like patterns ---")
for log in logs:
    msg = log.get("message", "")
    lines = msg.split("\n")
    for line in lines:
        line_stripped = line.strip()
        if re.search(r"\d+/tcp", line_stripped) and re.search(r"open|filtered|closed", line_stripped):
            print(f"  LINE: {line_stripped}")
