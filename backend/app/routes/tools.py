from fastapi import APIRouter
from datetime import datetime
import random

router = APIRouter(prefix="/api/tools", tags=["tools"])

_TOOLS = [
    {"id": "nmap", "name": "Nmap", "category": "Network Scanner", "description": "Network discovery and security scanning", "version": "7.95", "status": "ready", "risk_level": "low"},
    {"id": "sqlmap", "name": "SQLmap", "category": "Web App", "description": "Automatic SQL injection detection", "version": "1.8", "status": "ready", "risk_level": "medium"},
    {"id": "nikto", "name": "Nikto", "category": "Web App", "description": "Web server vulnerability scanner", "version": "2.5.0", "status": "ready", "risk_level": "low"},
    {"id": "nuclei", "name": "Nuclei", "category": "Vulnerability Scanner", "description": "Fast vulnerability scanner with templates", "version": "3.3", "status": "ready", "risk_level": "low"},
    {"id": "hydra", "name": "Hydra", "category": "Password Tool", "description": "Online password cracking tool", "version": "9.6", "status": "ready", "risk_level": "medium"},
    {"id": "amass", "name": "Amass", "category": "Reconnaissance", "description": "Subdomain discovery and enumeration", "version": "4.2", "status": "ready", "risk_level": "info"},
    {"id": "metasploit", "name": "Metasploit", "category": "Exploitation", "description": "Penetration testing framework", "version": "6.4", "status": "ready", "risk_level": "high"},
    {"id": "burpsuite", "name": "Burp Suite", "category": "Web App", "description": "Web application security testing", "version": "2024.9", "status": "ready", "risk_level": "low"},
    {"id": "wireshark", "name": "Wireshark", "category": "Network Analyzer", "description": "Network protocol analyzer", "version": "4.4", "status": "ready", "risk_level": "info"},
    {"id": "john", "name": "John the Ripper", "category": "Password Tool", "description": "Offline password cracking", "version": "1.9.0", "status": "ready", "risk_level": "medium"},
    {"id": "gobuster", "name": "Gobuster", "category": "Reconnaissance", "description": "Directory/file enumeration tool", "version": "3.6", "status": "ready", "risk_level": "info"},
    {"id": "ffuf", "name": "FFUF", "category": "Web App", "description": "Web fuzzing tool", "version": "2.1", "status": "ready", "risk_level": "low"},
    {"id": "subfinder", "name": "Subfinder", "category": "Reconnaissance", "description": "Subdomain discovery tool", "version": "2.6", "status": "ready", "risk_level": "info"},
    {"id": "httpx", "name": "HTTPX", "category": "Reconnaissance", "description": "HTTP probing tool", "version": "1.6", "status": "ready", "risk_level": "info"},
    {"id": "naabu", "name": "Naabu", "category": "Network Scanner", "description": "Port scanning tool", "version": "2.3", "status": "ready", "risk_level": "low"},
    {"id": "katana", "name": "Katana", "category": "Web App", "description": "Web crawling tool", "version": "1.1", "status": "ready", "risk_level": "info"},
    {"id": "haktrails", "name": "Haktrails", "category": "Reconnaissance", "description": "SecurityTrails API client", "version": "0.3", "status": "ready", "risk_level": "info"},
    {"id": "shodan", "name": "Shodan", "category": "Reconnaissance", "description": "Internet device search engine", "version": "1.3", "status": "ready", "risk_level": "info"},
    {"id": "censys", "name": "Censys", "category": "Reconnaissance", "description": "Internet asset discovery", "version": "2.2", "status": "ready", "risk_level": "info"},
    {"id": "whatweb", "name": "WhatWeb", "category": "Reconnaissance", "description": "Website technology identifier", "version": "0.5", "status": "ready", "risk_level": "info"},
    {"id": "wapiti", "name": "Wapiti", "category": "Web App", "description": "Web vulnerability scanner", "version": "3.1", "status": "ready", "risk_level": "low"},
    {"id": "zap", "name": "OWASP ZAP", "category": "Web App", "description": "Full-featured web proxy scanner", "version": "2.15", "status": "ready", "risk_level": "low"},
    {"id": "dirb", "name": "DIRB", "category": "Web App", "description": "Directory brute-forcing tool", "version": "2.22", "status": "ready", "risk_level": "info"},
]


@router.get("")
@router.get("/")
async def list_tools():
    cats = sorted(set(t["category"] for t in _TOOLS))
    return {"tools": _TOOLS, "categories": cats, "total": len(_TOOLS)}


@router.get("/{tool_id}")
async def get_tool(tool_id: str):
    tool = next((t for t in _TOOLS if t["id"] == tool_id), _TOOLS[0])
    return {"tool": tool}
