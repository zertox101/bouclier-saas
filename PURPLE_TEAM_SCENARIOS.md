# 🎯 Purple Team Scenarios - BOUCLIER SAAS

## Overview
This document outlines realistic Purple Team scenarios that combine multiple security tools to simulate real-world attack chains and validate defensive capabilities.

---

## 📋 Scenario Categories

### 1. **Reconnaissance Chain**
### 2. **Web Application Attack**
### 3. **Network Penetration**
### 4. **Credential Compromise**
### 5. **Post-Exploitation & Exfiltration**
### 6. **Advanced Persistent Threat (APT) Simulation**

---

## 🔍 Scenario 1: Full Reconnaissance Chain

**Objective**: Simulate a complete external reconnaissance phase against a target organization.

**MITRE ATT&CK**: T1590 (Gather Victim Network Information), T1595 (Active Scanning)

### Attack Flow:
```
1. OSINT Collection → 2. Subdomain Enumeration → 3. Service Discovery → 4. Vulnerability Scanning
```

### Tool Chain:
1. **TheHarvester** - Email and subdomain harvesting
2. **Amass** - Deep subdomain enumeration
3. **Subfinder** - Fast passive subdomain discovery
4. **Nmap** - Service and version detection
5. **Nuclei** - Vulnerability scanning

### API Execution Sequence:

```bash
# Step 1: Harvest emails and initial subdomains
curl -X POST http://localhost:8100/tools/run \
  -H "Content-Type: application/json" \
  -d '{
    "tool_id": "theharvester_scan",
    "input": {
      "target": "target-corp.local",
      "source": "google,bing,linkedin",
      "limit": 500
    }
  }'

# Step 2: Deep subdomain enumeration
curl -X POST http://localhost:8100/tools/run \
  -H "Content-Type: application/json" \
  -d '{
    "tool_id": "amass_enum",
    "input": {
      "target": "target-corp.local",
      "active": "false"
    }
  }'

# Step 3: Fast passive subdomain discovery
curl -X POST http://localhost:8100/tools/run \
  -H "Content-Type: application/json" \
  -d '{
    "tool_id": "subfinder_enum",
    "input": {
      "target": "target-corp.local"
    }
  }'

# Step 4: Port scanning discovered hosts
curl -X POST http://localhost:8100/tools/run \
  -H "Content-Type: application/json" \
  -d '{
    "tool_id": "network_recon",
    "input": {
      "target": "192.168.1.0/24",
      "ports": "80,443,8080,8443"
    }
  }'

# Step 5: Vulnerability scanning (requires TOOLS_ENABLE_OFFENSIVE=1)
curl -X POST http://localhost:8100/tools/run \
  -H "Content-Type: application/json" \
  -d '{
    "tool_id": "nuclei_scan",
    "input": {
      "target": "https://app.target-corp.local",
      "severity": "critical,high"
    }
  }'
```

### Expected Detections:
- **SIEM**: Multiple DNS queries from single source
- **IDS/IPS**: Port scanning signatures
- **WAF**: Vulnerability scanner user-agent
- **Threat Intel**: Known OSINT tool traffic patterns

---

## 🌐 Scenario 2: Web Application Attack Chain

**Objective**: Simulate a complete web application penetration test.

**MITRE ATT&CK**: T1190 (Exploit Public-Facing Application), T1595.002 (Vulnerability Scanning)

### Attack Flow:
```
1. HTTP Fingerprinting → 2. SSL/TLS Analysis → 3. Directory Brute Force → 4. SQL Injection
```

### Tool Chain:
1. **WhatWeb** - Technology fingerprinting
2. **SSLScan** - SSL/TLS configuration analysis
3. **Gobuster** - Directory enumeration
4. **SQLMap** - SQL injection testing
5. **Nuclei** - Automated vulnerability detection

### API Execution Sequence:

