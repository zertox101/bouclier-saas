from typing import Optional, Dict, Any, Union

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.sql import CorrelatedAlert, MlAlert, Incident
from app.services.prompt_guard import is_prompt_injection
from app.services.rag import rag_service
from app.services.redaction import redact_text

router = APIRouter()
public_router = APIRouter()


def require_db(db: Session = Depends(get_db)) -> Session:
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")
    return db


def _safe_dict(value: Any) -> Dict[str, Any]:
    return value if isinstance(value, dict) else {}


def _safe_list(value: Any) -> list:
    return value if isinstance(value, list) else []


def _build_last_event(
    alert: Union[CorrelatedAlert, MlAlert],
    alert_type: str,
) -> Dict[str, Any]:
    details = _safe_dict(alert.details)
    src_ip = details.get("src_ip")
    geoip = details.get("geoip")

    sequence: list = []
    if alert_type == "correlation":
        sequence = _safe_list(alert.sequence)
    else:
        sequence = _safe_list(details.get("sequence"))

    last = sequence[-1] if sequence else {}
    last_event = {
        "event_type": last.get("event_type"),
        "status": last.get("status"),
        "timestamp_epoch": last.get("timestamp_epoch") or alert.timestamp_epoch,
        "user": alert.user,
        "host": alert.host,
        "src_ip": src_ip,
    }

    if geoip:
        last_event["enrich"] = {"geoip": geoip}

    return last_event


def _alert_payload(alert: Union[CorrelatedAlert, MlAlert], alert_type: str) -> Dict[str, Any]:
    details = _safe_dict(alert.details)
    geoip = details.get("geoip")

    payload = {
        "id": f"{'corr' if alert_type == 'correlation' else 'ml'}-{alert.id}",
        "alert_type": alert_type,
        "timestamp_epoch": alert.timestamp_epoch,
        "user": alert.user,
        "host": alert.host,
        "evidence": {"last_event": _build_last_event(alert, alert_type)},
    }

    if alert_type == "correlation":
        payload.update(
            {
                "rule_id": alert.rule_name,
                "severity": alert.severity,
                "details": details,
            }
        )
    else:
        severity = "high"
        if alert.threshold is not None and alert.anomaly_score is not None:
            severity = "high" if alert.anomaly_score >= alert.threshold else "medium"
        payload.update(
            {
                "rule_id": "gru_anomaly",
                "severity": severity,
                "anomaly_score": alert.anomaly_score,
                "threshold": alert.threshold,
                "model_version": alert.model_version,
                "details": details,
            }
        )

    if geoip:
        payload["evidence"]["last_event"]["enrich"] = {"geoip": geoip}

    return payload


def _resolve_alert(alert_id: str, db: Session) -> Optional[Dict[str, Any]]:
    alert_type = None
    numeric_id = None

    if alert_id.startswith("corr-"):
        alert_type = "correlation"
        numeric_id = alert_id.replace("corr-", "")
    elif alert_id.startswith("ml-"):
        alert_type = "ml"
        numeric_id = alert_id.replace("ml-", "")

    if numeric_id and numeric_id.isdigit():
        alert_id_int = int(numeric_id)
        if alert_type == "correlation":
            alert = db.query(CorrelatedAlert).filter(CorrelatedAlert.id == alert_id_int).first()
            return _alert_payload(alert, "correlation") if alert else None
        if alert_type == "ml":
            alert = db.query(MlAlert).filter(MlAlert.id == alert_id_int).first()
            return _alert_payload(alert, "ml") if alert else None

    if alert_id.isdigit():
        alert_id_int = int(alert_id)
        alert = db.query(CorrelatedAlert).filter(CorrelatedAlert.id == alert_id_int).first()
        if alert:
            return _alert_payload(alert, "correlation")
        alert = db.query(MlAlert).filter(MlAlert.id == alert_id_int).first()
        if alert:
            return _alert_payload(alert, "ml")

    return None


@router.get("/alerts/correlated")
def list_correlated_alerts(
    db: Session = Depends(require_db),
    limit: int = Query(100, ge=1, le=500),
):
    alerts = (
        db.query(CorrelatedAlert)
        .order_by(CorrelatedAlert.timestamp_epoch.desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "id": alert.id,
            "timestamp_epoch": alert.timestamp_epoch,
            "rule_name": alert.rule_name,
            "user": alert.user,
            "host": alert.host,
            "severity": alert.severity,
            "sequence": alert.sequence,
            "details": alert.details,
        }
        for alert in alerts
    ]


@router.get("/alerts/ml")
def list_ml_alerts(
    db: Session = Depends(require_db),
    limit: int = Query(100, ge=1, le=500),
):
    alerts = (
        db.query(MlAlert)
        .order_by(MlAlert.timestamp_epoch.desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "id": alert.id,
            "timestamp_epoch": alert.timestamp_epoch,
            "user": alert.user,
            "host": alert.host,
            "anomaly_score": alert.anomaly_score,
            "threshold": alert.threshold,
            "model_version": alert.model_version,
            "details": alert.details,
        }
        for alert in alerts
    ]


