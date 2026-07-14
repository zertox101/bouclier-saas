from typing import List, Dict, Optional, Any
import json
import os
import random
import re
from datetime import datetime

import requests


def _extract_json(text: str) -> Optional[Dict[str, Any]]:
    if not text:
        return None
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", text, re.S)
        if match:
            try:
                return json.loads(match.group(0))
            except json.JSONDecodeError:
                return None
    return None


def _merge_analysis(base: Dict[str, Any], candidate: Dict[str, Any]) -> Dict[str, Any]:
    result = dict(base)
    if not isinstance(candidate, dict):
        return result

    summary = candidate.get("summary")
    if isinstance(summary, str) and summary.strip():
        result["summary"] = summary.strip()

    threats = candidate.get("threats")
    if isinstance(threats, list) and threats:
        result["threats"] = [str(item) for item in threats if item]

    recommendations = candidate.get("recommendations")
    if isinstance(recommendations, list) and recommendations:
        result["recommendations"] = [str(item) for item in recommendations if item]

    risk_score = candidate.get("riskScore")
    if isinstance(risk_score, (int, float)):
        result["riskScore"] = int(max(0, min(100, risk_score)))

    return result


class LLMClient:
    def __init__(self):
        self.provider = os.getenv("LLM_PROVIDER", "stub").strip().lower()
        self.base_url = os.getenv("LLM_BASE_URL", "").strip().rstrip("/")
        self.model = os.getenv("LLM_MODEL", "gemma4:latest").strip()
        self.api_key = os.getenv("LLM_API_KEY") or os.getenv("OPENAI_API_KEY") or ""
        self.timeout = float(os.getenv("LLM_TIMEOUT", "10"))
        self.system_prompt = os.getenv(
            "LLM_SYSTEM_PROMPT",
            "You are Sentinel, a SOC assistant. Be concise and actionable.",
        )

    @property
    def enabled(self) -> bool:
        return self.provider not in ("", "stub", "disabled")

    def chat(self, messages: List[Dict[str, str]]) -> Optional[str]:
        if not self.enabled:
            return None
        if self.provider == "ollama":
            return self._chat_ollama(messages)
        if self.provider in ("openai", "openai_compat", "vllm", "lmstudio"):
            return self._chat_openai(messages)
        return None

    def _chat_ollama(self, messages: List[Dict[str, str]]) -> Optional[str]:
        if not self.base_url:
            return None
        payload = {"model": self.model, "messages": messages, "stream": False}
        try:
            response = requests.post(
                f"{self.base_url}/api/chat",
                json=payload,
                timeout=self.timeout,
            )
            response.raise_for_status()
            data = response.json()
        except requests.RequestException:
            return None
        message = data.get("message", {})
        content = message.get("content")
        return content.strip() if isinstance(content, str) else None

    def _chat_openai(self, messages: List[Dict[str, str]]) -> Optional[str]:
        base_url = self.base_url or "https://api.openai.com"
        if not base_url:
            return None
        headers = {"Content-Type": "application/json"}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
        payload = {"model": self.model, "messages": messages}
        try:
            response = requests.post(
                f"{base_url}/v1/chat/completions",
                json=payload,
                headers=headers,
                timeout=self.timeout,
            )
            response.raise_for_status()
            data = response.json()
        except requests.RequestException:
            return None
        choices = data.get("choices") or []
        if not choices:
            return None
        content = (choices[0].get("message") or {}).get("content")
        return content.strip() if isinstance(content, str) else None

