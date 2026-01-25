#!/usr/bin/env python3
"""
SHIELD Web Application Security Scanner
Automated web vulnerability testing toolkit
For authorized security testing only!
"""

import requests
import urllib3
import re
import json
import time
import sys
from datetime import datetime
from typing import List, Dict, Optional, Tuple
from urllib.parse import urljoin, urlparse, parse_qs, urlencode
from concurrent.futures import ThreadPoolExecutor, as_completed
from html.parser import HTMLParser

# Disable SSL warnings for testing
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Force UTF-8
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')


class FormParser(HTMLParser):
    """Parse HTML forms for testing"""
    def __init__(self):
        super().__init__()
        self.forms = []
        self.current_form = None
    
    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        
        if tag == 'form':
            self.current_form = {
                'action': attrs_dict.get('action', ''),
                'method': attrs_dict.get('method', 'get').lower(),
                'inputs': []
            }
        elif tag == 'input' and self.current_form is not None:
            self.current_form['inputs'].append({
                'name': attrs_dict.get('name', ''),
                'type': attrs_dict.get('type', 'text'),
                'value': attrs_dict.get('value', '')
            })
        elif tag == 'textarea' and self.current_form is not None:
            self.current_form['inputs'].append({
                'name': attrs_dict.get('name', ''),
                'type': 'textarea',
                'value': ''
            })
    
    def handle_endtag(self, tag):
        if tag == 'form' and self.current_form:
            self.forms.append(self.current_form)
            self.current_form = None


