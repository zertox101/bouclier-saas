"""
Sentinel Evaluation CLI
-----------------------
Utility to benchmark and evaluate AI Agent performance across different prompts/models.
Used for quality optimization and hallucination tracking.
"""

import requests
import time
import json

TEST_CASES = [
    {"ports": [["445", "smb"]], "exploit_count": 0, "target": "192.168.1.10"},
    {"ports": [["80", "http"], ["3306", "mysql"]], "exploit_count": 5, "target": "internal-prod.lan"},
]

def run_benchmark():
    print(f"[*] Starting Sentinel AI Benchmark...")
    print(f"[*] Target Model: {os.getenv('LLM_MODEL', 'llama3.2:3b')}")
    print("-" * 50)
    
    results = []
    for case in TEST_CASES:
        start = time.time()
        # Call the analysis endpoint (simulated)
        # In a real pipeline, we'd hit the FastAPI directly
        try:
            # Simulated Agent call
            from sentinel_agent import sentinel_agent
            report = sentinel_agent.analyze_findings(case, "Raw scan data simulation...")
            latency = time.time() - start
            
            print(f"[+] Case: {case['target']} | Latency: {latency:.2f}s | RAG: {'YES' if report['mitre_context'] else 'NO'}")
            results.append({"case": case, "latency": latency, "status": "PASS"})
        except Exception as e:
            print(f"[-] Case Failed: {str(e)}")
            results.append({"case": case, "error": str(e), "status": "FAIL"})

    print("-" * 50)
    print(f"[*] Benchmark Complete. Success Rate: {len([r for r in results if r['status'] == 'PASS'])/len(results)*100}%")

if __name__ == "__main__":
    import os
    # Add project root to sys path to import agent
    import sys
    sys.path.append("/opt/tools-api")
    run_benchmark()
