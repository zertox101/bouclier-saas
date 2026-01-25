from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import redis
import os
from dotenv import load_dotenv
import os

# Explicitly load .env from the backend root
current_dir = os.path.dirname(os.path.abspath(__file__)) # core
app_dir = os.path.dirname(current_dir) # app
backend_root = os.path.dirname(app_dir) # backend root
env_path = os.path.join(backend_root, '.env')
load_dotenv(dotenv_path=env_path)

# Database Config
DATABASE_URL = os.getenv("DATABASE_URL")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASS = os.getenv("DB_PASS", "postgres")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "shield_db")

SQLALCHEMY_DATABASE_URL = DATABASE_URL or f"postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine = None
SessionLocal = None

try:
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    print("Database connection configured.")
except Exception as e:
    print(f"Failed to configure database: {e}")

# Redis Config
redis_client = None
try:
    redis_host = os.getenv("REDIS_HOST", "localhost")
    redis_port = int(os.getenv("REDIS_PORT", "6379"))
    redis_db = int(os.getenv("REDIS_DB", "0"))
    redis_client = redis.Redis(host=redis_host, port=redis_port, db=redis_db)
    redis_client.ping()
    print("Redis connection successful.")
except Exception as e:
    print(f"Redis connection failed: {e}")
    redis_client = None

def get_db():
    if SessionLocal:
        db = SessionLocal()
        try:
            yield db
        finally:
            db.close()
    else:
        yield None
