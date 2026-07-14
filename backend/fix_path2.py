import json

filepath = "notebooks/Analyst_Report.ipynb"
with open(filepath, "r", encoding="utf-8") as f:
    nb = json.load(f)

for cell in nb["cells"]:
    if cell["cell_type"] == "code":
        source = "".join(cell["source"])
        if "df = pd.read_csv(" in source:
            new_source = """import pandas as pd
import numpy as np
import json
import time

print("Loading data from CICIDS2017 dataset...")
# Load a sample to keep notebook fast, or load all if you prefer
df = pd.read_csv('../app/ml/data/cicids2017_sample.csv', nrows=50000)

import socket, struct
def dec2ip(dec):
    try:
        return socket.inet_ntoa(struct.pack('!L', int(float(dec))))
    except:
        return "0.0.0.0"

df['ip_str'] = df['Src IP dec'].apply(dec2ip)

now = time.time()
df['ts_epoch'] = now - np.arange(len(df))
df['ts'] = pd.to_datetime(df['ts_epoch'], unit='s').dt.strftime('%Y-%m-%d %H:%M:%S')

events = pd.DataFrame({
    "ts": df['ts'],
    "ts_epoch": df['ts_epoch'],
    "source": "cicids2017",
    "event_type": "network_flow",
    "user": "unknown",
    "host": "unknown",
    "ip": df['ip_str'],
    "raw": "{}"
})

malicious = df[df['Label'] != 'BENIGN'].copy()

alerts_evidence = malicious.apply(
    lambda row: json.dumps({
        "geoip": {"country": "US", "lat": 37.0, "lon": -122.0}, 
        "last_event": {"ip": row['ip_str'], "ts_epoch": row['ts_epoch']}
    }), axis=1
)

alerts = pd.DataFrame({
    "rule_id": malicious['Label'],
    "severity": "high",
    "group": "network",
    "evidence": alerts_evidence
})

print(f"Loaded events: {len(events):,}")
print(f"Loaded alerts: {len(alerts):,}")"""
            
            lines = [line + '\n' for line in new_source.split('\n')]
            if lines:
                lines[-1] = lines[-1][:-1]
                
            cell["source"] = lines
            break

with open(filepath, "w", encoding="utf-8") as f:
    json.dump(nb, f, indent=2)

print("Path fully replaced!")
