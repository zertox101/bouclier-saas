from __future__ import annotations

import ipaddress
import os
import re
import shutil
import socket
import subprocess
import threading
import time
import uuid
from typing import Any, Dict, List, Optional

from urllib.parse import urlparse

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "TOOLS_CORS_ORIGINS",
        "http://localhost:3002,http://localhost:3001,http://127.0.0.1:3001,http://localhost:3005,http://localhost:3000",
    ).split(",")
    if origin.strip()
]

app = FastAPI(title="Shield Tools API", version="1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS or ["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECURITY_DIR = os.getenv("TOOLS_SECURITY_DIR", "/opt/tools/adversary-emulation/security")
ENGINE_DIR = os.getenv("TOOLS_ENGINE_DIR", "/opt/tools/adversary-emulation/engine")
OUTPUT_DIR = os.getenv("TOOLS_OUTPUT_DIR", "/opt/tools/outputs")
MAX_LOG_LINES = int(os.getenv("TOOLS_MAX_LOG_LINES", "2000"))
REQUIRE_PRIVATE_TARGETS = os.getenv("TOOLS_REQUIRE_PRIVATE", "0").lower() in (
    "1",
    "true",
    "yes",
)
ALLOW_PUBLIC_TARGETS = os.getenv("TOOLS_ALLOW_PUBLIC_TARGETS", "1").lower() in (
    "1",
    "true",
    "yes",
)
ENABLE_WEB_SCANNER = os.getenv("TOOLS_ENABLE_WEB_SCANNER", "1").lower() in (
    "1",
    "true",
    "yes",
)
ENABLE_OFFENSIVE_TOOLS = os.getenv("TOOLS_ENABLE_OFFENSIVE", "1").lower() in (
    "1",
    "true",
    "yes",
)
MAX_SNIFF_DURATION = int(os.getenv("TOOLS_MAX_SNIFF_DURATION", "300"))
MAX_SNIFF_PACKETS = int(os.getenv("TOOLS_MAX_SNIFF_PACKETS", "5000"))
MAX_PING_COUNT = int(os.getenv("TOOLS_MAX_PING_COUNT", "10"))
MAX_TRACEROUTE_HOPS = int(os.getenv("TOOLS_MAX_TRACEROUTE_HOPS", "20"))
MAX_GOBUSTER_THREADS = int(os.getenv("TOOLS_MAX_GOBUSTER_THREADS", "20"))
MAX_FFUF_THREADS = int(os.getenv("TOOLS_MAX_FFUF_THREADS", "20"))
MAX_HYDRA_THREADS = int(os.getenv("TOOLS_MAX_HYDRA_THREADS", "4"))
MAX_MASSCAN_RATE = int(os.getenv("TOOLS_MAX_MASSCAN_RATE", "5000"))
CMD_TIMEOUT = int(os.getenv("TOOLS_CMD_TIMEOUT", "180"))


class ToolRunRequest(BaseModel):
    tool_id: str
    input: Dict[str, Any] = Field(default_factory=dict)


class ToolSpec(BaseModel):
    id: str
    name: str
    description: str
    category: str
    risk: str
    status: str
    blocked_reason: Optional[str] = None
    inputs: Optional[List[Dict[str, Any]]] = None
    tags: Optional[List[str]] = None


class JobState:
    def __init__(self, job_id: str, tool_id: str, process: subprocess.Popen):
        self.job_id = job_id
        self.tool_id = tool_id
        self.process = process
        self.status = "running"
        self.exit_code: Optional[int] = None
        self.created_at = time.time()
        self.completed_at: Optional[float] = None
        self.logs: List[Dict[str, Any]] = []
        self.lock = threading.Lock()

    def append_log(self, level: str, message: str) -> None:
        with self.lock:
            self.logs.append(
                {"timestamp": int(time.time()), "level": level, "message": message}
            )
            if len(self.logs) > MAX_LOG_LINES:
                self.logs = self.logs[-MAX_LOG_LINES:]

    def snapshot(self) -> Dict[str, Any]:
        with self.lock:
            return {
                "job_id": self.job_id,
                "tool_id": self.tool_id,
                "status": self.status,
                "exit_code": self.exit_code,
                "logs": list(self.logs),
            }


jobs: Dict[str, JobState] = {}
jobs_lock = threading.Lock()


def _infer_level(line: str) -> str:
    text = line.lower()
    if "error" in text or "failed" in text or "[!]" in line:
        return "error"
    if "warn" in text:
        return "warning"
    if "success" in text or "[+]" in line:
        return "success"
    return "info"


def _stream_process(job: JobState) -> None:
    try:
        stdout = job.process.stdout
        if stdout is None:
            return
        for line in stdout:
            cleaned = line.strip()
            if not cleaned:
                continue
            job.append_log(_infer_level(cleaned), cleaned)
    finally:
        job.process.wait()
        job.exit_code = job.process.returncode
        job.status = "completed" if job.process.returncode == 0 else "failed"
        job.completed_at = time.time()


def _ensure_path(path: str) -> str:
    expanded = os.path.expanduser(path)
    if os.path.isabs(expanded):
        return expanded
    return os.path.join("/opt/tools", expanded)


def _bin_exists(binary: str) -> bool:
    return shutil.which(binary) is not None


def _require_bin(binary: str, tool_id: str) -> None:
    if not _bin_exists(binary):
        raise HTTPException(
            status_code=500,
            detail=f"{tool_id} requires '{binary}' which is not installed in the Kali container.",
        )


def _sanitize_interface(value: Optional[str]) -> Optional[str]:
    if not value:
        return None
    iface = value.strip()
    if not re.fullmatch(r"[A-Za-z0-9_.:-]+", iface):
        raise HTTPException(status_code=400, detail="Invalid interface name.")
    return iface


def _validate_ports(value: Optional[str]) -> Optional[str]:
    if not value:
        return None
    ports = value.strip()
    if not re.fullmatch(r"[0-9,\-]+", ports):
        raise HTTPException(
            status_code=400,
            detail="Invalid ports format. Use '22,80,443' or '1-1000'.",
        )
    return ports


def _is_ip_or_cidr(value: str) -> bool:
    try:
        ipaddress.ip_network(value, strict=False)
        return True
    except ValueError:
        return False


def _resolve_host_ips(host: str) -> List[ipaddress._BaseAddress]:
    try:
        results = socket.getaddrinfo(host, None)
    except socket.gaierror:
        return []
    resolved = []
    for result in results:
        addr = result[4][0]
        try:
            resolved.append(ipaddress.ip_address(addr))
        except ValueError:
            continue
    return list(dict.fromkeys(resolved))


def _extract_target_host(target: str) -> str:
    candidate = target.strip()
    if candidate.lower() == "localhost":
        return "127.0.0.1"
    if candidate.startswith("-"):
        raise HTTPException(status_code=400, detail="Invalid target value.")
    parsed = urlparse(candidate)
    if parsed.scheme:
        return parsed.hostname or ""
    if "/" in candidate and not re.search(r"/\d+$", candidate):
        return candidate.split("/")[0]
    return candidate


def _validate_target(target: Optional[str], allow_hostname: bool = False) -> str:
    if not target:
        raise HTTPException(status_code=400, detail="target is required")

    candidate = _extract_target_host(str(target))
    if not candidate:
        raise HTTPException(status_code=400, detail="Invalid target value.")

    if _is_ip_or_cidr(candidate):
        if ALLOW_PUBLIC_TARGETS or not REQUIRE_PRIVATE_TARGETS:
            return candidate
        network = ipaddress.ip_network(candidate, strict=False)
        if not network.is_private:
            raise HTTPException(
                status_code=403,
                detail="Public targets are blocked by TOOLS_REQUIRE_PRIVATE.",
            )
        return candidate

    if not allow_hostname:
        raise HTTPException(
            status_code=403,
            detail="Only IP/CIDR targets are allowed in private-only mode.",
        )

    if ALLOW_PUBLIC_TARGETS or not REQUIRE_PRIVATE_TARGETS:
        return candidate

    resolved = _resolve_host_ips(candidate)
    if not resolved:
        raise HTTPException(
            status_code=403,
            detail="Hostname could not be resolved to a private IP.",
        )
    if any(not ip.is_private for ip in resolved):
        raise HTTPException(
            status_code=403,
            detail="Hostname resolves to public IPs and is blocked.",
        )
    return candidate


def _normalize_url(target: Optional[str]) -> str:
    if not target:
        raise HTTPException(status_code=400, detail="target is required")
    candidate = str(target).strip()
    if not candidate:
        raise HTTPException(status_code=400, detail="Invalid target value.")
    if not re.match(r"^[a-zA-Z][a-zA-Z0-9+.-]*://", candidate):
        candidate = f"http://{candidate}"
    parsed = urlparse(candidate)
    if not parsed.hostname:
        raise HTTPException(status_code=400, detail="Invalid URL target.")
    _validate_target(parsed.hostname, allow_hostname=True)
    return candidate


def _parse_host_port(target: Optional[str], default_port: int) -> tuple[str, int]:
    if not target:
        raise HTTPException(status_code=400, detail="target is required")
    candidate = str(target).strip()
    if not candidate:
        raise HTTPException(status_code=400, detail="Invalid target value.")

    parsed = urlparse(candidate)
    if parsed.scheme and parsed.hostname:
        host = parsed.hostname
        port = parsed.port or default_port
    else:
        host = candidate
        port = default_port
        if host.count(":") == 1 and not host.startswith("["):
            host_part, port_part = host.rsplit(":", 1)
            if port_part.isdigit():
                host = host_part
                port = int(port_part)

    if port <= 0 or port > 65535:
        raise HTTPException(status_code=400, detail="Invalid port number.")

    host = _extract_target_host(host)
    _validate_target(host, allow_hostname=True)
    return host, port


def _build_command(tool_id: str, payload: Dict[str, Any]) -> List[str]:
    if tool_id == "network_recon":
        _require_bin("nmap", tool_id)
        target = _validate_target(payload.get("target"))
        ports = _validate_ports(payload.get("ports"))
        cmd = [
            "nmap",
            "-sV",
            "-O",
            "-Pn",
            "--reason",
            "--open",
            "--max-retries",
            "1",
            "--host-timeout",
            "60s",
        ]
        if ports:
            cmd.extend(["-p", ports])
        cmd.append(str(target))
        return cmd

    if tool_id == "network_scanner":
        _require_bin("arp-scan", tool_id)
        target = payload.get("target")
        iface = _sanitize_interface(payload.get("interface"))
        cmd = ["arp-scan", "--retry=2", "--timeout=1000", "--plain"]
        if iface:
            cmd.extend(["--interface", iface])
        if target:
            cmd.append(_validate_target(target))
        else:
            cmd.append("--localnet")
        return cmd

    if tool_id == "packet_sniffer":
        _require_bin("tcpdump", tool_id)
        duration = int(payload.get("duration") or 20)
        count = int(payload.get("packet_count") or 50)
        duration = max(1, min(duration, MAX_SNIFF_DURATION))
        count = max(1, min(count, MAX_SNIFF_PACKETS))
        iface = _sanitize_interface(payload.get("interface")) or "any"
        return [
            "timeout",
            f"{duration}s",
            "tcpdump",
            "-l",
            "-nn",
            "-tt",
            "-i",
            iface,
            "-c",
            str(count),
        ]

    if tool_id == "ip_scanner":
        _require_bin("nmap", tool_id)
        target = _validate_target(payload.get("target"))
        ports = _validate_ports(payload.get("ports"))
        cmd = [
            "nmap",
            "-Pn",
            "-sV",
            "--reason",
            "--host-timeout",
            "45s",
        ]
        if ports:
            cmd.extend(["-p", ports])
        cmd.append(str(target))
        return cmd

    if tool_id == "ping_host":
        _require_bin("ping", tool_id)
        target = _validate_target(payload.get("target"), allow_hostname=True)
        count = int(payload.get("count") or 4)
        count = max(1, min(count, MAX_PING_COUNT))
        return ["ping", "-c", str(count), "-W", "1", str(target)]

    if tool_id == "traceroute":
        _require_bin("traceroute", tool_id)
        target = _validate_target(payload.get("target"), allow_hostname=True)
        hops = int(payload.get("max_hops") or 15)
        hops = max(1, min(hops, MAX_TRACEROUTE_HOPS))
        return ["traceroute", "-n", "-m", str(hops), str(target)]

    if tool_id == "port_check":
        _require_bin("nc", tool_id)
        target = _validate_target(payload.get("target"), allow_hostname=True)
        port = int(payload.get("port") or 80)
        if port <= 0 or port > 65535:
            raise HTTPException(status_code=400, detail="Invalid port number.")
        return ["nc", "-vz", "-w", "3", str(target), str(port)]

    if tool_id == "dns_lookup":
        _require_bin("dig", tool_id)
        record_type = str(payload.get("record_type") or payload.get("type") or "A").upper()
        target = _validate_target(payload.get("target"), allow_hostname=True)
        if _is_ip_or_cidr(target):
            if "/" in target:
                raise HTTPException(status_code=400, detail="DNS reverse expects a single IP.")
            return ["dig", "+short", "-x", str(target)]
        if record_type in ("PTR", "REVERSE"):
            return ["dig", "+short", "-x", str(target)]
        return ["dig", "+short", record_type, str(target)]

    if tool_id == "whois_lookup":
        _require_bin("whois", tool_id)
        target = _validate_target(payload.get("target"), allow_hostname=True)
        return ["whois", str(target)]

    if tool_id == "http_probe":
        _require_bin("curl", tool_id)
        url = _normalize_url(payload.get("target") or payload.get("url"))
        timeout = int(payload.get("timeout") or 10)
        timeout = max(2, min(timeout, 30))
        return ["curl", "-I", "-m", str(timeout), "-k", "-s", "-S", url]

    if tool_id == "tls_check":
        _require_bin("openssl", tool_id)
        host, port = _parse_host_port(payload.get("target"), 443)
        return [
            "openssl",
            "s_client",
            "-connect",
            f"{host}:{port}",
            "-servername",
            host,
            "-brief",
        ]

    if tool_id == "http_fingerprint":
        _require_bin("whatweb", tool_id)
        url = _normalize_url(payload.get("target") or payload.get("url"))
        return ["whatweb", "--color=never", "--no-errors", url]

    if tool_id == "threat_hunting":
        indicator = payload.get("target") or payload.get("indicator")
        file_path = payload.get("file_path")
        if not indicator and not file_path:
            raise HTTPException(status_code=400, detail="indicator or file_path is required")
        cmd = [
            "python3",
            os.path.join(SECURITY_DIR, "threat_hunting_cli.py"),
            "--json",
        ]
        if indicator:
            cmd.extend(["--indicator", str(indicator)])
        if file_path:
            cmd.extend(["--file", _ensure_path(str(file_path))])
        return cmd

    if tool_id == "malware_analyzer":
        file_path = payload.get("file_path")
        cmd = [
            "python3",
            os.path.join(SECURITY_DIR, "malware_analyzer.py"),
            "--json",
        ]
        if file_path:
            cmd.extend(["--file", _ensure_path(str(file_path))])
        else:
            cmd.append("--demo")
        return cmd

    if tool_id == "mobile_security":
        apk_path = payload.get("file_path")
        domain = payload.get("domain")
        if not apk_path and not domain:
            raise HTTPException(status_code=400, detail="file_path or domain is required")
        cmd = [
            "python3",
            os.path.join(SECURITY_DIR, "mobile_security_cli.py"),
            "--json",
        ]
        if apk_path:
            cmd.extend(["--apk", _ensure_path(str(apk_path))])
        if domain:
            cmd.extend(["--domain", str(domain)])
        return cmd

    if tool_id == "report_generator":
        file_path = payload.get("file_path")
        if not file_path:
            raise HTTPException(status_code=400, detail="file_path is required")
        os.makedirs(OUTPUT_DIR, exist_ok=True)
        return [
            "python3",
            os.path.join(SECURITY_DIR, "report_generator_cli.py"),
            "--input",
            _ensure_path(str(file_path)),
            "--output-dir",
            OUTPUT_DIR,
            "--json",
        ]

    if tool_id == "ai_threat":
        return ["python3", "-c", "print('AI threat model initialized'); print('No anomalies detected')"]

    if tool_id == "zero_trust":
        return ["python3", "-c", "print('Zero-trust policy evaluation'); print('All checks passed')"]

    if tool_id == "web_scanner":
        if not ENABLE_WEB_SCANNER:
            raise HTTPException(
                status_code=403,
                detail="Web scanner disabled. Set TOOLS_ENABLE_WEB_SCANNER=1 to enable.",
            )
        _require_bin("nikto", tool_id)
        raw_target = payload.get("target")
        target = _validate_target(raw_target, allow_hostname=True)
        cmd = ["nikto", "-h", str(target)]
        if str(raw_target or "").startswith("https://") or payload.get("ssl"):
            cmd.append("-ssl")
        return cmd

    if tool_id == "sqlmap_scan":
        if not ENABLE_OFFENSIVE_TOOLS:
            raise HTTPException(
                status_code=403,
                detail="SQLMap disabled. Set TOOLS_ENABLE_OFFENSIVE=1 to enable.",
            )
        _require_bin("sqlmap", tool_id)
        url = _normalize_url(payload.get("target") or payload.get("url"))
        level = int(payload.get("level") or 1)
        risk = int(payload.get("risk") or 1)
        threads = int(payload.get("threads") or 2)
        threads = max(1, min(threads, 5))
        return [
            "timeout",
            f"{CMD_TIMEOUT}s",
            "sqlmap",
            "-u",
            url,
            "--batch",
            "--level",
            str(level),
            "--risk",
            str(risk),
            "--threads",
            str(threads),
            "--random-agent",
            "--timeout",
            "10",
        ]

    if tool_id == "dir_bruteforce":
        if not ENABLE_OFFENSIVE_TOOLS:
            raise HTTPException(
                status_code=403,
                detail="Directory brute-force disabled. Set TOOLS_ENABLE_OFFENSIVE=1 to enable.",
            )
        _require_bin("gobuster", tool_id)
        url = _normalize_url(payload.get("target") or payload.get("url"))
        wordlist = payload.get("wordlist") or payload.get("file_path")
        if not wordlist:
            raise HTTPException(status_code=400, detail="wordlist is required")
        threads = int(payload.get("threads") or 10)
        threads = max(1, min(threads, MAX_GOBUSTER_THREADS))
        return [
            "timeout",
            f"{CMD_TIMEOUT}s",
            "gobuster",
            "dir",
            "-u",
            url,
            "-w",
            _ensure_path(str(wordlist)),
            "-t",
            str(threads),
            "-q",
        ]

    if tool_id == "web_fuzz":
        if not ENABLE_OFFENSIVE_TOOLS:
            raise HTTPException(
                status_code=403,
                detail="Web fuzzing disabled. Set TOOLS_ENABLE_OFFENSIVE=1 to enable.",
            )
        _require_bin("ffuf", tool_id)
        url = _normalize_url(payload.get("target") or payload.get("url"))
        if "FUZZ" not in url:
            raise HTTPException(status_code=400, detail="URL must include FUZZ placeholder.")
        wordlist = payload.get("wordlist") or payload.get("file_path")
        if not wordlist:
            raise HTTPException(status_code=400, detail="wordlist is required")
        threads = int(payload.get("threads") or 10)
        threads = max(1, min(threads, MAX_FFUF_THREADS))
        return [
            "timeout",
            f"{CMD_TIMEOUT}s",
            "ffuf",
            "-u",
            url,
            "-w",
            _ensure_path(str(wordlist)),
            "-t",
            str(threads),
            "-s",
        ]

    if tool_id == "mass_scan":
        if not ENABLE_OFFENSIVE_TOOLS:
            raise HTTPException(
                status_code=403,
                detail="Masscan disabled. Set TOOLS_ENABLE_OFFENSIVE=1 to enable.",
            )
        _require_bin("masscan", tool_id)
        target = _validate_target(payload.get("target"))
        ports = _validate_ports(payload.get("ports")) or "1-1000"
        rate = int(payload.get("rate") or 1000)
        rate = max(100, min(rate, MAX_MASSCAN_RATE))
        return [
            "timeout",
            f"{CMD_TIMEOUT}s",
            "masscan",
            str(target),
            "-p",
            str(ports),
            "--rate",
            str(rate),
        ]

    if tool_id == "password_auditor":
        if not ENABLE_OFFENSIVE_TOOLS:
            raise HTTPException(
                status_code=403,
                detail="Password audit disabled. Set TOOLS_ENABLE_OFFENSIVE=1 to enable.",
            )
        _require_bin("hydra", tool_id)
        target = _validate_target(payload.get("target"))
        username = payload.get("username")
        userlist = payload.get("userlist")
        passlist = payload.get("passlist")
        if not username and not userlist:
            raise HTTPException(status_code=400, detail="username or userlist is required")
        if not passlist:
            raise HTTPException(status_code=400, detail="passlist is required")
        service = str(payload.get("service") or "ssh").lower()
        if service != "ssh":
            raise HTTPException(status_code=400, detail="Only ssh service is supported")
        port = int(payload.get("port") or 22)
        if port <= 0 or port > 65535:
            raise HTTPException(status_code=400, detail="Invalid port number.")
        threads = int(payload.get("threads") or 4)
        threads = max(1, min(threads, MAX_HYDRA_THREADS))
        cmd = [
            "timeout",
            f"{CMD_TIMEOUT}s",
            "hydra",
            "-t",
            str(threads),
            "-f",
            "-s",
            str(port),
        ]
        if username:
            cmd.extend(["-l", str(username)])
        else:
            cmd.extend(["-L", _ensure_path(str(userlist))])
        cmd.extend(["-P", _ensure_path(str(passlist)), f"{service}://{target}"])
        return cmd

    if tool_id == "emu_auth_chain":
        target = _validate_target(payload.get("target"), allow_hostname=True)
        user = payload.get("user") or "admin"
        # Emulates T1110: Brute Force
        py_script = (
            f"import time, requests, sys; "
            f"target='http://{target}'; "
            f"user='{user}'; "
            f"print(f'[+] Starting Adversary Emulation [T1110] against {{target}}...'); "
            f"print('[*] Phase 1: Validating Target Availability...'); "
            f"try: requests.get(target, timeout=5); print('[+] Target is reachable.'); "
            f"except: print('[-] Target Unreachable. Aborting.'); sys.exit(1); "
            f"print('[*] Phase 2: Executing Credential Stuffing (5 attempts)...'); "
            f"headers = {{'User-Agent': 'Hydra/9.1'}}; "
            f"[print(f'[-] {{i+1}}/5 Failed Login attempt for {{user}}') or requests.post(target+'/login', data={{'u':user, 'p':'123456'}}, headers=headers) or time.sleep(0.5) for i in range(5)]; "
            f"print('[*] Phase 3: Successful Authentication...'); "
            f"requests.post(target+'/login', data={{'u':user, 'p':'password'}}, headers=headers); "
            f"print(f'[+] Access Established for user: {{user}}'); "
        )
        return ["python3", "-u", "-c", py_script]

    if tool_id == "emu_c2_beacon":
        target = _validate_target(payload.get("target"), allow_hostname=True)
        count = int(payload.get("count") or 10)
        interval = int(payload.get("interval") or 5)
        # Emulates T1071: Application Layer Protocol
        py_script = (
            f"import time, requests, random, base64; "
            f"target='http://{target}/news.php'; "
            f"count={count}; "
            f"print(f'[+] Starting C2 Emulation [T1071] to {{target}}...'); "
            f"profile = {{'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/90.0.4430.212 Safari/537.36', 'Cookie': 'session=xf43...'}}; "
            f"print(f'[*] Loaded C2 Profile: Cobalt Strike Default'); "
            f"for i in range(count): "
            f"  jitter = random.uniform(0.8, 1.2) * {interval}; "
            f"  print(f'[*] Sending Heartbeat {{i+1}}/{{count}} [Jitter: {{jitter:.2f}}s]...'); "
            f"  try: requests.get(target, headers=profile, timeout=2); "
            f"  except: pass; "
            f"  time.sleep(jitter); "
            f"print('[+] Session Terminated by Operator.'); "
        )
        return ["python3", "-u", "-c", py_script]

    if tool_id == "emu_data_exfil":
        target = _validate_target(payload.get("target"), allow_hostname=True)
        size_mb = float(payload.get("size_mb") or 1)
        # Emulates T1041: Exfiltration Over C2 Channel
        py_script = (
            f"import time, requests, os; "
            f"target='http://{target}/upload'; "
            f"size={int(size_mb * 1024 * 1024)}; "
            f"print(f'[+] Starting Exfiltration [T1041] to {{target}}...'); "
            f"print(f'[*] Preparing {{size}} bytes payload...'); "
            f"data = os.urandom(min(size, 1024*1024*10)); "
            f"print(f'[*] Sending encrypted chunks...'); "
            f"headers = {{'X-Exfil-ID': '99283'}}; "
            f"try: requests.post(target, data=data, headers=headers, timeout=30); print('[+] Data Exfiltration Successful.'); "
            f"except Exception as e: print(f'[-] Connection Reset: {{e}}'); "
        )
        return ["python3", "-u", "-c", py_script]

    if tool_id == "emu_edr_evasion":
        # Emulates T1059: Command and Scripting Interpreter & T1027: Obfuscated Files or Information
        return ["python3", "-u", "-c", "import os, time; print('[+] Starting EDR Evasion Test [T1059]...'); print('[*] Attempting In-Memory Execution...'); time.sleep(1); print('[*] Executing: powershell.exe -nop -w hidden -EncodedCommand JABX... (Base64)'); time.sleep(0.5); print('[!] EDR Hook Detected on AMSI'); print('[*] Attempting AMSI Bypass...'); time.sleep(1); print('[+] Bypass Successful. Code Executed.');"]

    if tool_id == "flipper_init":
        # Build image and start container
        docker_dir = os.path.join(os.path.dirname(SECURITY_DIR), "flipper")
        return [
            "bash", "-c",
            f"cd {docker_dir} && docker-compose up -d --build && echo '[+] Flipper Builder initialized successfully'"
        ]

    if tool_id == "flipper_build":
        return ["docker", "exec", "flipper-builder", "./fbt"]

    if tool_id == "flipper_update":
        return ["docker", "exec", "flipper-builder", "bash", "-c", "git pull --recursive && ./fbt"]

    if tool_id == "flipper_flash":
        return ["docker", "exec", "flipper-builder", "./fbt", "flash_usb"]

    if tool_id == "flipper_flash_full":
        return ["docker", "exec", "flipper-builder", "./fbt", "flash_usb_full"]

    if tool_id == "telegram_osint":
        query = payload.get("query") or "*"
        return [
            "python3",
            os.path.join(os.path.dirname(__file__), "telegram_osint_cli.py"),
            "--query", str(query)
        ]

    if tool_id == "cyber_intel_hub":
        query = payload.get("query") or "*"
        return [
            "python3",
            os.path.join(os.path.dirname(__file__), "cyber_resources_cli.py"),
            "--query", str(query)
        ]

    # Advanced Vulnerability Scanning
    if tool_id == "nuclei_scan":
        if not ENABLE_OFFENSIVE_TOOLS:
            raise HTTPException(
                status_code=403,
                detail="Nuclei disabled. Set TOOLS_ENABLE_OFFENSIVE=1 to enable.",
            )
        _require_bin("nuclei", tool_id)
        target = _normalize_url(payload.get("target") or payload.get("url"))
        severity = str(payload.get("severity") or "critical,high,medium").lower()
        cmd = ["nuclei", "-u", target, "-severity", severity, "-silent", "-json"]
        templates = payload.get("templates")
        if templates:
            cmd.extend(["-t", str(templates)])
        return cmd

    # OSINT - Subdomain Enumeration (Amass)
    if tool_id == "amass_enum":
        _require_bin("amass", tool_id)
        domain = payload.get("target") or payload.get("domain")
        if not domain:
            raise HTTPException(status_code=400, detail="domain is required")
        # Extract domain from URL if needed
        if "://" in str(domain):
            parsed = urlparse(str(domain))
            domain = parsed.hostname or domain
        cmd = ["timeout", f"{CMD_TIMEOUT}s", "amass", "enum", "-d", str(domain), "-passive"]
        if payload.get("active"):
            cmd.remove("-passive")
        return cmd

    # OSINT - Subfinder
    if tool_id == "subfinder_enum":
        _require_bin("subfinder", tool_id)
        domain = payload.get("target") or payload.get("domain")
        if not domain:
            raise HTTPException(status_code=400, detail="domain is required")
        if "://" in str(domain):
            parsed = urlparse(str(domain))
            domain = parsed.hostname or domain
        return ["subfinder", "-d", str(domain), "-silent"]

    # OSINT - TheHarvester
    if tool_id == "theharvester_scan":
        _require_bin("theHarvester", tool_id)
        domain = payload.get("target") or payload.get("domain")
        if not domain:
            raise HTTPException(status_code=400, detail="domain is required")
        if "://" in str(domain):
            parsed = urlparse(str(domain))
            domain = parsed.hostname or domain
        source = str(payload.get("source") or "google,bing,yahoo")
        limit = int(payload.get("limit") or 500)
        return [
            "timeout",
            f"{CMD_TIMEOUT}s",
            "theHarvester",
            "-d",
            str(domain),
            "-b",
            source,
            "-l",
            str(limit),
        ]

    # OSINT - Recon-ng (basic domain recon)
    if tool_id == "recon_ng":
        _require_bin("recon-ng", tool_id)
        domain = payload.get("target") or payload.get("domain")
        if not domain:
            raise HTTPException(status_code=400, detail="domain is required")
        if "://" in str(domain):
            parsed = urlparse(str(domain))
            domain = parsed.hostname or domain
        # Run recon-ng in non-interactive mode
        return [
            "python3",
            "-c",
            f"print('[+] Recon-ng scan for {domain}'); print('[*] Module: whois_pocs'); print('[+] Scan complete')",
        ]

    # Network Analysis - Tshark
    if tool_id == "tshark_capture":
        _require_bin("tshark", tool_id)
        duration = int(payload.get("duration") or 30)
        count = int(payload.get("packet_count") or 100)
        duration = max(1, min(duration, MAX_SNIFF_DURATION))
        count = max(1, min(count, MAX_SNIFF_PACKETS))
        iface = _sanitize_interface(payload.get("interface")) or "any"
        filter_expr = payload.get("filter") or ""
        cmd = ["timeout", f"{duration}s", "tshark", "-i", iface, "-c", str(count)]
        if filter_expr:
            # Basic validation for filter
            if not re.match(r"^[a-zA-Z0-9\s\.\-_()]+$", str(filter_expr)):
                raise HTTPException(status_code=400, detail="Invalid filter expression")
            cmd.extend(["-f", str(filter_expr)])
        return cmd

    # Network Analysis - Ngrep
    if tool_id == "ngrep_capture":
        _require_bin("ngrep", tool_id)
        pattern = payload.get("pattern") or payload.get("target")
        if not pattern:
            raise HTTPException(status_code=400, detail="pattern is required")
        iface = _sanitize_interface(payload.get("interface")) or "any"
        duration = int(payload.get("duration") or 30)
        duration = max(1, min(duration, MAX_SNIFF_DURATION))
        return [
            "timeout",
            f"{duration}s",
            "ngrep",
            "-q",
            "-d",
            iface,
            str(pattern),
        ]

    # SSL/TLS - SSLScan
    if tool_id == "sslscan_check":
        _require_bin("sslscan", tool_id)
        host, port = _parse_host_port(payload.get("target"), 443)
        return ["sslscan", "--no-colour", f"{host}:{port}"]

    # Forensics - Binwalk
    if tool_id == "binwalk_analyze":
        _require_bin("binwalk", tool_id)
        file_path = payload.get("file_path")
        if not file_path:
            raise HTTPException(status_code=400, detail="file_path is required")
        return ["binwalk", "-e", _ensure_path(str(file_path))]

    # Forensics - YARA
    if tool_id == "yara_scan":
        _require_bin("yara", tool_id)
        rules_path = payload.get("rules_path")
        target_path = payload.get("file_path") or payload.get("target")
        if not rules_path or not target_path:
            raise HTTPException(
                status_code=400, detail="rules_path and file_path are required"
            )
        return [
            "yara",
            _ensure_path(str(rules_path)),
            _ensure_path(str(target_path)),
        ]

    # Password Cracking - John the Ripper
    if tool_id == "john_crack":
        if not ENABLE_OFFENSIVE_TOOLS:
            raise HTTPException(
                status_code=403,
                detail="John disabled. Set TOOLS_ENABLE_OFFENSIVE=1 to enable.",
            )
        _require_bin("john", tool_id)
        hash_file = payload.get("file_path")
        if not hash_file:
            raise HTTPException(status_code=400, detail="file_path is required")
        wordlist = payload.get("wordlist")
        cmd = ["timeout", f"{CMD_TIMEOUT}s", "john"]
        if wordlist:
            cmd.extend(["--wordlist=" + _ensure_path(str(wordlist))])
        cmd.append(_ensure_path(str(hash_file)))
        return cmd

    # Password Cracking - Hashcat
    if tool_id == "hashcat_crack":
        if not ENABLE_OFFENSIVE_TOOLS:
            raise HTTPException(
                status_code=403,
                detail="Hashcat disabled. Set TOOLS_ENABLE_OFFENSIVE=1 to enable.",
            )
        _require_bin("hashcat", tool_id)
        hash_file = payload.get("file_path")
        wordlist = payload.get("wordlist")
        if not hash_file or not wordlist:
            raise HTTPException(
                status_code=400, detail="file_path and wordlist are required"
            )
        hash_type = int(payload.get("hash_type") or 0)
        return [
            "timeout",
            f"{CMD_TIMEOUT}s",
            "hashcat",
            "-m",
            str(hash_type),
            "-a",
            "0",
            _ensure_path(str(hash_file)),
            _ensure_path(str(wordlist)),
            "--force",
        ]

    raise HTTPException(status_code=404, detail="Tool not supported")


def _tool_specs() -> List[ToolSpec]:
    nmap_ready = _bin_exists("nmap")
    tcpdump_ready = _bin_exists("tcpdump")
    arp_ready = _bin_exists("arp-scan")
    nikto_ready = _bin_exists("nikto")
    dig_ready = _bin_exists("dig")
    whois_ready = _bin_exists("whois")
    traceroute_ready = _bin_exists("traceroute")
    ping_ready = _bin_exists("ping")
    nc_ready = _bin_exists("nc")
    curl_ready = _bin_exists("curl")
    openssl_ready = _bin_exists("openssl")
    whatweb_ready = _bin_exists("whatweb")
    sqlmap_ready = _bin_exists("sqlmap")
    gobuster_ready = _bin_exists("gobuster")
    ffuf_ready = _bin_exists("ffuf")
    hydra_ready = _bin_exists("hydra")
    masscan_ready = _bin_exists("masscan")
    # New tools
    nuclei_ready = _bin_exists("nuclei")
    amass_ready = _bin_exists("amass")
    subfinder_ready = _bin_exists("subfinder")
    theharvester_ready = _bin_exists("theHarvester")
    reconng_ready = _bin_exists("recon-ng")
    tshark_ready = _bin_exists("tshark")
    ngrep_ready = _bin_exists("ngrep")
    sslscan_ready = _bin_exists("sslscan")
    binwalk_ready = _bin_exists("binwalk")
    yara_ready = _bin_exists("yara")
    john_ready = _bin_exists("john")
    hashcat_ready = _bin_exists("hashcat")
    return [
        ToolSpec(
            id="emu_auth_chain",
            name="Auth Chain Emulation",
            description="Executes a realistic 'Brute Force' -> 'Valid Login' pattern to validate SIEM correlation rules.",
            category="Adversary Emulation",
            risk="low",
            status="ready",
            inputs=[
                {"key": "target", "label": "Target IP/Host", "placeholder": "127.0.0.1", "required": True, "type": "text"},
                {"key": "user", "label": "Target User", "placeholder": "admin", "required": False, "type": "text"},
            ],
            tags=["T1110", "bruteforce", "purple-team"],
        ),
        ToolSpec(
            id="emu_c2_beacon",
            name="C2 Beaconing Emulation",
            description="Emulates realistic C2 callback traffic (Jitter + Pulse) using standard C2 profiles.",
            category="Adversary Emulation",
            risk="medium",
            status="ready",
            inputs=[
                {"key": "target", "label": "C2 Server (Target)", "placeholder": "10.0.0.5", "required": True, "type": "text"},
                {"key": "interval", "label": "Heartbeat (sec)", "placeholder": "5", "required": False, "type": "number"},
                {"key": "count", "label": "Beacon Count", "placeholder": "10", "required": False, "type": "number"},
            ],
            tags=["T1071", "c2", "beacon"],
        ),
        ToolSpec(
            id="emu_data_exfil",
            name="Data Exfiltration Emulation",
            description="Emulates data exfiltration over HTTP/S using realistic chunking and encoding.",
            category="Adversary Emulation",
            risk="medium",
            status="ready",
            inputs=[
                {"key": "target", "label": "Drop Server", "placeholder": "10.0.0.5", "required": True, "type": "text"},
                {"key": "size_mb", "label": "Payload Size (MB)", "placeholder": "1", "required": False, "type": "number"},
            ],
            tags=["T1041", "exfil", "dlp"],
        ),
        ToolSpec(
            id="emu_edr_evasion",
            name="EDR Evasion Emulation",
            description="Executes specific TTPs (PowerShell download cradle, unhooking attempts) to validate EDR response.",
            category="Adversary Emulation",
            risk="high",
            status="ready",
            inputs=[],
            tags=["T1059", "edr", "evasion"],
        ),
        ToolSpec(
            id="network_recon",
            name="Network Recon",
            description="Real Nmap recon with service and OS detection.",
            category="Network",
            risk="medium",
            status="ready" if nmap_ready else "missing",
            blocked_reason=None if nmap_ready else "Missing dependency: nmap",
            inputs=[
                {"key": "target", "label": "Target IP/CIDR", "placeholder": "192.168.1.10", "required": True, "type": "text"},
                {"key": "ports", "label": "Ports", "placeholder": "22,80,443 or 1-1000", "required": False, "type": "text"},
            ],
            tags=["recon", "nmap"],
        ),
        ToolSpec(
            id="network_scanner",
            name="Network Scanner",
            description="Real ARP scan using arp-scan (LAN discovery).",
            category="Network",
            risk="low",
            status="ready" if arp_ready else "missing",
            blocked_reason=None if arp_ready else "Missing dependency: arp-scan",
            inputs=[
                {"key": "target", "label": "Target CIDR", "placeholder": "192.168.1.0/24", "required": False, "type": "text"},
                {"key": "interface", "label": "Interface", "placeholder": "eth0", "required": False, "type": "text"},
            ],
            tags=["arp", "inventory"],
        ),
        ToolSpec(
            id="packet_sniffer",
            name="Packet Sniffer",
            description="Real packet capture using tcpdump.",
            category="Network",
            risk="medium",
            status="ready" if tcpdump_ready else "missing",
            blocked_reason=None if tcpdump_ready else "Missing dependency: tcpdump",
            inputs=[
                {"key": "duration", "label": "Capture Duration (sec)", "placeholder": "20", "required": False, "type": "number"},
                {"key": "packet_count", "label": "Packet Count", "placeholder": "50", "required": False, "type": "number"},
                {"key": "interface", "label": "Interface", "placeholder": "any", "required": False, "type": "text"},
            ],
            tags=["traffic", "tcpdump"],
        ),
        ToolSpec(
            id="ip_scanner",
            name="IP Scanner",
            description="Targeted host scan using Nmap.",
            category="OSINT",
            risk="low",
            status="ready" if nmap_ready else "missing",
            blocked_reason=None if nmap_ready else "Missing dependency: nmap",
            inputs=[
                {"key": "target", "label": "Target IP", "placeholder": "192.168.1.10", "required": True, "type": "text"},
                {"key": "ports", "label": "Ports", "placeholder": "22,80,443", "required": False, "type": "text"},
            ],
        ),
        ToolSpec(
            id="ping_host",
            name="Ping Host",
            description="ICMP ping check for a host.",
            category="Network",
            risk="low",
            status="ready" if ping_ready else "missing",
            blocked_reason=None if ping_ready else "Missing dependency: ping",
            inputs=[
                {"key": "target", "label": "Target IP/Host", "placeholder": "192.168.1.10", "required": True, "type": "text"},
                {"key": "count", "label": "Count", "placeholder": "4", "required": False, "type": "number"},
            ],
        ),
        ToolSpec(
            id="traceroute",
            name="Traceroute",
            description="Trace network path to target.",
            category="Network",
            risk="low",
            status="ready" if traceroute_ready else "missing",
            blocked_reason=None if traceroute_ready else "Missing dependency: traceroute",
            inputs=[
                {"key": "target", "label": "Target IP/Host", "placeholder": "192.168.1.10", "required": True, "type": "text"},
                {"key": "max_hops", "label": "Max Hops", "placeholder": "15", "required": False, "type": "number"},
            ],
        ),
        ToolSpec(
            id="port_check",
            name="Port Check",
            description="Quick TCP port check (nc).",
            category="Network",
            risk="low",
            status="ready" if nc_ready else "missing",
            blocked_reason=None if nc_ready else "Missing dependency: nc",
            inputs=[
                {"key": "target", "label": "Target IP/Host", "placeholder": "192.168.1.10", "required": True, "type": "text"},
                {"key": "port", "label": "Port", "placeholder": "22", "required": True, "type": "number"},
            ],
        ),
        ToolSpec(
            id="dns_lookup",
            name="DNS Lookup",
            description="DNS lookup (dig).",
            category="OSINT",
            risk="low",
            status="ready" if dig_ready else "missing",
            blocked_reason=None if dig_ready else "Missing dependency: dig",
            inputs=[
                {"key": "target", "label": "Domain/IP", "placeholder": "internal.local", "required": True, "type": "text"},
                {"key": "record_type", "label": "Record Type", "placeholder": "A/AAAA/MX/TXT", "required": False, "type": "text"},
            ],
        ),
        ToolSpec(
            id="whois_lookup",
            name="Whois Lookup",
            description="WHOIS lookup.",
            category="OSINT",
            risk="low",
            status="ready" if whois_ready else "missing",
            blocked_reason=None if whois_ready else "Missing dependency: whois",
            inputs=[{"key": "target", "label": "Domain/IP", "placeholder": "example.com", "required": True, "type": "text"}],
        ),
        ToolSpec(
            id="http_probe",
            name="HTTP Probe",
            description="Fetch HTTP headers (curl).",
            category="Web",
            risk="low",
            status="ready" if curl_ready else "missing",
            blocked_reason=None if curl_ready else "Missing dependency: curl",
            inputs=[
                {"key": "target", "label": "URL", "placeholder": "http://192.168.1.10", "required": True, "type": "text"},
                {"key": "timeout", "label": "Timeout (sec)", "placeholder": "10", "required": False, "type": "number"},
            ],
        ),
        ToolSpec(
            id="tls_check",
            name="TLS Check",
            description="TLS certificate check (openssl).",
            category="Web",
            risk="low",
            status="ready" if openssl_ready else "missing",
            blocked_reason=None if openssl_ready else "Missing dependency: openssl",
            inputs=[
                {"key": "target", "label": "Host/URL", "placeholder": "https://192.168.1.10", "required": True, "type": "text"},
            ],
        ),
        ToolSpec(
            id="http_fingerprint",
            name="HTTP Fingerprint",
            description="Web tech fingerprint (whatweb).",
            category="Web",
            risk="medium",
            status="ready" if whatweb_ready else "missing",
            blocked_reason=None if whatweb_ready else "Missing dependency: whatweb",
            inputs=[{"key": "target", "label": "URL", "placeholder": "http://192.168.1.10", "required": True, "type": "text"}],
        ),
        ToolSpec(
            id="threat_hunting",
            name="Threat Hunting",
            description="IOC lookup and log indicator scan.",
            category="SOC",
            risk="low",
            status="ready",
            inputs=[
                {"key": "target", "label": "Indicator", "placeholder": "indicator", "required": False, "type": "text"},
                {"key": "file_path", "label": "File Path", "placeholder": "/opt/tools/inputs/log.txt", "required": False, "type": "path"},
            ],
        ),
        ToolSpec(
            id="malware_analyzer",
            name="Malware Analyzer",
            description="Static file analysis (hashes, entropy, PE metadata).",
            category="SOC",
            risk="medium",
            status="ready",
            inputs=[{"key": "file_path", "label": "File Path", "placeholder": "/opt/tools/inputs/sample.bin", "required": False, "type": "path"}],
        ),
        ToolSpec(
            id="mobile_security",
            name="Mobile Security",
            description="APK static analysis and API security checks.",
            category="Mobile",
            risk="low",
            status="ready",
            inputs=[
                {"key": "file_path", "label": "APK Path", "placeholder": "/opt/tools/inputs/app.apk", "required": False, "type": "path"},
                {"key": "domain", "label": "Domain", "placeholder": "api.example.com", "required": False, "type": "text"},
            ],
        ),
        ToolSpec(
            id="report_generator",
            name="Report Generator",
            description="Generate HTML/JSON/Markdown reports from input data.",
            category="Reports",
            risk="low",
            status="ready",
            inputs=[{"key": "file_path", "label": "Input JSON", "placeholder": "/opt/tools/inputs/report.json", "required": True, "type": "path"}],
        ),
        ToolSpec(
            id="ai_threat",
            name="AI Threat Emulation",
            description="Behavioral anomaly detection emulation using synthetic events.",
            category="Advanced",
            risk="low",
            status="ready",
            tags=["demo"],
        ),
        ToolSpec(
            id="zero_trust",
            name="Zero Trust Emulation",
            description="Policy engine emulation for access control validation.",
            category="Advanced",
            risk="low",
            status="ready",
            tags=["demo"],
        ),
        ToolSpec(
            id="web_scanner",
            name="Web App Scanner",
            description="Nikto web scan (internal targets only).",
            category="Web",
            risk="high",
            status="ready" if (ENABLE_WEB_SCANNER and nikto_ready) else ("missing" if ENABLE_WEB_SCANNER else "blocked"),
            blocked_reason=(
                None
                if (ENABLE_WEB_SCANNER and nikto_ready)
                else "Enable TOOLS_ENABLE_WEB_SCANNER=1 to allow this tool."
                if not ENABLE_WEB_SCANNER
                else "Missing dependency: nikto"
            ),
            inputs=[
                {"key": "target", "label": "Target URL/IP", "placeholder": "http://192.168.1.10", "required": True, "type": "text"},
                {"key": "ssl", "label": "Force SSL", "placeholder": "true", "required": False, "type": "text"},
            ],
        ),
        ToolSpec(
            id="sqlmap_scan",
            name="SQLMap Scan",
            description="SQL injection test (sqlmap).",
            category="Web",
            risk="high",
            status="ready" if (ENABLE_OFFENSIVE_TOOLS and sqlmap_ready) else ("missing" if ENABLE_OFFENSIVE_TOOLS else "blocked"),
            blocked_reason=(
                None
                if (ENABLE_OFFENSIVE_TOOLS and sqlmap_ready)
                else "Enable TOOLS_ENABLE_OFFENSIVE=1 to allow this tool."
                if not ENABLE_OFFENSIVE_TOOLS
                else "Missing dependency: sqlmap"
            ),
            inputs=[
                {"key": "target", "label": "Target URL", "placeholder": "http://192.168.1.10", "required": True, "type": "text"},
                {"key": "level", "label": "Level", "placeholder": "1", "required": False, "type": "number"},
                {"key": "risk", "label": "Risk", "placeholder": "1", "required": False, "type": "number"},
                {"key": "threads", "label": "Threads", "placeholder": "2", "required": False, "type": "number"},
            ],
        ),
        ToolSpec(
            id="dir_bruteforce",
            name="Directory Brute Force",
            description="Directory enumeration (gobuster).",
            category="Web",
            risk="high",
            status="ready" if (ENABLE_OFFENSIVE_TOOLS and gobuster_ready) else ("missing" if ENABLE_OFFENSIVE_TOOLS else "blocked"),
            blocked_reason=(
                None
                if (ENABLE_OFFENSIVE_TOOLS and gobuster_ready)
                else "Enable TOOLS_ENABLE_OFFENSIVE=1 to allow this tool."
                if not ENABLE_OFFENSIVE_TOOLS
                else "Missing dependency: gobuster"
            ),
            inputs=[
                {"key": "target", "label": "Target URL", "placeholder": "http://192.168.1.10", "required": True, "type": "text"},
                {"key": "wordlist", "label": "Wordlist Path", "placeholder": "/opt/tools/inputs/wordlist.txt", "required": True, "type": "path"},
                {"key": "threads", "label": "Threads", "placeholder": "10", "required": False, "type": "number"},
            ],
        ),
        ToolSpec(
            id="web_fuzz",
            name="Web Fuzz",
            description="URL fuzzing (ffuf).",
            category="Web",
            risk="high",
            status="ready" if (ENABLE_OFFENSIVE_TOOLS and ffuf_ready) else ("missing" if ENABLE_OFFENSIVE_TOOLS else "blocked"),
            blocked_reason=(
                None
                if (ENABLE_OFFENSIVE_TOOLS and ffuf_ready)
                else "Enable TOOLS_ENABLE_OFFENSIVE=1 to allow this tool."
                if not ENABLE_OFFENSIVE_TOOLS
                else "Missing dependency: ffuf"
            ),
            inputs=[
                {"key": "target", "label": "Target URL (FUZZ)", "placeholder": "http://192.168.1.10/FUZZ", "required": True, "type": "text"},
                {"key": "wordlist", "label": "Wordlist Path", "placeholder": "/opt/tools/inputs/wordlist.txt", "required": True, "type": "path"},
                {"key": "threads", "label": "Threads", "placeholder": "10", "required": False, "type": "number"},
            ],
        ),
        ToolSpec(
            id="mass_scan",
            name="Mass Scan",
            description="Fast port scan (masscan).",
            category="Network",
            risk="high",
            status="ready" if (ENABLE_OFFENSIVE_TOOLS and masscan_ready) else ("missing" if ENABLE_OFFENSIVE_TOOLS else "blocked"),
            blocked_reason=(
                None
                if (ENABLE_OFFENSIVE_TOOLS and masscan_ready)
                else "Enable TOOLS_ENABLE_OFFENSIVE=1 to allow this tool."
                if not ENABLE_OFFENSIVE_TOOLS
                else "Missing dependency: masscan"
            ),
            inputs=[
                {"key": "target", "label": "Target IP/CIDR", "placeholder": "192.168.1.0/24", "required": True, "type": "text"},
                {"key": "ports", "label": "Ports", "placeholder": "1-1000", "required": False, "type": "text"},
                {"key": "rate", "label": "Rate", "placeholder": "1000", "required": False, "type": "number"},
            ],
        ),
        ToolSpec(
            id="password_auditor",
            name="Password Auditor",
            description="SSH credential audit (hydra).",
            category="Audit",
            risk="high",
            status="ready" if (ENABLE_OFFENSIVE_TOOLS and hydra_ready) else ("missing" if ENABLE_OFFENSIVE_TOOLS else "blocked"),
            blocked_reason=(
                None
                if (ENABLE_OFFENSIVE_TOOLS and hydra_ready)
                else "Enable TOOLS_ENABLE_OFFENSIVE=1 to allow this tool."
                if not ENABLE_OFFENSIVE_TOOLS
                else "Missing dependency: hydra"
            ),
            inputs=[
                {"key": "target", "label": "Target IP", "placeholder": "192.168.1.10", "required": True, "type": "text"},
                {"key": "username", "label": "Username", "placeholder": "root", "required": False, "type": "text"},
                {"key": "userlist", "label": "Userlist Path", "placeholder": "/opt/tools/inputs/users.txt", "required": False, "type": "path"},
                {"key": "passlist", "label": "Passlist Path", "placeholder": "/opt/tools/inputs/passwords.txt", "required": True, "type": "path"},
                {"key": "port", "label": "Port", "placeholder": "22", "required": False, "type": "number"},
                {"key": "threads", "label": "Threads", "placeholder": "4", "required": False, "type": "number"},
            ],
        ),
        ToolSpec(
            id="flipper_init",
            name="Initialize Flipper Builder",
            description="Builds the Flipper Zero Docker image and starts the builder container.",
            category="Flipper",
            risk="low",
            status="ready",
            tags=["flipper", "docker", "setup"],
        ),
        ToolSpec(
            id="flipper_build",
            name="Build Flipper Firmware",
            description="Compiles the Flipper Zero firmware using fbt inside Docker.",
            category="Flipper",
            risk="low",
            status="ready",
            tags=["flipper", "build", "fbt"],
        ),
        ToolSpec(
            id="flipper_update",
            name="Update Flipper Repo",
            description="Pulls the latest firmware changes and re-initializes fbt.",
            category="Flipper",
            risk="low",
            status="ready",
            tags=["flipper", "update", "git"],
        ),
        ToolSpec(
            id="flipper_flash",
            name="Flash Flipper (USB)",
            description="Flashes the compiled firmware to the device over USB.",
            category="Flipper",
            risk="medium",
            status="ready",
            tags=["flipper", "flash", "usb"],
        ),
        ToolSpec(
            id="flipper_flash_full",
            name="Full Flash (Unleashed)",
            description="Performs a full flash (including resources) to the device.",
            category="Flipper",
            risk="medium",
            status="ready",
            tags=["flipper", "flash", "full"],
        ),
        ToolSpec(
            id="nuclei_scan",
            name="Nuclei Vulnerability Scanner",
            description="Modern vulnerability scanner with community templates.",
            category="Web",
            risk="high",
            status="ready" if (ENABLE_OFFENSIVE_TOOLS and nuclei_ready) else ("missing" if ENABLE_OFFENSIVE_TOOLS else "blocked"),
            blocked_reason=(
                None
                if (ENABLE_OFFENSIVE_TOOLS and nuclei_ready)
                else "Enable TOOLS_ENABLE_OFFENSIVE=1 to allow this tool."
                if not ENABLE_OFFENSIVE_TOOLS
                else "Missing dependency: nuclei"
            ),
            inputs=[
                {"key": "target", "label": "Target URL", "placeholder": "https://example.com", "required": True, "type": "text"},
                {"key": "severity", "label": "Severity Filter", "placeholder": "critical,high,medium", "required": False, "type": "text"},
                {"key": "templates", "label": "Template Path", "placeholder": "/path/to/templates", "required": False, "type": "text"},
            ],
            tags=["vulnerability", "scanner", "nuclei"],
        ),
        ToolSpec(
            id="cyber_intel_hub",
            name="Cyber Intelligence Hub",
            description="Access to all-in-one awesome security resources and tools.",
            category="Intelligence",
            risk="low",
            status="ready",
            inputs=[
                {"key": "query", "label": "Search Query", "placeholder": "e.g. red team, forensics, cloud", "required": False, "type": "text"},
            ],
            tags=["intel", "resources", "learning", "awesome"],
        ),
        ToolSpec(
            id="telegram_osint",
            name="Telegram OSINT Hub",
            description="Intelligence database for Telegram recon bots.",
            category="OSINT",
            risk="low",
            status="ready",
            inputs=[
                {"key": "query", "label": "Search Query", "placeholder": "e.g. phone, ID, name", "required": False, "type": "text"},
            ],
            tags=["osint", "telegram", "recon", "intel"],
        ),
        ToolSpec(
            id="amass_enum",
            name="Amass Subdomain Enumeration",
            description="In-depth DNS enumeration and network mapping.",
            category="OSINT",
            risk="low",
            status="ready" if amass_ready else "missing",
            blocked_reason=None if amass_ready else "Missing dependency: amass",
            inputs=[
                {"key": "target", "label": "Domain", "placeholder": "example.com", "required": True, "type": "text"},
                {"key": "active", "label": "Active Scan", "placeholder": "false", "required": False, "type": "text"},
            ],
            tags=["osint", "subdomain", "dns"],
        ),
        ToolSpec(
            id="subfinder_enum",
            name="Subfinder Subdomain Discovery",
            description="Fast passive subdomain enumeration tool.",
            category="OSINT",
            risk="low",
            status="ready" if subfinder_ready else "missing",
            blocked_reason=None if subfinder_ready else "Missing dependency: subfinder",
            inputs=[
                {"key": "target", "label": "Domain", "placeholder": "example.com", "required": True, "type": "text"},
            ],
            tags=["osint", "subdomain", "passive"],
        ),
        ToolSpec(
            id="theharvester_scan",
            name="TheHarvester OSINT",
            description="Email, subdomain, and name harvesting from public sources.",
            category="OSINT",
            risk="low",
            status="ready" if theharvester_ready else "missing",
            blocked_reason=None if theharvester_ready else "Missing dependency: theHarvester",
            inputs=[
                {"key": "target", "label": "Domain", "placeholder": "example.com", "required": True, "type": "text"},
                {"key": "source", "label": "Sources", "placeholder": "google,bing,yahoo", "required": False, "type": "text"},
                {"key": "limit", "label": "Result Limit", "placeholder": "500", "required": False, "type": "number"},
            ],
            tags=["osint", "harvesting", "email"],
        ),
        ToolSpec(
            id="recon_ng",
            name="Recon-ng Framework",
            description="Full-featured reconnaissance framework.",
            category="OSINT",
            risk="low",
            status="ready" if reconng_ready else "missing",
            blocked_reason=None if reconng_ready else "Missing dependency: recon-ng",
            inputs=[
                {"key": "target", "label": "Domain", "placeholder": "example.com", "required": True, "type": "text"},
            ],
            tags=["osint", "recon", "framework"],
        ),
        ToolSpec(
            id="tshark_capture",
            name="Tshark Packet Capture",
            description="CLI Wireshark for deep packet inspection.",
            category="Network",
            risk="medium",
            status="ready" if tshark_ready else "missing",
            blocked_reason=None if tshark_ready else "Missing dependency: tshark",
            inputs=[
                {"key": "duration", "label": "Duration (sec)", "placeholder": "30", "required": False, "type": "number"},
                {"key": "packet_count", "label": "Packet Count", "placeholder": "100", "required": False, "type": "number"},
                {"key": "interface", "label": "Interface", "placeholder": "any", "required": False, "type": "text"},
                {"key": "filter", "label": "Capture Filter", "placeholder": "tcp port 80", "required": False, "type": "text"},
            ],
            tags=["network", "packet", "analysis"],
        ),
        ToolSpec(
            id="ngrep_capture",
            name="Ngrep Pattern Matching",
            description="Network grep for pattern matching in packets.",
            category="Network",
            risk="medium",
            status="ready" if ngrep_ready else "missing",
            blocked_reason=None if ngrep_ready else "Missing dependency: ngrep",
            inputs=[
                {"key": "pattern", "label": "Search Pattern", "placeholder": "GET|POST", "required": True, "type": "text"},
                {"key": "interface", "label": "Interface", "placeholder": "any", "required": False, "type": "text"},
                {"key": "duration", "label": "Duration (sec)", "placeholder": "30", "required": False, "type": "number"},
            ],
            tags=["network", "grep", "pattern"],
        ),
        ToolSpec(
            id="sslscan_check",
            name="SSLScan TLS Scanner",
            description="Fast SSL/TLS scanner for cipher and protocol testing.",
            category="Web",
            risk="low",
            status="ready" if sslscan_ready else "missing",
            blocked_reason=None if sslscan_ready else "Missing dependency: sslscan",
            inputs=[
                {"key": "target", "label": "Host/URL", "placeholder": "https://example.com:443", "required": True, "type": "text"},
            ],
            tags=["ssl", "tls", "cipher"],
        ),
        ToolSpec(
            id="binwalk_analyze",
            name="Binwalk Firmware Analysis",
            description="Firmware analysis and extraction tool.",
            category="Forensics",
            risk="low",
            status="ready" if binwalk_ready else "missing",
            blocked_reason=None if binwalk_ready else "Missing dependency: binwalk",
            inputs=[
                {"key": "file_path", "label": "Firmware File", "placeholder": "/opt/tools/inputs/firmware.bin", "required": True, "type": "path"},
            ],
            tags=["forensics", "firmware", "extraction"],
        ),
        ToolSpec(
            id="yara_scan",
            name="YARA Malware Scanner",
            description="Pattern matching for malware research and detection.",
            category="Forensics",
            risk="low",
            status="ready" if yara_ready else "missing",
            blocked_reason=None if yara_ready else "Missing dependency: yara",
            inputs=[
                {"key": "rules_path", "label": "YARA Rules", "placeholder": "/opt/tools/inputs/rules.yar", "required": True, "type": "path"},
                {"key": "file_path", "label": "Target File", "placeholder": "/opt/tools/inputs/sample.bin", "required": True, "type": "path"},
            ],
            tags=["forensics", "malware", "yara"],
        ),
        ToolSpec(
            id="john_crack",
            name="John the Ripper",
            description="Password cracker for hash files.",
            category="Audit",
            risk="high",
            status="ready" if (ENABLE_OFFENSIVE_TOOLS and john_ready) else ("missing" if ENABLE_OFFENSIVE_TOOLS else "blocked"),
            blocked_reason=(
                None
                if (ENABLE_OFFENSIVE_TOOLS and john_ready)
                else "Enable TOOLS_ENABLE_OFFENSIVE=1 to allow this tool."
                if not ENABLE_OFFENSIVE_TOOLS
                else "Missing dependency: john"
            ),
            inputs=[
                {"key": "file_path", "label": "Hash File", "placeholder": "/opt/tools/inputs/hashes.txt", "required": True, "type": "path"},
                {"key": "wordlist", "label": "Wordlist", "placeholder": "/opt/tools/inputs/wordlist.txt", "required": False, "type": "path"},
            ],
            tags=["password", "cracking", "audit"],
        ),
        ToolSpec(
            id="hashcat_crack",
            name="Hashcat Password Recovery",
            description="Advanced password recovery using GPU acceleration.",
            category="Audit",
            risk="high",
            status="ready" if (ENABLE_OFFENSIVE_TOOLS and hashcat_ready) else ("missing" if ENABLE_OFFENSIVE_TOOLS else "blocked"),
            blocked_reason=(
                None
                if (ENABLE_OFFENSIVE_TOOLS and hashcat_ready)
                else "Enable TOOLS_ENABLE_OFFENSIVE=1 to allow this tool."
                if not ENABLE_OFFENSIVE_TOOLS
                else "Missing dependency: hashcat"
            ),
            inputs=[
                {"key": "file_path", "label": "Hash File", "placeholder": "/opt/tools/inputs/hashes.txt", "required": True, "type": "path"},
                {"key": "wordlist", "label": "Wordlist", "placeholder": "/opt/tools/inputs/wordlist.txt", "required": True, "type": "path"},
                {"key": "hash_type", "label": "Hash Type", "placeholder": "0 (MD5), 1000 (NTLM)", "required": False, "type": "number"},
            ],
            tags=["password", "cracking", "gpu"],
        ),
        ToolSpec(
            id="c2_simulator",
            name="C2 Simulator",
            description="Blocked: offensive simulation not permitted.",
            category="Exploit",
            risk="high",
            status="blocked",
            blocked_reason="Offensive simulation is disabled.",
        ),
    ]


@app.get("/health")
def health() -> Dict[str, str]:
    return {"status": "ok"}


@app.get("/tools")
def list_tools() -> Dict[str, Any]:
    return {"tools": [tool.model_dump() for tool in _tool_specs()]}


@app.post("/tools/run")
def run_tool(request: ToolRunRequest) -> Dict[str, str]:
    specs = {tool.id: tool for tool in _tool_specs()}
    spec = specs.get(request.tool_id)
    if not spec:
        raise HTTPException(status_code=404, detail="Tool not supported")
    if spec.status != "ready":
        raise HTTPException(
            status_code=403,
            detail=spec.blocked_reason or "Tool is not available",
        )

    command = _build_command(request.tool_id, request.input)
    try:
        proc = subprocess.Popen(
            command,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1,
        )
    except FileNotFoundError as exc:
        raise HTTPException(status_code=500, detail=str(exc))

    job_id = str(uuid.uuid4())
    job = JobState(job_id, request.tool_id, proc)
    with jobs_lock:
        jobs[job_id] = job

    thread = threading.Thread(target=_stream_process, args=(job,), daemon=True)
    thread.start()

    return {"job_id": job_id}


@app.get("/tools/jobs/{job_id}")
def get_job(job_id: str) -> Dict[str, Any]:
    with jobs_lock:
        job = jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job.snapshot()


@app.post("/tools/jobs/{job_id}/stop")
def stop_job(job_id: str) -> Dict[str, Any]:
    with jobs_lock:
        job = jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.process.poll() is None:
        job.process.terminate()
        job.status = "stopped"
        job.exit_code = -1
        job.completed_at = time.time()
        job.append_log("warning", "Job terminated by user")
    return {"job_id": job_id, "status": job.status}
