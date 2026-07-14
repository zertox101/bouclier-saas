"""Test WebSocket scan result parsing."""
import asyncio
import json
import websockets

async def test():
    WS_URL = "ws://localhost:8005/api/offensive/ws"
    async with websockets.connect(WS_URL, ping_interval=None) as ws:
        await ws.send(json.dumps({"action": "scan", "target": "scanme.nmap.org", "scan_type": "nmap"}))
        print("Sent scan, waiting...")
        msgs = []
        try:
            while True:
                msg = json.loads(await asyncio.wait_for(ws.recv(), timeout=30))
                msgs.append(msg)
                t = msg.get("type")
                if t == "scan_result":
                    ports = msg.get("ports", [])
                    print(f"\n=== SCAN RESULT ===")
                    print(f"Open ports: {msg.get('open_ports')}")
                    print(f"Filtered: {msg.get('filtered_ports')}")
                    for p in ports:
                        print(f"  Port {p['port']}/{p['service']} -> {p['state']}")
                elif t == "scan_complete":
                    print(f"\n=== COMPLETE ===")
                    print(f"Job: {msg.get('job_id')}")
                    print(f"Ports: {msg.get('total_ports')}")
                    print(f"Duration: {msg.get('duration_seconds')}s")
                    break
                elif t == "scan_error":
                    print(f"Error: {msg.get('message')}")
                    break
        except asyncio.TimeoutError:
            print("Timeout")
        
        types = [m.get("type") for m in msgs]
        has_result = "scan_result" in types
        has_ports = any(len(m.get("ports", [])) > 0 for m in msgs if m.get("type") == "scan_result")
        print(f"\nMessages: {len(msgs)}, types: {types}")
        print(f"Has scan_result: {has_result}")
        print(f"Has port data: {has_ports}")
        return has_result and has_ports

result = asyncio.run(test())
print(f"\n{'✅ PASS' if result else '❌ FAIL'}")
