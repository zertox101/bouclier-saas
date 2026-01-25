import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import bcrypt

load_dotenv()

DB_USER = os.getenv("DB_USER", "postgres")
DB_PASS = os.getenv("DB_PASS", "postgres")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5433")
DB_NAME = os.getenv("DB_NAME", "shield_db")

SQLALCHEMY_DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

from app.models.sql import User

# Manual hash to bypass passlib/bcrypt incompatibility
password = b"admin"
salt = bcrypt.gensalt()
hashed = bcrypt.hashpw(password, salt).decode('utf-8')

db = SessionLocal()
try:
    existing = db.query(User).filter(User.username == "admin").first()
    if not existing:
        admin = User(
            username="admin",
            email="admin@local",
            hashed_password=hashed,
            role="admin",
            is_active=True
        )
        db.add(admin)
        db.commit()
        print("Admin user created successfully with manual bcrypt hash.")
    else:
        print("Admin user already exists.")
except Exception as e:
    print(f"Error: {e}")
finally:
    db.close()
