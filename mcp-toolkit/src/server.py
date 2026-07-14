from fastmcp import FastMCP
import httpx
import json

# Initialize FastMCP Server
mcp = FastMCP("Bouclier Security Toolkit")

@mcp.tool()
async def get_cve_details(cve_id: str) -> str:
    """Get details about a specific CVE (Common Vulnerabilities and Exposures). Useful for both Red and Blue Teams.
    Args:
        cve_id: The CVE ID (e.g., 'CVE-2021-44228')
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"https://cveawg.mitre.org/api/cve/{cve_id}")
            if response.status_code == 200:
                data = response.json()
                descriptions = data.get("containers", {}).get("cna", {}).get("descriptions", [])
                if descriptions:
                    return f"{cve_id} Details: {descriptions[0].get('value')}"
                return f"{cve_id} found but no description available."
            return f"Information not found for {cve_id}."
    except Exception as e:
        return f"Error retrieving CVE details: {str(e)}"

@mcp.tool()
def generate_nmap_command(target: str, intensity: str = "standard") -> str:
    """Red Team Tool: Generates an optimal Nmap command based on the desired intensity.
    Args:
        target: The IP or domain to scan.
        intensity: 'stealth', 'standard', or 'aggressive'.
    """
    if intensity == "stealth":
        return f"nmap -sS -T2 -p 22,80,443 -f {target}"
    elif intensity == "aggressive":
        return f"nmap -A -T4 -p- --min-rate 1000 {target}"
    return f"nmap -sC -sV -p- -T3 {target}"

@mcp.tool()
def explain_mitre_technique(technique_id: str) -> str:
    """Blue/Red Team Tool: Explain a MITRE ATT&CK technique by its ID.
    Args:
        technique_id: The MITRE Technique ID (e.g., 'T1059')
    """
    db = {
        "T1046": "Network Service Scanning: Adversaries may attempt to get a listing of services executing on remote hosts and local networks.",
        "T1059": "Command and Scripting Interpreter: Adversaries may abuse command and script interpreters to execute commands, scripts, or binaries.",
        "T1110": "Brute Force: Adversaries may use brute force techniques to gain access to accounts.",
        "T1083": "File and Directory Discovery: Adversaries may enumerate files and directories or may search in specific locations of a host or network shares."
    }
    return db.get(technique_id.upper(), f"Technique {technique_id} is recognized as a potential offensive behavior, but specific details are not in the local cache.")

@mcp.tool()
def analyze_log_entry(log_line: str) -> str:
    """Blue Team Tool: Analyze a raw log entry for IOCs or malicious patterns.
    Args:
        log_line: The raw syslog or web proxy log line.
    """
    lower = log_line.lower()
    if "union select" in lower or "1=1" in lower:
        return "CRITICAL: SQL Injection pattern detected in log. Action: Block source IP immediately."
    if "passwd" in lower or "/etc/" in lower:
        return "HIGH: Potential Path Traversal or LFI attempt detected."
    if "nmap" in lower or "nikto" in lower:
        return "WARNING: Automated vulnerability scanner activity identified."
    return "INFO: Log line appears nominal, no obvious malicious patterns matched."

if __name__ == "__main__":
    # Start the MCP server using SSE mapping to 0.0.0.0 for Docker access
    # the MCP inspector or any client can connect to this
    mcp.run()
