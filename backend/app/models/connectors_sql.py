from sqlalchemy import Column, Integer, String, DateTime, JSON, Boolean
from app.models.sql import Base
from datetime import datetime

class SQLConnector(Base):
    __tablename__ = "sql_connectors"

    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(String, index=True)
    name = Column(String)
    db_type = Column(String) # postgres, mysql, mssql
    host = Column(String)
    port = Column(Integer)
    dbname = Column(String)
    username = Column(String)
    password_encrypted = Column(String)
    
    # Allowlist config
    allowed_schemas = Column(JSON, default=["public"])
    allowed_tables = Column(JSON, default=[])
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