```bash
# Step 1: Web technology fingerprinting
curl -X POST http://localhost:8100/tools/run \
  -H "Content-Type: application/json" \
  -d '{
    "tool_id": "http_fingerprint",
    "input": {
      "target": "http://192.168.1.100"
    }
  }'

# Step 2: SSL/TLS security analysis
curl -X POST http://localhost:8100/tools/run \
  -H "Content-Type: application/json" \
  -d '{
    "tool_id": "sslscan_check",
    "input": {
      "target": "https://192.168.1.100:443"
    }
  }'

# Step 3: Directory brute forcing (requires TOOLS_ENABLE_OFFENSIVE=1)
curl -X POST http://localhost:8100/tools/run \
  -H "Content-Type: application/json" \
  -d '{
    "tool_id": "dir_bruteforce",
    "input": {
      "target": "http://192.168.1.100",
      "wordlist": "/usr/share/wordlists/dirb/common.txt",
      "threads": 10
    }
  }'

# Step 4: SQL injection testing (requires TOOLS_ENABLE_OFFENSIVE=1)
curl -X POST http://localhost:8100/tools/run \
  -H "Content-Type: application/json" \
  -d '{
    "tool_id": "sqlmap_scan",
    "input": {
      "target": "http://192.168.1.100/login.php?id=1",
      "level": 2,
      "risk": 2
    }
  }'
```

### Expected Detections:
- **WAF**: Directory traversal attempts
- **IDS**: SQL injection patterns
- **Application Logs**: 404 errors spike
- **Rate Limiting**: Excessive requests from single IP

---

## 🔐 Scenario 3: Credential Compromise Chain

**Objective**: Simulate credential harvesting and brute force attacks.

**MITRE ATT&CK**: T1110 (Brute Force), T1589 (Gather Victim Identity Information)

### Attack Flow:
```
1. Email Harvesting → 2. Username Generation → 3. Password Spraying → 4. Hash Cracking
```

### Tool Chain:
1. **TheHarvester** - Email collection
2. **Hydra** - SSH brute forcing
3. **John the Ripper** - Password hash cracking
4. **Hashcat** - Advanced hash cracking

### API Execution Sequence:

```bash
# Step 1: Harvest employee emails
curl -X POST http://localhost:8100/tools/run \
  -H "Content-Type: application/json" \
  -d '{
    "tool_id": "theharvester_scan",
    "input": {
      "target": "target-corp.local",
      "source": "linkedin,google",
      "limit": 1000
    }
  }'

# Step 2: SSH password spraying (requires TOOLS_ENABLE_OFFENSIVE=1)
curl -X POST http://localhost:8100/tools/run \
  -H "Content-Type: application/json" \
  -d '{
    "tool_id": "password_auditor",
    "input": {
      "target": "192.168.1.50",
      "userlist": "/opt/tools/inputs/users.txt",
      "passlist": "/opt/tools/inputs/common_passwords.txt",
      "port": 22,
      "threads": 4
    }
  }'

# Step 3: Crack password hashes with John (requires TOOLS_ENABLE_OFFENSIVE=1)
curl -X POST http://localhost:8100/tools/run \
  -H "Content-Type: application/json" \
  -d '{
    "tool_id": "john_crack",
    "input": {
      "file_path": "/opt/tools/inputs/hashes.txt",
      "wordlist": "/usr/share/wordlists/rockyou.txt"
    }
  }'

# Step 4: Advanced hash cracking with Hashcat (requires TOOLS_ENABLE_OFFENSIVE=1)
curl -X POST http://localhost:8100/tools/run \
  -H "Content-Type: application/json" \
  -d '{
    "tool_id": "hashcat_crack",
    "input": {
      "file_path": "/opt/tools/inputs/ntlm_hashes.txt",
      "wordlist": "/usr/share/wordlists/rockyou.txt",
      "hash_type": 1000
    }
  }'
```