class WebSecurityScanner:
    """Comprehensive Web Application Security Scanner"""
    
    def __init__(self, target_url: str):
        self.target = target_url
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'SHIELD-WebScanner/1.0 (Security Testing)',
            'Accept': 'text/html,application/json,*/*',
        })
        self.results = {
            "target": target_url,
            "scan_time": None,
            "vulnerabilities": [],
            "info": []
        }
        self.discovered_urls = set()
        self.tested_params = set()
        self.shield_endpoint = "http://localhost:8002/ingest/syslog"
    
    def print_banner(self):
        print("""
+==============================================================+
|     SHIELD WEB SECURITY SCANNER v1.0                         |
|          Automated Web Vulnerability Testing                 |
|     For authorized security testing only!                    |
+==============================================================+
        """)
    
    # ==================== XSS TESTING ====================
    
    def test_xss(self, url: str, params: Dict = None) -> List[Dict]:
        """Test for Cross-Site Scripting vulnerabilities"""
        xss_payloads = [
            '<script>alert("XSS")</script>',
            '"><script>alert(1)</script>',
            "'-alert(1)-'",
            '<img src=x onerror=alert(1)>',
            '<svg onload=alert(1)>',
            '{{constructor.constructor("alert(1)")()}}',
            '${alert(1)}',
            '<body onload=alert(1)>',
            'javascript:alert(1)',
            '<iframe src="javascript:alert(1)">',
        ]
        
        vulns = []
        params = params or {}
        
        for payload in xss_payloads:
            for param in params:
                test_params = params.copy()
                test_params[param] = payload
                
                try:
                    response = self.session.get(url, params=test_params, timeout=10, verify=False)
                    
                    # Check if payload is reflected
                    if payload in response.text:
                        vuln = {
                            "type": "XSS",
                            "subtype": "Reflected XSS",
                            "url": url,
                            "parameter": param,
                            "payload": payload,
                            "severity": "HIGH",
                            "evidence": f"Payload reflected in response"
                        }
                        vulns.append(vuln)
                        print(f"    [!] XSS Found: {param} = {payload[:30]}...")
                        break  # One payload per param is enough
                        
                except Exception as e:
                    pass
        
        return vulns
    
    # ==================== SQL INJECTION TESTING ====================
    
    def test_sqli(self, url: str, params: Dict = None) -> List[Dict]:
        """Test for SQL Injection vulnerabilities"""
        sqli_payloads = [
            "' OR '1'='1",
            "' OR '1'='1' --",
            "' OR '1'='1' /*",
            "1' AND '1'='1",
            "1 AND 1=1",
            "1' AND '1'='2",
            "1 AND 1=2",
            "'; DROP TABLE users; --",
            "1; SELECT * FROM users",
            "' UNION SELECT NULL,NULL,NULL --",
            "' UNION SELECT 1,2,3 --",
            "admin'--",
            "1' ORDER BY 1 --",
            "1' ORDER BY 100 --",
        ]
        
        error_patterns = [
            r"SQL syntax",
            r"mysql_fetch",
            r"ORA-\d+",
            r"PostgreSQL.*ERROR",
            r"Microsoft.*SQL.*Server",
            r"ODBC.*Driver",
            r"SQLite.*error",
            r"Warning.*mysql",
            r"Unclosed quotation mark",
            r"quoted string not properly terminated",
        ]
        
        vulns = []
        params = params or {}
        
        # Get baseline response
        try:
            baseline = self.session.get(url, params=params, timeout=10, verify=False)
            baseline_length = len(baseline.text)
        except Exception:
            return vulns
        
        for payload in sqli_payloads[:5]:  # Test first 5 payloads
            for param in params:
                test_params = params.copy()
                test_params[param] = payload
                
                try:
                    response = self.session.get(url, params=test_params, timeout=10, verify=False)
                    
                    # Check for SQL error messages
                    for pattern in error_patterns:
                        if re.search(pattern, response.text, re.IGNORECASE):
                            vuln = {
                                "type": "SQL Injection",
                                "subtype": "Error-based SQLi",
                                "url": url,
                                "parameter": param,
                                "payload": payload,
                                "severity": "CRITICAL",
                                "evidence": f"SQL error pattern detected: {pattern}"
                            }
                            vulns.append(vuln)
                            print(f"    [!] SQLi Found: {param} (Error-based)")
                            break
                    
                    # Check for significant response length difference (blind SQLi indicator)
                    if abs(len(response.text) - baseline_length) > baseline_length * 0.3:
                        vuln = {
                            "type": "SQL Injection",
                            "subtype": "Boolean-based SQLi (potential)",
                            "url": url,
                            "parameter": param,
                            "payload": payload,
                            "severity": "HIGH",
                            "evidence": f"Response length changed significantly"
                        }
                        vulns.append(vuln)
                        print(f"    [!] SQLi Potential: {param} (Boolean-based)")
                        
                except Exception:
                    pass
        
        return vulns
    
    # ==================== COMMAND INJECTION TESTING ====================
    
    def test_command_injection(self, url: str, params: Dict = None) -> List[Dict]:
        """Test for Command Injection vulnerabilities"""
        cmd_payloads = [
            "; id",
            "| id",
            "& id",
            "`id`",
            "$(id)",
            "; whoami",
            "| whoami",
            "& whoami",
            "; cat /etc/passwd",
            "| cat /etc/passwd",
            "; dir",
            "| dir",
            "& dir",
        ]
        
        indicators = [
            r"uid=\d+",
            r"root:",
            r"bin/bash",
            r"Volume Serial Number",
            r"Directory of",
        ]
        
        vulns = []
        params = params or {}
        
        for payload in cmd_payloads[:5]:
            for param in params:
                test_params = params.copy()
                test_params[param] = payload
                
                try:
                    response = self.session.get(url, params=test_params, timeout=10, verify=False)
                    
                    for indicator in indicators:
                        if re.search(indicator, response.text):
                            vuln = {
                                "type": "Command Injection",
                                "url": url,
                                "parameter": param,
                                "payload": payload,
                                "severity": "CRITICAL",
                                "evidence": f"Command output indicator found"
                            }
                            vulns.append(vuln)
                            print(f"    [!] Command Injection: {param}")
                            break
                            
                except Exception:
                    pass
        
        return vulns
    
    # ==================== LFI/RFI TESTING ====================
    
    def test_lfi(self, url: str, params: Dict = None) -> List[Dict]:
        """Test for Local File Inclusion"""
        lfi_payloads = [
            "../../../etc/passwd",
            "....//....//....//etc/passwd",
            "..%2F..%2F..%2Fetc%2Fpasswd",
            "../../../windows/system32/drivers/etc/hosts",
            "....//....//....//windows/system32/drivers/etc/hosts",
            "/etc/passwd%00",
            "php://filter/convert.base64-encode/resource=index",
            "php://input",
        ]
        
        indicators = [
            r"root:.*:0:0",
            r"daemon:.*:",
            r"localhost",
            r"\[fonts\]",
        ]
        
        vulns = []
        params = params or {}
        
        for payload in lfi_payloads:
            for param in params:
                test_params = params.copy()
                test_params[param] = payload
                
                try:
                    response = self.session.get(url, params=test_params, timeout=10, verify=False)
                    
                    for indicator in indicators:
                        if re.search(indicator, response.text):
                            vuln = {
                                "type": "Local File Inclusion",
                                "url": url,
                                "parameter": param,
                                "payload": payload,
                                "severity": "HIGH",
                                "evidence": f"File content indicator found"
                            }
                            vulns.append(vuln)
                            print(f"    [!] LFI Found: {param}")
                            break
                            
                except Exception:
                    pass
        
        return vulns
    
    # ==================== SECURITY HEADERS CHECK ====================
    
    def check_security_headers(self, url: str) -> Dict:
        """Check security headers"""
        try:
            response = self.session.get(url, timeout=10, verify=False)
            headers = response.headers
            
            checks = {
                "X-Frame-Options": {
                    "present": "X-Frame-Options" in headers,
                    "value": headers.get("X-Frame-Options"),
                    "risk": "Clickjacking" if "X-Frame-Options" not in headers else None
                },
                "X-XSS-Protection": {
                    "present": "X-XSS-Protection" in headers,
                    "value": headers.get("X-XSS-Protection"),
                    "risk": "XSS not filtered" if "X-XSS-Protection" not in headers else None
                },
                "X-Content-Type-Options": {
                    "present": "X-Content-Type-Options" in headers,
                    "value": headers.get("X-Content-Type-Options"),
                    "risk": "MIME sniffing" if "X-Content-Type-Options" not in headers else None
                },
                "Strict-Transport-Security": {
                    "present": "Strict-Transport-Security" in headers,
                    "value": headers.get("Strict-Transport-Security"),
                    "risk": "No HSTS" if "Strict-Transport-Security" not in headers else None
                },
                "Content-Security-Policy": {
                    "present": "Content-Security-Policy" in headers,
                    "value": headers.get("Content-Security-Policy", "")[:100],
                    "risk": "No CSP" if "Content-Security-Policy" not in headers else None
                },
                "Server": {
                    "present": "Server" in headers,
                    "value": headers.get("Server"),
                    "risk": "Server info exposed" if "Server" in headers else None
                },
            }
            
            missing_count = sum(1 for h in checks.values() if not h["present"])
            
            return {
                "url": url,
                "headers": checks,
                "missing_count": missing_count,
                "security_score": round((len(checks) - missing_count) / len(checks) * 100)
            }
            
        except Exception as e:
            return {"error": str(e)}
    
    # ==================== FORM DISCOVERY & TESTING ====================
    
    def discover_forms(self, url: str) -> List[Dict]:
        """Discover forms on a page"""
        try:
            response = self.session.get(url, timeout=10, verify=False)
            parser = FormParser()
            parser.feed(response.text)
            
            forms = []
            for form in parser.forms:
                form['url'] = urljoin(url, form['action']) if form['action'] else url
                forms.append(form)
            
            return forms
        except Exception:
            return []
    
    def test_form(self, form: Dict, base_url: str) -> List[Dict]:
        """Test a form for vulnerabilities"""
        vulns = []
        
        # Build params from form inputs
        params = {}
        for inp in form['inputs']:
            if inp['name']:
                params[inp['name']] = inp['value'] or 'test'
        
        if not params:
            return vulns
        
        action_url = form['url']
        
        # Test XSS
        vulns.extend(self.test_xss(action_url, params))
        
        # Test SQLi
        vulns.extend(self.test_sqli(action_url, params))
        
        return vulns
    
    # ==================== CRAWLING ====================
    
    def crawl(self, start_url: str, max_depth: int = 2, max_urls: int = 50) -> set:
        """Simple crawler to discover URLs"""
        from urllib.parse import urljoin
        
        visited = set()
        to_visit = [(start_url, 0)]
        
        while to_visit and len(visited) < max_urls:
            url, depth = to_visit.pop(0)
            
            if url in visited or depth > max_depth:
                continue
            
            # Only crawl same domain
            if urlparse(url).netloc != urlparse(start_url).netloc:
                continue
            
            visited.add(url)
            print(f"    Crawling: {url}")
            
            try:
                response = self.session.get(url, timeout=10, verify=False)
                
                # Find links
                links = re.findall(r'href=["\']([^"\']+)["\']', response.text)
                for link in links:
                    full_url = urljoin(url, link)
                    if full_url not in visited:
                        to_visit.append((full_url, depth + 1))
                        
            except Exception:
                pass
        
        return visited
    
    # ==================== MAIN SCAN FUNCTION ====================
    
    def scan(self, crawl_first: bool = True) -> Dict:
        """Run full security scan"""
        self.print_banner()
        self.results["scan_time"] = datetime.now().isoformat()
        
        print(f"\n  [*] Target: {self.target}")
        
        # Check if target is accessible
        try:
            response = self.session.get(self.target, timeout=10, verify=False)
            print(f"  [+] Target accessible: {response.status_code}")
        except Exception as e:
            print(f"  [!] Target not accessible: {e}")
            return self.results
        
        # Security headers check
        print("\n  === SECURITY HEADERS ===")
        headers_result = self.check_security_headers(self.target)
        self.results["security_headers"] = headers_result
        
        if headers_result.get("missing_count", 0) > 0:
            print(f"    [!] Missing security headers: {headers_result['missing_count']}")
            for header, info in headers_result.get("headers", {}).items():
                if not info["present"]:
                    print(f"        - {header}: {info['risk']}")
        
        # Crawl for URLs
        urls_to_test = {self.target}
        if crawl_first:
            print("\n  === CRAWLING ===")
            urls_to_test = self.crawl(self.target, max_depth=2, max_urls=20)
            print(f"    Found {len(urls_to_test)} URLs")
        
        # Test each URL
        print("\n  === VULNERABILITY TESTING ===")
        all_vulns = []
        
        for url in urls_to_test:
            # Extract params from URL
            parsed = urlparse(url)
            params = {k: v[0] for k, v in parse_qs(parsed.query).items()}
            
            if params:
                print(f"\n  Testing: {url}")
                all_vulns.extend(self.test_xss(url, params))
                all_vulns.extend(self.test_sqli(url, params))
                all_vulns.extend(self.test_lfi(url, params))
            
            # Discover and test forms
            forms = self.discover_forms(url)
            for form in forms:
                print(f"    Testing form: {form['action']}")
                all_vulns.extend(self.test_form(form, url))
        
        self.results["vulnerabilities"] = all_vulns
        
        # Send to SHIELD
        self.send_results()
        
        # Summary
        self.print_summary()
        
        return self.results
    
    def send_results(self):
        """Send results to SHIELD dashboard"""
        try:
            for vuln in self.results["vulnerabilities"]:
                payload = {
                    "timestamp": time.time(),
                    "source_ip": "web_scanner",
                    "destination_ip": self.target,
                    "event_type": f"WEB_VULN: {vuln['type']}",
                    "severity": vuln.get("severity", "HIGH"),
                    "payload": vuln,
                    "tenant_id": "T-WEBSCAN"
                }
                requests.post(self.shield_endpoint, json=payload, timeout=2)
        except Exception:
            pass
    
    def print_summary(self):
        """Print scan summary"""
        print("\n" + "="*60)
        print("                 WEB SCAN SUMMARY")
        print("="*60)
        
        print(f"\n  Target: {self.target}")
        print(f"  Scan Time: {self.results['scan_time']}")
        
        vulns = self.results["vulnerabilities"]
        
        # Count by type
        by_type = {}
        for v in vulns:
            t = v["type"]
            by_type[t] = by_type.get(t, 0) + 1
        
        print(f"\n  Vulnerabilities Found: {len(vulns)}")
        for t, count in by_type.items():
            print(f"    - {t}: {count}")
        
        # Count by severity
        by_sev = {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0}
        for v in vulns:
            sev = v.get("severity", "HIGH")
            by_sev[sev] = by_sev.get(sev, 0) + 1
        
        print(f"\n  By Severity:")
        for sev, count in by_sev.items():
            if count > 0:
                print(f"    - {sev}: {count}")
        
        print("\n" + "="*60)
    
    def save_report(self, filename: str = None) -> str:
        """Save scan results to file"""
        if filename is None:
            domain = urlparse(self.target).netloc.replace(":", "_")
            filename = f"webscan_{domain}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(self.results, f, indent=2, ensure_ascii=False)
        
        print(f"\n  [+] Report saved: {filename}")
        return filename


def main():
    # Default target for testing (SHIELD dashboard)
    target = "http://localhost:3000"
    
    if len(sys.argv) > 1:
        target = sys.argv[1]
    
    scanner = WebSecurityScanner(target)
    results = scanner.scan(crawl_first=True)
    scanner.save_report()


if __name__ == "__main__":
    main()
