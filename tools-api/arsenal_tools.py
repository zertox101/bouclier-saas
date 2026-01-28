"""
Offensive Arsenal Tools Integration
Merges tools from tools-api with Arsenal browser tools for unified tactical interface
"""

ARSENAL_TOOLS = [
    {
        "id": "nmap_advanced",
        "name": "Nmap Advanced Scan",
        "description": "Comprehensive network reconnaissance with OS detection and service enumeration",
        "category": "Network",
        "risk": "medium",
        "status": "ready",
        "tags": ["network", "recon", "scanning"],
        "inputs": [
            {"key": "target", "label": "Target IP/CIDR", "type": "text", "required": True, "placeholder": "192.168.1.0/24"},
            {"key": "ports", "label": "Port Range", "type": "text", "required": False, "placeholder": "1-1000"},
        ]
    },
    {
        "id": "sqlmap_advanced",
        "name": "SQLmap Injection Scanner",
        "description": "Automated SQL injection detection and database takeover",
        "category": "Web",
        "risk": "high",
        "status": "ready",
        "tags": ["web", "injection", "database"],
        "inputs": [
            {"key": "url", "label": "Target URL", "type": "text", "required": True, "placeholder": "http://target.com/page?id=1"},
            {"key": "level", "label": "Test Level (1-5)", "type": "number", "required": False, "placeholder": "1"},
        ]
    },
    {
        "id": "hydra_bruteforce",
        "name": "Hydra Password Auditor",
        "description": "Network logon cracker supporting SSH, FTP, HTTP and more",
        "category": "Audit",
        "risk": "high",
        "status": "ready",
        "tags": ["password", "bruteforce", "audit"],
        "inputs": [
            {"key": "target", "label": "Target Host", "type": "text", "required": True, "placeholder": "192.168.1.100"},
            {"key": "username", "label": "Username", "type": "text", "required": True, "placeholder": "admin"},
            {"key": "passlist", "label": "Password List Path", "type": "text", "required": True, "placeholder": "/usr/share/wordlists/rockyou.txt"},
        ]
    },
    {
        "id": "nikto_webscan",
        "name": "Nikto Web Scanner",
        "description": "Comprehensive web server vulnerability scanner",
        "category": "Web",
        "risk": "medium",
        "status": "ready",
        "tags": ["web", "scanner", "vulnerabilities"],
        "inputs": [
            {"key": "target", "label": "Target URL", "type": "text", "required": True, "placeholder": "https://target.com"},
        ]
    },
    {
        "id": "theharvester_osint",
        "name": "theHarvester OSINT",
        "description": "Email, subdomain and people names harvester",
        "category": "OSINT",
        "risk": "low",
        "status": "ready",
        "tags": ["osint", "recon", "email"],
        "inputs": [
            {"key": "domain", "label": "Target Domain", "type": "text", "required": True, "placeholder": "example.com"},
            {"key": "limit", "label": "Results Limit", "type": "number", "required": False, "placeholder": "50"},
        ]
    },
    {
        "id": "nuclei_scanner",
        "name": "Nuclei Vulnerability Scanner",
        "description": "Fast template-based vulnerability scanner",
        "category": "Web",
        "risk": "medium",
        "status": "ready",
        "tags": ["web", "scanner", "templates"],
        "inputs": [
            {"key": "url", "label": "Target URL", "type": "text", "required": True, "placeholder": "https://target.com"},
            {"key": "severity", "label": "Severity Filter", "type": "text", "required": False, "placeholder": "critical,high"},
        ]
    },
    {
        "id": "crackmapexec_smb",
        "name": "CrackMapExec SMB",
        "description": "Swiss army knife for pentesting Windows networks",
        "category": "Post-Exploitation",
        "risk": "high",
        "status": "ready",
        "tags": ["windows", "smb", "lateral"],
        "inputs": [
            {"key": "target", "label": "Target IP", "type": "text", "required": True, "placeholder": "192.168.1.100"},
            {"key": "username", "label": "Username", "type": "text", "required": True, "placeholder": "administrator"},
            {"key": "password", "label": "Password", "type": "text", "required": True, "placeholder": "P@ssw0rd"},
        ]
    },
    {
        "id": "amass_enum",
        "name": "Amass DNS Enumeration",
        "description": "In-depth DNS enumeration and network mapping",
        "category": "OSINT",
        "risk": "low",
        "status": "ready",
        "tags": ["dns", "subdomain", "recon"],
        "inputs": [
            {"key": "domain", "label": "Target Domain", "type": "text", "required": True, "placeholder": "example.com"},
        ]
    },
    {
        "id": "gobuster_dir",
        "name": "Gobuster Directory Bruteforce",
        "description": "Fast directory and file bruteforcing tool",
        "category": "Web",
        "risk": "medium",
        "status": "ready",
        "tags": ["web", "bruteforce", "directory"],
        "inputs": [
            {"key": "url", "label": "Target URL", "type": "text", "required": True, "placeholder": "https://target.com"},
            {"key": "wordlist", "label": "Wordlist Path", "type": "text", "required": True, "placeholder": "/usr/share/wordlists/dirb/common.txt"},
        ]
    },
    {
        "id": "masscan_fast",
        "name": "Masscan Fast Port Scanner",
        "description": "Fastest Internet port scanner - scan entire networks in minutes",
        "category": "Network",
        "risk": "medium",
        "status": "ready",
        "tags": ["network", "scanner", "fast"],
        "inputs": [
            {"key": "target", "label": "Target IP/CIDR", "type": "text", "required": True, "placeholder": "192.168.1.0/24"},
            {"key": "ports", "label": "Port Range", "type": "text", "required": False, "placeholder": "1-1000"},
        ]
    },
]