### Expected Detections:
- **SIEM**: Multiple failed login attempts
- **EDR**: Suspicious process execution
- **Network**: Unusual SSH connection patterns
- **Account Lockout**: Threshold exceeded

---

## 🕵️ Scenario 4: Network Traffic Analysis

**Objective**: Monitor and analyze network traffic for suspicious patterns.

**MITRE ATT&CK**: T1040 (Network Sniffing), T1557 (Adversary-in-the-Middle)

### Attack Flow:
```
1. Packet Capture → 2. Protocol Analysis → 3. Pattern Matching → 4. Credential Extraction
```

### Tool Chain:
1. **Tcpdump** - Basic packet capture
2. **Tshark** - Deep packet inspection
3. **Ngrep** - Pattern matching in traffic

### API Execution Sequence:

```bash
# Step 1: Basic packet capture
curl -X POST http://localhost:8100/tools/run \
  -H "Content-Type: application/json" \
  -d '{
    "tool_id": "packet_sniffer",
    "input": {
      "duration": 60,
      "packet_count": 1000,
      "interface": "eth0"
    }
  }'

# Step 2: Deep packet inspection with Tshark
curl -X POST http://localhost:8100/tools/run \
  -H "Content-Type: application/json" \
  -d '{
    "tool_id": "tshark_capture",
    "input": {
      "duration": 60,
      "packet_count": 500,
      "interface": "eth0",
      "filter": "tcp port 80"
    }
  }'

# Step 3: Search for credentials in traffic
curl -X POST http://localhost:8100/tools/run \
  -H "Content-Type: application/json" \
  -d '{
    "tool_id": "ngrep_capture",
    "input": {
      "pattern": "password|passwd|pwd",
      "interface": "eth0",
      "duration": 30
    }
  }'
```

### Expected Detections:
- **IDS**: Promiscuous mode detection
- **Network**: Unusual traffic patterns
- **SIEM**: Packet capture tool execution

---

## 🦠 Scenario 5: Malware Analysis & Forensics

**Objective**: Analyze suspicious files and firmware for malware.

**MITRE ATT&CK**: T1059 (Command and Scripting Interpreter), T1027 (Obfuscated Files)

### Attack Flow:
```
1. File Discovery → 2. Static Analysis → 3. Pattern Matching → 4. Firmware Extraction
```

### Tool Chain:
1. **Binwalk** - Firmware analysis
2. **YARA** - Malware pattern matching
3. **Malware Analyzer** - Custom static analysis

### API Execution Sequence:

```bash
# Step 1: Firmware analysis
curl -X POST http://localhost:8100/tools/run \
  -H "Content-Type: application/json" \
  -d '{
    "tool_id": "binwalk_analyze",
    "input": {
      "file_path": "/opt/tools/inputs/router_firmware.bin"
    }
  }'

# Step 2: YARA malware scanning
curl -X POST http://localhost:8100/tools/run \
  -H "Content-Type: application/json" \
  -d '{
    "tool_id": "yara_scan",
    "input": {
      "rules_path": "/opt/tools/inputs/malware_rules.yar",
      "file_path": "/opt/tools/inputs/suspicious_file.exe"
    }
  }'

# Step 3: Custom malware analysis
curl -X POST http://localhost:8100/tools/run \
  -H "Content-Type: application/json" \
  -d '{
    "tool_id": "malware_analyzer",
    "input": {
      "file_path": "/opt/tools/inputs/sample.bin"
    }
  }'
```

### Expected Detections:
- **EDR**: File analysis tool execution
- **SIEM**: Suspicious file access patterns
- **Sandbox**: Malware detonation alerts

---

## 🎭 Scenario 6: APT Simulation - Full Kill Chain

**Objective**: Simulate a complete Advanced Persistent Threat attack chain.

**MITRE ATT&CK**: Multiple TTPs across the kill chain

### Attack Flow:
```
1. Recon → 2. Initial Access → 3. Execution → 4. Persistence → 5. C2 → 6. Exfiltration
```

