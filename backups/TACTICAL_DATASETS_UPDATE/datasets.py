from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import os

router = APIRouter(prefix="/api/datasets", tags=["Datasets Intelligence"])

class DatasetItem(BaseModel):
    name: str
    year: str
    type: str
    category: str
    status: Optional[str] = None
    download_url: Optional[str] = None
    description: Optional[str] = None
    size: Optional[str] = None
    integrated: bool = False

DATASETS_REGISTRY = [
    # IoT Datasets
    {
        "name": "CIC-YNU-IoTMal 2026",
        "year": "2026",
        "type": "Malware/IoT",
        "category": "IoT Datasets",
        "status": "New",
        "download_url": "https://www.unb.ca/cic/datasets/iotmal-2026.html",
        "description": "Latest IoT malware behavior dataset including zero-day patterns.",
        "size": "4.2 GB"
    },
    {
        "name": "Datasense IIoT (IoT) 2025",
        "year": "2025",
        "type": "Industrial IoT",
        "category": "IoT Datasets",
        "status": "Premium",
        "download_url": "https://www.unb.ca/cic/datasets/iiot-2025.html",
        "description": "Comprehensive Industrial IoT attack and normal traffic dataset.",
        "size": "12.8 GB"
    },
    {
        "name": "APT IIoT 2024",
        "year": "2024",
        "type": "APT/IoT",
        "category": "IoT Datasets",
        "download_url": "https://www.unb.ca/cic/datasets/cicada-iiot-2024.html",
        "description": "Advanced Persistent Threat (APT) scenarios in IoT environments.",
        "size": "8.5 GB"
    },
    {
        "name": "CICIoMT2024",
        "year": "2024",
        "type": "Medical IoT",
        "category": "IoT Datasets",
        "download_url": "https://www.unb.ca/cic/datasets/iomt-2024.html",
        "description": "Internet of Medical Things security evaluation dataset.",
        "size": "3.1 GB"
    },
    # IDS Datasets
    {
        "name": "UNSW-NB15 2024",
        "year": "2024",
        "type": "Intrusion Detection",
        "category": "IDS Datasets",
        "status": "Popular",
        "download_url": "https://research.unsw.edu.au/projects/unsw-nb15-dataset",
        "description": "Modern network traffic including 9 types of attacks.",
        "size": "2.1 GB"
    },
    {
        "name": "CIC-IDS 2017",
        "year": "2017",
        "type": "Classic IDS",
        "category": "IDS Datasets",
        "status": "Core",
        "download_url": "https://www.unb.ca/cic/datasets/ids-2017.html",
        "description": "The gold standard for IDS evaluation. Balanced benign and attack traffic.",
        "size": "50 GB"
    },
    # LLM
    {
        "name": "SBAN datasets 2025",
        "year": "2025",
        "type": "LLM Security",
        "category": "Large Language Models",
        "status": "New",
        "description": "Security benchmarks for Adversarial Networks and LLMs.",
        "size": "1.5 GB"
    },
    # Malware
    {
        "name": "CIC MalMem 2022",
        "year": "2022",
        "type": "Memory Forensics",
        "category": "Malware Analysis",
        "download_url": "https://www.unb.ca/cic/datasets/malmem-2022.html",
        "description": "Obfuscated malware detection using memory forensics.",
        "size": "1.2 GB"
    }
]

# We redefine the mapping to check file existence locally
DATASET_FILES = {
    "CIC-IDS 2017": "cicids2017_sample.csv",
    "CIC-YNU-IoTMal 2026": "iotmal2026_sample.csv",
    "CIC MalMem 2022": "malmem2022_sample.csv",
    "UNSW-NB15 2024": "unsw_nb15_sample.csv",
}

def _check_integration(name: str) -> bool:
    file_name = DATASET_FILES.get(name)
    if not file_name: return False
    # Path relative to backend root
    data_path = os.path.join(os.getcwd(), "app", "ml", "data", file_name)
    return os.path.exists(data_path)

@router.get("/", response_model=List[DatasetItem])
async def get_datasets():
    """Returns the full registry of available cybersecurity datasets with local integration status."""
    results = []
    for ds in DATASETS_REGISTRY:
        item = ds.copy()
        item["integrated"] = _check_integration(ds["name"])
        results.append(item)
    return results

@router.get("/{name}", response_model=DatasetItem)
async def get_dataset_details(name: str):
    """Returns detailed metadata for a specific dataset."""
    for ds in DATASETS_REGISTRY:
        if ds["name"].lower() == name.lower():
            item = ds.copy()
            item["integrated"] = _check_integration(ds["name"])
            return item
    raise HTTPException(status_code=404, detail="Dataset not found")

@router.post("/integrate/{name}")
async def integrate_dataset(name: str):
    """
    Simulates the integration/download of a dataset into the local AI pipeline.
    In a real scenario, this would trigger an async download and preprocessing task.
    """
    # Logic to verify if dataset exists in registry
    ds_exists = any(ds["name"].lower() == name.lower() for ds in DATASETS_REGISTRY)
    if not ds_exists:
        raise HTTPException(status_code=404, detail="Dataset not found in registry")
    
    return {
        "status": "Integration started",
        "dataset": name,
        "tasks": [
            "Initializing secure stream...",
            "Verifying SHA-256 checksum...",
            "Parsing feature vectors...",
            "Injecting into training pipeline..."
        ]
    }
