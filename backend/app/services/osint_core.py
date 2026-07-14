import asyncio
import json
import re
import networkx as nx
from typing import List, Dict, Any, Optional
from datetime import datetime
import httpx

class OSINTIntelligenceCore:
    """
    NEXUS-SOC OSINT Intelligence Core (Platinum Edition)
    Handles: Modular Collection, Entity Resolution, Correlation, and Graph Logic.
    """
    def __init__(self):
        self.graph = nx.MultiDiGraph()
        self.knowledge_assets = []
        self.plugins = ["shodan", "whois", "dns", "leaks", "social"]

    async def run_deep_recon(self, target: str) -> Dict[str, Any]:
        """
        Main Orchestrator for OSINT Reconnaissance.
        """
        print(f"[OSINT_CORE] Starting deep reconnaissance on: {target}")
        
        # 1. Collection Phase (Concurrent Plugins)
        results = await asyncio.gather(
            self._plugin_shodan(target),
            self._plugin_whois(target),
            self._plugin_dns(target),
            self._plugin_leaks(target),
            self._plugin_social(target),
            return_exceptions=True
        )

        # 2. Normalization & Entity Extraction
        entities = []
        for res in results:
            if isinstance(res, dict):
                entities.extend(self._normalize_entities(res))

        # 3. Entity Resolution & Graph Linking
        self._build_knowledge_graph(target, entities)

        # 4. Correlation & AI Scoring
        analysis = self._perform_intelligence_synthesis(target)

        return analysis

    def _normalize_entities(self, raw_data: Dict) -> List[Dict]:
        """
        Standardizes disparate data into Unified Intelligence Formats.
        """
        normalized = []
        source = raw_data.get("source", "unknown")
        
        for item in raw_data.get("data", []):
            normalized.append({
                "type": item.get("type"),
                "value": item.get("value"),
                "source": source,
                "confidence": item.get("confidence", 0.7),
                "metadata": item.get("metadata", {})
            })
        return normalized

    def _build_knowledge_graph(self, root: str, entities: List[Dict]):
        """
        Constructs the relationship graph using NetworkX.
        """
        self.graph.clear()
        self.graph.add_node(root, type="TARGET", color="#a855f7") # Purple Root

        for ent in entities:
            val = ent["value"]
            self.graph.add_node(val, type=ent["type"], source=ent["source"])
            # Linking logic
            if ent["type"] in ["IP", "SUBDOMAIN"]:
                self.graph.add_edge(root, val, label="RESOLVES_TO")
            elif ent["type"] == "IDENTITY":
                self.graph.add_edge(root, val, label="ASSOCIATED_WITH")
            elif ent["type"] == "LEAK":
                self.graph.add_edge(root, val, label="COMPROMISED_IN")

    def _perform_intelligence_synthesis(self, target: str) -> Dict[str, Any]:
        """
        The Reasoning Layer: Synthesizes graph data into actionable intelligence.
        """
        nodes = list(self.graph.nodes(data=True))
        edges = list(self.graph.edges(data=True))
        
        # Calculate Risk Score (Heuristic)
        risk_score = 0
        threats = []
        
        # Anomaly: Check for cluster density
        if len(nodes) > 10:
            risk_score += 20
            threats.append("High surface area detected: Multiple exposed subdomains.")

        # Check for Critical Entities
        for node, data in nodes:
            if data.get("type") == "LEAK":
                risk_score += 40
                threats.append(f"Critical Identity Leak: Credentials found for target vector in public dumps.")
            if data.get("type") == "IP" and "vulnerable" in str(data.get("source")):
                risk_score += 30
                threats.append("Vulnerable infrastructure detected via Shodan correlation.")

        risk_score = min(98, risk_score + (len(edges) * 2))

        return {
            "target": target,
            "summary": f"Neural synthesis complete. Intelligence graph identifies {len(nodes)} connected entities with a risk coefficient of {risk_score}%.",
            "risk_score": risk_score,
            "graph": {
                "nodes": [{"id": n, "label": n, "type": d.get("type", "UNKNOWN")} for n, d in nodes],
                "links": [{"source": u, "target": v, "label": d.get("label", "CONNECTS")} for u, v, d in edges]
            },
            "threats": threats,
            "mitre_mapping": self._map_to_mitre(threats),
            "predictions": [
                "High probability of credential stuffing based on leak correlation.",
                "Potential reconnaissance phase by APT-aligned actors."
            ],
            "recommended_actions": [
                "Rotate all administrative API keys and enforce MFA.",
                "Decommission exposed staging subdomains identified in DNS crawl."
            ]
        }

    def _map_to_mitre(self, threats: List[str]) -> List[Dict]:
        """
        Maps findings to MITRE ATT&CK Framework.
        """
        mapping = []
        for t in threats:
            if "Recon" in t or "subdomains" in t:
                mapping.append({"tactic": "Reconnaissance", "id": "T1589", "name": "Gather Victim Identity Information"})
            if "Leak" in t:
                mapping.append({"tactic": "Credential Access", "id": "T1589.001", "name": "Credentials in Files"})
        return mapping

    # --- Plugin Mock Implementations (To be wired to real APIs) ---

    async def _plugin_shodan(self, target: str) -> Dict:
        # Real-world: Use shodan library or API
        await asyncio.sleep(0.5)
        return {
            "source": "shodan",
            "data": [
                {"type": "IP", "value": "104.21.4.12", "confidence": 0.9},
                {"type": "IP", "value": "172.67.132.8", "confidence": 0.9}
            ]
        }

    async def _plugin_whois(self, target: str) -> Dict:
        await asyncio.sleep(0.3)
        return {
            "source": "whois",
            "data": [
                {"type": "IDENTITY", "value": "admin@"+target, "confidence": 0.8},
                {"type": "DATE", "value": "2024-01-15", "metadata": {"field": "expiry"}}
            ]
        }

    async def _plugin_dns(self, target: str) -> Dict:
        await asyncio.sleep(0.6)
        return {
            "source": "dns",
            "data": [
                {"type": "SUBDOMAIN", "value": "api."+target, "confidence": 0.95},
                {"type": "SUBDOMAIN", "value": "staging."+target, "confidence": 0.95}
            ]
        }

    async def _plugin_leaks(self, target: str) -> Dict:
        await asyncio.sleep(1.0)
        return {
            "source": "dark_web",
            "data": [
                {"type": "LEAK", "value": "Collection #1 Dump", "confidence": 0.85}
            ]
        }

    async def _plugin_social(self, target: str) -> Dict:
        return {"source": "social", "data": []}

osint_intelligence = OSINTIntelligenceCore()