@public_router.get("/alerts")
def list_alerts(
    db: Session = Depends(require_db),
    limit: int = Query(200, ge=1, le=1000),
):
    correlated = (
        db.query(CorrelatedAlert)
        .order_by(CorrelatedAlert.timestamp_epoch.desc())
        .limit(limit)
        .all()
    )
    ml_alerts = (
        db.query(MlAlert)
        .order_by(MlAlert.timestamp_epoch.desc())
        .limit(limit)
        .all()
    )

    combined = [_alert_payload(alert, "correlation") for alert in correlated] + [
        _alert_payload(alert, "ml") for alert in ml_alerts
    ]
    combined.sort(key=lambda item: item.get("timestamp_epoch", 0), reverse=True)
    return combined[:limit]


@public_router.get("/alerts/{alert_id}/explain")
def explain_alert(
    alert_id: str,
    db: Session = Depends(require_db),
    question: Optional[str] = Query(None, min_length=3, max_length=2000),
):
    payload = _resolve_alert(alert_id, db)
    if not payload:
        raise HTTPException(status_code=404, detail="Alert not found")

    query = redact_text(question or "Explain this alert.")
    if is_prompt_injection(query):
        return {
            "alert_id": payload["id"],
            "blocked": True,
            "analysis": "Prompt injection detected. Explanation restricted to alert metadata.",
            "recommended_actions": ["Review the alert manually and validate access approval."],
            "citations": [],
        }

    last_event = payload.get("evidence", {}).get("last_event", {})
    summary_event = {
        "event_type": payload.get("rule_id", "alert"),
        "user": payload.get("user") or last_event.get("user") or "unknown",
        "host": payload.get("host") or last_event.get("host") or "unknown",
        "status": last_event.get("status") or "alert",
        "severity": payload.get("severity") or "medium",
    }
    result = rag_service.explain(summary_event, question=query, top_k=3)
    return {
        "alert_id": payload["id"],
        "blocked": False,
        "analysis": redact_text(result["analysis"]),
        "recommended_actions": result["recommended_actions"],
        "citations": result["citations"],
    }
@public_router.post("/alerts/{alert_id}/archive")
def archive_alert(
    alert_id: str,
    db: Session = Depends(require_db),
):
    alert_type = "correlation" if alert_id.startswith("corr-") else "ml" if alert_id.startswith("ml-") else None
    numeric_id = alert_id.replace("corr-", "").replace("ml-", "")
    
    if not numeric_id.isdigit():
        raise HTTPException(status_code=400, detail="Invalid Alert ID")
    
    alert_id_int = int(numeric_id)
    if alert_type == "correlation":
        alert = db.query(CorrelatedAlert).filter(CorrelatedAlert.id == alert_id_int).first()
    else:
        alert = db.query(MlAlert).filter(MlAlert.id == alert_id_int).first()
        
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    alert.status = "archived"
    db.commit()
    return {"status": "success", "message": f"Alert {alert_id} archived"}


@public_router.post("/alerts/{alert_id}/investigate")
def investigate_alert(
    alert_id: str,
    db: Session = Depends(require_db),
):
    alert_type = "correlation" if alert_id.startswith("corr-") else "ml" if alert_id.startswith("ml-") else None
    numeric_id = alert_id.replace("corr-", "").replace("ml-", "")
    
    if not numeric_id.isdigit():
        raise HTTPException(status_code=400, detail="Invalid Alert ID")
    
    alert_id_int = int(numeric_id)
    alert = None
    if alert_type == "correlation":
        alert = db.query(CorrelatedAlert).filter(CorrelatedAlert.id == alert_id_int).first()
    else:
        alert = db.query(MlAlert).filter(MlAlert.id == alert_id_int).first()
        
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    # Update alert status
    alert.status = "investigating"
    
    # Create an Incident if not already created
    # Check if any incident already has this alert_id in its 'alerts' list
    from sqlalchemy import func
    # Note: Using JSON contains or just manual check for simplicity here
    existing_incident = None
    all_incidents = db.query(Incident).all()
    for inc in all_incidents:
        if alert_id in (inc.alerts or []):
            existing_incident = inc
            break
            
    if not existing_incident:
        # Create a high-fidelity incident
        title = alert.rule_name if hasattr(alert, 'rule_name') else "Behavioral Anomaly Detected"
        severity = alert.severity if hasattr(alert, 'severity') else "High"
        
        new_incident = Incident(
            title=f"Investigation: {title}",
            description=f"Automated incident spawned from alert {alert_id}. Target Host: {alert.host}. User: {alert.user}.",
            severity=severity.capitalize(),
            status="In Progress",
            owner=alert.user or "Analyst-Alpha",
            alerts=[alert_id],
            timeline=[{
                "time": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
                "action": "Incident spawned from Alert Inbox",
                "user": "System"
            }]
        )
        db.add(new_incident)
    
    db.commit()
    return {"status": "success", "message": f"Investigation started for {alert_id}. Incident record synchronized."}
