#!/usr/bin/env python3
"""
SHIELD Security Report Generator
Professional PDF/HTML security assessment reports
"""

import sys
import os
import json
from datetime import datetime
from typing import List, Dict, Optional
from pathlib import Path

# Force UTF-8
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')


class ReportGenerator:
    """Generate professional security reports"""
    
    def __init__(self, title: str = "Security Assessment Report"):
        self.title = title
        self.sections = []
        self.findings = []
        self.executive_summary = ""
        self.metadata = {
            'generated': datetime.now().isoformat(),
            'version': '1.0',
            'classification': 'CONFIDENTIAL',
        }
    
    def set_executive_summary(self, summary: str):
        """Set executive summary"""
        self.executive_summary = summary
    
    def add_section(self, title: str, content: str, findings: List[Dict] = None):
        """Add report section"""
        self.sections.append({
            'title': title,
            'content': content,
            'findings': findings or [],
        })
    
    def add_finding(self, finding: Dict):
        """Add security finding"""
        required_fields = ['title', 'severity', 'description']
        for field in required_fields:
            if field not in finding:
                raise ValueError(f"Finding missing required field: {field}")
        
        finding['id'] = f"FINDING-{len(self.findings) + 1:03d}"
        self.findings.append(finding)
    
    def generate_html(self, output_path: str = None) -> str:
        """Generate HTML report"""
        
        # Count findings by severity
        severity_counts = {'CRITICAL': 0, 'HIGH': 0, 'MEDIUM': 0, 'LOW': 0, 'INFO': 0}
        for f in self.findings:
            sev = f.get('severity', 'INFO').upper()
            if sev in severity_counts:
                severity_counts[sev] += 1
        
        html = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{self.title}</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
        }}
        
        .container {{
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }}
        
        .header {{
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            color: white;
            padding: 40px;
            border-radius: 10px;
            margin-bottom: 30px;
        }}
        
        .header h1 {{
            font-size: 2.5em;
            margin-bottom: 10px;
        }}
        
        .header .meta {{
            opacity: 0.8;
            font-size: 0.9em;
        }}
        
        .classification {{
            display: inline-block;
            background: #e74c3c;
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 0.8em;
            margin-top: 15px;
        }}
        
        .summary-cards {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }}
        
        .card {{
            background: white;
            padding: 25px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }}
        
        .card.critical {{ border-top: 4px solid #e74c3c; }}
        .card.high {{ border-top: 4px solid #e67e22; }}
        .card.medium {{ border-top: 4px solid #f1c40f; }}
        .card.low {{ border-top: 4px solid #3498db; }}
        .card.info {{ border-top: 4px solid #95a5a6; }}
        
        .card .count {{
            font-size: 3em;
            font-weight: bold;
            color: #333;
        }}
        
        .card .label {{
            font-size: 0.9em;
            color: #666;
            text-transform: uppercase;
        }}
        
        .section {{
            background: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }}
        
        .section h2 {{
            color: #1a1a2e;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #eee;
        }}
        
        .finding {{
            background: #f9f9f9;
            border-left: 4px solid #ccc;
            padding: 20px;
            margin: 15px 0;
            border-radius: 0 8px 8px 0;
        }}
        
        .finding.critical {{ border-left-color: #e74c3c; background: #fdf2f2; }}
        .finding.high {{ border-left-color: #e67e22; background: #fef5ec; }}
        .finding.medium {{ border-left-color: #f1c40f; background: #fefce8; }}
        .finding.low {{ border-left-color: #3498db; background: #eff6fc; }}
        
        .finding-header {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }}
        
        .finding-title {{
            font-weight: bold;
            font-size: 1.1em;
        }}
        
        .severity-badge {{
            padding: 3px 10px;
            border-radius: 15px;
            font-size: 0.75em;
            font-weight: bold;
            color: white;
        }}
        
        .severity-badge.critical {{ background: #e74c3c; }}
        .severity-badge.high {{ background: #e67e22; }}
        .severity-badge.medium {{ background: #f1c40f; color: #333; }}
        .severity-badge.low {{ background: #3498db; }}
        
        .finding-id {{
            font-size: 0.8em;
            color: #666;
            margin-bottom: 10px;
        }}
        
        .finding-description {{
            margin-bottom: 15px;
        }}
        
        .finding-section {{
            margin-top: 15px;
        }}
        
        .finding-section h4 {{
            color: #555;
            margin-bottom: 5px;
            font-size: 0.9em;
        }}
        
        .code {{
            background: #2d2d2d;
            color: #f8f8f2;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
            font-family: 'Consolas', 'Monaco', monospace;
            font-size: 0.9em;
        }}
        
        .toc {{
            background: white;
            padding: 20px 30px;
            border-radius: 10px;
            margin-bottom: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }}
        
        .toc h3 {{
            margin-bottom: 15px;
            color: #1a1a2e;
        }}
        
        .toc ul {{
            list-style: none;
        }}
        
        .toc li {{
            padding: 5px 0;
        }}
        
        .toc a {{
            color: #3498db;
            text-decoration: none;
        }}
        
        .toc a:hover {{
            text-decoration: underline;
        }}
        
        .footer {{
            text-align: center;
            padding: 30px;
            color: #666;
            font-size: 0.9em;
        }}
        
        @media print {{
            body {{ background: white; }}
            .container {{ max-width: 100%; }}
            .section {{ box-shadow: none; border: 1px solid #ddd; }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🛡️ {self.title}</h1>
            <div class="meta">
                <p>Generated: {self.metadata['generated']}</p>
                <p>Version: {self.metadata['version']}</p>
            </div>
            <span class="classification">{self.metadata['classification']}</span>
        </div>
        
        <div class="summary-cards">
            <div class="card critical">
                <div class="count">{severity_counts['CRITICAL']}</div>
                <div class="label">Critical</div>
            </div>
            <div class="card high">
                <div class="count">{severity_counts['HIGH']}</div>
                <div class="label">High</div>
            </div>
            <div class="card medium">
                <div class="count">{severity_counts['MEDIUM']}</div>
                <div class="label">Medium</div>
            </div>
            <div class="card low">
                <div class="count">{severity_counts['LOW']}</div>
                <div class="label">Low</div>
            </div>
            <div class="card info">
                <div class="count">{severity_counts['INFO']}</div>
                <div class="label">Info</div>
            </div>
        </div>
        
        <div class="toc">
            <h3>📋 Table of Contents</h3>
            <ul>
                <li><a href="#executive-summary">Executive Summary</a></li>
                {''.join(f'<li><a href="#section-{i}">{s["title"]}</a></li>' for i, s in enumerate(self.sections))}
                <li><a href="#findings">Security Findings</a></li>
                <li><a href="#recommendations">Recommendations</a></li>
            </ul>
        </div>
        
        <div class="section" id="executive-summary">
            <h2>📊 Executive Summary</h2>
            <p>{self.executive_summary or 'No executive summary provided.'}</p>
        </div>
'''
        
        # Add sections
        for i, section in enumerate(self.sections):
            html += f'''
        <div class="section" id="section-{i}">
            <h2>{section['title']}</h2>
            <p>{section['content']}</p>
        </div>
'''
        
        # Add findings
        html += '''
        <div class="section" id="findings">
            <h2>🔍 Security Findings</h2>
'''
        
        for finding in sorted(self.findings, key=lambda f: 
            {'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3, 'INFO': 4}.get(f.get('severity', 'INFO').upper(), 5)):
            
            severity = finding.get('severity', 'INFO').lower()
            html += f'''
            <div class="finding {severity}">
                <div class="finding-header">
                    <span class="finding-title">{finding['title']}</span>
                    <span class="severity-badge {severity}">{finding['severity'].upper()}</span>
                </div>
                <div class="finding-id">{finding['id']}</div>
                <div class="finding-description">{finding['description']}</div>
'''
            
            if finding.get('affected'):
                html += f'''
                <div class="finding-section">
                    <h4>Affected Assets</h4>
                    <p>{finding['affected']}</p>
                </div>
'''
            
            if finding.get('evidence'):
                html += f'''
                <div class="finding-section">
                    <h4>Evidence</h4>
                    <div class="code">{finding['evidence']}</div>
                </div>
'''
            
            if finding.get('recommendation'):
                html += f'''
                <div class="finding-section">
                    <h4>Recommendation</h4>
                    <p>{finding['recommendation']}</p>
                </div>
'''
            
            if finding.get('references'):
                html += f'''
                <div class="finding-section">
                    <h4>References</h4>
                    <p>{finding['references']}</p>
                </div>
'''
            
            html += '''
            </div>
'''
        
        html += '''
        </div>
        
        <div class="section" id="recommendations">
            <h2>✅ Recommendations Summary</h2>
            <p>Based on the findings above, the following actions are recommended:</p>
            <ul>
'''
        
        for finding in self.findings:
            if finding.get('recommendation'):
                html += f'''
                <li><strong>{finding['title']}:</strong> {finding['recommendation']}</li>
'''
        
        html += '''
            </ul>
        </div>
        
        <div class="footer">
            <p>Generated by SHIELD Security Framework</p>
            <p>This report is confidential and intended for authorized personnel only.</p>
        </div>
    </div>
</body>
</html>
'''
        
        if output_path:
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(html)
            print(f"  [+] Report saved: {output_path}")
        
        return html
    
    def generate_json(self, output_path: str = None) -> Dict:
        """Generate JSON report"""
        report = {
            'title': self.title,
            'metadata': self.metadata,
            'executive_summary': self.executive_summary,
            'statistics': {
                'total_findings': len(self.findings),
                'by_severity': {},
            },
            'sections': self.sections,
            'findings': self.findings,
        }
        
        # Count by severity
        for f in self.findings:
            sev = f.get('severity', 'INFO').upper()
            report['statistics']['by_severity'][sev] = \
                report['statistics']['by_severity'].get(sev, 0) + 1
        
        if output_path:
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(report, f, indent=2, ensure_ascii=False)
            print(f"  [+] Report saved: {output_path}")
        
        return report
    
    def generate_markdown(self, output_path: str = None) -> str:
        """Generate Markdown report"""
        md = f'''# {self.title}

**Generated:** {self.metadata['generated']}  
**Classification:** {self.metadata['classification']}

---

## Executive Summary

{self.executive_summary or 'No executive summary provided.'}

---

## Findings Summary

| Severity | Count |
|----------|-------|
'''
        
        severity_counts = {'CRITICAL': 0, 'HIGH': 0, 'MEDIUM': 0, 'LOW': 0, 'INFO': 0}
        for f in self.findings:
            sev = f.get('severity', 'INFO').upper()
            if sev in severity_counts:
                severity_counts[sev] += 1
        
        for sev, count in severity_counts.items():
            md += f'| {sev} | {count} |\n'
        
        md += '\n---\n\n'
        
        # Sections
        for section in self.sections:
            md += f'''## {section['title']}

{section['content']}

'''
        
        # Findings
        md += '## Security Findings\n\n'
        
        for finding in self.findings:
            md += f'''### {finding['id']}: {finding['title']}

**Severity:** {finding['severity'].upper()}

**Description:**  
{finding['description']}

'''
            if finding.get('affected'):
                md += f'''**Affected Assets:**  
{finding['affected']}

'''
            if finding.get('evidence'):
                md += f'''**Evidence:**
```
{finding['evidence']}
```

'''
            if finding.get('recommendation'):
                md += f'''**Recommendation:**  
{finding['recommendation']}

'''
            md += '---\n\n'
        
        if output_path:
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(md)
            print(f"  [+] Report saved: {output_path}")
        
        return md


def demo():
    """Generate demo report"""
    print("""
+==============================================================+
|     SHIELD SECURITY REPORT GENERATOR v1.0                    |
|          Professional Security Assessment Reports            |
+==============================================================+
    """)
    
    # Create report
    report = ReportGenerator("SHIELD Security Assessment Report")
    
    # Executive summary
    report.set_executive_summary("""
This security assessment was conducted to evaluate the security posture of the target environment. 
The assessment identified 3 critical, 2 high, 4 medium, and 2 low severity vulnerabilities.
Immediate action is recommended for critical findings to prevent potential security breaches.
    """)
    
    # Add sections
    report.add_section(
        "Scope and Methodology",
        """
The assessment covered the following areas:
- Network infrastructure security
- Web application security testing
- Authentication and access control
- Configuration review
- Vulnerability scanning

Testing was conducted using industry-standard tools and methodologies including OWASP Testing Guide and PTES.
        """
    )
    
    report.add_section(
        "Environment Overview",
        """
The target environment consists of:
- 3 web servers running Apache/Nginx
- 2 database servers (MySQL, PostgreSQL)
- 1 API gateway
- Active Directory for authentication
- Cloud-based infrastructure (AWS)
        """
    )
    
    # Add findings
    report.add_finding({
        'title': 'SQL Injection in Login Form',
        'severity': 'CRITICAL',
        'description': 'The login form is vulnerable to SQL injection attacks, allowing attackers to bypass authentication or extract database contents.',
        'affected': '/api/v1/auth/login',
        'evidence': "POST /api/v1/login\nusername=admin' OR '1'='1&password=test",
        'recommendation': 'Use parameterized queries or prepared statements. Implement input validation.',
        'references': 'OWASP SQL Injection Prevention Cheat Sheet'
    })
    
    report.add_finding({
        'title': 'Remote Code Execution via File Upload',
        'severity': 'CRITICAL',
        'description': 'The file upload functionality allows uploading of executable files without proper validation.',
        'affected': '/api/v1/upload',
        'evidence': 'Uploaded malicious.php was executed on server',
        'recommendation': 'Implement strict file type validation, use allowlist approach, and store uploads outside webroot.',
    })
    
    report.add_finding({
        'title': 'Missing Security Headers',
        'severity': 'MEDIUM',
        'description': 'Several important security headers are missing from HTTP responses.',
        'affected': 'All endpoints',
        'evidence': 'Missing: X-Frame-Options, X-Content-Type-Options, Content-Security-Policy',
        'recommendation': 'Add security headers to all HTTP responses.',
    })
    
    report.add_finding({
        'title': 'Outdated Software Versions',
        'severity': 'HIGH',
        'description': 'Several software components are running outdated versions with known vulnerabilities.',
        'affected': 'Apache 2.4.29, OpenSSL 1.0.2',
        'recommendation': 'Update all software to the latest stable versions.',
    })
    
    report.add_finding({
        'title': 'Weak Password Policy',
        'severity': 'MEDIUM',
        'description': 'The password policy allows weak passwords that can be easily guessed or brute-forced.',
        'affected': 'User authentication system',
        'recommendation': 'Implement strong password requirements: minimum 12 characters, complexity requirements, prevent common passwords.',
    })
    
    # Generate reports
    print("\n  [*] Generating reports...")
    
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    
    report.generate_html(f'security_report_{timestamp}.html')
    report.generate_json(f'security_report_{timestamp}.json')
    report.generate_markdown(f'security_report_{timestamp}.md')
    
    print("\n  [+] Reports generated successfully!")
    print(f"      - security_report_{timestamp}.html")
    print(f"      - security_report_{timestamp}.json")
    print(f"      - security_report_{timestamp}.md")


if __name__ == "__main__":
    demo()
