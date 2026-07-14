import re
import hashlib

class AIAnalyzer:
    """
    Lightweight AI Analyzer - No external dependencies
    """
    
    def __init__(self):
        self.false_positive_patterns = {
            'xss': [
                r'<script.*?src=', r'cdn', r'static', r'asset',
                r'google-analytics', r'googletagmanager'
            ],
            'sqli': [
                r'page not found', r'404', r'not found',
                r'example.com', r'stackoverflow'
            ],
            'rce': [
                r'echo.*test', r'example', r'demo'
            ],
            'lfi': [
                r'etc/hosts', r'etc/fstab', r'example'
            ]
        }
        
        self.true_positive_patterns = {
            'xss': [
                r'alert\(', r'onerror=', r'onload=',
                r'javascript:', r'<script>', r'prompt\('
            ],
            'sqli': [
                r'sql syntax', r'mysql_fetch', r'ora-',
                r'postgresql', r'unclosed quotation',
                r'you have an error in your sql'
            ],
            'rce': [
                r'uid=', r'gid=', r'groups=', r'root:',
                r'etc/passwd', r'win.ini'
            ],
            'lfi': [
                r'root:x:0:0:', r'bin/bash', r'bin/sh',
                r'\[extensions\]', r'\[fonts\]'
            ]
        }
    
    def analyze(self, finding):
        vuln_type = finding.get('type', '')
        payload = finding.get('payload', '')
        response_text = finding.get('response_text', '').lower()
        status_code = finding.get('status_code', 0)
        
        confidence = 50
        reasons = []
        
        if vuln_type in self.true_positive_patterns:
            for pattern in self.true_positive_patterns[vuln_type]:
                if re.search(pattern, response_text, re.IGNORECASE):
                    confidence += 15
                    reasons.append(f"Found pattern: {pattern}")
        
        if vuln_type in self.false_positive_patterns:
            for pattern in self.false_positive_patterns[vuln_type]:
                if re.search(pattern, response_text, re.IGNORECASE):
                    confidence -= 20
                    reasons.append(f"False positive pattern: {pattern}")
        
        if status_code in [200, 201, 202]:
            confidence += 10
        elif status_code in [403, 404, 500, 502, 503]:
            confidence -= 15
        
        confidence = max(0, min(100, confidence))
        
        if confidence >= 75:
            verdict = "confirmed"
        elif confidence >= 55:
            verdict = "likely"
        elif confidence >= 35:
            verdict = "uncertain"
        else:
            verdict = "false_positive"
        
        return {
            'confidence': confidence,
            'verdict': verdict,
            'reasons': reasons[:3],
            'vuln_type': vuln_type
        }
