"""
Vector Store API — semantic search over CVEs, MITRE ATT&CK, incidents, reports
"""
import asyncio
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional
from app.services.vector_store import (
    search_similar, store_document, ingest_cve, ingest_mitre_technique, rebuild_cve_cache
)

router = APIRouter(prefix="/api/vector", tags=["vector-store"])

_ingestion_lock = asyncio.Lock()
_ingestion_status = {"running": False, "cves": 0, "mitre": 0, "error": ""}


class VectorSearchRequest(BaseModel):
    collection: str
    query: str
    limit: int = 5


class VectorIngestRequest(BaseModel):
    collection: str
    doc_id: str
    text: str
    metadata: dict = {}


@router.post("/search")
async def search_vectors(req: VectorSearchRequest):
    if req.collection not in ["cve", "mitre_attack", "exploitdb", "incidents", "reports"]:
        raise HTTPException(status_code=400, detail=f"Invalid collection: {req.collection}")
    results = await search_similar(req.collection, req.query, req.limit)
    return {"results": results, "collection": req.collection}


@router.post("/ingest")
async def ingest_vector(req: VectorIngestRequest):
    if req.collection not in ["cve", "mitre_attack", "exploitdb", "incidents", "reports"]:
        raise HTTPException(status_code=400, detail=f"Invalid collection: {req.collection}")
    doc_id = await store_document(req.collection, req.doc_id, req.text, req.metadata)
    return {"doc_id": doc_id, "status": "stored"}


@router.post("/ingest/cve")
async def ingest_cve_entry(cve_id: str = Query(...), description: str = Query(...), cvss: str = "", affected: str = ""):
    doc_id = await ingest_cve(cve_id, description, cvss, affected)
    return {"doc_id": doc_id, "status": "stored"}


@router.post("/ingest/mitre")
async def ingest_mitre(technique_id: str = Query(...), name: str = Query(...), description: str = Query(...)):
    doc_id = await ingest_mitre_technique(technique_id, name, description)
    return {"doc_id": doc_id, "status": "stored"}


@router.get("/cache")
async def get_cve_cache():
    entries = await rebuild_cve_cache()
    return {"entries": entries or [], "count": len(entries) if entries else 0}


SAMPLE_CVES = [
    ("CVE-2024-21626", "runc container breakout via process.cwd trick", "8.6"),
    ("CVE-2024-3094", "XZ Utils backdoor (CVE-2024-3094)", "10.0"),
    ("CVE-2023-44487", "HTTP/2 Rapid Reset DDoS", "7.5"),
    ("CVE-2023-46604", "Apache ActiveMQ RCE", "9.8"),
    ("CVE-2023-3519", "Citrix ADC RCE", "9.8"),
    ("CVE-2023-34362", "MOVEit Transfer SQLi", "9.8"),
    ("CVE-2023-27997", "FortiOS SSL-VPN RCE", "9.8"),
    ("CVE-2023-1389", "TP-Link Archer AX21 RCE", "9.8"),
    ("CVE-2022-22965", "Spring4Shell RCE", "9.8"),
    ("CVE-2022-40605", "Zimbra XSS leading to RCE", "9.8"),
    ("CVE-2022-30190", "Follina MSDT RCE", "7.8"),
    ("CVE-2021-44228", "Log4Shell JNDI injection", "10.0"),
    ("CVE-2021-26855", "ProxyLogon SSRF", "9.8"),
    ("CVE-2021-41773", "Apache Path Traversal", "7.5"),
    ("CVE-2021-22986", "F5 BIG-IP RCE", "9.8"),
    ("CVE-2020-1472", "ZeroLogon privilege escalation", "10.0"),
    ("CVE-2020-0606", "Windows CryptoAPI spoofing", "8.1"),
    ("CVE-2019-0708", "BlueKeep RDP RCE", "9.8"),
    ("CVE-2018-7600", "Drupalgeddon2 RCE", "9.8"),
    ("CVE-2017-5638", "Apache Struts2 RCE", "10.0"),
    ("CVE-2017-0144", "EternalBlue SMB RCE", "8.5"),
    ("CVE-2016-5195", "DirtyCow Linux privilege escalation", "7.8"),
    ("CVE-2015-1427", "ElasticSearch Groovy RCE", "7.5"),
    ("CVE-2014-0160", "Heartbleed OpenSSL memory leak", "7.5"),
    ("CVE-2014-6271", "ShellShock Bash RCE", "10.0"),
    ("CVE-2012-1823", "PHP-CGI RCE", "9.8"),
    ("CVE-2011-3192", "Apache Range Header DoS", "7.8"),
    ("CVE-2008-0166", "Debian OpenSSL weak keys", "8.0"),
    ("CVE-2007-2447", "Samba rpc_server_rap RCE", "9.8"),
    ("CVE-2003-0818", "Windows ASN.1 RCE (Blaster)", "9.8"),
]

