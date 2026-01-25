import os
import time
from typing import List, Dict, Any, Optional
from sqlalchemy import create_engine, text, inspect
from sqlalchemy.orm import Session
from sqlalchemy.exc import OperationalError, TimeoutError
from app.models.connectors_sql import SQLConnector
from app.utils.crypto import decrypt_secret
from app.models.sql import AuditLog

class SQLConnectorService:
    @staticmethod
    def get_connection_url(connector: SQLConnector) -> str:
        password = decrypt_secret(connector.password_encrypted)
        if connector.db_type == "postgres":
            return f"postgresql://{connector.username}:{password}@{connector.host}:{connector.port}/{connector.dbname}"
        elif connector.db_type == "mysql":
            return f"mysql+pymysql://{connector.username}:{password}@{connector.host}:{connector.port}/{connector.dbname}"
        elif connector.db_type == "mssql":
            return f"mssql+pyodbc://{connector.username}:{password}@{connector.host}:{connector.port}/{connector.dbname}"
        raise ValueError(f"Unsupported DB type: {connector.db_type}")

    @staticmethod
    def test_connection(connector: SQLConnector) -> bool:
        url = SQLConnectorService.get_connection_url(connector)
        # Low timeout for testing
        engine = create_engine(url, connect_args={'connect_timeout': 5})
        try:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            return True
        except Exception as e:
            print(f"Connection test failed: {e}")
            return False

    @staticmethod
    def list_tables(connector: SQLConnector) -> List[str]:
        url = SQLConnectorService.get_connection_url(connector)
        engine = create_engine(url)
        inspector = inspect(engine)
        
        all_tables = []
        for schema in connector.allowed_schemas:
            tables = inspector.get_table_names(schema=schema)
            all_tables.extend([f"{schema}.{t}" if schema != "public" else t for t in tables])
            
        return all_tables

    @staticmethod
    def execute_query(
        db: Session,
        connector: SQLConnector,
        query_template: str,
        params: Dict[str, Any],
        user_id: str
    ) -> List[Dict[str, Any]]:
        # 1. Audit start
        audit = AuditLog(
            org_id=connector.org_id,
            user_id=user_id,
            action="SQL_QUERY_EXEC",
            entity_type="sql_connector",
            entity_id=str(connector.id),
            metadata_json={"query": query_template, "params": list(params.keys())}
        )
        db.add(audit)
        db.commit()

        # 2. Safety Checks (Read-only check)
        forbidden_keywords = ["INSERT", "UPDATE", "DELETE", "DROP", "TRUNCATE", "ALTER", "GRANT", "REVOKE"]
        if any(kw in query_template.upper() for kw in forbidden_keywords):
            raise ValueError("Destructive operations are not allowed (Read-only mode).")

        # 3. Connection with timeout
        url = SQLConnectorService.get_connection_url(connector)
        # timeout in seconds
        engine = create_engine(url, execution_options={"timeout": 10})
        
        try:
            with engine.connect() as conn:
                # 4. Limit enforcement via SQL if not present
                final_query = query_template
                if "LIMIT" not in final_query.upper():
                    final_query += " LIMIT 5000"
                
                result = conn.execute(text(final_query), params)
                cols = result.keys()
                
                rows = [dict(zip(cols, row)) for row in result.fetchall()]
                return rows
                
        except Exception as e:
            # Log error in audit if needed
            print(f"Query execution error: {e}")
            raise
