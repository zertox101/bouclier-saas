# SHIELD Advanced Security Toolkit
## Complete Cybersecurity Framework

### Requirements Installation

```bash
# Core Dependencies
pip install requests urllib3 bcrypt passlib paramiko

# Full installation
pip install -r requirements.txt
```

---

## 📁 Module Overview

| Module | File | Description |
|--------|------|-------------|
| **Network Recon** | `network_recon.py` | Port scanning, OS fingerprinting, service enumeration |
| **OSINT Recon** | `osint_recon.py` | DNS, WHOIS, subdomain enum, email harvesting |
| **Web Scanner** | `web_scanner.py` | XSS, SQLi, LFI, Command Injection testing |
| **Password Auditor** | `password_auditor.py` | Hash identification, cracking, strength analysis |
| **Packet Sniffer** | `packet_sniffer.py` | Network traffic capture and analysis |
| **Auth Auditor** | `auth_auditor.py` | SSH/SMB/RDP brute force testing |
| **AI Threat Detection** | `ai_threat_detector.py` | ML-based anomaly detection, behavioral analysis |
| **Post-Quantum Crypto** | `pqc_crypto.py` | Kyber KEM, Dilithium signatures |
| **Zero Trust** | `zero_trust.py` | Identity verification, micro-segmentation |
| **Exploit Framework** | `exploit_framework.py` | Payload generation, post-exploitation |
| **Mobile Security** | `mobile_security.py` | APK analysis, mobile app security |
| **C2 Simulator** | `c2_simulator.py` | Command & Control testing framework |
| **Report Generator** | `report_generator.py` | Professional HTML/PDF reports |

---

## 🚀 Quick Start

### Interactive CLI
```bash
cd scripts/security
python shield_cli.py
```

### Run Specific Module
```bash
python shield_cli.py -m recon      # Network reconnaissance
python shield_cli.py -m web        # Web scanner
python shield_cli.py -m ai         # AI threat detection
python shield_cli.py -m pqc        # Post-quantum crypto demo
python shield_cli.py --list        # List all modules
```

---

## 📖 Module Details

### 1. Network Reconnaissance (`network_recon.py`)
- TCP/UDP port scanning
- SYN scan simulation
- OS fingerprinting
- Service banner grabbing
- SMB/RDP vulnerability checks

```python
from network_recon import NetworkRecon
recon = NetworkRecon()
results = recon.quick_scan("192.168.1.1")
```

### 2. OSINT Reconnaissance (`osint_recon.py`)
- DNS lookup (A, MX, NS, TXT records)
- WHOIS information
- Subdomain enumeration
- Technology detection
- Email harvesting
- Sensitive file discovery

```python
from osint_recon import OSINTRecon
osint = OSINTRecon()
results = osint.full_recon("example.com")
```

### 3. Web Application Scanner (`web_scanner.py`)
- XSS testing (reflected, stored)
- SQL Injection (error-based, boolean-based)
- Local File Inclusion (LFI)
- Command Injection
- Security headers analysis
- Form discovery and fuzzing

```python
from web_scanner import WebSecurityScanner
scanner = WebSecurityScanner("http://target.com")
results = scanner.scan(crawl_first=True)
```

### 4. Password Auditor (`password_auditor.py`)
- Hash type identification
- Password strength analysis
- Dictionary attacks
- Brute force attacks
- Crack time estimation

```python
from password_auditor import PasswordAuditor
auditor = PasswordAuditor()
result = auditor.analyze_strength("MyP@ssw0rd!")
auditor.identify_hash("5f4dcc3b5aa765d61d8327deb882cf99")
```

### 5. AI Threat Detection (`ai_threat_detector.py`)
- Isolation Forest anomaly detection
- Behavioral analysis
- Threat classification
- Real-time scoring
- Threat intelligence integration

```python
from ai_threat_detector import AIThreatDetector
detector = AIThreatDetector()
detector.train()
result = detector.analyze_event(event)
```

### 6. Post-Quantum Cryptography (`pqc_crypto.py`)
- Kyber Key Encapsulation Mechanism
- Dilithium Digital Signatures
- Hybrid encryption scheme

```python
from pqc_crypto import PQCHybrid
pqc = PQCHybrid(security_level=2)
keys = pqc.generate_keypair()
encrypted = pqc.hybrid_encrypt(message, keys['encryption_pk'])
```

### 7. Zero Trust Framework (`zero_trust.py`)
- Identity management
- Device compliance checking
- Policy evaluation
- Micro-segmentation
- Continuous validation

```python
from zero_trust import ZeroTrustFramework
zt = ZeroTrustFramework()
result = zt.request_access(context)
```

### 8. Exploit Framework (`exploit_framework.py`)
- Payload generation (PowerShell, Python, Bash)
- Web shells (PHP, ASPX)
- Vulnerability checking
- Post-exploitation modules

```python
from exploit_framework import ExploitFramework
framework = ExploitFramework()
payload = framework.generate_payload('powershell', '10.10.10.1', 4444)
```

### 9. Mobile Security (`mobile_security.py`)
- APK static analysis
- Permission analysis
- Hardcoded secret detection
- Device security checks

```python
from mobile_security import MobileSecurityFramework
mobile = MobileSecurityFramework()
result = mobile.analyze_apk("app.apk")
```

### 10. Report Generator (`report_generator.py`)
- Professional HTML reports
- JSON export
- Markdown output
- Executive summaries
- Finding severity classification

```python
from report_generator import ReportGenerator
report = ReportGenerator("Security Assessment")
report.add_finding({...})
report.generate_html("report.html")
```

---

## ⚠️ Legal Disclaimer

**IMPORTANT:** This toolkit is intended for:
- Authorized penetration testing
- Security research and education
- Testing on systems you own or have explicit permission to test

**Unauthorized access to computer systems is illegal.**

---

## 📊 Integration with SHIELD Dashboard

All tools can send results to the SHIELD dashboard:
```python
# Events are automatically sent to:
# http://localhost:8002/ingest/syslog
```

View results in the web interface at `http://localhost:3000`

---

## 🔧 API Reference

See individual module files for complete API documentation.
Each module includes:
- `print_banner()` - Display module banner
- `demo()` or `run_demo()` - Run demonstration
- Module-specific methods

---

## 📝 Version History

- **v2.0** - Added AI Threat Detection, PQC, Zero Trust, Exploit Framework
- **v1.0** - Initial release with basic scanning tools
