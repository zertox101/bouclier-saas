# 🛡️ Blue Team Mastery Program
## Complete Execution-Ready Training for Detection Engineers

---

## 1. Tool Categorization by Blue Team Function

### 🔍 OSINT & External Exposure
- **SpiderFoot**: Automated OSINT aggregation, digital footprint mapping
- **Censys**: Internet-wide asset discovery, certificate transparency
- **AlienVault OTX**: Threat intelligence, IOC correlation
- **theHarvester**: Email/subdomain enumeration (defensive recon)

### 🌐 Network Analysis & Visibility
- **Nmap**: Asset discovery, service enumeration, baseline inventory
- **Wireshark**: Packet analysis, protocol debugging, anomaly detection

### 🔒 Vulnerability Management
- **Nessus**: Enterprise vulnerability scanning, compliance auditing

### 🕸️ Application Security Testing
- **Burp Suite**: Web app security assessment, API testing, request manipulation

### 📊 SIEM & Detection Engineering
- **Splunk**: Log aggregation, correlation rules, threat hunting, dashboards

### ✅ Purple Team Validation (Defensive Use)
- **Metasploit**: Controlled exploit validation (proof-of-detection only)
- **Hydra**: Authentication testing (rate-limit testing, brute-force detection validation)

---

## 2. Skills Checklist & Mastery Indicators

### 🔍 **Nmap** (Network Discovery)

| Level | Competencies | Mastery Indicator |
|-------|-------------|-------------------|
| **Beginner** | • Basic host discovery (`-sn`)<br>• Port scanning (`-p-`, `-sT`)<br>• Service version detection (`-sV`)<br>• Output formats (`-oA`) | Can inventory 50+ hosts, identify all listening services, export results |
| **Intermediate** | • NSE scripting (`--script vuln`)<br>• Timing optimization (`-T4`)<br>• Firewall evasion techniques<br>• Custom port ranges & protocols | Can detect misconfigurations, run safe NSE scripts, optimize scans for large networks |
| **Advanced** | • Custom NSE script creation<br>• Integration with CI/CD pipelines<br>• Differential scanning (baseline vs current)<br>• Asset change detection automation | Automated asset inventory system with alerting on unauthorized services |

---

### 📡 **Wireshark** (Packet Analysis)

| Level | Competencies | Mastery Indicator |
|-------|-------------|-------------------|
| **Beginner** | • Capture filters (`host`, `port`)<br>• Display filters (`tcp.port == 443`)<br>• Follow TCP/HTTP streams<br>• Export objects (files, certs) | Can isolate suspicious traffic, extract artifacts, identify protocols |
| **Intermediate** | • TLS/SSL analysis (decrypt with keys)<br>• Protocol dissectors<br>• Statistics & flow graphs<br>• Anomaly detection (retransmissions, latency) | Can analyze encrypted traffic, identify C2 beaconing patterns, detect exfiltration |
| **Advanced** | • Custom Lua dissectors<br>• Automated PCAP analysis (tshark scripting)<br>• Integration with SIEM<br>• Threat hunting workflows | Automated threat detection pipeline from PCAP to alerts |

---

### 🔒 **Nessus** (Vulnerability Scanning)

| Level | Competencies | Mastery Indicator |
|-------|-------------|-------------------|
| **Beginner** | • Basic network scans<br>• Credentialed vs non-credentialed<br>• Policy templates<br>• Report generation | Can scan 20+ hosts, interpret CVSS scores, export findings |
| **Intermediate** | • Custom scan policies<br>• Compliance auditing (CIS, PCI-DSS)<br>• Plugin families & tuning<br>• Remediation tracking | Can create tailored scans, track vulnerability lifecycle, reduce false positives |
| **Advanced** | • API automation (Nessus REST API)<br>• Integration with ticketing systems<br>• Custom compliance policies<br>• Continuous scanning pipelines | Fully automated vulnerability management program with SLA tracking |

---

### 🕸️ **Burp Suite** (Web App Security)

| Level | Competencies | Mastery Indicator |
|-------|-------------|-------------------|
| **Beginner** | • Proxy setup & interception<br>• Repeater for request manipulation<br>• Scanner (passive/active)<br>• Target scope management | Can identify OWASP Top 10 issues, manipulate requests, document findings |
| **Intermediate** | • Intruder for fuzzing<br>• Decoder/Comparer utilities<br>• Session handling rules<br>• Extension installation (Logger++, Autorize) | Can perform authenticated testing, detect authorization flaws, automate workflows |
| **Advanced** | • Custom extension development (Python/Java)<br>• Macro/session token handling<br>• Collaborator for SSRF/XXE<br>• API testing automation | Can test complex SPAs, detect business logic flaws, integrate with CI/CD |

---

### 📊 **Splunk** (SIEM & Detection)

| Level | Competencies | Mastery Indicator |
|-------|-------------|-------------------|
| **Beginner** | • SPL basics (`search`, `stats`, `table`)<br>• Time range selection<br>• Field extraction<br>• Basic dashboards | Can search logs, create simple visualizations, extract custom fields |
| **Intermediate** | • Advanced SPL (`eval`, `rex`, `transaction`)<br>• Correlation searches<br>• Alerts & scheduled reports<br>• Data models & pivots | Can write detection rules, correlate multi-source events, tune alert thresholds |
| **Advanced** | • Custom apps & add-ons<br>• SOAR integration<br>• Threat hunting frameworks (PEAK)<br>• Performance optimization | Production-ready detection engineering pipeline with documented playbooks |

---

### 🔍 **SpiderFoot** (OSINT Automation)

| Level | Competencies | Mastery Indicator |
|-------|-------------|-------------------|
| **Beginner** | • Target configuration<br>• Module selection<br>• Report interpretation<br>• Data export | Can enumerate subdomains, emails, leaked credentials for a domain |
| **Intermediate** | • Custom module configuration<br>• API integration (Shodan, VirusTotal)<br>• Correlation of findings<br>• Scheduled scans | Can automate external exposure monitoring, correlate OSINT with internal assets |
| **Advanced** | • Custom module development<br>• Integration with ticketing/SIEM<br>• Threat actor profiling<br>• Continuous monitoring pipelines | Automated external attack surface management program |

