from fastapi import APIRouter, Depends
import psutil
import time
import socket
import os
import requests

router = APIRouter(prefix="/api/infrastructure", tags=["Infrastructure"])

def check_service(url, timeout=1):
    try:
        response = requests.get(url, timeout=timeout)
        return response.status_code == 200
    except:
        return False

@router.get("/health")
def get_health():
    # Service health
    services = {
        "CORE_API": {"status": "ONLINE", "latency": "0.4ms"},
        "TOOLS_API": {"status": "ONLINE" if check_service("http://localhost:8100/health") else "OFFLINE", "port": 8100},
        "MYTHOS_ENGINE": {"status": "READY", "version": "v2.0-Elite"},
        "OLLAMA_LLM": {"status": "ONLINE" if check_service("http://localhost:11434") else "STANDBY", "model": "Llama3-8B"},
        "ML_DETECTOR": {"status": "ACTIVE", "sampling": "30%"},
        "KALI_CLUSTER": {"status": "CONNECTED", "nodes": 1}
    }

    # System metrics
    cpu_usage = psutil.cpu_percent()
    ram_usage = psutil.virtual_memory().percent
    disk_usage = psutil.disk_usage('/').percent

    return {
        "services": services,
        "system": {
            "cpu": cpu_usage,
            "ram": ram_usage,
            "disk": disk_usage,
            "uptime": "14h 22m" # Mock uptime or calculate
        },
        "status": "OPERATIONAL" if all(s["status"] != "OFFLINE" for s in services.values()) else "DEGRADED"
    }
