import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Manual env parse
with open(".env", "r") as f:
    for line in f:
        if "=" in line:
            k, v = line.strip().split("=", 1)
            os.environ[k] = v

DB_USER = os.getenv("DB_USER", "postgres")
DB_PASS = os.getenv("DB_PASS", "postgres")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "shield_db")

SQLALCHEMY_DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
print(f"Connecting to: {SQLALCHEMY_DATABASE_URL}")

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

from app.models.sql import User

db = SessionLocal()
try:
    users = db.query(User).all()
    print(f"Total Users: {len(users)}")
    for u in users:
        print(f"User: {u.username} | Email: {u.email} | Active: {u.is_active}")
except Exception as e:
    print(f"Error checking users: {e}")
finally:
    db.close()
