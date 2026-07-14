import os
import asyncio
from typing import Dict, Any

try:
    from mcp.client.sse import sse_client
    from mcp.client.session import ClientSession
except ImportError:
    sse_client = None

MCP_URL = os.getenv("MCP_TOOLKIT_URL", "http://mcp-toolkit:8000/sse")

async def _fetch_intel(query: str, param: str) -> str:
    """Connect to the fastmcp SSE toolkit to fetch context."""
    if not sse_client:
        return "MCP Client not installed. Ensure mcp package is in requirements."
        
    try:
        async with sse_client(MCP_URL) as streams:
            async with ClientSession(streams[0], streams[1]) as session:
                await session.initialize()
                
                # We can call the specific tool based on input
                # For demo logic, we'll try to explain Mitre technique or generate Nmap
                if query == "mitre":
                    result = await session.call_tool("explain_mitre_technique", {"technique_id": param})
                elif query == "nmap":
                    result = await session.call_tool("generate_nmap_command", {"target": param, "intensity": "standard"})
                elif query == "cve":
                    result = await session.call_tool("get_cve_details", {"cve_id": param})
                else:
                    return f"Unknown MCP tool request: {query}"
                    
                if result and result.content:
                    return result.content[0].text
                return "No data returned from MCP tool."
    except Exception as e:
        return f"MCP Toolkit Error: {str(e)}"

def get_mcp_context(event_data: Dict[str, Any]) -> str:
    """
    Synchronous wrapper to query the MCP server for tactical intel.
    Used by the Sentinel Agent to augment RAG memory.
    """
    event_str = str(event_data).lower()
    intel = []
    
    # Simple heuristic to query MCP tools based on event details
    if "t1046" in event_str or "t1110" in event_str or "t1059" in event_str:
        tid = "T1046" if "t1046" in event_str else ("T1110" if "t1110" in event_str else "T1059")
        try:
            res = asyncio.run(_fetch_intel("mitre", tid))
            intel.append(f"[MCP-Mitre-Intel]: {res}")
        except: pass
        
    if "cve-" in event_str:
        import re
        cve_match = re.search(r'(cve-\d{4}-\d{4,7})', event_str)
        if cve_match:
            try:
                res = asyncio.run(_fetch_intel("cve", cve_match.group(1).upper()))
                intel.append(f"[MCP-CVE-Intel]: {res}")
            except: pass
            
    if "scan" in event_str or "nmap" in event_str:
        try:
            target = event_data.get("src_ip", "TARGET_IP")
            res = asyncio.run(_fetch_intel("nmap", target))
            intel.append(f"[MCP-Offensive-Intel]: Suggested Nmap Command: {res}")
        except: pass

    if not intel:
        intel.append("[MCP-Toolkit]: Ready for advanced Red/Blue team context queries.")
        
    return "\n".join(intel)
