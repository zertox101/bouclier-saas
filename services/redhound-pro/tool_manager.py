import subprocess
import json
import os
import shutil

class ToolManager:
    def __init__(self, socketio=None):
        self.socketio = socketio
        self.tools = {
            'subfinder': {
                'cmd': 'subfinder',
                'args': ['-d', '{target}', '-silent']
            },
            'nmap': {
                'cmd': 'nmap',
                'args': ['-p-', '-T4', '-sV', '{target}']
            },
            'nuclei': {
                'cmd': 'nuclei',
                'args': ['-u', '{target}', '-silent', '-severity', 'critical,high,medium']
            },
            'httpx': {
                'cmd': 'httpx',
                'args': ['-u', '{target}', '-silent', '-status-code', '-title']
            },
            'ffuf': {
                'cmd': 'ffuf',
                'args': ['-u', '{target}/FUZZ', '-w', '/usr/share/wordlists/dirb/common.txt', '-silent']
            }
        }
        self.burp_config = {'enabled': False, 'host': '127.0.0.1', 'port': 8080}
    
    def get_status(self):
        status = {}
        for tool in self.tools:
            try:
                # Use shutil.which for cross-platform support (Windows/Linux/Mac)
                status[tool] = shutil.which(tool) is not None
            except:
                status[tool] = False
        status['burp'] = self.burp_config['enabled']
        return status
    
    def run_tool(self, tool_name, target):
        if tool_name not in self.tools:
            return {'success': False, 'error': f'Tool {tool_name} not found'}
        
        tool = self.tools[tool_name]
        args = [arg.replace('{target}', target) for arg in tool['args']]
        
        try:
            if self.socketio:
                self.socketio.emit('log', {'message': f'Running {tool_name}'})
            
            result = subprocess.run([tool['cmd']] + args, capture_output=True, text=True, timeout=60)
            output = result.stdout.strip().split('\n') if result.stdout else []
            
            return {
                'success': True,
                'tool': tool_name,
                'output': output[:20],
                'raw': result.stdout[:500]
            }
        except subprocess.TimeoutExpired:
            return {'success': False, 'error': 'Timeout'}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def export_to_burp(self, findings):
        if not self.burp_config['enabled']:
            return
        
        burp_format = [{
            'url': f.get('url'),
            'name': f.get('type'),
            'severity': f.get('severity'),
            'detail': f.get('payload')
        } for f in findings]
        
        with open('/tmp/redhound_burp.json', 'w') as f:
            json.dump(burp_format, f, indent=2)
    
    def configure_burp(self, enabled=True, host='127.0.0.1', port=8080):
        self.burp_config = {'enabled': enabled, 'host': host, 'port': port}
        return self.burp_config