### Tool Chain:
1. **Amass** - Target reconnaissance
2. **Nuclei** - Vulnerability exploitation
3. **Emulation Tools** - Auth chain, C2 beaconing, data exfil
4. **Network Tools** - Traffic analysis

### API Execution Sequence:

```bash
# Phase 1: Reconnaissance
curl -X POST http://localhost:8100/tools/run \
  -H "Content-Type: application/json" \
  -d '{"tool_id": "amass_enum", "input": {"target": "target.local"}}'

# Phase 2: Vulnerability Scanning
curl -X POST http://localhost:8100/tools/run \
  -H "Content-Type: application/json" \
  -d '{"tool_id": "nuclei_scan", "input": {"target": "https://target.local", "severity": "critical"}}'

# Phase 3: Credential Brute Force (Emulated)
curl -X POST http://localhost:8100/tools/run \
  -H "Content-Type: application/json" \
  -d '{"tool_id": "emu_auth_chain", "input": {"target": "192.168.1.100", "user": "admin"}}'

# Phase 4: C2 Beaconing
curl -X POST http://localhost:8100/tools/run \
  -H "Content-Type: application/json" \
  -d '{"tool_id": "emu_c2_beacon", "input": {"target": "192.168.1.5", "interval": 10, "count": 20}}'

# Phase 5: Data Exfiltration
curl -X POST http://localhost:8100/tools/run \
  -H "Content-Type: application/json" \
  -d '{"tool_id": "emu_data_exfil", "input": {"target": "192.168.1.5", "size_mb": 5}}'

# Phase 6: EDR Evasion Attempt
curl -X POST http://localhost:8100/tools/run \
  -H "Content-Type: application/json" \
  -d '{"tool_id": "emu_edr_evasion", "input": {}}'
```

### Expected Detections:
- **SIEM**: Correlation of multiple attack stages
- **EDR**: Suspicious process tree
- **Network IDS**: C2 beaconing patterns
- **DLP**: Data exfiltration attempt
- **Threat Intel**: Known APT TTPs

---

## 📊 Detection Validation Matrix

| Scenario | SIEM | EDR | IDS/IPS | WAF | DLP | Threat Intel |
|----------|------|-----|---------|-----|-----|--------------|
| Recon Chain | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ |
| Web Attack | ✅ | ❌ | ✅ | ✅ | ❌ | ✅ |
| Credential Compromise | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| Network Analysis | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Malware Analysis | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| APT Simulation | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 🔧 Configuration Requirements

### Enable Offensive Tools
```bash
# In docker-compose.yml, add to tools-api environment:
TOOLS_ENABLE_OFFENSIVE=1
TOOLS_ENABLE_WEB_SCANNER=1
TOOLS_ALLOW_PUBLIC_TARGETS=0  # Keep restricted to private IPs
```

### Prepare Wordlists
```bash
# Create wordlist directory
docker exec bouclier-tools mkdir -p /opt/tools/inputs

# Copy common wordlists
docker cp /usr/share/wordlists/rockyou.txt bouclier-tools:/opt/tools/inputs/
docker cp /usr/share/wordlists/dirb/common.txt bouclier-tools:/opt/tools/inputs/
```

---

## 📈 Success Metrics

1. **Detection Rate**: % of attack stages detected
2. **Time to Detect**: Average time from attack start to alert
3. **False Positive Rate**: % of benign activities flagged
4. **Alert Correlation**: Ability to link related events
5. **Response Time**: Time from detection to containment

---

## 🎯 Best Practices

1. **Always coordinate** with SOC team before running scenarios
2. **Document baselines** before testing
3. **Use isolated environments** when possible
4. **Monitor performance impact** during tests
5. **Validate detections** after each scenario
6. **Update playbooks** based on findings

---

**Last Updated**: 2026-01-10
**Version**: 1.0
**Author**: BOUCLIER Security Team
