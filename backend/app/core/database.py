from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import redis
import os
from dotenv import load_dotenv

# Load .env only if not running in Docker (Docker Compose sets env vars directly)
# Check if we're in a Docker container
in_docker = os.path.exists('/.dockerenv') or os.getenv('DOCKER_CONTAINER')

if not in_docker:
    current_dir = os.path.dirname(os.path.abspath(__file__))  # core
    app_dir = os.path.dirname(current_dir)  # app
    backend_root = os.path.dirname(app_dir)  # backend root
    env_path = os.path.join(backend_root, '.env')
    load_dotenv(dotenv_path=env_path)

# Database Config
# In Docker, prefer individual components over DATABASE_URL to avoid .env conflicts
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASS = os.getenv("DB_PASS", "postgres")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "shield_db")

# Only use DATABASE_URL if individual components are not set (legacy support)
DATABASE_URL = os.getenv("DATABASE_URL")
use_database_url = DATABASE_URL and not (os.getenv("DB_HOST") and os.getenv("DB_PORT") and os.getenv("DB_NAME"))

constructed_url = f"postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
SQLALCHEMY_DATABASE_URL = DATABASE_URL if use_database_url else constructed_url

# Fallback to SQLite if Postgres fails
# Use /tmp which is always writable (mounted as tmpfs in Docker, always available locally)
SQLITE_URL = "sqlite:////tmp/shield.db"

engine = None
SessionLocal = None
_using_sqlite_fallback = False


def _try_postgres():
    """Test PostgreSQL connection directly in the main thread with a short timeout."""
    try:
        e = create_engine(
            SQLALCHEMY_DATABASE_URL,
            connect_args={"connect_timeout": 10},
            pool_pre_ping=True,
        )
        with e.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"ok": True, "engine": e}
    except Exception as exc:
        return {"ok": False, "error": exc}


def _init_sqlite():
    """Initialize SQLite fallback."""
    global engine, SessionLocal, _using_sqlite_fallback
    try:
        engine = create_engine(SQLITE_URL, connect_args={"check_same_thread": False})
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        print(f"SQLite fallback active: {SQLITE_URL}")
        _using_sqlite_fallback = True
        # Create tables if using SQLite
        from app.models.sql import Base
        import app.models.telemetry_sql  # Ensure models are loaded
        import app.models.soc_expert_sql  # Ensure SOC models are loaded
        Base.metadata.create_all(bind=engine)
        print("SQLite tables created/verified.")
        return True
    except Exception as e2:
        print(f"Failed to configure even SQLite: {e2}")
        return False


def _reconnect_postgres():
    """Try to reconnect to Postgres (called lazily on each request if using SQLite)."""
    global engine, SessionLocal, _using_sqlite_fallback
    result = _try_postgres()
    if result.get("ok"):
        print("[DB] Reconnected to PostgreSQL successfully.")
        engine = result["engine"]
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        _using_sqlite_fallback = False
        return True
    return False


# Initial connection attempt at startup
print(f"[DB] Attempting PostgreSQL connection to {SQLALCHEMY_DATABASE_URL}")
_pg_result = _try_postgres()
if _pg_result.get("ok"):
    print("[DB] Connected to PostgreSQL successfully.")
    engine = _pg_result["engine"]
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
else:
    err = _pg_result.get("error", "timeout/unreachable")
    print(f"[DB] PostgreSQL connection failed ({err}). Falling back to SQLite...")
    _init_sqlite()


# Redis Config
def get_redis_client():
    try:
        host = os.getenv("REDIS_HOST", "localhost")
        port = int(os.getenv("REDIS_PORT", "6379"))
        client = redis.Redis(
            host=host, port=port, db=0,
            socket_connect_timeout=2, socket_timeout=2,
            decode_responses=False
        )
        client.ping()
        return client
    except:
        return None

redis_client = get_redis_client()


def get_db():
    global _using_sqlite_fallback
    # If we're on SQLite fallback, try to reconnect to Postgres lazily
    if _using_sqlite_fallback:
        _reconnect_postgres()
    
    if SessionLocal:
        db = SessionLocal()
        try:
            yield db
        finally:
            db.close()
    else:
        yield None
