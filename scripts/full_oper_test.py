import requests
import time
import sys

API_BASE = "http://localhost:8100"
TARGET = "scanme.nmap.org"

TEST_PLAN = [
    {
        "name": "Nmap Recon",
        "tool_id": "nmap_advanced",
        "inputs": {"target": TARGET, "intensity": "aggressive"}
    },
    {
        "name": "Nuclei Vulnerability Scan",
        "tool_id": "nuclei_audit",
        "inputs": {"target": f"http://{TARGET}"}
    },
    {
        "name": "Nikto Web Audit",
        "tool_id": "nikto_audit",
        "inputs": {"target": f"http://{TARGET}"}
    },
    {
        "name": "Gobuster Directory Fuzzing",
        "tool_id": "gobuster_dir",
        "inputs": {"target": f"http://{TARGET}", "wordlist": "/usr/share/wordlists/dirb/common.txt"}
    }
]

def run_test():
    print(f"🚀 Starting Tactical Full Power Test on {TARGET}")
    print("-" * 50)

    for step in TEST_PLAN:
        print(f"📡 [QUEUING] {step['name']} ({step['tool_id']})...")
        try:
            resp = requests.post(f"{API_BASE}/tools/run", json={
                "tool_id": step["tool_id"],
                "input": step["inputs"]
            })
            if resp.status_code == 200:
                job_id = resp.json().get("job_id")
                print(f"✅ [RUNNING] Job ID: {job_id}")
                
                # Wait for tool to start generating logs
                time.sleep(2)
                
                # Check status
                status_resp = requests.get(f"{API_BASE}/tools/jobs/{job_id}")
                if status_resp.status_code == 200:
                    status = status_resp.json().get("status")
                    print(f"📊 [STATUS] Current status: {status}")
            else:
                print(f"❌ [FAILED] HTTP {resp.status_code}: {resp.text}")
        except Exception as e:
            print(f"🚨 [ERROR] Connection error: {str(e)}")
        
        print("-" * 50)
        time.sleep(3) # Small gap between tool deployments

    print("🏁 [FINISH] All tactical payloads deployed. Check the dashboard!")

if __name__ == "__main__":
    run_test()
