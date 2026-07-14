from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional, Dict
import uuid
import time
from datetime import datetime

app = FastAPI(title="SignalGuard RedOps Service", version="1.0.0")

# --- Models ---
class TargetProfile(BaseModel):
    name: str
    role: str
    department: str
    vulnerabilities: List[str]

class Scenario(BaseModel):
    id: str
    name: str
    description: str
    tactics: List[str]

class Campaign(BaseModel):
    id: str
    name: str
    target_group: str
    scenario_id: str
    status: str = "queued"
    created_at: datetime = datetime.now()

# --- In-Memory Store (Mock DB) ---
campaigns: Dict[str, Campaign] = {}

# --- Routes ---

@app.get("/health")
async def health():
    return {"status": "operational", "service": "redops"}

@app.post("/campaigns")
async def create_campaign(campaign_data: Dict, background_tasks: BackgroundTasks):
    campaign_id = f"CMP-{uuid.uuid4().hex[:8].upper()}"
    new_campaign = Campaign(
        id=campaign_id,
        name=campaign_data.get("name", "Unnamed Campaign"),
        target_group=campaign_data.get("target_group", "General"),
        scenario_id=campaign_data.get("scenario_id", "vishing-standard")
    )
    campaigns[campaign_id] = new_campaign
    
    # Simulate background execution
    background_tasks.add_task(run_campaign_simulation, campaign_id)
    
    return new_campaign

@app.get("/campaigns/{campaign_id}")
async def get_campaign(campaign_id: str):
    if campaign_id not in campaigns:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaigns[campaign_id]

async def run_campaign_simulation(campaign_id: str):
    """Background task to simulate campaign progress"""
    if campaign_id not in campaigns: return
    
    time.sleep(5)
    campaigns[campaign_id].status = "in-progress"
    
    # In a real system, this would trigger voice clones, generate emails, etc.
    time.sleep(30)
    campaigns[campaign_id].status = "completed"

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
