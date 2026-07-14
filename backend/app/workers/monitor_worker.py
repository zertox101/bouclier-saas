import time
import json
import random
from datetime import datetime
from app.core.celery_app import celery

@celery.task(name="app.workers.monitor_worker.monitor_task")
def monitor_task():
    """
    Main background monitoring task. 
    Handles network scanning, AI analysis, Memory storage, and SIEM correlation.
    """
    from app.services.scanner import scan_network_connections, analyze_packet
    from app.services.llm import llm_service
    from app.services.memory import store_event, search_similar
    from app.services.correlation import correlate_events
    from app.models.monitor import monitor
    from app.core.database import SessionLocal, redis_client

    db = SessionLocal()
    try:
        # 1. Scan Network
        connections = scan_network_connections()
        
        for conn in connections:
            # 2. Heuristic Analysis
            analysis = analyze_packet(conn)
            
            if analysis["is_suspicious"]:
                s_ip = str(conn.get("src_ip", "0.0.0.0"))
                d_ip = str(conn.get("dst_ip", "0.0.0.0"))
                ctry = str(conn.get("country", "Local Network"))
                
                event_data = {
                    **conn,
                    "id": f"celery-{time.time()}-{s_ip}",
                    "event_type": analysis["alerts"][0],
                    "severity": analysis["severity"],
                    "attackType": analysis["alerts"][0],
                    "message": f"Suspicious Activity Detected: {analysis['alerts'][0]}",
                    "sourceIp": s_ip,
                    "targetIp": d_ip,
                    "sourceCountry": ctry,
                    "timestamp": datetime.now().isoformat()
                }

                # 3. Memory & Correlation Pipeline
                try:
                    # Search vector history
                    similar_events = search_similar(event_data, limit=5)
                    
                    # Run SIEM rules
                    correlation_insights = correlate_events(event_data, similar_events)
                    
                    # Deep AI Analysis with context
                    ai_intel = llm_service.analyze_with_correlation(event_data, similar_events, correlation_insights)
                    event_data["ai_analysis"] = ai_intel
                    
                    if correlation_insights:
                        event_data["correlations"] = correlation_insights
                        # Upgrade severity
                        if ai_intel.get("threat_level") == "critical" or any(c["severity"] == "critical" for c in correlation_insights):
                            event_data["severity"] = "critical"
                        else:
                            event_data["severity"] = "high"
                        event_data["message"] = f"[CELERY INTEL] {event_data['message']} - {ai_intel.get('attack_pattern', 'Campaign Linked')}"

                    # Store for future
                    store_event(event_data)
                except Exception as intel_err:
                    print(f"Worker Intel Error: {intel_err}")

                # 4. Final Persistence
                monitor.add_event(event_data, db)
                
                # 5. Push to Live Stream
                if redis_client:
                    redis_client.xadd("event_stream", {"payload": json.dumps(event_data)})
                    redis_client.publish("telemetry:events:default", json.dumps(event_data))

    except Exception as e:
        print(f"Monitor Worker Error: {e}")
    finally:
        db.close()


