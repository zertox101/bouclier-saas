# 🛡️ BOUCLIER SAAS - Security Tools Inventory

## 📦 Installed Security Tools

### Core Network Reconnaissance
- **nmap** - Network mapper for host/service discovery
- **masscan** - High-speed port scanner
- **arp-scan** - ARP-based network scanner
- **ping** - ICMP echo request utility
- **traceroute** - Network path tracing
- **hping3** - Advanced packet crafting tool
- **dnsrecon** ✨ NEW - DNS enumeration and zone transfer
- **netdiscover** ✨ NEW - Active/passive ARP reconnaissance
- **unicornscan** ✨ NEW - High-speed asynchronous TCP/UDP scanner

### Network Analysis & Monitoring
- **tcpdump** - Packet capture and analysis
- **tshark** ✨ NEW - CLI Wireshark for deep packet inspection
- **ngrep** ✨ NEW - Network grep for pattern matching
- **iftop** ✨ NEW - Real-time bandwidth monitoring
- **nethogs** ✨ NEW - Per-process network usage tracking
- **ettercap** ✨ NEW - Network sniffer/interceptor (CLI)
- **bettercap** ✨ NEW - Advanced network monitoring & manipulation

### Web Application Security
- **nikto** - Web server vulnerability scanner
- **whatweb** - Web technology fingerprinting
- **gobuster** - Directory/file brute-forcing
- **ffuf** - Fast web fuzzer
- **sqlmap** - SQL injection detection and exploitation
- **wapiti** ✨ NEW - Web application vulnerability scanner
- **nuclei** ✨ NEW - Modern vulnerability scanner with templates
- **w3af** ✨ NEW - Web application attack and audit framework

### SSL/TLS Security
- **openssl** - SSL/TLS toolkit
- **sslscan** ✨ NEW - Fast SSL/TLS scanner

### Exploitation & Post-Exploitation
- **metasploit-framework** ✨ NEW - Complete penetration testing framework
- **exploitdb** ✨ NEW - Exploit database
- **crackmapexec** ✨ NEW - Network pentesting Swiss army knife
- **hydra** - Network login cracker
- **medusa** ✨ NEW - Parallel network login cracker
- **patator** ✨ NEW - Multi-purpose brute-force tool
- **setoolkit** ✨ NEW - Social Engineering Toolkit

### OSINT & Reconnaissance
- **whois** - Domain registration lookup
- **theharvester** ✨ NEW - Email, subdomain, and name harvesting
- **recon-ng** ✨ NEW - Full-featured reconnaissance framework
- **amass** ✨ NEW - In-depth DNS enumeration
- **subfinder** ✨ NEW - Subdomain discovery tool
- **cewl** ✨ NEW - Custom wordlist generator

### Password Auditing
- **john** ✨ NEW - John the Ripper password cracker
- **hashcat** ✨ NEW - Advanced password recovery
- **crunch** ✨ NEW - Wordlist generator

### Wireless Security
- **aircrack-ng** ✨ NEW - Wireless network security suite
- **wifite** ✨ NEW - Automated wireless attack tool
- **reaver** ✨ NEW - WPS brute-force tool
- **pixiewps** ✨ NEW - Offline WPS pin cracker
- **kismet** ✨ NEW - Wireless network sniffer

### Forensics & Malware Analysis
- **binwalk** ✨ NEW - Firmware analysis tool
- **foremost** ✨ NEW - File carving tool
- **yara** ✨ NEW - Pattern matching for malware research

### Binary Exploitation & Reverse Engineering
- **radare2** ✨ NEW - Advanced reverse engineering framework
- **pwntools** ✨ NEW - CTF framework and exploit development library
- **checksec** ✨ NEW - Check binary security features
- **searchsploit** ✨ NEW - Search Exploit-DB for known exploits
- **androguard** ✨ NEW - Static analysis of APKs

### Network Utilities
- **curl** - HTTP client
- **wget** - File downloader
- **netcat-traditional** - Network Swiss army knife
- **net-tools** - Network configuration tools
- **iputils-ping** - Ping utilities
- **iproute2** - Advanced routing utilities
- **dnsutils** - DNS query tools (dig, nslookup)

