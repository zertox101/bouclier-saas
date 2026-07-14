import os
import sys
from sqlalchemy import create_engine
from dotenv import load_dotenv

# Load env
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("DATABASE_URL not found in .env")
    sys.exit(1)

print(f"Connecting to {DATABASE_URL}...")
engine = create_engine(DATABASE_URL)

try:
    from app.models.sql import Base
    import app.models.telemetry_sql
    
    print("Creating all tables in PostgreSQL...")
    Base.metadata.create_all(bind=engine)
    print("[SUCCESS] All tables created in PostgreSQL (bouclier_db).")
except Exception as e:
    print(f"[ERROR] Failed to create tables: {e}")
