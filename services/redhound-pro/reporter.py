import json
import os
import time

class Reporter:
    def __init__(self):
        self.base_dir = "scans/reports"
        os.makedirs(self.base_dir, exist_ok=True)
    
    def save(self, target, data):
        timestamp = int(time.time())
        safe = target.replace('http://', '').replace('https://', '').replace('/', '_')
        path = f"{self.base_dir}/{safe}_{timestamp}.json"
        with open(path, 'w') as f:
            json.dump(data, f, indent=2)
        return path
    
    def export(self, data, fmt='html'):
        if fmt == 'html':
            html = f"""<!DOCTYPE html>
<html>
<head>
    <title>RedHound Pro Report - {data.get('target', 'N/A')}</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 20px; }}
        h1 {{ color: #d32f2f; }}
        table {{ border-collapse: collapse; width: 100%; }}
        th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
        th {{ background-color: #f2f2f2; }}
        .critical {{ background-color: #ffcdd2; }}
        .high {{ background-color: #ffebcc; }}
        .medium {{ background-color: #fff9c4; }}
        .low {{ background-color: #e8f5e9; }}
    </style>
</head>
<body>
    <h1>RedHound Pro Report</h1>
    <p><strong>Target:</strong> {data.get('target', 'N/A')}</p>
    <p><strong>Start Time:</strong> {data.get('start_time', 'N/A')}</p>
    <p><strong>Total Time:</strong> {data.get('total_time', 0)} seconds</p>
    <p><strong>Vulnerabilities Found:</strong> {len(data.get('findings', []))}</p>
    
    <h2>Findings</h2>
    <table>
        <tr><th>Type</th><th>URL</th><th>Payload</th><th>Severity</th><th>AI Confidence</th></tr>
"""
            for f in data.get('findings', []):
                severity = f.get('severity', 'Medium').lower()
                html += f"""
        <tr class="{severity}">
            <td>{f.get('type', '')}</td>
            <td>{f.get('url', '')}</td>
            <td><code>{f.get('payload', '')[:50]}</code></td>
            <td>{f.get('severity', 'Medium')}</td>
            <td>{f.get('ai_confidence', 'N/A')}% ({f.get('ai_verdict', 'unknown')})</td>
        </tr>"""
            
            html += """
    </table>
</body>
</html>"""
            return html
        
        return json.dumps(data, indent=2)
