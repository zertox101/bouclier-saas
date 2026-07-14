#!/usr/bin/env python3
import http.server
import json
import sys
import subprocess
import os
import urllib.parse


RAPTOR_SCRIPT = "/app/raptor_agentic.py"
CMD_MAP = {
    "help": ["--help"],
    "scan": ["--scan"],
    "fuzz": ["--fuzz"],
    "web": ["--web"],
}


class HealthHandler(http.server.BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        pass

    def do_GET(self):
        if self.path == "/health":
            self.send_json({"status": "ok", "service": "raptor"})
        else:
            self.send_json({
                "status": "ready",
                "message": "RAPTOR is running.",
                "commands": [
                    "help - General help",
                    "scan - Scan source code",
                    "fuzz - Fuzz binaries",
                    "web - Test web apps",
                ]
            })

    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length) if length else b"{}"
        try:
            data = json.loads(body)
        except json.JSONDecodeError:
            data = {}
        cmd_id = data.get("command", "help")
        args = CMD_MAP.get(cmd_id, CMD_MAP["help"])
        full_cmd = ["python3", RAPTOR_SCRIPT] + args
        try:
            result = subprocess.run(full_cmd, capture_output=True, text=True, timeout=30)
            output = (result.stdout + result.stderr)[:5000]
        except subprocess.TimeoutExpired:
            output = "Command timed out (30s)"
        except FileNotFoundError:
            output = f"RAPTOR script not found at {RAPTOR_SCRIPT}"
        except Exception as e:
            output = str(e)
        self.send_json({"command": cmd_id, "output": output})

    def send_json(self, data):
        body = json.dumps(data).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    http.server.HTTPServer(("0.0.0.0", port), HealthHandler).serve_forever()
