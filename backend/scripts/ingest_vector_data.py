"""
Ingest real CVE + MITRE ATT&CK data into Qdrant vector store.
Usage: python scripts/ingest_vector_data.py [--cve-limit 200] [--mitre-only]
"""
import asyncio
import json
import os
import sys
import httpx
from typing import List, Dict, Any

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.services.vector_store import ingest_cve, ingest_mitre_technique

NVD_API = "https://services.nvd.nist.gov/rest/json/cves/2.0"
MITRE_DOMAIN = "https://raw.githubusercontent.com/mitre/cti/master/enterprise-attack/enterprise-attack.json"

async def fetch_cves(limit: int = 200) -> List[Dict]:
    print(f"[CVE] Fetching up to {limit} CVEs from NVD...")
    params = {"resultsPerPage": min(limit, 200), "startIndex": 0}
    try:
        async with httpx.AsyncClient(timeout=60) as c:
            resp = await c.get(NVD_API, params=params)
            if resp.status_code != 200:
                print(f"[CVE] NVD API error: {resp.status_code}")
                return []
            data = resp.json()
            vulns = data.get("vulnerabilities", [])
            print(f"[CVE] Got {len(vulns)} entries from NVD")
            return vulns[:limit]
    except Exception as e:
        print(f"[CVE] Fetch error: {e}")
        return []

async def fetch_mitre_techniques() -> List[Dict]:
    print("[MITRE] Fetching MITRE ATT&CK techniques...")
    try:
        async with httpx.AsyncClient(timeout=120) as c:
            resp = await c.get(MITRE_DOMAIN)
            if resp.status_code != 200:
                print(f"[MITRE] MITRE CTI error: {resp.status_code}")
                return []
            data = resp.json()
            objects = data.get("objects", [])
            techniques = [o for o in objects if o.get("type") == "attack-pattern"]
            print(f"[MITRE] Got {len(techniques)} techniques")
            return techniques
    except Exception as e:
        print(f"[MITRE] Fetch error: {e}")
        return []

async def ingest_cve_batch(cves: List[Dict]):
    count = 0
    for vuln in cves:
        try:
            cve = vuln.get("cve", {})
            cve_id = cve.get("id", "")
            descs = cve.get("descriptions", [])
            description = next((d["value"] for d in descs if d.get("lang") == "en"), "")
            if not description:
                continue
            metrics = cve.get("metrics", {})
            cvss = ""
            for key in ["cvssMetricV31", "cvssMetricV30", "cvssMetricV2"]:
                if key in metrics and metrics[key]:
                    cvss = metrics[key][0].get("cvssData", {}).get("baseScore", "")
                    break
            affected = ", ".join([
                p.get("vendor") + "/" + p.get("product", "")
                for p in cve.get("configurations", [])
                if isinstance(p, dict)
            ])
            await ingest_cve(cve_id, description, str(cvss), affected)
            count += 1
            if count % 50 == 0:
                print(f"[CVE] Ingested {count}/{len(cves)}")
        except Exception as e:
            print(f"[CVE] Error ingesting {vuln.get('cve', {}).get('id', 'unknown')}: {e}")
    print(f"[CVE] Done: {count} CVEs ingested")

async def ingest_mitre_batch(techniques: List[Dict]):
    count = 0
    for t in techniques:
        try:
            tech_id = t.get("id", "")
            name = t.get("name", "")
            desc = next((
                d.get("value", "") for d in t.get("description", [])
                if isinstance(d, dict) and d.get("lang") == "en"
            ), t.get("description", ""))
            if isinstance(desc, list):
                desc = " ".join(d.get("value", "") for d in desc if isinstance(d, dict))
            kill_chain = t.get("kill_chain_phases", [])
            tactics = [k.get("phase_name", "") for k in kill_chain if isinstance(k, dict)]
            if not tech_id or not name:
                continue
            await ingest_mitre_technique(tech_id, name, desc[:1000], tactics)
            count += 1
            if count % 50 == 0:
                print(f"[MITRE] Ingested {count}/{len(techniques)}")
        except Exception as e:
            print(f"[MITRE] Error: {e}")
    print(f"[MITRE] Done: {count} techniques ingested")

async def main():
    cve_limit = 200
    mitre_only = False
    for arg in sys.argv[1:]:
        if arg.startswith("--cve-limit="):
            cve_limit = int(arg.split("=")[1])
        elif arg == "--mitre-only":
            mitre_only = True

    if not mitre_only:
        cves = await fetch_cves(cve_limit)
        if cves:
            await ingest_cve_batch(cves)
        else:
            print("[CVE] No CVEs fetched, skipping")
    else:
        print("[CVE] Skipping CVEs (--mitre-only)")

    techniques = await fetch_mitre_techniques()
    if techniques:
        await ingest_mitre_batch(techniques)
    else:
        print("[MITRE] No techniques fetched, using sample data")
        sample = [
            {"id": "T1059", "name": "Command and Scripting Interpreter", "description": "Adversaries may abuse command and script interpreters to execute commands, scripts, or binaries.", "kill_chain_phases": [{"phase_name": "execution"}]},
            {"id": "T1566", "name": "Phishing", "description": "Adversaries may send phishing messages to gain access to victim systems.", "kill_chain_phases": [{"phase_name": "initial-access"}]},
            {"id": "T1078", "name": "Valid Accounts", "description": "Adversaries may steal or obtain credentials to access systems.", "kill_chain_phases": [{"phase_name": "defense-evasion"}, {"phase_name": "persistence"}, {"phase_name": "privilege-escalation"}]},
            {"id": "T1190", "name": "Exploit Public-Facing Application", "description": "Adversaries may exploit a software vulnerability to gain access to a public-facing application.", "kill_chain_phases": [{"phase_name": "initial-access"}]},
            {"id": "T1021", "name": "Remote Services", "description": "Adversaries may use remote services to move laterally within the network.", "kill_chain_phases": [{"phase_name": "lateral-movement"}]},
            {"id": "T1055", "name": "Process Injection", "description": "Adversaries may inject code into processes to evade defenses.", "kill_chain_phases": [{"phase_name": "defense-evasion"}, {"phase_name": "privilege-escalation"}]},
            {"id": "T1003", "name": "OS Credential Dumping", "description": "Adversaries may dump credentials from OS memory.", "kill_chain_phases": [{"phase_name": "credential-access"}]},
            {"id": "T1046", "name": "Network Service Scanning", "description": "Adversaries may scan the network to discover services.", "kill_chain_phases": [{"phase_name": "discovery"}]},
            {"id": "T1485", "name": "Data Destruction", "description": "Adversaries may destroy data on target systems.", "kill_chain_phases": [{"phase_name": "impact"}]},
            {"id": "T1574", "name": "Hijack Execution Flow", "description": "Adversaries may hijack the execution flow of a program.", "kill_chain_phases": [{"phase_name": "defense-evasion"}, {"phase_name": "persistence"}, {"phase_name": "privilege-escalation"}]},
        ]
        await ingest_mitre_batch(sample)
    print("[DONE] Vector store population complete")

if __name__ == "__main__":
    asyncio.run(main())
