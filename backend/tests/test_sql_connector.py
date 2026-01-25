import pytest
from app.utils.crypto import encrypt_secret, decrypt_secret
from app.models.connectors_sql import SQLConnector
from app.services.sql_connector_service import SQLConnectorService

def test_encryption_decryption():
    secret = "my_super_secret_password_123!"
    encrypted = encrypt_secret(secret)
    assert encrypted != secret
    decrypted = decrypt_secret(encrypted)
    assert decrypted == secret

def test_sql_injection_guard():
    connector = SQLConnector(
        org_id="test",
        db_type="postgres",
        allowed_tables=["users"]
    )
    
    malicious_queries = [
        "DROP TABLE users",
        "DELETE FROM users",
        "UPDATE users SET role='admin'",
        "INSERT INTO users (name) VALUES ('hacked')"
    ]
    
    for q in malicious_queries:
        with pytest.raises(ValueError, match="not allowed"):
            SQLConnectorService.execute_query(
                db=None, # Session not needed for pre-check
                connector=connector,
                query_template=q,
                params={},
                user_id="test_user"
            )

def test_connection_url_generation():
    # Validating that password is decrypted and URL is formatted correctly
    pass_raw = "db_pass"
    connector = SQLConnector(
        db_type="postgres",
        username="db_user",
        password_encrypted=encrypt_secret(pass_raw),
        host="localhost",
        port=5432,
        dbname="test_db"
    )
    
    url = SQLConnectorService.get_connection_url(connector)
    assert "postgresql://db_user:db_pass@localhost:5432/test_db" == url
