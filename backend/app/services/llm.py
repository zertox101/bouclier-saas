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
        self.model = os.getenv("LLM_MODEL", "llama3.2:3b").strip()
        self.api_key = os.getenv("LLM_API_KEY") or os.getenv("OPENAI_API_KEY") or ""
        self.timeout = float(os.getenv("LLM_TIMEOUT", "20"))
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
        
    def analyze_incident(self, event: Dict) -> Dict:
        """
        Simulate a deep LLM analysis of a specific security event.
        In production, this would call OpenAI/Anthropic API.
        """
        event_type = event.get("type", "Unknown").lower()
        severity = event.get("severity", "Low")
        src_ip = event.get("src_ip", "Unknown")
        
        # Prompt Engineering Simulation
        analysis = {
            "summary": f"Detected {event_type} activity from {src_ip}.",
            "impact_assessment": f"Severity level is {severity}. Potential for data exfiltration or service disruption.",
            "recommended_action": "Isolate the host immediately and review firewall logs.",
            "confidence_score": 0.85 + (random.random() * 0.14)
        }
        
        if "ssh" in event_type:
            analysis["recommended_action"] = "Block IP on port 22. Check authorized_keys for modifications."
            analysis["tactics"] = "MITRE ATT&CK T1110 - Brute Force"
        elif "ddos" in event_type:
            analysis["recommended_action"] = "Enable rate limiting and geo-blocking for non-essential regions."
            analysis["tactics"] = "MITRE ATT&CK T1498 - Network Denial of Service"
            
        return analysis

    def chat_response(self, user_query: str, context: Dict = None) -> str:
        """
        Generate a conversational response based on system state
        """
        if self.client.enabled:
            messages = self._build_chat_messages(user_query, context or {})
            response = self.client.chat(messages)
            if response:
                return response

        q = user_query.lower()
        
        if "threat" in q or "attack" in q:
            if context and context.get("active_threats"):
                 return f"I am currently tracking {len(context['active_threats'])} active threats. The most critical is a {context['active_threats'][0].get('type')} from {context['active_threats'][0].get('country')}."
            return "No active critical threats detected at this moment, but I am monitoring network traffic anomalies."
            
        if "status" in q:
            return "System Monitor: ONLINE. AI Detection Engine: ACTIVE. Sentinel Core: READY."
            
        if "analyze" in q:
            return "I can analyze specific logs. Please provide the Event ID or let me scan the latest traffic buffer."

        return "I am Sentinel, your AI Security Architect. I can help you investigate threats, analyze traffic patterns, or configure defense protocols."

    def analyze_tool_output(self, tool_name: str, logs: str) -> Dict:
        """
        Analyze the output logs of a security tool.
        Returns a structured analysis with summary, threats, recommendations, and risk score.
        """
        base = self._heuristic_tool_analysis(tool_name, logs)
        if self.client.enabled:
            messages = self._build_tool_messages(tool_name, logs, base)
            response = self.client.chat(messages)
            payload = _extract_json(response or "")
            if payload:
                return _merge_analysis(base, payload)
        return base

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
llm_engine = LLMSecurityAnalyst()