SAMPLE_MITRE = [
    ("T1059", "Command and Scripting Interpreter", "Adversaries may abuse command and script interpreters to execute commands, scripts, or binaries.", ["execution"]),
    ("T1566", "Phishing", "Adversaries may send phishing messages to gain access to victim systems.", ["initial-access"]),
    ("T1078", "Valid Accounts", "Adversaries may steal credentials to access systems.", ["defense-evasion", "persistence", "privilege-escalation"]),
    ("T1190", "Exploit Public-Facing Application", "Adversaries may exploit a software vulnerability to gain access to a public-facing application.", ["initial-access"]),
    ("T1021", "Remote Services", "Adversaries may use remote services to move laterally within the network.", ["lateral-movement"]),
    ("T1055", "Process Injection", "Adversaries may inject code into processes to evade defenses.", ["defense-evasion", "privilege-escalation"]),
    ("T1003", "OS Credential Dumping", "Adversaries may dump credentials from OS memory.", ["credential-access"]),
    ("T1046", "Network Service Scanning", "Adversaries may scan the network to discover services.", ["discovery"]),
    ("T1485", "Data Destruction", "Adversaries may destroy data on target systems.", ["impact"]),
    ("T1574", "Hijack Execution Flow", "Adversaries may hijack program execution flow.", ["defense-evasion", "persistence", "privilege-escalation"]),
    ("T1562", "Impair Defenses", "Adversaries may disable or impair security tools.", ["defense-evasion"]),
    ("T1550", "Use Alternate Authentication Material", "Adversaries may use alternate credentials to move laterally.", ["lateral-movement", "defense-evasion"]),
    ("T1548", "Abuse Elevation Control Mechanism", "Adversaries may bypass UAC or sudo to elevate privileges.", ["privilege-escalation", "defense-evasion"]),
    ("T1547", "Boot or Logon Autostart Execution", "Adversaries may configure persistence via startup items.", ["persistence", "privilege-escalation"]),
    ("T1539", "Steal Web Session Cookie", "Adversaries may steal session cookies to impersonate users.", ["credential-access"]),
    ("T1529", "System Shutdown/Reboot", "Adversaries may shutdown or reboot systems.", ["impact"]),
    ("T1518", "Software Discovery", "Adversaries may enumerate software installed on systems.", ["discovery"]),
    ("T1505", "Server Software Component", "Adversaries may install backdoors on servers.", ["persistence"]),
    ("T1499", "Endpoint Denial of Service", "Adversaries may perform DoS on specific endpoints.", ["impact"]),
    ("T1498", "Network Denial of Service", "Adversaries may perform network-level DoS attacks.", ["impact"]),
    ("T1497", "Virtualization/Sandbox Evasion", "Adversaries may check for analysis environments.", ["defense-evasion", "discovery"]),
    ("T1496", "Resource Hijacking", "Adversaries may hijack compute resources for cryptomining.", ["impact"]),
    ("T1490", "Inhibit System Recovery", "Adversaries may delete backups or volume snapshots.", ["impact"]),
    ("T1486", "Data Encrypted for Impact", "Adversaries may encrypt data to demand ransom.", ["impact"]),
    ("T1484", "Domain Policy Modification", "Adversaries may modify domain trust settings.", ["defense-evasion", "privilege-escalation"]),
    ("T1482", "Domain Trust Discovery", "Adversaries may enumerate domain trusts.", ["discovery"]),
    ("T1480", "Domain Accounts", "Adversaries may use domain accounts for access.", ["defense-evasion", "persistence"]),
    ("T1210", "Exploitation of Remote Services", "Adversaries may exploit remote services to gain access.", ["initial-access", "lateral-movement"]),
    ("T1203", "Exploitation for Client Execution", "Adversaries may exploit client-side vulnerabilities.", ["execution"]),
    ("T1202", "Indirect Command Execution", "Adversaries may use utilities to execute indirect commands.", ["execution", "defense-evasion"]),
]

async def _bulk_ingest_worker(cve_limit: int = 100):
    global _ingestion_status
    _ingestion_status["running"] = True
    _ingestion_status["error"] = ""
    try:
        # Ingest sample CVEs
        cve_count = 0
        for cve_id, desc, cvss in SAMPLE_CVES[:cve_limit]:
            try:
                await ingest_cve(cve_id, desc, cvss)
                cve_count += 1
            except Exception as e:
                _ingestion_status["error"] += f"cve:{cve_id}:{e}. "
        _ingestion_status["cves"] = cve_count

        # Try MITRE from CTI first, fallback to samples
        mitre_count = 0
        import httpx
        mitre_url = "https://raw.githubusercontent.com/mitre/cti/master/enterprise-attack/enterprise-attack.json"
        try:
            async with httpx.AsyncClient(timeout=120) as c:
                resp = await c.get(mitre_url)
                if resp.status_code == 200:
                    data = resp.json()
                    techniques = [o for o in data.get("objects", []) if o.get("type") == "attack-pattern"]
                    for t in techniques[:200]:
                        tech_id = t.get("id", "")
                        name = t.get("name", "")
                        desc_obj = t.get("description", "")
                        desc = desc_obj if isinstance(desc_obj, str) else ""
                        kill_chain = t.get("kill_chain_phases", [])
                        tactics = [k.get("phase_name", "") for k in kill_chain if isinstance(k, dict)]
                        if not tech_id or not name:
                            continue
                        await ingest_mitre_technique(tech_id, name, desc[:1000], tactics)
                        mitre_count += 1
        except Exception as e:
            _ingestion_status["error"] += f"MITRE-fetch: {e}. Using samples."
            for tech_id, name, desc, tactics in SAMPLE_MITRE:
                await ingest_mitre_technique(tech_id, name, desc, tactics)
                mitre_count += 1
        _ingestion_status["mitre"] = mitre_count
    except Exception as e:
        _ingestion_status["error"] += str(e)
    finally:
        _ingestion_status["running"] = False


@router.post("/ingest/bulk")
async def bulk_ingest(cve_limit: int = Query(100, le=500)):
    if _ingestion_status["running"]:
        raise HTTPException(status_code=409, detail="Ingestion already in progress")
    asyncio.create_task(_bulk_ingest_worker(cve_limit))
    return {"status": "started", "cve_limit": cve_limit}


@router.get("/ingest/status")
async def ingestion_status():
    return _ingestion_status
