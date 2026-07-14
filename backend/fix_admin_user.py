"""
Fix admin user - uses pbkdf2_sha256 (same as security.py) and writes to SQLite (shield.db)
"""
import os
import sys

# Add backend root to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from passlib.context import CryptContext

# Use SQLite - same as backend fallback
SQLITE_URL = "sqlite:///./shield.db"
engine = create_engine(SQLITE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Same context as security.py
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

from app.models.sql import Base, User
import app.models.telemetry_sql  # ensure all models loaded

# Create tables if not exist
Base.metadata.create_all(bind=engine)

db = SessionLocal()
try:
    # Remove old admin if exists (wrong hash)
    old = db.query(User).filter(User.username == "admin").first()
    if old:
        db.delete(old)
        db.commit()
        print("Old admin user removed.")

    # Create new admin with correct hash
    hashed = pwd_context.hash("admin")
    admin = User(
        username="admin",
        email="admin@local",
        hashed_password=hashed,
        role="admin",
        is_active=True,
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    print(f"[OK] Admin user created successfully!")
    print(f"   Username : admin")
    print(f"   Password : admin")
    print(f"   Email    : admin@local")
    print(f"   Role     : admin")
    print(f"   DB       : shield.db (SQLite)")

except Exception as e:
    db.rollback()
    print(f"[ERROR]: {e}")
finally:
    db.close()
