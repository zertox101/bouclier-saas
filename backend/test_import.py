import sys
import os

backend_root = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_root)

try:
    from app.ml.model import detector
    print("Success importing detector")
except Exception as e:
    print("Error importing detector:", str(e))
