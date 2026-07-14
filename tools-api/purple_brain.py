import json
import re
import os
import requests

from sentinel_agent import sentinel_agent

class PurpleBrain:
    def __init__(self):
        self.mitre_db = {
            "smb": {"id": "T1021.002", "name": "SMB/Windows Admin Shares", "tactic": "Lateral Movement"},
            "ssh": {"id": "T1021.004", "name": "SSH", "tactic": "Lateral Movement"},
            "http": {"id": "T1190", "name": "Exploit Public-Facing Application", "tactic": "Initial Access"},
            "sql": {"id": "T1190", "name": "SQL Injection", "tactic": "Initial Access"},
            "ftp": {"id": "T1021.001", "name": "Remote Service: FTP", "tactic": "Lateral Movement"},
        }

    def analyze_nmap_exploit(self, raw_output: str, target: str):
        """
        Analyzes Nmap + SearchSploit output to provide Purple Team reasoning.
        """
        findings = []
        mitre_mappings = []
        risk_score = 0
        
        # 1. Parse Open Ports & Services
        open_ports = re.findall(r"(\d+)/tcp\s+open\s+([\w-]+)", raw_output)
        
        for port, service in open_ports:
            finding = {
                "type": "open_port",
                "port": port,
                "service": service,
                "description": f"Port {port} ({service}) is exposed."
            }
            
            # Map to MITRE
            for key in self.mitre_db:
                if key in service.lower():
                    finding["mitre"] = self.mitre_db[key]
                    risk_score += 10
                    mitre_mappings.append(self.mitre_db[key]["id"])
            
            findings.append(finding)

        # 2. Parse Exploits (SearchSploit)
        exploit_matches = re.findall(r"Exploit Title\s+\|\s+Path\n[-]+\n(.*)", raw_output, re.DOTALL)
        exploit_count = 0
        if exploit_matches:
            exploit_lines = [l for l in exploit_matches[0].strip().split('\n') if '|' in l]
            exploit_count = len(exploit_lines)
            risk_score += (exploit_count * 15)

        # 3. Base Recommendations
        recommendations = []
        if any(f['port'] == "445" for f in findings):
            recommendations.append("Block Port 445 (SMB) immediately.")
        
        # 4. Integrate Advanced AI Agent (RAG + Benchmarking)
        findings_summary = {"ports": open_ports, "exploit_count": exploit_count, "target": target}
        agent_report = sentinel_agent.analyze_findings(findings_summary, raw_output)

        # 5. Generate Structured Report
        report = {
            "summary": f"Target {target} analysis complete. Risk Level: {'CRITICAL' if risk_score > 50 else 'HIGH' if risk_score > 20 else 'MEDIUM'}.",
            "threat_impact": risk_score,
            "metrics": agent_report["metrics"],
            "offensive_view": {
                "open_ports": len(findings),
                "potential_exploits": exploit_count,
            },
            "purple_view": {
                "mitre_techniques": list(set(mitre_mappings)),
                "ai_reasoning": agent_report["agent_reasoning"],
                "mitre_context": agent_report["mitre_context"],
                "recommendations": recommendations
            }
        }
        
        return report

purple_brain = PurpleBrain()
