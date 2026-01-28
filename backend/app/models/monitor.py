from typing import Dict, List, Optional
from collections import defaultdict
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.models.sql import AlertEvent
import json

# Global state for real-time data
class SecurityMonitor:
    def __init__(self):
        self.packets = []
        self.events = []
        self.stats = defaultdict(int)
        self.traffic_by_country = defaultdict(int)
        self.severity_counts = {"Critique": 0, "Élevé": 0, "Moyen": 0}
        self.network_stats = {"CONNECT": 0, "REST": 0, "GET": 0, "POST": 0}
        self.is_monitoring = False
        self.ddos_detected = False
        self.attack_sources = []
        
        self.attack_sources = []
        
    def add_event(self, event_data: Dict, db: Session = None):
        """Add event to memory and optionally to DB"""
        # Memory (Limit 100)
        self.events.append(event_data)
        if len(self.events) > 100:
            self.events.pop(0)
            
        # Persistence
        if db:
            try:
                alert = AlertEvent(
                    src_ip=event_data.get("src_ip"),
                    dst_ip=event_data.get("dst_ip"),
                    dst_port=event_data.get("dst_port"),
                    type=event_data.get("type"),
                    severity=event_data.get("severity", "Moyen"),
                    details=event_data,
                    status="new"
                )
                db.add(alert)
                db.commit()
            except Exception as e:
                print(f"Failed to persist event: {e}")

        # Real-time Broadcast
        from app.services.redis_stream import stream_service
        try:
            # Sync with the SSE format expected by telemetry.py
            stream_data = {
                "id": event_data.get("id", ""),
                "type": event_data.get("type", "security_event"),
                "severity": event_data.get("severity", "info"),
                "message": event_data.get("message") or f"Signal from {event_data.get('src_ip')}",
                "sensor": "core_monitor",
                "src_ip": event_data.get("src_ip"),
                "dst_ip": event_data.get("dst_ip")
            }
            stream_service.publish("telemetry:events:default", stream_data)
        except Exception as e:
            print(f"Broadcast Failed: {e}")

                
    def load_history(self, db: Session):
        """Load recent events from DB on startup"""
        try:
            recents = db.query(AlertEvent).order_by(AlertEvent.timestamp.desc()).limit(50).all()
            for r in recents:
                self.events.insert(0, r.details)
        except Exception as e:
            print(f"Failed to load history: {e}")

class ChatMessage(BaseModel):
    message: str
    context: Dict = {}

class ToolAnalysisRequest(BaseModel):
    tool_name: str
    logs: str
    context: Dict = {}

# Singleton instance
monitor = SecurityMonitor()
