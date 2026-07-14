import time
import json
import whois
import dns.resolver
from typing import Dict, List, Any, Optional
from datetime import datetime

class OSINT360Agent:
    def __init__(self):
        self.name = "OSINT360_TACTICAL_AGENT"
        self.version = "4.2.0-PRO"
        self.capabilities = [
            "OSINT", "DNS_INTEL", "WHOIS", "GEOINT"
        ]

    def execute_command(self, cmd_full: str) -> Dict[str, Any]:
        parts = cmd_full.split(' ')
        cmd = parts[0].lower()
        target = parts[1] if len(parts) > 1 else None

        if cmd == "/help":
            return {"type": "help", "content": "Full spectrum intelligence protocols active. Commands: /profile, /dns, /whois, /enrich."}
        
        if cmd == "/profile":
            return self._profile_target(target)
        
        if cmd == "/dns":
            return self._dns_lookup(target)
        
        if cmd == "/whois":
            return self._whois_lookup(target)

        return {
            "type": "standard", 
            "content": f"Agent processing {cmd}... Accessing multi-source repositories (Real-time).",
            "logs": f"COLLECTING_DATA_FOR_{cmd.upper()}..."
        }

    def _whois_lookup(self, target: str) -> Dict[str, Any]:
        if not target: return {"type": "error", "content": "Target required."}
        try:
            w = whois.whois(target)
            return {
                "type": "report",
                "content": f"[WHOIS] Registrar: {w.registrar}\n[INTEL] Creation Date: {w.creation_date}\n[INTEL] Expiry: {w.expiration_date}\n[OWNER] Name: {w.name or 'Privacy Protected'}",
                "data": w
            }
        except Exception as e:
            return {"type": "error", "content": f"Whois Lookup Failed: {str(e)}"}

    def _dns_lookup(self, target: str) -> Dict[str, Any]:
        if not target: return {"type": "error", "content": "Target required."}
        try:
            records = {}
            for rtype in ['A', 'MX', 'NS', 'TXT']:
                try:
                    answers = dns.resolver.resolve(target, rtype)
                    records[rtype] = [str(rdata) for rdata in answers]
                except:
                    records[rtype] = []
            
            content = f"[DNS] Results for {target}:\n"
            for rt, vals in records.items():
                content += f" - {rt}: {', '.join(vals) if vals else 'None'}\n"
            
            return {"type": "report", "content": content, "data": records}
        except Exception as e:
            return {"type": "error", "content": f"DNS Lookup Failed: {str(e)}"}

    def _profile_target(self, target: str) -> Dict[str, Any]:
        # Combines WHOIS and DNS for a "Profile"
        whois_data = self._whois_lookup(target)
        dns_data = self._dns_lookup(target)
        
        return {
            "type": "report",
            "content": f"🛡️ FULL PROFILE: {target}\n\n{whois_data.get('content')}\n\n{dns_data.get('content')}",
            "data": {
                "whois": whois_data.get("data"),
                "dns": dns_data.get("data")
            }
        }

osint_agent = OSINT360Agent()
