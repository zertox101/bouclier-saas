import os
import sys
import time

print("1. Setting paths...")
backend_root = os.path.dirname(os.path.abspath(__file__))
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

print("2. Importing sqlalchemy...")
from sqlalchemy import create_engine
print("3. Importing redis...")
import redis
print("4. Importing dotenv...")
from dotenv import load_dotenv

print("5. Loading .env...")
env_path = os.path.join(backend_root, '.env')
load_dotenv(dotenv_path=env_path)

print("6. Getting DATABASE_URL...")
DATABASE_URL = os.getenv("DATABASE_URL")
print(f"DATABASE_URL: {DATABASE_URL}")

print("7. Testing thread-based connection...")
import threading
def test_conn():
    print("  Thread: starting...")
    print(f"  Thread: connecting to {DATABASE_URL}...")
    try:
        e = create_engine(DATABASE_URL, connect_args={"connect_timeout": 3})
        with e.connect() as conn:
            print("  Thread: connected!")
    except Exception as e:
        print(f"  Thread: error {e}")

t = threading.Thread(target=test_conn)
t.start()
print("8. Joining thread...")
t.join(timeout=5)
print("9. Done!")
