import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from passlib.context import CryptContext
from dotenv import load_dotenv

# Load from .env
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://shield_user:shield_password@localhost:5432/shield_data")
# Adjust localhost if running outside docker but db is mapped to 5432
# In the user's setup, db is at port 5432 inside docker.

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

from app.models.sql import User

def fix():
    db = SessionLocal()
    try:
        # Check if user exists
        user = db.query(User).filter(User.username == "admin").first()
        if user:
            db.delete(user)
            db.commit()
            print("Deleted existing admin.")
        
        hashed_password = pwd_context.hash("admin123")
        admin = User(
            username="admin",
            email="admin@local",
            hashed_password=hashed_password,
            role="admin",
            is_active=True
        )
        db.add(admin)
        db.commit()
        print("Admin user 'admin' created with password 'admin123' in Postgres.")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    fix()
