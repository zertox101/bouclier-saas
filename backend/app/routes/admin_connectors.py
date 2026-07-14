from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.connectors_sql import SQLConnector
from app.models.sql import User
from app.services.sql_connector_service import SQLConnectorService
from app.utils.crypto import encrypt_secret
from app.routes.auth import oauth2_scheme_optional
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()


def _resolve_connector_org_id(request: Request, token: Optional[str] = None) -> str:
    org_id = request.headers.get("X-Organization-ID")
    if org_id:
        return org_id
    if token:
        try:
            payload = decode_access_token(token)
            if payload and payload.get("org_id"):
                return payload["org_id"]
        except Exception:
            pass
    return "default"

class SQLConnectorCreate(BaseModel):
    name: str
    db_type: str  # postgres, mysql, mssql
    host: str
    port: int
    dbname: str
    username: str
    password: str
    allowed_schemas: List[str] = ["public"]
    allowed_tables: List[str] = []

class SQLConnectorResponse(BaseModel):
    id: int
    org_id: str
    name: str
    db_type: str
    host: str
    port: int
    dbname: str
    username: str
    allowed_schemas: List[str]
    allowed_tables: List[str]
    created_at: datetime

    class Config:
        from_attributes = True

class QueryRequest(BaseModel):
    query_template: str
    params: Dict[str, Any] = {}

@router.post("/connectors/sql", response_model=SQLConnectorResponse)
def create_connector(payload: SQLConnectorCreate, request: Request, db: Session = Depends(get_db), token: Optional[str] = Depends(oauth2_scheme_optional)):
    org_id = _resolve_connector_org_id(request, token)
    
    new_connector = SQLConnector(
        org_id=org_id,
        name=payload.name,
        db_type=payload.db_type,
        host=payload.host,
        port=payload.port,
        dbname=payload.dbname,
        username=payload.username,
        password_encrypted=encrypt_secret(payload.password),
        allowed_schemas=payload.allowed_schemas,
        allowed_tables=payload.allowed_tables
    )
    db.add(new_connector)
    db.commit()
    db.refresh(new_connector)
    
    # Audit creation
    from app.models.sql import AuditLog
    audit = AuditLog(
        org_id=org_id,
        user_id="admin",
        action="SQL_CONNECTOR_CREATE",
        entity_type="sql_connector",
        entity_id=str(new_connector.id),
        metadata_json={"name": payload.name, "db_type": payload.db_type}
    )
    db.add(audit)
    db.commit()
    
    return new_connector

@router.get("/connectors/sql", response_model=List[SQLConnectorResponse])
def list_connectors(db: Session = Depends(get_db)):
    return db.query(SQLConnector).all()

@router.post("/connectors/sql/{id}/test")
def test_connector(id: int, db: Session = Depends(get_db)):
    connector = db.query(SQLConnector).filter(SQLConnector.id == id).first()
    if not connector:
        raise HTTPException(status_code=404, detail="Connector not found")
    
    success = SQLConnectorService.test_connection(connector)
    return {"success": success}

@router.get("/connectors/sql/{id}/tables")
def list_connector_tables(id: int, db: Session = Depends(get_db)):
    connector = db.query(SQLConnector).filter(SQLConnector.id == id).first()
    if not connector:
        raise HTTPException(status_code=404, detail="Connector not found")
    
    tables = SQLConnectorService.list_tables(connector)
    return {"tables": tables}

@router.post("/connectors/sql/{id}/query")
def run_query(id: int, payload: QueryRequest, db: Session = Depends(get_db)):
    connector = db.query(SQLConnector).filter(SQLConnector.id == id).first()
    if not connector:
        raise HTTPException(status_code=404, detail="Connector not found")
    
    try:
        # user_id would normally come from current_user
        results = SQLConnectorService.execute_query(
            db=db,
            connector=connector,
            query_template=payload.query_template,
            params=payload.params,
            user_id="admin"
        )
        return {"results": results, "count": len(results)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
