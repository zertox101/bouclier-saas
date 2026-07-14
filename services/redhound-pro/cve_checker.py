import requests
import sqlite3
import os
from datetime import datetime

class CVEChecker:
    def __init__(self, socketio=None):
        self.socketio = socketio
        self.db_path = "cve_cache.db"
        self.init_db()
    
    def init_db(self):
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()
        c.execute("""
            CREATE TABLE IF NOT EXISTS cve_cache (
                cve_id TEXT PRIMARY KEY,
                description TEXT,
                cvss_score REAL,
                severity TEXT,
                last_updated TEXT
            )
        """)
        conn.commit()
        conn.close()
    
    def check_service(self, service_info):
        if not service_info or service_info.get('name') == 'unknown':
            return []
        
        service_name = service_info.get('name', '')
        service_version = service_info.get('version', '')
        
        cves = []
        
        try:
            api_cves = self.fetch_from_nvd(service_name, service_version)
            if api_cves:
                cves.extend(api_cves)
        except Exception as e:
            if self.socketio:
                self.socketio.emit('log', {'message': f'NVD API error'})
        
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()
        c.execute("SELECT * FROM cve_cache WHERE cve_id LIKE ?", (f'%{service_name.upper()}%',))
        local_cves = c.fetchall()
        
        for cve in local_cves:
            cves.append({
                'id': cve[0],
                'description': cve[1][:100],
                'cvss_score': cve[2],
                'severity': cve[3]
            })
        
        conn.close()
        return cves[:5]
    
    def fetch_from_nvd(self, service_name, service_version):
        url = "https://services.nvd.nist.gov/rest/json/cves/2.0"
        params = {
            'keywordSearch': f"{service_name} {service_version}" if service_version else service_name,
            'resultsPerPage': 5
        }
        
        try:
            response = requests.get(url, params=params, timeout=10)
            if response.status_code == 200:
                data = response.json()
                cves = []
                for vuln in data.get('vulnerabilities', []):
                    cve = vuln.get('cve', {})
                    metrics = cve.get('metrics', {})
                    cvss = metrics.get('cvssMetricV31', [{}])[0].get('cvssData', {})
                    
                    cves.append({
                        'id': cve.get('id', ''),
                        'description': cve.get('descriptions', [{}])[0].get('value', '')[:150],
                        'cvss_score': cvss.get('baseScore', 0),
                        'severity': cvss.get('baseSeverity', 'UNKNOWN')
                    })
                    
                    self.cache_cve(cves[-1])
                
                return cves
        except:
            pass
        
        return []
    
    def cache_cve(self, cve_data):
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()
        try:
            c.execute("""
                INSERT OR REPLACE INTO cve_cache 
                (cve_id, description, cvss_score, severity, last_updated)
                VALUES (?, ?, ?, ?, ?)
            """, (cve_data.get('id'),
                  cve_data.get('description'),
                  cve_data.get('cvss_score'),
                  cve_data.get('severity'),
                  datetime.now().isoformat()))
            conn.commit()
        except:
            pass
        conn.close()