---

### 🌍 **Censys** (Internet Scanning)

| Level | Competencies | Mastery Indicator |
|-------|-------------|-------------------|
| **Beginner** | • Basic search queries<br>• Certificate transparency logs<br>• Service identification<br>• Export results | Can find all public-facing assets for an organization |
| **Intermediate** | • Advanced query syntax<br>• API automation<br>• Historical data analysis<br>• Anomaly detection | Can track asset changes over time, detect shadow IT, automate reporting |
| **Advanced** | • Custom monitoring workflows<br>• Integration with asset management<br>• Threat intelligence correlation<br>• Compliance validation | Continuous external asset monitoring with automated alerting |

---

### 🧠 **AlienVault OTX** (Threat Intelligence)

| Level | Competencies | Mastery Indicator |
|-------|-------------|-------------------|
| **Beginner** | • IOC lookup (IPs, domains, hashes)<br>• Pulse subscription<br>• Threat actor tracking<br>• Export IOCs | Can validate suspicious indicators, subscribe to relevant threat feeds |
| **Intermediate** | • API integration<br>• Custom pulse creation<br>• IOC correlation with logs<br>• Threat hunting workflows | Can enrich SIEM alerts with threat intel, automate IOC ingestion |
| **Advanced** | • Custom threat intelligence platform<br>• STIX/TAXII integration<br>• Threat actor attribution<br>• Predictive analysis | Fully integrated threat intelligence program with automated enrichment |

---

### 🔎 **theHarvester** (Reconnaissance)

| Level | Competencies | Mastery Indicator |
|-------|-------------|-------------------|
| **Beginner** | • Email enumeration<br>• Subdomain discovery<br>• Data source selection<br>• Output parsing | Can enumerate external exposure for a domain |
| **Intermediate** | • API integration (Shodan, VirusTotal)<br>• Automation scripting<br>• Result correlation<br>• Scheduled reconnaissance | Can automate external recon, correlate with asset inventory |
| **Advanced** | • Custom data source integration<br>• OSINT framework integration<br>• Continuous monitoring<br>• Threat modeling | Automated external attack surface monitoring with risk scoring |

---

### ⚔️ **Metasploit** (Purple Team Validation - DEFENSIVE USE ONLY)

| Level | Competencies | Mastery Indicator |
|-------|-------------|-------------------|
| **Beginner** | • Framework navigation<br>• Auxiliary modules (scanners)<br>• Payload generation (for detection testing)<br>• Safe lab usage | Can generate test payloads, validate AV/EDR detection |
| **Intermediate** | • Exploit module usage (lab only)<br>• Post-exploitation modules (for logging validation)<br>• Custom resource scripts<br>• Detection validation workflows | Can validate detection rules, test logging coverage, document gaps |
| **Advanced** | • Custom module development<br>• Purple team automation<br>• Detection engineering feedback loops<br>• MITRE ATT&CK mapping | Automated purple team validation pipeline with detection coverage metrics |

---

### 🔐 **Hydra** (Authentication Testing - DEFENSIVE USE ONLY)

| Level | Competencies | Mastery Indicator |
|-------|-------------|-------------------|
| **Beginner** | • Protocol support (SSH, HTTP, FTP)<br>• Wordlist usage<br>• Rate limiting awareness<br>• Lab-only testing | Can validate account lockout policies, test authentication logging |
| **Intermediate** | • Custom wordlist generation<br>• Multi-protocol testing<br>• Detection validation<br>• Reporting | Can validate brute-force detection rules, test SIEM alerting |
| **Advanced** | • Integration with detection pipelines<br>• Automated validation workflows<br>• Custom module development<br>• Purple team exercises | Automated authentication security validation with detection metrics |

---

## 3. 6-Week Practical Roadmap

### 📅 **Week 1: Asset Inventory & Network Baseline**
**Objective**: Build a complete asset inventory and establish network traffic baselines

**Setup**:
- Local lab network (3-5 VMs: Linux, Windows, web server)
- Docker containers (nginx, vulnerable apps)
- Wireshark on monitoring host
- Nmap installed

**Tasks**:
1. **Nmap Asset Discovery**
   - Perform host discovery scan (`nmap -sn 192.168.1.0/24`)
   - Full port scan on discovered hosts (`nmap -p- -sV -sC -oA baseline <targets>`)
   - Service enumeration and OS detection
   - Export results in XML/JSON format

2. **Wireshark Traffic Baseline**
   - Capture 1 hour of normal traffic
   - Identify all protocols in use
   - Document normal traffic patterns (DNS, HTTP, SSH)
   - Create display filters for key services
   - Export statistics (Protocol Hierarchy, Conversations)

3. **Documentation**
   - Create asset inventory spreadsheet (IP, hostname, OS, services, owner)
   - Document baseline traffic patterns
   - Identify unauthorized services/ports

**Deliverables**:
- Asset inventory CSV (minimum 10 assets)
- Nmap scan results (XML + human-readable)
- Wireshark baseline PCAP + statistics report
- Network diagram (logical topology)

**Success Rubric**:
- ✅ 100% asset coverage in scope
- ✅ All listening services documented
- ✅ Baseline traffic patterns identified
- ✅ At least 3 unauthorized services detected
- ✅ Repeatable scanning methodology documented

---

### 📅 **Week 2: Vulnerability Management Cycle**
**Objective**: Execute a complete vulnerability management lifecycle

**Setup**:
- Nessus Essentials (free for 16 IPs)
- Vulnerable VMs (Metasploitable, DVWA, old OS versions)
- Spreadsheet for tracking

**Tasks**:
1. **Initial Vulnerability Scan**
   - Configure credentialed scan policy
   - Scan all assets from Week 1
   - Export results (PDF executive + CSV technical)
   - Categorize findings by severity (Critical/High/Medium/Low)

2. **Remediation Planning**
   - Prioritize top 10 vulnerabilities (CVSS + exploitability)
   - Create remediation tickets with owners
   - Document compensating controls for non-patchable items
   - Set SLA targets (Critical: 7 days, High: 30 days)

