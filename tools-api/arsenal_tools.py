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
            {"key": "target", "label": "Target IP/Domain/CIDR", "type": "text", "required": True, "placeholder": "192.168.1.0/24 or example.com"},
            {"key": "ports", "label": "Port Range", "type": "text", "required": False, "placeholder": "1-1000"},
        ]
    },
    {
        "id": "smart_offensive_agent",
        "name": "AutoGPT Smart Agent",
        "description": "Fully autonomous AI-driven pentesting. Automatically performs recon, identifies vulnerabilities, and executes exploit chains.",
        "category": "Advanced",
        "risk": "critical",
        "status": "ready",
        "tags": ["ai", "automated", "smart", "agent"],
        "inputs": [
            {"key": "target", "label": "Target Host / IP", "type": "text", "required": True, "placeholder": "example.com"},
            {"key": "mode", "label": "Execution Mode", "type": "text", "required": False, "placeholder": "stealth / aggressive (default)"},
        ]
    },
    {
        "id": "nmap_exploit_scan",
        "name": "Nmap + SearchSploit Audit",
        "description": "Auto-detect service versions and search for known exploits (Exploit-DB).",
        "category": "Vulnerability",
        "risk": "medium",
        "status": "ready",
        "tags": ["network", "audit", "exploit-db"],
        "inputs": [
            {"key": "target", "label": "Target Host", "type": "text", "required": True, "placeholder": "192.168.1.10"},
        ]
    },
    {
        "id": "mythos_windows_audit",
        "name": "Mythos Windows Audit",
        "description": "Deep system audit: BitLocker, Defender, Firewall, SMBv1, and security policies.",
        "category": "Mythos",
        "risk": "medium",
        "status": "ready",
        "tags": ["mythos", "windows", "audit", "compliance"],
        "inputs": []
    },
    {
        "id": "mythos_linux_audit",
        "name": "Mythos Linux Audit",
        "description": "Hardening check: Kernel, SSH, Ports, Firewall, and SUID binaries.",
        "category": "Mythos",
        "risk": "medium",
        "status": "ready",
        "tags": ["mythos", "linux", "audit", "hardening"],
        "inputs": []
    },
    {
        "id": "mythos_network_audit",
        "name": "Mythos Network Audit",
        "description": "External sweep: Dangerous ports, SPF/DMARC, TLS certs, and security headers.",
        "category": "Mythos",
        "risk": "medium",
        "status": "ready",
        "tags": ["mythos", "network", "recon", "external"],
        "inputs": [
            {"key": "target_ip", "label": "Target IP", "type": "text", "required": True, "placeholder": "203.0.113.50"},
            {"key": "domain", "label": "Target Domain", "type": "text", "required": True, "placeholder": "example.com"},
        ]
    },
    {
        "id": "mythos_dependency_audit",
        "name": "Mythos Dependency Audit",
        "description": "SCA scan: Detects vulnerabilities in Node.js, Python, Docker, and secrets.",
        "category": "Mythos",
        "risk": "medium",
        "status": "ready",
        "tags": ["mythos", "sca", "dependencies", "secrets"],
        "inputs": [
            {"key": "path", "label": "Project Path", "type": "text", "required": True, "placeholder": "/path/to/project"},
        ]
    },
    {
        "id": "mythos_cisa_kev",
        "name": "CISA KEV Monitor",
        "description": "Query CISA Known Exploited Vulnerabilities catalog for recent threats.",
        "category": "Mythos",
        "risk": "low",
        "status": "ready",
        "tags": ["mythos", "cisa", "kev", "intelligence"],
        "inputs": [
            {"key": "filter", "label": "Vendor/Product Filter (Optional)", "type": "text", "required": False, "placeholder": "microsoft"},
        ]
    },    
    {
        "id": "ping_host",
        "name": "Sentinel Ping Probe",
        "description": "Verify target availability and network latency via ICMP",
        "category": "Network",
        "risk": "low",
        "status": "ready",
        "tags": ["recon", "ping", "latency"],
        "inputs": [
            {"key": "target", "label": "Target Host/IP", "type": "text", "required": True, "placeholder": "example.com"},
        ]
    },
    {
        "id": "traceroute",
        "name": "Network Path Tracer",
        "description": "Trace the network path and hops to a remote target",
        "category": "Network",
        "risk": "low",
        "status": "ready",
        "tags": ["network", "hops", "recon"],
        "inputs": [
            {"key": "target", "label": "Target Host/IP", "type": "text", "required": True, "placeholder": "example.com"},
        ]
    },
    {
        "id": "whois_lookup",
        "name": "WHOIS Domain Lookup",
        "description": "Query WHOIS database for domain ownership and registration details",
        "category": "OSINT",
        "risk": "low",
        "status": "ready",
        "tags": ["osint", "domain", "recon"],
        "inputs": [
            {"key": "target", "label": "Domain/IP", "type": "text", "required": True, "placeholder": "example.com"},
        ]
    },
    {
        "id": "dns_lookup",
        "name": "Dig DNS Analyzer",
        "description": "Perform deep DNS record lookups (A, MX, TXT, NS)",
        "category": "OSINT",
        "risk": "low",
        "status": "ready",
        "tags": ["dns", "recon", "dig"],
        "inputs": [
            {"key": "target", "label": "Domain", "type": "text", "required": True, "placeholder": "example.com"},
            {"key": "type", "label": "Record Type", "type": "text", "required": False, "placeholder": "A (default)"},
        ]
    },
    {
        "id": "port_check",
        "name": "Neural Port Verify",
        "description": "Fast TCP port connectivity check using Netcat",
        "category": "Network",
        "risk": "low",
        "status": "ready",
        "tags": ["network", "port", "connect"],
        "inputs": [
            {"key": "target", "label": "Target Host/IP", "type": "text", "required": True, "placeholder": "example.com"},
            {"key": "port", "label": "Target Port", "type": "number", "required": True, "placeholder": "80"},
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
            {"key": "passlist", "label": "Password List Path (Optional)", "type": "text", "required": False, "placeholder": "Default: /usr/share/wordlists/rockyou.txt"},
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
            {"key": "wordlist", "label": "Wordlist Path (Optional)", "type": "text", "required": False, "placeholder": "Default: /usr/share/wordlists/dirb/common.txt"},
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
            {"key": "target", "label": "Target IP/Domain/CIDR", "type": "text", "required": True, "placeholder": "192.168.1.0/24 or example.com"},
            {"key": "ports", "label": "Port Range", "type": "text", "required": False, "placeholder": "1-1000"},
        ]
    },
    {
        "id": "searchsploit_exploitdb",
        "name": "SearchSploit Exploit Search",
        "description": "Search the local copy of Exploit-DB for known vulnerabilities",
        "category": "Exploit",
        "risk": "low",
        "status": "ready",
        "tags": ["exploit", "vulnerability", "binary"],
        "inputs": [
            {"key": "query", "label": "Search Query", "type": "text", "required": True, "placeholder": "OpenSSH 7.2"},
        ]
    },
    {
        "id": "radare2_analyze",
        "name": "Radare2 Binary Analysis",
        "description": "Perform basic automated binary analysis using Radare2",
        "category": "Exploit",
        "risk": "low",
        "status": "ready",
        "tags": ["binary", "reverse", "analysis"],
        "inputs": [
            {"key": "file_path", "label": "Binary Path", "type": "text", "required": True, "placeholder": "/usr/bin/ls"},
        ]
    },
    {
        "id": "checksec_binary",
        "name": "Checksec Security Audit",
        "description": "Check binary security protections (NX, PIE, Canary, ASLR)",
        "category": "Exploit",
        "risk": "low",
        "status": "ready",
        "tags": ["binary", "hardening", "security"],
        "inputs": [
            {"key": "file_path", "label": "Binary Path", "type": "text", "required": True, "placeholder": "/usr/bin/ls"},
        ]
    },
    {
        "id": "dnsrecon_enum",
        "name": "DNSRecon Enumeration",
        "description": "DNS enumeration and zone transfer testing",
        "category": "OSINT",
        "risk": "low",
        "status": "ready",
        "tags": ["dns", "recon", "enum"],
        "inputs": [{"key": "domain", "label": "Domain", "type": "text", "required": True}]
    },
    {
        "id": "netdiscover_scan",
        "name": "Netdiscover ARP Scan",
        "description": "Active/passive ARP reconnaissance tool",
        "category": "Network",
        "risk": "low",
        "status": "ready",
        "tags": ["network", "arp", "recon"],
        "inputs": [{"key": "range", "label": "Network Range", "type": "text", "required": True, "placeholder": "192.168.1.0/24"}]
    },
    {
        "id": "medusa_bruteforce",
        "name": "Medusa Login Cracker",
        "description": "Parallel network login cracker",
        "category": "Audit",
        "risk": "high",
        "status": "ready",
        "tags": ["password", "bruteforce", "audit"],
        "inputs": [
            {"key": "target", "label": "Target Host", "type": "text", "required": True},
            {"key": "username", "label": "Username", "type": "text", "required": True},
            {"key": "module", "label": "Module (ssh/ftp/etc)", "type": "text", "required": True}
        ]
    },
    {
        "id": "cewl_wordlist",
        "name": "CeWL Wordlist Generator",
        "description": "Custom wordlist generator by crawling a target website",
        "category": "Audit",
        "risk": "low",
        "status": "ready",
        "tags": ["password", "wordlist", "cewl"],
        "inputs": [{"key": "url", "label": "Target URL", "type": "text", "required": True}]
    },
    {
        "id": "bettercap_recon",
        "name": "Bettercap Recon",
        "description": "Powerful network monitoring and manipulation framework",
        "category": "Network",
        "risk": "medium",
        "status": "ready",
        "tags": ["network", "mitm", "recon"],
        "inputs": [{"key": "command", "label": "Command", "type": "text", "required": False, "placeholder": "net.probe on"}]
    },
    {
        "id": "yersinia_attack",
        "name": "Yersinia Network Attack",
        "description": "Network tool for protocol vulnerabilities",
        "category": "Network",
        "risk": "high",
        "status": "ready",
        "tags": ["network", "layer2", "attack"],
        "inputs": [{"key": "interface", "label": "Interface", "type": "text", "required": True}]
    },
    {
        "id": "androguard_analyze",
        "name": "Androguard APK Analysis",
        "description": "Static analysis of Android applications",
        "category": "Mobile",
        "risk": "low",
        "status": "ready",
        "tags": ["mobile", "android", "reverse"],
        "inputs": [{"key": "file_path", "label": "APK Path", "type": "text", "required": True}]
    },
    {
        "id": "reaver_wps",
        "name": "Reaver WPS Attack",
        "description": "Brute force attack against WPS registrar PINs",
        "category": "Wireless",
        "risk": "high",
        "status": "ready",
        "tags": ["wireless", "wifi", "wps"],
        "inputs": [
            {"key": "interface", "label": "Monitor Interface", "type": "text", "required": True},
            {"key": "bssid", "label": "Target BSSID", "type": "text", "required": True}
        ]
    },
    {
        "id": "set_social_engineering",
        "name": "Social Engineering Toolkit (SET)",
        "description": "Exploit technical vulnerabilities with human psychology",
        "category": "Social Engineering",
        "risk": "high",
        "status": "ready",
        "tags": ["social", "phishing", "set"],
        "inputs": [{"key": "attack_vector", "label": "Attack Vector (e.g. spearphish)", "type": "text", "required": True}]
    },
    {
        "id": "shodan_enterprise",
        "name": "Bouclier Shodan Enterprise",
        "description": "Enterprise-grade IoT search & network monitoring. Includes: 327,680 IP Scans/mo, Full Filter Access, Streaming API, Batch Lookups, and Tag Search.",
        "category": "OSINT",
        "risk": "low",
        "status": "ready",
        "tags": ["osint", "iot", "enterprise", "shodan", "monitoring"],
        "inputs": [
            {"key": "query", "label": "Search Query", "type": "text", "required": True, "placeholder": "apache country:MA"},
            {"key": "api_key", "label": "Corporate API Key", "type": "text", "required": True, "placeholder": "Your Shodan Enterprise Key"},
            {"key": "monitoring", "label": "Enable Network Monitoring (up to 327,680 IPs)", "type": "checkbox", "required": False},
        ]
    },
    {
        "id": "maltego_transform",
        "name": "Maltego Transform Runner",
        "description": "Execute custom Maltego transforms for OSINT investigation",
        "category": "OSINT",
        "risk": "low",
        "status": "ready",
        "tags": ["osint", "transforms", "graphing"],
        "inputs": [
            {"key": "transform", "label": "Transform Name", "type": "text", "required": True, "placeholder": "DNSToIP"},
            {"key": "entity", "label": "Entity Value", "type": "text", "required": True, "placeholder": "example.com"}
        ]
    },
    {
        "id": "pypykatz_lsass",
        "name": "Pypykatz Credential Extractor",
        "description": "Mimikatz alternative for Linux - extract credentials from memory dumps",
        "category": "Post-Exploitation",
        "risk": "high",
        "status": "ready",
        "tags": ["credentials", "memory", "windows"],
        "inputs": [
            {"key": "dump_file", "label": "LSASS Dump File Path", "type": "text", "required": True, "placeholder": "/path/to/lsass.DMP"},
            {"key": "output_format", "label": "Output Format", "type": "text", "required": False, "placeholder": "json"}
        ]
    },
    {
        "id": "ghidra_analyze",
        "name": "Ghidra Headless Analysis",
        "description": "NSA reverse engineering suite - automated binary analysis",
        "category": "Reverse Engineering",
        "risk": "low",
        "status": "ready",
        "tags": ["reverse", "binary", "nsa"],
        "inputs": [
            {"key": "binary_path", "label": "Binary File Path", "type": "text", "required": True, "placeholder": "/path/to/binary"},
            {"key": "script", "label": "Analysis Script (Optional)", "type": "text", "required": False, "placeholder": "FunctionCallTrees.py"}
        ]
    },
    {
        "id": "empire_powershell",
        "name": "Empire PowerShell Agent",
        "description": "Post-exploitation PowerShell framework for lateral movement",
        "category": "Post-Exploitation",
        "risk": "high",
        "status": "ready",
        "tags": ["powershell", "post-exploit", "lateral"],
        "inputs": [
            {"key": "listener", "label": "Listener Name", "type": "text", "required": True, "placeholder": "http"},
            {"key": "command", "label": "Empire Command", "type": "text", "required": True, "placeholder": "uselistener http"}
        ]
    },
    {
        "id": "bloodhound_collect",
        "name": "BloodHound Data Collector",
        "description": "Active Directory attack path analysis - collect domain data",
        "category": "Post-Exploitation",
        "risk": "medium",
        "status": "ready",
        "tags": ["active-directory", "windows", "graph"],
        "inputs": [
            {"key": "domain", "label": "Domain", "type": "text", "required": True, "placeholder": "corp.local"},
            {"key": "username", "label": "Username", "type": "text", "required": True, "placeholder": "domain\\user"},
            {"key": "password", "label": "Password", "type": "text", "required": True, "placeholder": "P@ssw0rd"}
        ]
    },
    {
        "id": "mobsf_scan",
        "name": "MobSF Mobile Security Scan",
        "description": "Comprehensive Android/iOS security analysis framework",
        "category": "Mobile",
        "risk": "low",
        "status": "ready",
        "tags": ["mobile", "android", "ios"],
        "inputs": [
            {"key": "apk_path", "label": "APK/IPA Path", "type": "text", "required": True, "placeholder": "/path/to/app.apk"}
        ]
    },
    {
        "id": "frida_hook",
        "name": "Frida Dynamic Instrumentation",
        "description": "Runtime manipulation of iOS/Android apps",
        "category": "Mobile",
        "risk": "medium",
        "status": "ready",
        "tags": ["mobile", "runtime", "hooking"],
        "inputs": [
            {"key": "package", "label": "Package Name", "type": "text", "required": True, "placeholder": "com.example.app"},
            {"key": "script", "label": "Frida Script", "type": "text", "required": False, "placeholder": "Java.perform(function() {})"}
        ]
    },
    {
        "id": "armitage_teamserver",
        "name": "Armitage Team Server",
        "description": "Metasploit collaboration & management. Full attack management with target visualization.",
        "category": "Exploit",
        "risk": "high",
        "status": "ready",
        "tags": ["metasploit", "gui", "collaboration", "attack-management"],
        "inputs": [
            {"key": "ip", "label": "External IP", "type": "text", "required": True, "placeholder": "127.0.0.1"},
            {"key": "password", "label": "Team Password", "type": "text", "required": True, "placeholder": "********"},
        ]
    },
    {
        "id": "kali_custom_tool",
        "name": "Custom Kali Command",
        "description": "Run any installed Kali tool by specifying the command and arguments.",
        "category": "Advanced",
        "risk": "high",
        "status": "ready",
        "tags": ["custom", "advanced", "terminal"],
        "inputs": [
            {"key": "command", "label": "Full Command", "type": "text", "required": True, "placeholder": "whoami / nmap --version / metasploit-framework"},
        ]
    },
    # Info Gathering
    {
        "id": "dnsmap_recon",
        "name": "DNSMap Subdomain Search",
        "description": "Passive subdomain discovery and network mapping.",
        "category": "OSINT",
        "risk": "low",
        "status": "ready",
        "tags": ["dns", "recon", "enum"],
        "inputs": [{"key": "target", "label": "Target Domain", "type": "text", "required": True}]
    },
    {
        "id": "sparta_recon",
        "name": "SPARTA Network Infrastructure Toolkit",
        "description": "Network infrastructure penetration testing toolkit.",
        "category": "Network",
        "risk": "medium",
        "status": "ready",
        "tags": ["network", "audit", "recon"],
        "inputs": [{"key": "target", "label": "Target IP/Network", "type": "text", "required": True}]
    },
    # Vuln Analysis
    {
        "id": "openvas_scan",
        "name": "OpenVAS Vulnerability Audit",
        "description": "Deep vulnerability scanning and management.",
        "category": "Vulnerability",
        "risk": "medium",
        "status": "ready",
        "tags": ["scanner", "vulnerability", "audit"],
        "inputs": [{"key": "target", "label": "Target Host", "type": "text", "required": True}]
    },
    # Wireless
    {
        "id": "kismet_wireless",
        "name": "Kismet Wireless Sniffer",
        "description": "Wireless network sniffer, sniffer, and IDS.",
        "category": "Wireless",
        "risk": "low",
        "status": "ready",
        "tags": ["wireless", "sniffer", "monitor"],
        "inputs": [{"key": "interface", "label": "Monitor Interface", "type": "text", "required": True}]
    },
    # Web Apps
    {
        "id": "burp_rest_api",
        "name": "Burp Suite API Runner",
        "description": "Control a remote Burp Suite instance for automated scanning.",
        "category": "Web",
        "risk": "medium",
        "status": "ready",
        "tags": ["web", "proxy", "scanner"],
        "inputs": [{"key": "api_url", "label": "Burp API URL", "type": "text", "required": True}]
    },
    {
        "id": "wapiti_audit",
        "name": "Wapiti Web Security Audit",
        "description": "Web vulnerability scanner using black-box analysis.",
        "category": "Web",
        "risk": "medium",
        "status": "ready",
        "tags": ["web", "scanner", "vuln"],
        "inputs": [{"key": "url", "label": "Target URL", "type": "text", "required": True}]
    },
    {
        "id": "wstg_scan",
        "name": "OWASP WSTG Web Security Scanner",
        "description": "Complete OWASP WSTG-based web security scanner. Performs: info gathering, nmap, nuclei, ffuf vhost/dir busting, spidering, source analysis, SQLi/XSS/SSRF/SSTI/XXE, API testing, brute force, WPScan, and Active Directory pentesting. Generates TXT/JSON/HTML/MD reports.",
        "category": "Web",
        "risk": "high",
        "status": "ready",
        "tags": ["web", "owasp", "wstg", "scanner", "full"],
        "inputs": [
            {"key": "url", "label": "Target URL", "type": "text", "required": True, "placeholder": "https://example.com"},
            {"key": "threads", "label": "Threads", "type": "number", "required": False, "placeholder": "5"},
            {"key": "timeout", "label": "Timeout (seconds)", "type": "number", "required": False, "placeholder": "10"},
            {"key": "delay", "label": "Delay between requests", "type": "number", "required": False, "placeholder": "0"},
            {"key": "insecure", "label": "Disable TLS verification", "type": "checkbox", "required": False},
        ]
    },
    {
        "id": "raptor_scan",
        "name": "RAPTOR AI - Autonomous Security Research",
        "description": "Recursive Autonomous Penetration Testing and Observation Robot. Scans codebases/binaries with Semgrep + CodeQL, validates findings via multi-stage pipeline, generates exploit PoCs and secure patches.",
        "category": "Advanced",
        "risk": "critical",
        "status": "ready",
        "tags": ["ai", "autonomous", "vulnerability", "exploit", "patch", "semgrep", "codeql"],
        "inputs": [
            {"key": "target", "label": "Target path / URL / repo", "type": "text", "required": True, "placeholder": "/path/to/code or https://github.com/user/repo"},
            {"key": "mode", "label": "Analysis Mode", "type": "select", "options": ["scan", "agentic", "sca", "understand", "validate"], "required": False},
            {"key": "threat_model", "label": "Enable threat modeling", "type": "checkbox", "required": False},
        ]
    },
    # Exploitation
    {
        "id": "exploitdb_offline",
        "name": "Exploit-DB Offline Mirror",
        "description": "Access the entire Exploit-DB archive for local search and retrieval.",
        "category": "Exploit",
        "risk": "low",
        "status": "ready",
        "tags": ["exploit", "offline", "archive"],
        "inputs": [{"key": "query", "label": "Search Pattern", "type": "text", "required": True}]
    },
    # Post Exploit
    {
        "id": "powersploit_recon",
        "name": "PowerSploit Enumeration",
        "description": "PowerShell modules for post-exploitation reconnaissance.",
        "category": "Post-Exploitation",
        "risk": "high",
        "status": "ready",
        "tags": ["windows", "powershell", "recon"],
        "inputs": [{"key": "command", "label": "PowerSploit Command", "type": "text", "required": True}]
    },
    # Forensics
    {
        "id": "foremost_extract",
        "name": "Foremost File Extractor",
        "description": "Recover files based on their headers, footers, and internal data structures.",
        "category": "Forensics",
        "risk": "low",
        "status": "ready",
        "tags": ["carving", "extraction", "recovery"],
        "inputs": [{"key": "image_path", "label": "Disk Image Path", "type": "text", "required": True}]
    },
    # Sniffing/Spoofing
    {
        "id": "ettercap_mitm",
        "name": "Ettercap MiTM Console",
        "description": "Comprehensive suite for man-in-the-middle attacks.",
        "category": "Network",
        "risk": "high",
        "status": "ready",
        "tags": ["mitm", "spoofing", "sniffing"],
        "inputs": [{"key": "target1", "label": "Target 1", "type": "text", "required": True}, {"key": "target2", "label": "Target 2", "type": "text", "required": True}]
    },
    {
        "id": "mythos_playbook_perimeter",
        "name": "Playbook: Perimeter Sweep",
        "description": "Multi-stage recon: Network Audit -> CISA KEV -> Port Discovery -> OSINT Correlation.",
        "category": "Playbooks",
        "risk": "medium",
        "status": "ready",
        "tags": ["mythos", "automation", "perimeter", "sweep"],
        "inputs": [
            {"key": "target", "label": "Target Domain", "type": "text", "required": True, "placeholder": "example.com"},
        ]
    },
    {
        "id": "mythos_playbook_lateral",
        "name": "Playbook: Lateral Discovery",
        "description": "Internal movement mapping: SMB Audit -> Active Directory Recon -> Credential Hunting.",
        "category": "Playbooks",
        "risk": "high",
        "status": "ready",
        "tags": ["mythos", "lateral-movement", "internal", "ad"],
        "inputs": [
            {"key": "target_network", "label": "Target CIDR", "type": "text", "required": True, "placeholder": "10.0.0.0/24"},
        ]
    },
    {
        "id": "mythos_playbook_cloud",
        "name": "Playbook: Cloud Asset Audit",
        "description": "S3 bucket hunting, exposed secrets, and dependency vulnerability chain analysis.",
        "category": "Playbooks",
        "risk": "medium",
        "status": "ready",
        "tags": ["mythos", "cloud", "s3", "secrets"],
        "inputs": [
            {"key": "cloud_provider", "label": "Provider", "type": "select", "options": ["aws", "azure", "gcp"], "required": True},
            {"key": "domain", "label": "Organization Domain", "type": "text", "required": True},
        ]
    }
]
