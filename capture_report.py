import requests
import json

try:
    r = requests.get("http://localhost:8100/analysis/scan/LATEST")
    if r.status_code == 200:
        with open("REAL_AI_REPORT.json", "w") as f:
            json.dump(r.json(), f, indent=4)
        print("Success: REAL_AI_REPORT.json created.")
    else:
        print(f"Error: {r.status_code} - {r.text}")
except Exception as e:
    print(f"Failed to connect: {e}")