3. **Remediation & Re-scan**
   - Patch/fix at least 5 vulnerabilities
   - Re-scan to validate fixes
   - Document false positives
   - Update asset inventory with patch levels

**Deliverables**:
- Initial vulnerability report (executive + technical)
- Remediation tracking spreadsheet with SLAs
- Re-scan validation report
- False positive documentation
- Lessons learned document

**Success Rubric**:
- ✅ All assets scanned with credentials
- ✅ At least 20 unique vulnerabilities identified
- ✅ 5+ vulnerabilities remediated and validated
- ✅ Executive report suitable for management
- ✅ Repeatable process documented

---

### 📅 **Week 3: Web Application Security Triage**
**Objective**: Perform comprehensive web app security assessment

**Setup**:
- Burp Suite Community Edition
- OWASP Juice Shop (Docker: `docker run -p 3000:3000 bkimminich/juice-shop`)
- DVWA (Docker: `docker run -p 80:80 vulnerables/web-dvwa`)
- Browser with FoxyProxy

**Tasks**:
1. **Reconnaissance & Mapping**
   - Configure Burp proxy and browser
   - Spider/crawl application
   - Identify all endpoints, parameters, cookies
   - Map authentication/authorization flows
   - Export site map

2. **Vulnerability Testing (OWASP Top 10)**
   - Test for SQLi (manual + scanner)
   - Test for XSS (reflected, stored, DOM)
   - Test for broken authentication
   - Test for sensitive data exposure
   - Test for broken access control (Autorize extension)
   - Test for security misconfigurations
   - Document all findings with evidence

3. **Reporting & Remediation**
   - Create finding reports (request/response, impact, fix)
   - Prioritize by risk (CVSS + business impact)
   - Provide developer-friendly remediation guidance
   - Create proof-of-concept (non-destructive)

**Deliverables**:
- Application security assessment report
- Minimum 10 documented findings with evidence
- Burp scan results (HTML export)
- Remediation guidance document
- Request/response evidence for each finding

**Success Rubric**:
- ✅ Complete application mapping
- ✅ At least 3 OWASP Top 10 categories covered
- ✅ Clear evidence (screenshots, requests/responses)
- ✅ Developer-actionable remediation steps
- ✅ Risk-based prioritization

---

### 📅 **Week 4: Detection Engineering Mini-SIEM**
**Objective**: Build a functional SIEM with detections and dashboards

**Setup**:
- Splunk Free (Docker: `docker run -p 8000:8000 -e SPLUNK_START_ARGS='--accept-license' -e SPLUNK_PASSWORD='<password>' splunk/splunk:latest`)
- Log sources: nginx access/error logs, SSH auth logs, Windows Event Logs (if available)
- Sample attack data (failed logins, web attacks, port scans)

**Tasks**:
1. **Data Ingestion**
   - Configure data inputs (monitor files, HTTP Event Collector)
   - Ingest nginx logs, SSH logs, application logs
   - Verify data parsing and field extraction
   - Create source types and indexes
   - Set up log rotation

2. **Detection Engineering**
   - Create 5 detection rules:
     - Brute force detection (failed logins)
     - Port scan detection (Nmap signatures)
     - Web attack detection (SQLi/XSS patterns)
     - Anomalous user agent detection
     - Suspicious file download detection
   - Configure alerting (email/webhook)
   - Tune thresholds to reduce false positives
   - Document detection logic and MITRE ATT&CK mapping

3. **Dashboards & Reporting**
   - Create security operations dashboard
   - Build visualizations (timecharts, top talkers, geo maps)
   - Create scheduled reports (daily/weekly)
   - Implement drill-down capabilities

**Deliverables**:
- Splunk instance with 3+ data sources
- 5 working detection rules with documentation
- Security operations dashboard
- Alert tuning documentation
- Detection validation report (true/false positive rates)

**Success Rubric**:
- ✅ All log sources ingesting correctly
- ✅ 5 detections with <10% false positive rate
- ✅ Dashboard provides actionable insights
- ✅ Alerts trigger on simulated attacks
- ✅ MITRE ATT&CK mapping documented

---

### 📅 **Week 5: External Exposure Assessment**
**Objective**: Identify and report on external attack surface

**Setup**:
- SpiderFoot (Docker: `docker run -p 5001:5001 spiderfoot/spiderfoot`)
- Censys account (free tier)
- AlienVault OTX account (free)
- theHarvester installed
- Target: Your own domain or authorized test domain

**Tasks**:
1. **OSINT Reconnaissance**
   - Run SpiderFoot scan on target domain
   - Use theHarvester for email/subdomain enumeration
   - Search Censys for public-facing assets
   - Query AlienVault OTX for threat intelligence
   - Correlate findings across tools

2. **Asset Correlation & Risk Assessment**
   - Map discovered assets to known inventory
   - Identify shadow IT (unauthorized assets)
   - Check for leaked credentials (HaveIBeenPwned API)
   - Assess certificate transparency logs
   - Identify misconfigured services (open databases, admin panels)

3. **Reporting & Remediation**
   - Create external exposure report
   - Prioritize findings by risk
   - Provide remediation recommendations
   - Create monitoring plan for ongoing visibility

**Deliverables**:
- External exposure assessment report
- Asset inventory comparison (internal vs external)
- Shadow IT findings
- Leaked credential report
- Continuous monitoring recommendations

**Success Rubric**:
- ✅ All public-facing assets identified
- ✅ At least 3 shadow IT assets discovered
- ✅ Leaked credentials checked for all employees
- ✅ Risk-prioritized findings
- ✅ Actionable remediation plan

---

### 📅 **Week 6: Purple Team Validation (SAFE MODE)**
**Objective**: Validate detection coverage using controlled adversary emulation

**Setup**:
- Isolated lab network (NO INTERNET ACCESS)
- Metasploit Framework
- Hydra
- Splunk from Week 4
- Vulnerable targets from previous weeks
- **STRICT SCOPE DOCUMENTATION**

**Tasks**:
1. **Pre-Validation Planning**
   - Document authorized scope (IPs, timeframe, techniques)
   - Create test plan (MITRE ATT&CK techniques to validate)
   - Establish success criteria (expected alerts)
   - Set up logging (ensure all sources are captured)
   - Create rollback plan

