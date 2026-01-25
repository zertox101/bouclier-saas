
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import subprocess

app = FastAPI()

class AcademyToolRun(BaseModel):
    tool_id: str
    target_host: str # Resolved by backend, never user input
    params: dict
    allowed_tools: list[str]

@app.post("/tools/academy/run")
def run_academy_tool(req: AcademyToolRun):
    # 1. Double check allowlist
    if req.tool_id not in req.allowed_tools:
        raise HTTPException(403, "Tool not in allowlist")
    
    # 2. Safety Checks (Mock)
    if ".." in req.target_host or req.target_host.startswith("-"):
        raise HTTPException(400, "Invalid target format")

    # 3. Execution Mock
    # In real world, use python-nmap or subprocess with rigid args
    
    return {
        "tool": req.tool_id,
        "status": "success", 
        "output": f"Running {req.tool_id} against {req.target_host}...\n[SAFE MODE] Scan complete. Found 2 vulnerabilities."
    }
