"""
Kali Arsenal Tools Router - AI Pentester Integration
Provides real tool execution with intelligent fallback to simulation
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import subprocess
import asyncio
import json
from datetime import datetime
import shutil

class KaliState:
    def __init__(self):
        self.mode = "simulation" # Default mode

state = KaliState()

router = APIRouter(prefix="/api/kali", tags=["kali-tools"])


class ScanTarget(BaseModel):
    """Target for security scanning"""
    target: str
    ports: Optional[str] = "1-1000"
    scan_type: Optional[str] = "quick"


class ToolResult(BaseModel):
    """Result from tool execution"""
    tool: str
    status: str  # success, simulated, error
    target: str
    output: str
    execution_time: float
    timestamp: str
    is_real: bool


class NmapScanRequest(BaseModel):
    target: str
    scan_type: str = "quick"  # quick, full, stealth


class NiktoScanRequest(BaseModel):
    target: str
    port: int = 80


class SQLMapRequest(BaseModel):
    url: str
    parameter: Optional[str] = None


def check_tool_available(tool_name: str) -> bool:
    """Check if a Kali tool is installed and available"""
    return shutil.which(tool_name) is not None


async def run_command_with_timeout(cmd: List[str], timeout: int = 60) -> tuple[bool, str]:
    """
    Run command with timeout
    Returns: (success: bool, output: str)
    """
    try:
        process = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        
        stdout, stderr = await asyncio.wait_for(
            process.communicate(),
            timeout=timeout
        )
        
        output = stdout.decode() if stdout else stderr.decode()
        return True, output
        
    except asyncio.TimeoutError:
        return False, f"Command timed out after {timeout} seconds"
    except Exception as e:
        return False, f"Error executing command: {str(e)}"


@router.get("/mode")
async def get_mode():
    return {"mode": state.mode}


@router.post("/mode")
async def set_mode(mode: str):
    if mode not in ["auto", "real", "simulation"]:
        raise HTTPException(status_code=400, detail="Invalid mode")
    state.mode = mode
    return {"mode": state.mode}


@router.get("/tools/status")
async def get_tools_status():
    """
    Get status of all Kali tools
    Returns which tools are installed and available
    """
    tools = {
        "nmap": check_tool_available("nmap"),
        "nikto": check_tool_available("nikto"),
        "sqlmap": check_tool_available("sqlmap"),
        "hydra": check_tool_available("hydra"),
        "metasploit": check_tool_available("msfconsole"),
        "burpsuite": check_tool_available("burpsuite"),
        "dirb": check_tool_available("dirb"),
        "gobuster": check_tool_available("gobuster"),
    }
    
    available_count = sum(1 for available in tools.values() if available)
    total_count = len(tools)
    
    return {
        "tools": tools,
        "available": available_count,
        "total": total_count,
        "percentage": round((available_count / total_count) * 100, 1),
        "mode": state.mode if state.mode != "auto" else ("real" if available_count > 0 else "simulation")
    }


@router.post("/nmap", response_model=ToolResult)
async def run_nmap_scan(request: NmapScanRequest):
    """
    Execute Nmap port scan
    Falls back to simulation if Nmap not available
    """
    start_time = datetime.now()
    
    # Check if nmap is available
    if check_tool_available("nmap"):
        # Real Nmap execution
        scan_options = {
            "quick": ["-sV", "-T4", "--top-ports", "100"],
            "full": ["-sV", "-sC", "-p-", "-T4"],
            "stealth": ["-sS", "-T2", "-f"]
        }
        
        cmd = ["nmap"] + scan_options.get(request.scan_type, scan_options["quick"]) + [request.target]
        
        success, output = await run_command_with_timeout(cmd, timeout=120)
        
        execution_time = (datetime.now() - start_time).total_seconds()
        
        if success:
            return ToolResult(
                tool="nmap",
                status="success",
                target=request.target,
                output=output,
                execution_time=execution_time,
                timestamp=datetime.now().isoformat(),
                is_real=True
            )
        else:
            # Fallback to simulation on error
            pass
    
    # Simulation mode
    execution_time = (datetime.now() - start_time).total_seconds()
    
    simulated_output = f"""Starting Nmap 7.94 ( https://nmap.org ) at {datetime.now().strftime('%Y-%m-%d %H:%M')}
Nmap scan report for {request.target}
Host is up (0.045s latency).
Not shown: 996 closed ports
PORT     STATE SERVICE     VERSION
22/tcp   open  ssh         OpenSSH 8.2p1 Ubuntu 4ubuntu0.5
80/tcp   open  http        nginx 1.18.0
443/tcp  open  ssl/http    nginx 1.18.0
3306/tcp open  mysql       MySQL 8.0.32

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 12.34 seconds
"""
    
    return ToolResult(
        tool="nmap",
        status="simulated",
        target=request.target,
        output=simulated_output,
        execution_time=execution_time,
        timestamp=datetime.now().isoformat(),
        is_real=False
    )


@router.post("/nikto", response_model=ToolResult)
async def run_nikto_scan(request: NiktoScanRequest):
    """
    Execute Nikto web vulnerability scan
    Falls back to simulation if Nikto not available
    """
    start_time = datetime.now()
    
    # Check if nikto is available
    if check_tool_available("nikto"):
        cmd = ["nikto", "-h", request.target, "-p", str(request.port), "-Format", "txt"]
        
        success, output = await run_command_with_timeout(cmd, timeout=180)
        
        execution_time = (datetime.now() - start_time).total_seconds()
        
        if success:
            return ToolResult(
                tool="nikto",
                status="success",
                target=request.target,
                output=output,
                execution_time=execution_time,
                timestamp=datetime.now().isoformat(),
                is_real=True
            )
    
    # Simulation mode
    execution_time = (datetime.now() - start_time).total_seconds()
    
    simulated_output = f"""- Nikto v2.5.0
---------------------------------------------------------------------------
+ Target IP:          {request.target}
+ Target Hostname:    {request.target}
+ Target Port:        {request.port}
+ Start Time:         {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
---------------------------------------------------------------------------
+ Server: nginx/1.18.0
+ The anti-clickjacking X-Frame-Options header is not present.
+ The X-Content-Type-Options header is not set.
+ No CGI Directories found (use '-C all' to force check all possible dirs)
+ Server may leak inodes via ETags, header found with file /, inode: 5e8a, size: 615, mtime: Mon, 01 Jan 2024 00:00:00 GMT
+ Allowed HTTP Methods: GET, HEAD, POST, OPTIONS 
+ OSVDB-3268: /admin/: Directory indexing found.
+ OSVDB-3092: /admin/: This might be interesting...
+ OSVDB-3233: /icons/README: Apache default file found.
+ 7915 requests: 0 error(s) and 7 item(s) reported on remote host
+ End Time:           {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} (15 seconds)
---------------------------------------------------------------------------
+ 1 host(s) tested
"""
    
    return ToolResult(
        tool="nikto",
        status="simulated",
        target=request.target,
        output=simulated_output,
        execution_time=execution_time,
        timestamp=datetime.now().isoformat(),
        is_real=False
    )


@router.post("/sqlmap", response_model=ToolResult)
async def run_sqlmap_scan(request: SQLMapRequest):
    """
    Execute SQLMap SQL injection test
    Falls back to simulation if SQLMap not available
    """
    start_time = datetime.now()
    
    # Check if sqlmap is available
    if check_tool_available("sqlmap"):
        cmd = ["sqlmap", "-u", request.url, "--batch", "--level=1", "--risk=1"]
        
        if request.parameter:
            cmd.extend(["-p", request.parameter])
        
        success, output = await run_command_with_timeout(cmd, timeout=300)
        
        execution_time = (datetime.now() - start_time).total_seconds()
        
        if success:
            return ToolResult(
                tool="sqlmap",
                status="success",
                target=request.url,
                output=output,
                execution_time=execution_time,
                timestamp=datetime.now().isoformat(),
                is_real=True
            )
    
    # Simulation mode
    execution_time = (datetime.now() - start_time).total_seconds()
    
    simulated_output = f"""        ___
       __H__
 ___ ___[']_____ ___ ___  {{1.7.2#stable}}
|_ -| . [']     | .'| . |
|___|_  ["]_|_|_|__,|  _|
      |_|V...       |_|   https://sqlmap.org

[*] starting @ {datetime.now().strftime('%H:%M:%S')}

[*] testing connection to the target URL
[*] testing if the target URL content is stable
[*] target URL content is stable
[*] testing if GET parameter 'id' is dynamic
[*] GET parameter 'id' appears to be dynamic
[*] heuristic (basic) test shows that GET parameter 'id' might be injectable (possible DBMS: 'MySQL')
[*] testing for SQL injection on GET parameter 'id'
it looks like the back-end DBMS is 'MySQL'. Do you want to skip test payloads specific for other DBMSes? [Y/n] Y
[*] testing 'AND boolean-based blind - WHERE or HAVING clause'
[*] GET parameter 'id' appears to be 'AND boolean-based blind - WHERE or HAVING clause' injectable 
[*] testing 'MySQL >= 5.0 AND error-based - WHERE, HAVING, ORDER BY or GROUP BY clause (FLOOR)'
[*] GET parameter 'id' is 'MySQL >= 5.0 AND error-based - WHERE, HAVING, ORDER BY or GROUP BY clause (FLOOR)' injectable 

GET parameter 'id' is vulnerable. Do you want to keep testing the others (if any)? [y/N] N
sqlmap identified the following injection point(s) with a total of 47 HTTP(s) requests:
---
Parameter: id (GET)
    Type: boolean-based blind
    Title: AND boolean-based blind - WHERE or HAVING clause
    Payload: id=1 AND 5678=5678

    Type: error-based
    Title: MySQL >= 5.0 AND error-based - WHERE, HAVING, ORDER BY or GROUP BY clause (FLOOR)
    Payload: id=1 AND (SELECT 1234 FROM(SELECT COUNT(*),CONCAT(0x7176786a71,(SELECT (ELT(1234=1234,1))),0x7178707671,FLOOR(RAND(0)*2))x FROM INFORMATION_SCHEMA.PLUGINS GROUP BY x)a)
---
[*] shutting down at {datetime.now().strftime('%H:%M:%S')}
"""
    
    return ToolResult(
        tool="sqlmap",
        status="simulated",
        target=request.url,
        output=simulated_output,
        execution_time=execution_time,
        timestamp=datetime.now().isoformat(),
        is_real=False
    )


@router.post("/hydra")
async def run_hydra_bruteforce(service: str, target: str, username: str, wordlist: str = "rockyou.txt"):
    """
    Execute Hydra brute force attack
    Falls back to simulation if Hydra not available
    """
    start_time = datetime.now()
    
    # Check if hydra is available
    if check_tool_available("hydra"):
        cmd = ["hydra", "-l", username, "-P", wordlist, "-t", "4", service + "://" + target]
        
        success, output = await run_command_with_timeout(cmd, timeout=600)
        
        execution_time = (datetime.now() - start_time).total_seconds()
        
        if success:
            return {
                "tool": "hydra",
                "status": "success",
                "target": target,
                "output": output,
                "execution_time": execution_time,
                "is_real": True
            }
    
    # Simulation mode
    execution_time = (datetime.now() - start_time).total_seconds()
    
    simulated_output = f"""Hydra v9.4 (c) 2022 by van Hauser/THC & David Maciejak - Please do not use in military or secret service organizations, or for illegal purposes.

Hydra (https://github.com/vanhauser-thc/thc-hydra) starting at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
[DATA] max 4 tasks per 1 server, overall 4 tasks, 14344399 login tries (l:1/p:14344399), ~3586100 tries per task
[DATA] attacking {service}://{target}:22/
[22][{service}] host: {target}   login: {username}   password: password123
[STATUS] attack finished for {target} (valid pair found)
1 of 1 target successfully completed, 1 valid password found
Hydra (https://github.com/vanhauser-thc/thc-hydra) finished at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
"""
    
    return {
        "tool": "hydra",
        "status": "simulated",
        "target": target,
        "output": simulated_output,
        "execution_time": execution_time,
        "is_real": False
    }


@router.get("/scan-history")
async def get_scan_history(limit: int = 10):
    """
    Get recent scan history
    (In production, this would query a database)
    """
    # Simulated history
    history = [
        {
            "id": f"SCAN-{i:04d}",
            "tool": ["nmap", "nikto", "sqlmap"][i % 3],
            "target": f"192.168.1.{100 + i}",
            "timestamp": datetime.now().isoformat(),
            "status": "completed",
            "findings": i * 3
        }
        for i in range(limit)
    ]
    
    return {"scans": history, "total": limit}