2. **Controlled Testing (DEFENSIVE VALIDATION ONLY)**
   - **Reconnaissance**: Use Nmap/theHarvester to validate network detection
   - **Brute Force**: Use Hydra (5 attempts max) to validate auth monitoring
   - **Exploitation**: Use Metasploit auxiliary modules (scanners only, NO exploits)
   - **Payload Detection**: Generate test payloads, validate AV/EDR detection
   - **Logging Validation**: Verify all actions are logged in Splunk

3. **Detection Gap Analysis**
   - Compare expected alerts vs actual alerts
   - Calculate MTTD (Mean Time To Detect)
   - Identify detection gaps
   - Document false negatives
   - Create improvement plan

**Deliverables**:
- Purple team test plan with authorized scope
- Detection validation report (expected vs observed)
- MTTD metrics per technique
- Detection gap analysis
- Remediation plan for gaps
- Lessons learned document

**Success Rubric**:
- ✅ All testing within authorized scope
- ✅ 100% of actions logged
- ✅ At least 70% detection rate
- ✅ MTTD < 5 minutes for critical techniques
- ✅ Documented gaps with remediation plan
- ✅ NO destructive actions performed

---

## 4. Lab Blueprint (Self-Hosted, Isolated)

### 🏗️ **Architecture Overview**
```
┌─────────────────────────────────────────────────────────────┐
│                    HOST MACHINE (NAT ONLY)                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Docker Network (Isolated)                │  │
│  │                                                       │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐           │  │
│  │  │  Splunk  │  │  Juice   │  │  DVWA    │           │  │
│  │  │  SIEM    │  │  Shop    │  │  WebApp  │           │  │
│  │  └──────────┘  └──────────┘  └──────────┘           │  │
│  │                                                       │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐           │  │
│  │  │ Spider   │  │  Nginx   │  │ Log Gen  │           │  │
│  │  │  Foot    │  │  Proxy   │  │          │           │  │
│  │  └──────────┘  └──────────┘  └──────────┘           │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │         VirtualBox VMs (Internal Network)             │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐           │  │
│  │  │ Kali     │  │ Windows  │  │ Ubuntu   │           │  │
│  │  │ Linux    │  │ 10       │  │ Server   │           │  │
│  │  └──────────┘  └──────────┘  └──────────┘           │  │
│  │                                                       │  │
│  │  ┌──────────┐                                        │  │
│  │  │ Metaspl  │                                        │  │
│  │  │ oitable  │                                        │  │
│  │  └──────────┘                                        │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 🐳 **Docker Compose Configuration**

```yaml
version: '3.8'

services:
  splunk:
    image: splunk/splunk:latest
    container_name: blue-team-splunk
    environment:
      - SPLUNK_START_ARGS=--accept-license
      - SPLUNK_PASSWORD=BlueTeam2024!
    ports:
      - "8000:8000"
      - "8088:8088"
    volumes:
      - splunk-data:/opt/splunk/var
    networks:
      - blue-team-net

  juice-shop:
    image: bkimminich/juice-shop
    container_name: blue-team-juiceshop
    ports:
      - "3000:3000"
    networks:
      - blue-team-net

  dvwa:
    image: vulnerables/web-dvwa
    container_name: blue-team-dvwa
    ports:
      - "8080:80"
    networks:
      - blue-team-net

  spiderfoot:
    image: spiderfoot/spiderfoot
    container_name: blue-team-spiderfoot
    ports:
      - "5001:5001"
    networks:
      - blue-team-net

  nginx:
    image: nginx:alpine
    container_name: blue-team-nginx
    ports:
      - "8888:80"
    volumes:
      - ./nginx-logs:/var/log/nginx
    networks:
      - blue-team-net

  log-generator:
    image: mingrammer/flog
    container_name: blue-team-loggenerator
    command: -f apache_combined -l -d 1 -s 1
    volumes:
      - ./generated-logs:/var/log
    networks:
      - blue-team-net

volumes:
  splunk-data:

networks:
  blue-team-net:
    driver: bridge
    internal: true  # No external internet access
