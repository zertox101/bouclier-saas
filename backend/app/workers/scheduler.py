import time
import signal
import sys
from app.workers.monitor_worker import monitor_task

def run_scheduler():
    print("""
╔══════════════════════════════════════════════════════════╗
║        SHIELD TACTICAL SCHEDULER v2.5 STARTED            ║
║        Orchestrating Distributed Cyber Intelligence     ║
╚══════════════════════════════════════════════════════════╝
    """)

    def signal_handler(sig, frame):
        print("\n[Scheduler] Signal received. Shutting down...")
        sys.exit(0)

    signal.signal(signal.SIGINT, signal_handler)

    while True:
        try:
            # Trigger main security monitor
            monitor_task.delay()

            time.sleep(2) # 2-second tactical pulse
        except Exception as e:
            print(f"[Scheduler Error] {e}")
            time.sleep(5)

if __name__ == "__main__":
    run_scheduler()