class LLMSecurityAnalyst:
    def __init__(self):
        self.role = "Senior SOC Analyst (AI)"
        self.client = LLMClient()
        self.knowledge_base = {
            "ddos": "Distributed Denial of Service: Multiple compromised systems attacking a target.",
            "ssh_brute": "Repeated failed SSH login attempts indicating a brute-force attack.",
            "mitm": "Man-in-the-Middle: Attacker intercepting communication between two parties.",
            "sql_injection": "Malicious SQL statements inserted into entry fields for execution."
        }

    def call_llm(self, prompt: str, system_prompt: str = None, timeout: float = None) -> str:
        """General purpose LLM call for strategic briefings and analysis."""
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        if timeout is not None:
            original = self.client.timeout
            self.client.timeout = timeout
            result = self.client.chat(messages) or "Neural link failed."
            self.client.timeout = original
            return result
        return self.client.chat(messages) or "Neural link failed."
        
    def analyze_with_correlation(self, event: Dict, past_events: List, insights: List) -> Dict:
        """
        AI-driven deep correlation analysis.
        """
        if not self.client.enabled:
            # Heuristic summary if AI is disabled
            summary = f"Detected {event.get('event_type')} from {event.get('sourceIp')}."
            if insights:
                summary += f" Correlation Alert: {insights[0]['message']}"
            return {
                "summary": summary,
                "threat_level": "high" if insights else "medium",
                "attack_pattern": "campaign" if any(i["type"] == "ATTACK_CAMPAIGN" for i in insights) else "single",
                "attacker_profile": "unknown",
                "recommended_action": "Review firewall logs and block source IP."
            }

        prompt_messages = [
            {"role": "system", "content": "You are a senior cyber threat analyst. Return JSON with: threat_level, attack_pattern, attacker_profile, correlation_summary, recommended_action."},
            {
                "role": "user", 
                "content": f"""
Analyze this event with context:
CURRENT EVENT: {json.dumps(event)}
PAST SIMILAR EVENTS: {json.dumps([e.payload for e in past_events])}
CORRELATION INSIGHTS: {json.dumps(insights)}
"""
            }
        ]
        
        raw_response = self.client.chat(prompt_messages)
        parsed = _extract_json(raw_response) if raw_response else None
        
        return parsed or {
            "summary": "AI Analysis Failed. Following heuristic protocol.",
            "threat_level": "high" if insights else "medium",
            "attack_pattern": "coordinated" if insights else "single",
            "attacker_profile": "unknown",
            "recommended_action": "Manual triage required."
        }

    def chat_response(self, user_query: str, context: Dict = None) -> str:
        """
        Generate a conversational AI response using Ollama (primary) or intelligent heuristics (fallback).
        """
        # ─── PROMPT 1: ELITE SYSTEM IDENTITY ────────────────────────────────
        SYSTEM_PROMPT = """
You are a senior cyber threat analyst and the brain of the BOUCLIER SIEM+AI platform.

You receive:
1. Current event telemetry
2. Past similar events (Memory context)
3. Correlation insights (Pattern detection)

MISSION:
- Transform raw alerts into high-context Cyber Intelligence.
- Identify if the current event is isolated, part of a campaign, or a coordinated attack.

OUTPUT REQUIREMENTS:
- threat_level: (low / medium / high / critical)
- attack_pattern: (single / campaign / coordinated / reconnaissance)
- attacker_profile: (script kiddie / botnet / APT / inside threat)
- correlation_summary: Summarize why this event is linked to others.
- recommended_action: Immediate tactical steps.

RESPONSE STYLE:
- Tactical, technical, and authoritative.
- Use MITRE ATT&CK mapping.
"""

        # ─── PROMPT 2: CONTEXT INJECTION ────────────────────────────────────
        context_str = ""
        if context:
            active = context.get("active_threats", [])
            stats = context.get("stats", {})
            if active:
                recent = active[-3:]
                threat_summary = ", ".join([
                    f"{t.get('type','?')} from {t.get('src_ip','?')} [{t.get('severity','?')}]"
                    for t in recent
                ])
                context_str = f"\n\n[LIVE SOC CONTEXT]\nActive threats: {threat_summary}\nTotal events: {len(active)}"
            if stats and isinstance(stats, dict):
                top_c = list(stats.keys())[:3]
                if top_c:
                    context_str += f"\nTop threat origins: {', '.join(top_c)}"

        # --- 1. Try Ollama direct call ---
        try:
            ollama_url = os.getenv("LLM_BASE_URL", "http://localhost:11434")
            model = os.getenv("LLM_MODEL", "gemma4:latest")

            payload = {
                "model": model,
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_query + context_str}
                ],
                "stream": False,
                "options": {"temperature": 0.7, "top_p": 0.9, "num_predict": 400}
            }
            resp = requests.post(
                f"{ollama_url}/api/chat",
                json=payload,
                timeout=float(os.getenv("LLM_TIMEOUT", "25"))
            )
            if resp.status_code == 200:
                data = resp.json()
                content = data.get("message", {}).get("content", "").strip()
                if content:
                    print(f"[Sentinel] Ollama OK -> {len(content)} chars | model={model}")
                    return content
        except Exception as e:
            print(f"[Sentinel] Ollama error: {e}")

        # --- 2. Intelligent Heuristic Fallbacks (works fully offline) ---
        q = user_query.lower()

        # PROMPT 3: Greeting
        if any(w in q for w in ["salam", "hello", "hi", "chkon", "merhba", "bonjour", "ahlan"]):
            return (
                "SENTINEL ONLINE - NEURAL CORE: ACTIVE\n\n"
                "Salam! SENTINEL v2.5 initialized. Neural core synchronized at 100% capacity.\n\n"
                "Capabilities available:\n"
                "- Threat analysis & MITRE ATT&CK mapping\n"
                "- Pentest guidance (OSCP-grade)\n"
                "- Real-time global intel via World Monitor\n"
                "- Tool orchestration (nmap, nikto, sqlmap...)\n"
                "- Incident response playbooks\n\n"
                "Perimeters: 100% | Status: SURVEILLANCE_ACTIVE\n"
                "Kifach n9der n3awnk today, Operator?"
            )

        # PROMPT 4: Network recon
        if any(w in q for w in ["nmap", "scan", "port", "recon", "reconnaissance", "network"]):
            return (
                "RECON PROTOCOL ACTIVATED - SENTINEL AI ANALYZING\n\n"
                "Essential NMAP Commands:\n"
                "  nmap -sV -O -T3 <target>          # Service + OS detection\n"
                "  nmap -sC -sV -p- <target>         # Full port + scripts\n"
                "  nmap -A --script vuln <target>     # Aggressive vuln scan\n"
                "  nmap -sS -T4 -Pn <target>         # Stealth SYN scan\n\n"
                "MITRE ATT&CK: T1046 - Network Service Scanning\n\n"
                "Launch from Shadow Root Labs or AI Pentester Hub for automated pipeline."
            )

        # PROMPT 5: DDoS
        if any(w in q for w in ["ddos", "denial", "flood", "botnet"]):
            return (
                "DDoS THREAT RESPONSE - SENTINEL AI DEFENSE\n\n"
                "Immediate Actions:\n"
                "- Enable rate limiting (nginx: limit_req_zone)\n"
                "- Activate geo-blocking for non-essential regions\n"
                "- Route traffic through scrubbing center\n"
                "- Alert ISP for upstream null-routing\n\n"
                "Detection:\n"
                "  netstat -n | grep SYN_RECV | wc -l\n\n"
                "MITRE ATT&CK: T1498 - Network DoS | T1499 - Endpoint DoS"
            )

        # PROMPT 6: Web vulnerabilities
        if any(w in q for w in ["sql", "injection", "sqli", "xss", "rce", "lfi", "vuln", "exploit"]):
            return (
                "WEB VULNERABILITY ASSESSMENT - SENTINEL AI INSIGHTS\n\n"
                "Critical Vulns & Mitigations:\n"
                "- SQLi -> Parameterized queries, WAF | MITRE: T1190\n"
                "- XSS  -> CSP headers, output encoding, DOMPurify\n"
                "- RCE  -> Patch immediately, disable dangerous functions\n"
                "- LFI  -> Disable allow_url_include, use whitelists\n\n"
                "Automated scan commands:\n"
                "  nikto -h <target>\n"
                "  sqlmap -u <url> --dbs\n\n"
                "Launch from AI Pentester Hub -> Tools tab"
            )

        # PROMPT 7: Incident response
        if any(w in q for w in ["incident", "breach", "compromis", "hack", "intrusion", "alert", "threat"]):
            return (
                "INCIDENT RESPONSE PLAYBOOK - SENTINEL AI COORDINATION\n\n"
                "Phase 1 - Containment (0-15 min):\n"
                "- Isolate affected host from network\n"
                "- Block source IP at perimeter firewall\n"
                "- Preserve logs (do not clear until forensics)\n\n"
                "Phase 2 - Investigation (15-60 min):\n"
                "- Check INCIDENT_TRIAGE page for correlated alerts\n"
                "- Review /var/log/auth.log & firewall logs\n"
                "- Run: netstat -tulpn  (check suspicious listeners)\n\n"
                "Phase 3 - Recovery:\n"
                "- Restore from clean backup\n"
                "- Patch vulnerability + reset compromised credentials\n\n"
                "MITRE ATT&CK: Reference navigator at /mitre page"
            )

        # PROMPT 8: Default capability overview
        return (
            "SENTINEL CORE - ONLINE // NEURAL LINK: STABLE\n\n"
            "Ask me about:\n"
            "- Threats: DDoS, SQLi, XSS, RCE, ransomware\n"
            "- Recon: nmap, masscan, amass, theHarvester\n"
            "- Vuln scan: nikto, sqlmap, nuclei\n"
            "- Incident response: containment, forensics\n"
            "- Global intel: World Monitor queries\n"
            "- MITRE ATT&CK: technique lookup & mapping\n\n"
            "Status: ALL_SYSTEMS_GO | Power: NOMINAL"
        )

    def analyze_tool_output(self, tool_name: str, logs: str) -> Dict:
        """
        Analyze the output logs of a security tool using Sentinel reasoning.
        """
        try:
            from sentinel_agent import sentinel_agent
            analysis = sentinel_agent.analyze_findings({"tool_name": tool_name, "logs_preview": logs[:500]}, logs)
            
            # Formulate the response in the format frontend expects
            return {
                "summary": f"Sentinel AI Analysis for {tool_name}",
                "reasoning": analysis.get("reasoning"),
                "threats": [analysis.get("mitre_mapping", "Analyzing attack vectors...")],
                "recommendations": ["Review detailed reasoning for situational awareness."],
                "riskScore": 75 # Dynamic based on reasoning in real LLM
            }
        except Exception as e:
            print(f"Tool Analysis Error: {e}")
            return self._heuristic_tool_analysis(tool_name, logs)

    def _heuristic_tool_analysis(self, tool_name: str, logs: str) -> Dict:
        logs_lower = logs.lower()
        threats = []
        recommendations = []
        risk_score = 0
        
        # Simulated intelligent analysis logic based on keywords
        if "vulnerability" in logs_lower or "exploit" in logs_lower:
            threats.append("Potential vulnerabilities detected in scan results.")
            risk_score += 30
        
        if "open port" in logs_lower or "listening" in logs_lower:
            threats.append("Open ports discovered - potential attack surface.")
            recommendations.append("Review and close unnecessary ports (e.g., 21, 23, 445).")
            risk_score += 20
            
        if "sql injection" in logs_lower or "sqli" in logs_lower:
            threats.append("Critical: SQL Injection vulnerability found.")
            recommendations.append("Implement parameterized queries immediately.")
            risk_score += 40
            
        if "xss" in logs_lower or "cross-site scripting" in logs_lower:
            threats.append("Cross-Site Scripting (XSS) vector identified.")
            recommendations.append("Sanitize all user inputs and escape outputs.")
            risk_score += 35
            
        if "outdated" in logs_lower or "old version" in logs_lower:
            threats.append("Outdated software version detected.")
            recommendations.append("Update affecting software to latest stable version.")
            risk_score += 15
            
        if "ssl" in logs_lower or "tls" in logs_lower:
            threats.append("Weak SSL/TLS configuration.")
            recommendations.append("Enforce TLS 1.2 or 1.3 and disable weak ciphers.")
            risk_score += 10

        # Contextual analysis based on tool
        if tool_name.lower() == "nmap":
            if "80/tcp" in logs_lower or "443/tcp" in logs_lower:
                threats.append("Web server exposed.")
                recommendations.append("Ensure web server is behind a WAF (Web Application Firewall).")
        elif tool_name.lower() == "nikto":
             if "index" in logs_lower:
                  threats.append("Directory indexing might be enabled.")
                  recommendations.append("Disable directory listing in web server config.")

        # Default minimal score/threat
        if not threats:
            threats.append("No critical threats detected in current scan context.")
            recommendations.append("Continue regular scheduled scanning.")
            risk_score = 10
        
        # Normalize score
        risk_score = min(risk_score, 100)
        
        return {
            "summary": f"Sentinel AI analyzed {len(logs.splitlines())} lines of output from {tool_name}. Identified {len(threats)} potential issues.",
            "threats": threats,
            "recommendations": recommendations,
            "riskScore": risk_score
        }

    def _build_chat_messages(self, user_query: str, context: Dict[str, Any]) -> List[Dict[str, str]]:
        context_summary = {}
        active_threats = context.get("active_threats") or []
        if active_threats:
            context_summary["active_threats"] = [
                {
                    "type": threat.get("type"),
                    "severity": threat.get("severity"),
                    "src_ip": threat.get("src_ip"),
                    "country": threat.get("country"),
                }
                for threat in active_threats[-5:]
            ]
        if context.get("stats"):
            context_summary["stats"] = context.get("stats")

        prompt = (
            "Provide a concise SOC response. If data is missing, say so. "
            "Use short bullets when listing actions."
        )
        return [
            {"role": "system", "content": self.client.system_prompt},
            {"role": "system", "content": prompt},
            {
                "role": "user",
                "content": "Question: "
                + user_query
                + "\nContext: "
                + json.dumps(context_summary, ensure_ascii=True),
            },
        ]

    def _build_tool_messages(
        self, tool_name: str, logs: str, base: Dict[str, Any]
    ) -> List[Dict[str, str]]:
        instructions = (
            "Return JSON only with keys summary, threats, recommendations, riskScore. "
            "Use short strings for list items. riskScore must be 0-100."
        )
        return [
            {"role": "system", "content": self.client.system_prompt},
            {"role": "system", "content": instructions},
            {
                "role": "user",
                "content": "Tool: "
                + tool_name
                + "\nLogs:\n"
                + logs
                + "\nBaseline:\n"
                + json.dumps(base, ensure_ascii=True),
            },
        ]

# Global Instance
llm_service = LLMSecurityAnalyst()