```

### 💻 **Virtual Machine Setup**

**Required VMs** (VirtualBox/VMware):
1. **Kali Linux** (Attacker/Tester)
   - Pre-installed tools: Nmap, Metasploit, Hydra, theHarvester, Burp Suite
   - Network: Internal network only
   - Purpose: Testing platform

2. **Metasploitable 2/3** (Vulnerable Target)
   - Network: Internal network only
   - Purpose: Vulnerability scanning practice

3. **Windows 10** (Endpoint)
   - Sysmon installed for logging
   - Network: Internal network only
   - Purpose: Windows-based testing

4. **Ubuntu Server** (Web/App Server)
   - SSH, Apache/Nginx installed
   - Network: Internal network only
   - Purpose: Linux server testing

### 📡 **Telemetry Sources**

**Log Collection Points**:
- Nginx access/error logs → Splunk
- SSH authentication logs (`/var/log/auth.log`) → Splunk
- Windows Event Logs (Security, System, Sysmon) → Splunk
- Application logs (Juice Shop, DVWA) → Splunk
- Docker container logs → Splunk
- Network flow data (optional: Zeek/Suricata)

**Splunk Forwarder Configuration**:
```bash
# Install Universal Forwarder on each VM
# Configure inputs.conf
[monitor:///var/log/auth.log]
sourcetype = linux_secure
index = main

[monitor:///var/log/nginx/access.log]
sourcetype = nginx_access
index = web

[monitor:///var/log/nginx/error.log]
sourcetype = nginx_error
index = web
```

### 🔒 **Strict Isolation Guidelines**

**Network Isolation**:
- ✅ Use VirtualBox "Internal Network" or VMware "Host-Only"
- ✅ Docker networks set to `internal: true`
- ✅ Disable all internet access for lab VMs
- ✅ Use NAT only for downloading tools (then disable)

**Firewall Rules** (Host Machine):
```powershell
# Block all outbound from lab network
New-NetFirewallRule -DisplayName "Block Lab Outbound" -Direction Outbound -LocalAddress 192.168.100.0/24 -Action Block
```

**Safety Checklist**:
- [ ] All VMs on isolated network
- [ ] No internet access from lab
- [ ] Snapshots taken before testing
- [ ] Scope documentation completed
- [ ] Rollback plan documented

---

## 5. Reporting Templates

### 📄 **Template 1: Vulnerability Assessment Report**

```markdown
# Vulnerability Assessment Report

**Organization**: [Company Name]
**Assessment Date**: [Date]
**Assessor**: [Your Name]
**Scope**: [IP Ranges/Hostnames]

---

## Executive Summary

### Overview
This vulnerability assessment identified **[X]** vulnerabilities across **[Y]** assets within the authorized scope. Of these, **[Z]** are rated Critical or High severity and require immediate remediation.

### Key Findings
- **Critical**: [X] vulnerabilities
- **High**: [Y] vulnerabilities
- **Medium**: [Z] vulnerabilities
- **Low**: [W] vulnerabilities

### Risk Summary
The most significant risks identified include:
1. [Critical Finding 1] - Affects [X] systems
2. [Critical Finding 2] - Affects [Y] systems
3. [High Finding 1] - Affects [Z] systems

### Recommendations
1. Prioritize patching of all Critical vulnerabilities within 7 days
2. Implement compensating controls for systems that cannot be patched
3. Establish continuous vulnerability scanning program
4. Conduct quarterly re-assessments

---

## Technical Findings

### Finding 1: [Vulnerability Name]
**Severity**: Critical (CVSS 9.8)
**Affected Assets**: [IP/Hostname list]
**CVE**: CVE-2024-XXXXX

**Description**:
[Technical description of vulnerability]

**Impact**:
An attacker could exploit this vulnerability to [impact description].

**Evidence**:
```
[Nessus plugin output or proof]
```

**Remediation**:
1. Apply vendor patch [version]
2. Restart affected services
3. Verify fix with re-scan

**References**:
- [Vendor advisory URL]
- [CVE details URL]

---

### Finding 2: [Next Vulnerability]
[Repeat structure]

---

## Remediation Tracking

| Finding ID | Severity | Affected Assets | Owner | SLA | Status |
|------------|----------|-----------------|-------|-----|--------|
| VULN-001 | Critical | 10.0.1.5 | IT Team | 7 days | Open |
| VULN-002 | High | 10.0.1.10-15 | DevOps | 30 days | In Progress |

---

## Appendix
- Full Nessus scan results (CSV)
- Asset inventory
- Scan configuration details
```

---

### 📄 **Template 2: Web Application Finding Report**

```markdown
# Web Application Security Finding

**Finding ID**: WEB-001
**Application**: [App Name]
**URL**: [Base URL]
**Severity**: High
**OWASP Category**: A03:2021 – Injection
**CWE**: CWE-89 (SQL Injection)

---

## Summary
The application is vulnerable to SQL injection in the login form, allowing an attacker to bypass authentication and access unauthorized data.

---

## Technical Details

### Vulnerable Endpoint
- **URL**: `https://example.com/login`
- **Parameter**: `username`
- **Method**: POST

### Proof of Concept

**Request**:
```http
POST /login HTTP/1.1
Host: example.com
Content-Type: application/x-www-form-urlencoded

username=admin' OR '1'='1&password=anything
```

**Response**:
```http
HTTP/1.1 302 Found
Location: /dashboard
Set-Cookie: session=authenticated_session_token
```

**Evidence**:
[Screenshot of Burp Suite request/response]

---

## Impact

**Confidentiality**: High - Attacker can access all user data
**Integrity**: High - Attacker can modify database records
**Availability**: Medium - Attacker could delete data

**Business Impact**:
- Unauthorized access to customer data
- Potential data breach notification requirements
- Regulatory compliance violations (GDPR, PCI-DSS)

---

## Reproduction Steps

1. Navigate to login page
2. Intercept request with Burp Suite
3. Modify username parameter to: `admin' OR '1'='1`
4. Forward request
5. Observe successful authentication bypass

---

## Remediation

### Immediate Actions
1. Deploy WAF rule to block SQL injection patterns
2. Disable affected endpoint until patch is deployed
3. Review logs for exploitation attempts

### Permanent Fix
```python
# VULNERABLE CODE
query = f"SELECT * FROM users WHERE username='{username}' AND password='{password}'"

# SECURE CODE (Parameterized Query)
query = "SELECT * FROM users WHERE username=? AND password=?"
cursor.execute(query, (username, password))
```

### Validation
1. Re-test with original payload
2. Perform comprehensive SQLi testing (sqlmap)
3. Code review of all database queries
4. Implement automated security testing in CI/CD

---

## References
- OWASP SQL Injection: https://owasp.org/www-community/attacks/SQL_Injection
- CWE-89: https://cwe.mitre.org/data/definitions/89.html
- OWASP Testing Guide: https://owasp.org/www-project-web-security-testing-guide/

---

**Discovered By**: [Your Name]
**Date**: [Date]
**Retest Date**: [Date + 30 days]
```

---

### 📄 **Template 3: Detection Validation Report**

```markdown
# Detection Validation Report

**Exercise Name**: Purple Team Validation - Week 6
**Date**: [Date]
**Scope**: [IP Ranges]
**Techniques Tested**: [MITRE ATT&CK IDs]

---

## Executive Summary

This purple team exercise validated detection coverage for **[X]** MITRE ATT&CK techniques. The overall detection rate was **[Y]%**, with a Mean Time To Detect (MTTD) of **[Z] minutes**.

### Key Metrics
- **Techniques Tested**: [X]
- **Detections Triggered**: [Y]
- **Detection Rate**: [Y/X]%
- **False Positives**: [Z]
- **Mean Time To Detect**: [W] minutes

### Critical Gaps
1. [Technique] - No detection
2. [Technique] - Detection delayed >30 minutes
3. [Technique] - High false positive rate

---

## Test Matrix

| Technique | MITRE ID | Expected Alert | Observed Alert | MTTD | Status |
|-----------|----------|----------------|----------------|------|--------|
| Network Scanning | T1046 | Port Scan Detected | ✅ Triggered | 2 min | PASS |
| Brute Force | T1110.001 | Failed Login Alert | ✅ Triggered | 1 min | PASS |
| Service Enumeration | T1046 | Suspicious Scan | ❌ Not Triggered | N/A | FAIL |
| Credential Dumping | T1003 | Mimikatz Detection | ✅ Triggered | 30 sec | PASS |

---

## Detailed Test Results

### Test 1: Network Scanning (T1046)
**Objective**: Validate detection of network reconnaissance

**Execution**:
```bash
nmap -sS -p- 192.168.100.0/24
```

**Expected Detection**: Splunk alert "Port Scan Detected"

**Observed**:
- ✅ Alert triggered at 14:32:15
- ✅ Correct source IP identified
- ✅ Scan pattern detected (>100 ports/minute)

**MTTD**: 2 minutes

**Evidence**:
```spl
index=network sourcetype=firewall_logs
| stats dc(dest_port) as port_count by src_ip
| where port_count > 50
```

**Status**: ✅ PASS

---

### Test 2: Brute Force Authentication (T1110.001)
**Objective**: Validate detection of credential brute forcing

**Execution**:
```bash
hydra -l admin -P /usr/share/wordlists/rockyou.txt ssh://192.168.100.10 -t 4 -V -f
```

**Expected Detection**: Splunk alert "Brute Force Attempt"

**Observed**:
- ✅ Alert triggered at 14:45:03
- ✅ Correct username identified
- ⚠️ Alert threshold too sensitive (triggered after 3 attempts, expected 5)

**MTTD**: 1 minute

**Evidence**:
```spl
index=linux sourcetype=linux_secure "Failed password"
| stats count by user, src_ip
| where count > 3
```

**Status**: ✅ PASS (with tuning recommendation)

---

### Test 3: Service Enumeration (T1046)
**Objective**: Validate detection of service version scanning

**Execution**:
```bash
nmap -sV 192.168.100.10
```

**Expected Detection**: Splunk alert "Suspicious Service Scan"

**Observed**:
- ❌ No alert triggered
- ❌ Traffic logged but no correlation rule

**MTTD**: N/A

**Root Cause**: Missing detection rule for service version scanning patterns

**Status**: ❌ FAIL

---

## Detection Gaps & Remediation

### Gap 1: Service Version Scanning
**Severity**: Medium
**MITRE Technique**: T1046

**Issue**: No detection for Nmap service version scanning

**Remediation**:
```spl
index=network sourcetype=firewall_logs
| rex field=payload "(?<nmap_probe>GET / HTTP/1.0|NULL|GenericLines)"
| where isnotnull(nmap_probe)
| stats count by src_ip, dest_ip
| where count > 5
```

**Owner**: Detection Engineering Team
**Due Date**: [Date + 7 days]

---

### Gap 2: Alert Tuning - Brute Force
**Severity**: Low
**MITRE Technique**: T1110.001

**Issue**: Alert threshold too sensitive (3 attempts vs 5)

**Remediation**: Update Splunk alert threshold from 3 to 5 failed attempts

**Owner**: SOC Team
**Due Date**: [Date + 3 days]

---

## Recommendations

1. **Immediate Actions**:
   - Deploy detection rule for service version scanning
   - Tune brute force alert threshold
   - Add logging for [missing data source]

2. **Short-term (30 days)**:
   - Implement detection for [X] additional MITRE techniques
   - Reduce MTTD to <2 minutes for all critical techniques
   - Automate purple team testing (monthly)

3. **Long-term (90 days)**:
   - Achieve 90% detection coverage for MITRE ATT&CK
   - Implement SOAR playbooks for automated response
   - Establish continuous validation program

---

## Appendix
- Full test plan
- Raw Splunk queries
- PCAP files
- Screenshots of alerts
```

---

### 📄 **Template 4: External Exposure Report**

```markdown
# External Exposure Assessment Report

**Organization**: [Company Name]
**Assessment Date**: [Date]
**Assessor**: [Your Name]
**Scope**: [Domains/IP Ranges]

---

## Executive Summary

This external exposure assessment identified **[X]** public-facing assets, including **[Y]** previously unknown (shadow IT) systems. **[Z]** high-risk exposures require immediate remediation.

### Key Findings
- **Total Public Assets**: [X]
- **Shadow IT Assets**: [Y]
- **Leaked Credentials**: [Z]
- **Misconfigured Services**: [W]
- **Expired Certificates**: [V]

### Critical Exposures
1. [Exposed database on port 27017]
2. [Admin panel with default credentials]
3. [Leaked API keys in GitHub]

---

## Asset Inventory

### Discovered Subdomains
| Subdomain | IP Address | Services | Risk | Owner |
|-----------|------------|----------|------|-------|
| www.example.com | 1.2.3.4 | HTTP/HTTPS | Low | IT |
| admin.example.com | 1.2.3.5 | HTTP (no auth) | Critical | Unknown |
| dev.example.com | 1.2.3.6 | SSH, MySQL | High | DevOps |

### Discovered IP Ranges
| IP Range | ASN | Services | Risk |
|----------|-----|----------|------|
| 1.2.3.0/24 | AS12345 | Web, SSH | Medium |

---

## OSINT Findings

### Email Addresses Discovered
- admin@example.com
- support@example.com
- [50+ additional emails]

**Source**: theHarvester, SpiderFoot

### Leaked Credentials
| Email | Breach | Date | Password Hash |
|-------|--------|------|---------------|
| admin@example.com | LinkedIn | 2021 | [SHA1 hash] |
| user@example.com | Adobe | 2019 | [MD5 hash] |

**Source**: HaveIBeenPwned API, AlienVault OTX

### Social Media Exposure
- LinkedIn: [X] employees with job titles revealing tech stack
- GitHub: [Y] repositories with potential secrets
- Pastebin: [Z] mentions of company in dumps

---

## High-Risk Exposures

### Finding 1: Exposed MongoDB Database
**Severity**: Critical
**Asset**: db.example.com:27017
**Description**: MongoDB instance accessible without authentication

**Evidence**:
```bash
$ nmap -p 27017 db.example.com
PORT      STATE SERVICE
27017/tcp open  mongodb

$ mongo db.example.com:27017
> show dbs
admin   0.000GB
users   2.345GB
```

**Impact**: Complete database compromise, customer data exposure

**Remediation**:
1. Immediately restrict access to trusted IPs only
2. Enable authentication
3. Review logs for unauthorized access
4. Notify security team

---

### Finding 2: Admin Panel with Default Credentials
**Severity**: Critical
**Asset**: admin.example.com
**Description**: Admin panel accessible with default credentials (admin/admin)

**Evidence**: [Screenshot]

**Impact**: Full administrative access to application

**Remediation**:
1. Change default credentials immediately
2. Implement MFA
3. Restrict access by IP
4. Review audit logs

---

## Certificate Transparency Analysis

### Expired Certificates
| Domain | Expiry Date | Issuer | Risk |
|--------|-------------|--------|------|
| old.example.com | 2023-01-15 | Let's Encrypt | Medium |

### Wildcard Certificates
| Certificate | Domains Covered | Risk |
|-------------|-----------------|------|
| *.example.com | All subdomains | High (if compromised) |

---

## Threat Intelligence Correlation

### AlienVault OTX Findings
- **[X]** company IPs found in threat feeds
- **[Y]** domains associated with malware campaigns
- **[Z]** indicators of compromise

### Shodan/Censys Findings
- **[X]** exposed services
- **[Y]** vulnerable software versions
- **[Z]** misconfigured cloud storage

---

## Recommendations

### Immediate Actions (24-48 hours)
1. Secure exposed database (Finding 1)
2. Change default credentials (Finding 2)
3. Revoke leaked API keys
4. Take down shadow IT assets or secure them

### Short-term (30 days)
1. Implement external attack surface monitoring
2. Establish asset ownership and inventory
3. Deploy certificate monitoring
4. Conduct employee security awareness training

### Long-term (90 days)
1. Implement continuous OSINT monitoring
2. Establish shadow IT discovery process
3. Deploy external vulnerability scanning
4. Implement threat intelligence program

---

## Continuous Monitoring Plan

### Automated Monitoring
- **Certificate Transparency**: Monitor for new certificates
- **Subdomain Discovery**: Weekly SpiderFoot scans
- **Leaked Credentials**: Daily HaveIBeenPwned checks
- **Threat Intelligence**: AlienVault OTX pulse subscriptions

### Alerting
- New subdomain discovered
- Certificate expiring in <30 days
- Leaked credentials detected
- New threat intelligence indicator

---

## Appendix
- Full SpiderFoot report
- Censys query results
- theHarvester output
- Certificate transparency logs
```

---

## 6. Do/Don't Safety Section

### ✅ **DO: Best Practices**

#### Authorization & Scope
- ✅ **DO** obtain written authorization before any testing
- ✅ **DO** clearly define scope (IP ranges, domains, timeframe)
- ✅ **DO** document all testing activities with timestamps
- ✅ **DO** use isolated lab environments for practice
- ✅ **DO** verify you're testing the correct target before starting
- ✅ **DO** maintain a "get out of jail free" letter (authorization document)

#### Safe Testing Practices
- ✅ **DO** implement rate limiting (max 5 requests/second)
- ✅ **DO** use non-destructive testing methods
- ✅ **DO** take snapshots/backups before testing
- ✅ **DO** test during approved maintenance windows
- ✅ **DO** have a rollback plan for every test
- ✅ **DO** monitor system health during testing
- ✅ **DO** stop immediately if unexpected behavior occurs

#### Documentation & Communication
- ✅ **DO** document all findings with evidence
- ✅ **DO** communicate with stakeholders before/during/after testing
- ✅ **DO** provide remediation guidance with findings
- ✅ **DO** follow responsible disclosure practices
- ✅ **DO** encrypt sensitive reports
- ✅ **DO** maintain chain of custody for evidence

#### Tool Usage
- ✅ **DO** use tools in "safe mode" or passive mode when possible
- ✅ **DO** understand what each tool does before running it
- ✅ **DO** review tool output before taking action
- ✅ **DO** keep tools updated to avoid false positives
- ✅ **DO** validate findings manually before reporting

---

### ❌ **DON'T: Prohibited Actions**

#### Unauthorized Activity
- ❌ **DON'T** test systems without explicit written authorization
- ❌ **DON'T** exceed the defined scope (even if you find something interesting)
- ❌ **DON'T** test production systems without approval
- ❌ **DON'T** assume verbal permission is sufficient
- ❌ **DON'T** test third-party systems (cloud providers, vendors) without their consent

#### Destructive Actions
- ❌ **DON'T** use exploits that could crash systems
- ❌ **DON'T** perform denial-of-service attacks (even in testing)
- ❌ **DON'T** delete or modify data (unless explicitly authorized)
- ❌ **DON'T** use destructive payloads (ransomware, wipers)
- ❌ **DON'T** perform lateral movement in production environments
- ❌ **DON'T** escalate privileges beyond test accounts

#### Credential & Data Handling
- ❌ **DON'T** steal or exfiltrate real credentials
- ❌ **DON'T** use discovered credentials on other systems
- ❌ **DON'T** share credentials outside the authorized team
- ❌ **DON'T** store credentials in plaintext
- ❌ **DON'T** access customer/user data unnecessarily
- ❌ **DON'T** retain sensitive data after testing

#### Tool Misuse
- ❌ **DON'T** run tools you don't understand
- ❌ **DON'T** use maximum speed/threads (causes DoS)
- ❌ **DON'T** use automated exploitation frameworks blindly
- ❌ **DON'T** chain exploits without approval
- ❌ **DON'T** use weaponized payloads
- ❌ **DON'T** bypass security controls without authorization

---

### 📋 **Authorization Documentation Template**

```markdown
# Security Testing Authorization

**Project Name**: [Project Name]
**Tester**: [Your Name]
**Authorizing Party**: [Manager/CISO Name]
**Date**: [Date]

## Scope
**In-Scope Assets**:
- IP Ranges: [e.g., 192.168.1.0/24]
- Domains: [e.g., test.example.com]
- Applications: [e.g., Internal Web App]

**Out-of-Scope Assets**:
- Production databases
- Customer-facing systems
- Third-party services

## Authorized Activities
- [x] Network scanning (Nmap)
- [x] Vulnerability scanning (Nessus)
- [x] Web application testing (Burp Suite)
- [ ] Exploitation (Metasploit) - LAB ONLY
- [ ] Password testing (Hydra) - LAB ONLY

## Constraints
- Testing window: [Date/Time range]
- Rate limit: Max 5 requests/second
- No destructive actions
- Stop immediately if systems become unstable

## Emergency Contacts
- Primary: [Name, Phone, Email]
- Secondary: [Name, Phone, Email]

## Signatures
**Tester**: _________________ Date: _______
**Authorizer**: _____________ Date: _______
```

---

### 🔒 **Rate Limiting Guidelines**

#### Nmap
```bash
# GOOD: Polite scan with timing
nmap -T2 --max-rate 100 -p- target.com

# BAD: Aggressive scan (can cause DoS)
nmap -T5 --min-rate 10000 -p- target.com
```

#### Burp Suite
```
# GOOD: Throttle requests
Intruder → Resource Pool → Maximum concurrent requests: 1
Delay between requests: 1000ms

# BAD: Default unlimited threads
```

#### Hydra
```bash
# GOOD: Limited attempts with delays
hydra -l admin -P wordlist.txt -t 2 -w 3 ssh://target

# BAD: Aggressive brute force
hydra -l admin -P wordlist.txt -t 64 ssh://target
```

#### Nessus
```
# GOOD: Scan policy with rate limiting
Max simultaneous checks: 5
Delay between checks: 1 second

# BAD: Unlimited parallel checks
```

---

### 🚨 **Incident Response Plan**

**If something goes wrong during testing**:

1. **STOP IMMEDIATELY**
   - Terminate all running scans/tools
   - Document exactly what you were doing

2. **ASSESS IMPACT**
   - Is the system down?
   - Is data affected?
   - Are users impacted?

3. **NOTIFY STAKEHOLDERS**
   - Contact emergency contacts immediately
   - Provide clear, factual information
   - Don't hide mistakes

4. **DOCUMENT EVERYTHING**
   - Exact commands run
   - Timestamps
   - System state before/after
   - Error messages

5. **ASSIST WITH RECOVERY**
   - Provide technical details to ops team
   - Help with rollback if needed
   - Participate in post-incident review

6. **LESSONS LEARNED**
   - Document what went wrong
   - Update procedures to prevent recurrence
   - Share knowledge with team

---

### 📚 **Legal & Ethical Considerations**

#### Laws to Be Aware Of
- **Computer Fraud and Abuse Act (CFAA)** - US
- **Computer Misuse Act** - UK
- **GDPR** - EU (data protection)
- **Local cybercrime laws** - Varies by country

#### Ethical Principles
1. **Do No Harm**: Minimize risk to systems and data
2. **Transparency**: Be honest about capabilities and limitations
3. **Confidentiality**: Protect sensitive information discovered
4. **Professionalism**: Maintain high standards of conduct
5. **Continuous Learning**: Stay updated on best practices

#### Professional Certifications (Optional)
- **GIAC GCIA** (Intrusion Analyst)
- **GIAC GCIH** (Incident Handler)
- **OSCP** (Offensive Security - for purple team)
- **CEH** (Certified Ethical Hacker)
- **CISSP** (Security Professional)

---

## 🎯 **Success Metrics & Career Progression**

### Program Completion Criteria
- ✅ All 6 weekly projects completed
- ✅ Lab environment fully functional
- ✅ All tool competencies at "Intermediate" level minimum
- ✅ 5+ professional reports written
- ✅ Detection engineering pipeline operational
- ✅ Purple team validation completed safely

### Next Steps After Completion
1. **Build Portfolio**: Publish sanitized reports on GitHub/blog
2. **Contribute to Community**: Share tools/scripts/detections
3. **Pursue Certifications**: GCIA, GCIH, or equivalent
4. **Specialize**: Choose focus area (DFIR, Threat Hunting, Detection Engineering)
5. **Mentor Others**: Help junior analysts learn

### Career Paths
- **SOC Analyst** → **Senior SOC Analyst** → **SOC Lead**
- **Detection Engineer** → **Senior Detection Engineer** → **Detection Architect**
- **Threat Hunter** → **Senior Threat Hunter** → **Threat Hunting Lead**
- **Incident Responder** → **Senior IR** → **DFIR Manager**
- **Purple Team Engineer** → **Senior Purple Team** → **Red/Purple Team Lead**

---

## 📖 **Additional Resources**

### Books
- "Blue Team Handbook" - Don Murdoch
- "Applied Network Security Monitoring" - Chris Sanders
- "The Practice of Network Security Monitoring" - Richard Bejtlich
- "Crafting the InfoSec Playbook" - Jeff Bollinger

### Online Resources
- **MITRE ATT&CK**: attack.mitre.org
- **Splunk Security Essentials**: splunkbase.splunk.com
- **SANS Reading Room**: sans.org/reading-room
- **Awesome Detection Engineering**: github.com/0x4D31/awesome-detection-engineering

### Communities
- **r/blueteamsec** (Reddit)
- **BlueTeamVillage** (DEF CON)
- **Detection Engineering Discord**
- **SANS DFIR Summit**

---

## 🏁 **Final Checklist**

Before starting the program, ensure:
- [ ] Lab environment set up and isolated
- [ ] All tools installed and tested
- [ ] Authorization documentation template ready
- [ ] Backup/snapshot capability verified
- [ ] Emergency contacts identified
- [ ] Weekly schedule blocked on calendar
- [ ] Note-taking system established (Obsidian, Notion, etc.)
- [ ] GitHub repo created for documentation

**Good luck on your Blue Team journey! Remember: Defense is a marathon, not a sprint. Focus on building solid fundamentals, and always prioritize safety and authorization.** 🛡️

---

**Document Version**: 1.0
**Last Updated**: 2026-01-20
**Maintained By**: Antigravity Blue Team Mentor
