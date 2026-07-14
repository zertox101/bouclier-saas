"""
Sentinel Tactical Agent
-----------------------
Advanced AI Agent implementing RAG (Retrieval Augmented Generation) and 
Hybrid Search capabilities for autonomous security analysis.
Connected via the SHIELD AI Gateway for Policy-Based Routing.
"""

import os
import json
import re
import time
import requests
from typing import List, Dict, Any

class SentinelTacticalAgent:
    def __init__(self, gateway_url: str = None, model: str = None):
        # Point to the AI Gateway (8200) instead of direct Ollama
        self.gateway_url = gateway_url or os.getenv("LLM_BASE_URL", "http://ai-gateway:8200")
        self.model = model or os.getenv("LLM_MODEL", "llama3.2:3b")
        
        self.kb_path = "/opt/tools/knowledge_base/mitre_attack.json"
        self._initialize_kb()

    def _initialize_kb(self):
        """Simulates a VectorDB index initialization."""
        os.makedirs(os.path.dirname(self.kb_path), exist_ok=True)
        if not os.path.exists(self.kb_path):
            sample_mitre = {
                "T1021.002": "SMB/Windows Admin Shares. Adversaries may use valid accounts to log into a remote system...",
                "T1190": "Exploit Public-Facing Application. Adversaries may attempt to exploit a vulnerability in an Internet-facing application...",
                "T1059": "Command and Scripting Interpreter. Adversaries may abuse command and script interpreters to execute commands.",
            }
            with open(self.kb_path, "w") as f:
                json.dump(sample_mitre, f)

    def hybrid_search(self, query: str) -> str:
        """Combines keyword matches with Semantic Context."""
        context = ""
        try:
            with open(self.kb_path, "r") as f:
                kb = json.load(f)
            for tech_id, description in kb.items():
                if tech_id.lower() in query.lower() or any(k in query.lower() for k in description.split()[:5]):
                    context += f"\n- {tech_id}: {description}"
        except:
            pass
        return context if context else "No direct MITRE mapping found in local KB."

    def analyze_findings(self, findings: Dict[str, Any], raw_log: str) -> Dict[str, Any]:
        """
        Enhanced Agent Execution Loop.
        Utilizes AI Gateway with 'security' intent for optimized model routing.
        """
        start_time = time.time()
        
        # 1. Retrieval Phase
        search_query = f"{findings.get('event_type', findings.get('target', ''))}"
        knowledge_context = self.hybrid_search(search_query)

        # 2. Reasoning Prompt
        prompt = f"""
        [ROLE: TACTICAL SECURITY ANALYST - REASONING MODE]
        [KNOWLEDGE_BASE: {knowledge_context}]
        
        DATA TO ANALYZE:
        {json.dumps(findings, indent=2)}
        
        YOUR INSTRUCTIONS:
        1. Show your internal reasoning process.
        2. Start with <thought> (logic).
        3. Follow with <analysis> (MITRE correlation).
        4. End with <recommendation> in JSON.
        """

        # 3. Inference via AI Gateway (with Intent Header)
        try:
            headers = {
                "X-Shield-Intent": "security",  # Triggers routing to DeepSeek if available
                "Content-Type": "application/json"
            }
            
            response = requests.post(
                f"{self.gateway_url}/api/generate",
                json={
                    "model": self.model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {"temperature": 0.1}
                },
                headers=headers,
                timeout=90
            )
            
            if response.status_code != 200:
                raw_output = f"<thought>Gateway Error: {response.status_code}</thought>"
            else:
                raw_output = response.json().get("response", "")
                
        except Exception as e:
            raw_output = f"<thought>Gateway Unreachable: {str(e)}</thought>"

        # 4. Extract Reasoning
        thought = self._extract_tag(raw_output, "thought")
        analysis = self._extract_tag(raw_output, "analysis")
        
        return {
            "agent_reasoning": thought,
            "mitre_context": analysis,
            "raw_output": raw_output,
            "metrics": {"latency": round(time.time() - start_time, 2)}
        }

    def _extract_tag(self, text: str, tag: str) -> str:
        pattern = f"<{tag}>(.*?)</{tag}>"
        match = re.search(pattern, text, re.DOTALL)
        return match.group(1).strip() if match else "No details extracted."

sentinel_agent = SentinelTacticalAgent()