### Development & Utilities
- **python3** - Python interpreter
- **python3-pip** - Python package manager
- **python3-scapy** ✨ NEW - Packet manipulation library
- **build-essential** - Compilation tools
- **jq** ✨ NEW - JSON processor (essential for API work)
- **git** ✨ NEW - Version control
- **vim** ✨ NEW - Text editor
- **tmux** ✨ NEW - Terminal multiplexer

### Development Libraries
- **libxml2-dev** - XML parsing library
- **libxslt1-dev** - XSLT processing library
- **libffi-dev** - Foreign Function Interface library
- **libssl-dev** - SSL development library
- **libpcap-dev** - Packet capture library

---

## 🎯 Purple Team Capabilities

### Adversary Emulation Tools (Built-in)
- **emu_auth_chain** - Brute force → Valid login pattern (T1110)
- **emu_c2_beacon** - C2 beaconing simulation (T1071)
- **emu_data_exfil** - Data exfiltration over C2 (T1041)
- **emu_edr_evasion** - EDR evasion techniques (T1059, T1027)

### Custom Security Tools
- **threat_hunting** - IOC hunting and analysis
- **malware_analyzer** - Malware static/dynamic analysis
- **mobile_security** - APK security analysis
- **report_generator** - Security report generation

### Flipper Zero Integration
- **flipper_init** - Initialize Flipper development environment
- **flipper_build** - Build Flipper firmware
- **flipper_update** - Update and rebuild firmware
- **flipper_flash** - Flash firmware to device
- **flipper_flash_full** - Full firmware flash

---

## 🚀 Usage

### Rebuild the Tools Container
To apply the new tools, rebuild the tools-api container:

```bash
docker-compose up -d --build tools-api
```

### Verify Tool Installation
Check if a specific tool is installed:

```bash
docker exec bouclier-tools which nuclei
docker exec bouclier-tools metasploit-framework --version
```

### Run Tools via API
All tools are accessible through the Tools API at `http://localhost:8100`

Example:
```bash
curl -X POST http://localhost:8100/tools/run \
  -H "Content-Type: application/json" \
  -d '{
    "tool_id": "network_recon",
    "input": {
      "target": "192.168.1.0/24",
      "ports": "22,80,443"
    }
  }'
```

---

## 🔒 Security Configuration

### Environment Variables
- `TOOLS_REQUIRE_PRIVATE=1` - Only allow private IP targets
- `TOOLS_ALLOW_PUBLIC_TARGETS=0` - Block public IP scanning
- `TOOLS_ENABLE_WEB_SCANNER=0` - Enable/disable web scanners
- `TOOLS_ENABLE_OFFENSIVE=0` - Enable/disable offensive tools
- `TOOLS_MAX_SNIFF_DURATION=300` - Max packet capture duration (seconds)
- `TOOLS_CMD_TIMEOUT=180` - Command execution timeout (seconds)

### Capabilities
The tools-api container runs with:
- `NET_ADMIN` - Network administration
- `NET_RAW` - Raw socket access (required for packet crafting)

---

## 📊 Tool Categories

| Category | Count | Risk Level |
|----------|-------|------------|
| Network Reconnaissance | 10 | Low-Medium |
| Web Security | 7 | Medium-High |
| Exploitation | 4 | High |
| OSINT | 5 | Low |
| Password Auditing | 4 | High |
| Wireless | 2 | High |
| Forensics | 3 | Low |
| Adversary Emulation | 4 | Medium |

**Total Tools: 60+**

---

## 🎓 Next Steps

1. **Rebuild Container**: Run `docker-compose up -d --build tools-api`
2. **Test New Tools**: Verify installation with `docker exec bouclier-tools <tool> --version`
3. **Integrate into API**: Add new tool endpoints to `tools-api/app.py`
4. **Update Frontend**: Add UI components for new tools in the dashboard
5. **Create Workflows**: Build Purple Team scenarios combining multiple tools

---

## 📝 Notes

- All tools are installed in a **Kali Linux** base image (`kalilinux/kali-rolling`)
- Tools marked with ✨ **NEW** were added in this update
- Offensive tools require `TOOLS_ENABLE_OFFENSIVE=1` to activate
- All tool execution is logged and can be monitored via the API

---

**Last Updated**: 2026-01-10
**Container**: bouclier-tools (tools-api)
**Base Image**: kalilinux/kali-rolling
