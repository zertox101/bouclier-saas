#!/usr/bin/env python3
"""
SHIELD OSINT Reconnaissance Toolkit
Open Source Intelligence Gathering
For authorized security testing only!
"""

import requests
import socket
import json
import sys
import re
import os
import time
import argparse
import contextlib
import io
from datetime import datetime
from typing import List, Dict, Optional
from urllib.parse import urlparse, urljoin
from concurrent.futures import ThreadPoolExecutor, as_completed

# Force UTF-8
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')


class OSINTRecon:
    """Open Source Intelligence Reconnaissance Toolkit"""
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        self.results = {}
        self.shield_endpoint = "http://localhost:8002/ingest/syslog"
    
    def print_banner(self):
        print("""
+==============================================================+
|     SHIELD OSINT RECON TOOLKIT v1.0                          |
|          Open Source Intelligence Gathering                  |
|     For authorized security testing only!                    |
+==============================================================+
        """)
    
    # ==================== DOMAIN RECON ====================
    
    def dns_lookup(self, domain: str) -> Dict:
        """Perform DNS lookups"""
        results = {
            "domain": domain,
            "records": {}
        }
        
        # A record
        try:
            ips = socket.gethostbyname_ex(domain)
            results["records"]["A"] = ips[2]
        except Exception:
            pass
        
        # Get additional info via DNS over HTTPS (Google)
        try:
            response = self.session.get(
                f"https://dns.google/resolve?name={domain}&type=A",
                timeout=5
            )
            data = response.json()
            if "Answer" in data:
                results["records"]["A_detail"] = [
                    {"ip": a.get("data"), "ttl": a.get("TTL")}
                    for a in data["Answer"]
                ]
        except Exception:
            pass
        
        # MX records
        try:
            response = self.session.get(
                f"https://dns.google/resolve?name={domain}&type=MX",
                timeout=5
            )
            data = response.json()
            if "Answer" in data:
                results["records"]["MX"] = [a.get("data") for a in data["Answer"]]
        except Exception:
            pass
        
        # NS records
        try:
            response = self.session.get(
                f"https://dns.google/resolve?name={domain}&type=NS",
                timeout=5
            )
            data = response.json()
            if "Answer" in data:
                results["records"]["NS"] = [a.get("data") for a in data["Answer"]]
        except Exception:
            pass
        
        # TXT records (often contain SPF, DMARC)
        try:
            response = self.session.get(
                f"https://dns.google/resolve?name={domain}&type=TXT",
                timeout=5
            )
            data = response.json()
            if "Answer" in data:
                results["records"]["TXT"] = [a.get("data") for a in data["Answer"]]
        except Exception:
            pass
        
        return results
    
    def whois_lookup(self, domain: str) -> Dict:
        """WHOIS-like lookup using public APIs"""
        results = {"domain": domain}
        
        # Use ip-api for basic info
        try:
            ip = socket.gethostbyname(domain)
            response = self.session.get(
                f"http://ip-api.com/json/{ip}",
                timeout=5
            )
            data = response.json()
            if data.get("status") == "success":
                results["ip"] = ip
                results["country"] = data.get("country")
                results["region"] = data.get("regionName")
                results["city"] = data.get("city")
                results["isp"] = data.get("isp")
                results["org"] = data.get("org")
                results["as"] = data.get("as")
        except Exception:
            pass
        
        return results
    
    def subdomain_enum(self, domain: str) -> List[str]:
        """Enumerate subdomains using public sources"""
        subdomains = set()
        
        # Common subdomain prefixes
        common_subs = [
            "www", "mail", "ftp", "localhost", "webmail", "smtp", "pop",
            "ns1", "ns2", "dns", "dns1", "dns2", "mx", "mx1", "mx2",
            "blog", "dev", "staging", "test", "api", "admin", "portal",
            "secure", "vpn", "remote", "cloud", "cdn", "static",
            "app", "apps", "mobile", "m", "web", "email", "imap",
            "shop", "store", "cart", "checkout", "pay", "payment",
            "db", "database", "sql", "mysql", "pg", "mongo",
            "git", "gitlab", "github", "svn", "repo",
            "jenkins", "ci", "build", "deploy", "docker", "k8s",
            "grafana", "prometheus", "kibana", "elastic", "log", "logs",
        ]
        
        print(f"\n    [*] Checking {len(common_subs)} common subdomains...")
        
        def check_subdomain(sub):
            full_domain = f"{sub}.{domain}"
            try:
                socket.gethostbyname(full_domain)
                return full_domain
            except Exception:
                return None
        
        with ThreadPoolExecutor(max_workers=20) as executor:
            futures = {executor.submit(check_subdomain, sub): sub for sub in common_subs}
            
            for future in as_completed(futures):
                result = future.result()
                if result:
                    subdomains.add(result)
                    print(f"        [+] Found: {result}")
        
        # Try crt.sh for certificate transparency
        try:
            response = self.session.get(
                f"https://crt.sh/?q=%.{domain}&output=json",
                timeout=10
            )
            if response.status_code == 200:
                certs = response.json()
                for cert in certs[:50]:  # Limit results
                    name = cert.get("name_value", "")
                    for sub in name.split("\n"):
                        sub = sub.strip().lower()
                        if sub.endswith(domain) and '*' not in sub:
                            subdomains.add(sub)
        except Exception:
            pass
        
        return list(subdomains)
    
    # ==================== WEBSITE RECON ====================
    
    def analyze_website(self, url: str) -> Dict:
        """Analyze website technologies and information"""
        results = {
            "url": url,
            "technologies": [],
            "headers": {},
            "meta": {}
        }
        
        try:
            response = self.session.get(url, timeout=10, verify=False)
            html = response.text.lower()
            headers = dict(response.headers)
            
            results["status_code"] = response.status_code
            results["headers"] = {
                "Server": headers.get("Server"),
                "X-Powered-By": headers.get("X-Powered-By"),
                "Content-Type": headers.get("Content-Type"),
            }
            
            # Detect technologies
            tech_signatures = {
                "WordPress": ["wp-content", "wp-includes", "wordpress"],
                "Drupal": ["drupal", "/sites/default/"],
                "Joomla": ["joomla", "/components/"],
                "Django": ["csrfmiddlewaretoken", "__admin__"],
                "React": ["react", "_react", "reactdom"],
                "Angular": ["ng-app", "angular", "ng-controller"],
                "Vue.js": ["vue", "v-bind", "v-model"],
                "jQuery": ["jquery"],
                "Bootstrap": ["bootstrap"],
                "Laravel": ["laravel", "csrf_token"],
                "ASP.NET": ["asp.net", "__viewstate"],
                "PHP": [".php", "phpsessid"],
                "Node.js": ["express", "node"],
                "nginx": [],
                "Apache": [],
                "IIS": [],
            }
            
            # Check headers for server
            server = headers.get("Server", "").lower()
            if "nginx" in server:
                results["technologies"].append("nginx")
            if "apache" in server:
                results["technologies"].append("Apache")
            if "iis" in server:
                results["technologies"].append("IIS")
            
            powered_by = headers.get("X-Powered-By", "").lower()
            if "php" in powered_by:
                results["technologies"].append("PHP")
            if "asp.net" in powered_by:
                results["technologies"].append("ASP.NET")
            if "express" in powered_by:
                results["technologies"].append("Express.js")
            
            # Check HTML content
            for tech, signatures in tech_signatures.items():
                for sig in signatures:
                    if sig in html:
                        if tech not in results["technologies"]:
                            results["technologies"].append(tech)
                        break
            
            # Extract meta information
            title_match = re.search(r'<title>([^<]+)</title>', response.text, re.IGNORECASE)
            if title_match:
                results["meta"]["title"] = title_match.group(1)
            
            desc_match = re.search(r'<meta[^>]+name=["\']description["\'][^>]+content=["\']([^"\']+)', response.text, re.IGNORECASE)
            if desc_match:
                results["meta"]["description"] = desc_match.group(1)
            
            # Extract emails
            emails = set(re.findall(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', response.text))
            if emails:
                results["emails"] = list(emails)[:10]
            
            # Extract links
            links = set(re.findall(r'href=["\']([^"\']+)["\']', response.text))
            external_links = [l for l in links if l.startswith('http') and urlparse(url).netloc not in l]
            results["external_links"] = external_links[:20]
            
        except Exception as e:
            results["error"] = str(e)
        
        return results
    
    def find_sensitive_files(self, base_url: str) -> List[Dict]:
        """Check for exposed sensitive files"""
        sensitive_paths = [
            "robots.txt", "sitemap.xml", ".git/HEAD", ".svn/entries",
            ".env", ".env.local", ".env.production", "config.php",
            "wp-config.php", "configuration.php", "settings.py",
            ".htaccess", "web.config", "crossdomain.xml",
            "backup.sql", "dump.sql", "database.sql",
            "admin/", "administrator/", "phpmyadmin/", "adminer.php",
            "info.php", "phpinfo.php", "test.php",
            "README.md", "CHANGELOG.md", "LICENSE",
            ".DS_Store", "Thumbs.db",
            "api/swagger.json", "api/openapi.json", "swagger-ui/",
            "graphql", "graphiql",
            ".well-known/security.txt",
        ]
        
        found = []
        
        print(f"\n    [*] Checking {len(sensitive_paths)} sensitive paths...")
        
        def check_path(path):
            url = urljoin(base_url, path)
            try:
                response = self.session.get(url, timeout=5, verify=False, allow_redirects=False)
                if response.status_code == 200:
                    return {
                        "path": path,
                        "url": url,
                        "status": response.status_code,
                        "size": len(response.content)
                    }
            except Exception:
                pass
            return None
        
        with ThreadPoolExecutor(max_workers=10) as executor:
            futures = {executor.submit(check_path, path): path for path in sensitive_paths}
            
            for future in as_completed(futures):
                result = future.result()
                if result:
                    found.append(result)
                    print(f"        [+] Found: {result['path']} ({result['size']} bytes)")
        
        return found
    
    # ==================== IP/ASN RECON ====================
    
    def ip_lookup(self, ip: str) -> Dict:
        """Get information about an IP address"""
        results = {"ip": ip}
        
        try:
            response = self.session.get(f"http://ip-api.com/json/{ip}", timeout=5)
            data = response.json()
            
            if data.get("status") == "success":
                results.update({
                    "country": data.get("country"),
                    "country_code": data.get("countryCode"),
                    "region": data.get("regionName"),
                    "city": data.get("city"),
                    "zip": data.get("zip"),
                    "lat": data.get("lat"),
                    "lon": data.get("lon"),
                    "isp": data.get("isp"),
                    "org": data.get("org"),
                    "as": data.get("as"),
                })
        except Exception as e:
            results["error"] = str(e)
        
        return results
    
    def reverse_dns(self, ip: str) -> Optional[str]:
        """Reverse DNS lookup"""
        try:
            hostname = socket.gethostbyaddr(ip)[0]
            return hostname
        except Exception:
            return None
    
    # ==================== EMAIL HARVESTING ====================
    
    def harvest_emails(self, domain: str, max_pages: int = 5) -> List[str]:
        """Harvest email addresses related to a domain"""
        emails = set()
        
        # Search using DuckDuckGo HTML (no API needed)
        search_queries = [
            f"@{domain}",
            f"email {domain}",
            f"contact {domain}",
        ]
        
        print(f"\n    [*] Harvesting emails for {domain}...")
        
        for query in search_queries:
            try:
                # Note: This is a simplified example - real implementation would 
                # need proper search API or more sophisticated scraping
                response = self.session.get(
                    f"https://html.duckduckgo.com/html/?q={query}",
                    timeout=10
                )
                
                # Extract emails from response
                found = re.findall(
                    r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}',
                    response.text
                )
                
                for email in found:
                    if domain.lower() in email.lower():
                        emails.add(email.lower())
                        
            except Exception:
                pass
        
        email_list = list(emails)
        for email in email_list:
            print(f"        [+] {email}")
        
        return email_list
    
    # ==================== FULL RECON ====================
    
    def full_recon(self, target: str) -> Dict:
        """Perform full OSINT reconnaissance"""
        self.print_banner()
        
        # Determine if target is domain or URL
        if target.startswith('http'):
            parsed = urlparse(target)
            domain = parsed.netloc
            url = target
        else:
            domain = target
            url = f"https://{target}"
        
        print(f"\n  [*] Target: {domain}")
        print(f"  [*] Starting OSINT reconnaissance...")
        
        results = {
            "target": target,
            "domain": domain,
            "scan_time": datetime.now().isoformat()
        }
        
        # DNS Lookup
        print("\n  === DNS RECORDS ===")
        dns_results = self.dns_lookup(domain)
        results["dns"] = dns_results
        for record_type, values in dns_results.get("records", {}).items():
            print(f"    {record_type}: {values}")
        
        # WHOIS
        print("\n  === WHOIS INFO ===")
        whois_results = self.whois_lookup(domain)
        results["whois"] = whois_results
        for key, value in whois_results.items():
            if key != "domain" and value:
                print(f"    {key}: {value}")
        
        # Subdomain enumeration
        print("\n  === SUBDOMAINS ===")
        subdomains = self.subdomain_enum(domain)
        results["subdomains"] = subdomains
        print(f"    Total found: {len(subdomains)}")
        
        # Website analysis
        print("\n  === WEBSITE ANALYSIS ===")
        web_results = self.analyze_website(url)
        results["website"] = web_results
        if web_results.get("technologies"):
            print(f"    Technologies: {', '.join(web_results['technologies'])}")
        if web_results.get("emails"):
            print(f"    Emails found: {len(web_results['emails'])}")
        
        # Sensitive files
        print("\n  === SENSITIVE FILES ===")
        sensitive_files = self.find_sensitive_files(url)
        results["sensitive_files"] = sensitive_files
        print(f"    Found: {len(sensitive_files)} files")
        
        # Email harvesting
        print("\n  === EMAIL HARVESTING ===")
        emails = self.harvest_emails(domain)
        results["emails"] = emails
        print(f"    Harvested: {len(emails)} emails")
        
        # Send to SHIELD
        self.send_to_shield(results)
        
        # Summary
        self.print_summary(results)
        
        return results
    
    def send_to_shield(self, results: Dict):
        """Send results to SHIELD dashboard"""
        try:
            payload = {
                "timestamp": time.time(),
                "source_ip": "osint_recon",
                "destination_ip": results.get("domain", "unknown"),
                "event_type": "OSINT: Reconnaissance Complete",
                "severity": "INFO",
                "payload": {
                    "subdomains": len(results.get("subdomains", [])),
                    "emails": len(results.get("emails", [])),
                    "sensitive_files": len(results.get("sensitive_files", []))
                },
                "tenant_id": "T-OSINT"
            }
            requests.post(self.shield_endpoint, json=payload, timeout=2)
        except Exception:
            pass
    
    def print_summary(self, results: Dict):
        """Print reconnaissance summary"""
        print("\n" + "="*60)
        print("                 OSINT SUMMARY")
        print("="*60)
        
        print(f"\n  Target: {results['domain']}")
        print(f"  Scan Time: {results['scan_time']}")
        
        print(f"\n  Findings:")
        print(f"    - DNS Records: {len(results.get('dns', {}).get('records', {}))}")
        print(f"    - Subdomains: {len(results.get('subdomains', []))}")
        print(f"    - Technologies: {len(results.get('website', {}).get('technologies', []))}")
        print(f"    - Emails: {len(results.get('emails', []))}")
        print(f"    - Sensitive Files: {len(results.get('sensitive_files', []))}")
        
        print("\n" + "="*60)
    
    def save_report(self, results: Dict, filename: str = None) -> str:
        """Save OSINT report"""
        if filename is None:
            domain = results.get("domain", "unknown").replace(".", "_")
            filename = f"osint_{domain}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        
        print(f"\n  [+] Report saved: {filename}")
        return filename


def main():
    parser = argparse.ArgumentParser(description="SHIELD OSINT Recon")
    parser.add_argument("--target", required=True, help="Target domain or URL")
    parser.add_argument("--json", action="store_true", help="Output results as JSON")
    parser.add_argument("--no-report", action="store_true", help="Skip saving report file")
    args = parser.parse_args()

    osint = OSINTRecon()

    if args.json:
        with contextlib.redirect_stdout(io.StringIO()):
            results = osint.full_recon(args.target)
    else:
        results = osint.full_recon(args.target)

    if not args.no_report:
        osint.save_report(results)

    if args.json:
        print(json.dumps(results, indent=2))
    else:
        print("\n  [+] OSINT reconnaissance complete!")


if __name__ == "__main__":
    main()
