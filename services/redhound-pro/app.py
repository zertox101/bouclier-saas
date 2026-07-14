from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS
from payload_engine import PayloadEngine
from reporter import Reporter
from param_finder import ParamFinder
from tool_manager import ToolManager
from cve_checker import CVEChecker
from ai_analyzer import AIAnalyzer
import threading
import time
from datetime import datetime

app = Flask(__name__)
app.config['SECRET_KEY'] = 'redhound'
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

engine = PayloadEngine(socketio)
reporter = Reporter()
param_finder = ParamFinder()
tool_manager = ToolManager(socketio)
cve_checker = CVEChecker(socketio)
ai_analyzer = AIAnalyzer()

scan_stats = {
    'total_scans': 0,
    'vulnerabilities_found': 0,
    'by_type': {
        'xss': 0, 'sqli': 0, 'lfi': 0, 'rce': 0, 'xxe': 0,
        'ssti': 0, 'ssrf': 0, 'open_redirect': 0, 'crlf': 0,
        'nosqli': 0, 'idor': 0, 'csrf': 0, 'jwt': 0,
        'graphql': 0, 'api_key': 0, 'ldap': 0, 'cmd_injection': 0
    },
    'scan_history': [],
    'total_time': 0,
    'cve_matches': []
}

scan_config = {
    'max_time': 300,
    'auto_stop': True,
    'current_scan_start': None,
    'use_tools': True,
    'use_ai': True,
    'check_cve': True
}

@app.route('/')
def index():
    return jsonify({
        "service": "RedHound Pro",
        "version": "2.0",
        "status": "operational",
        "endpoints": ["/api/stats", "/api/scan", "/api/stop", "/api/tools/status", "/api/config"]
    })

@app.route('/api/stats')
def get_stats():
    return jsonify(scan_stats)

@app.route('/api/tools/status')
def tools_status():
    return jsonify(tool_manager.get_status())

@app.route('/api/tools/run', methods=['POST'])
def run_tool():
    data = request.json
    tool = data.get('tool')
    target = data.get('target')
    result = tool_manager.run_tool(tool, target)
    return jsonify(result)

@app.route('/api/config', methods=['POST'])
def config():
    global scan_config
    data = request.json
    scan_config['max_time'] = data.get('max_time', 300)
    scan_config['use_tools'] = data.get('use_tools', True)
    scan_config['use_ai'] = data.get('use_ai', True)
    scan_config['check_cve'] = data.get('check_cve', True)
    return jsonify({'status': 'updated'})

@app.route('/api/scan', methods=['POST'])
def start_scan():
    data = request.json
    target = data.get('url')
    vuln_types = data.get('types', [])
    
    if not vuln_types:
        vuln_types = list(scan_stats['by_type'].keys())
    
    thread = threading.Thread(target=run_scan, args=(target, vuln_types))
    thread.daemon = True
    thread.start()
    
    return jsonify({'status': 'started', 'target': target})

@app.route('/api/stop', methods=['POST'])
def stop_scan():
    global scan_config
    scan_config['auto_stop'] = True
    scan_config['max_time'] = 0
    return jsonify({'status': 'stopped'})

def run_scan(target, vuln_types):
    scan_id = len(scan_stats['scan_history'])
    scan_config['current_scan_start'] = time.time()
    
    scan_info = {
        'id': scan_id,
        'target': target,
        'start_time': datetime.now().isoformat(),
        'status': 'running',
        'findings': [],
        'progress': 0,
        'tested_types': [],
        'urls_tested': [],
        'tools_output': {},
        'cve_matches': []
    }
    scan_stats['scan_history'].append(scan_info)
    scan_stats['total_scans'] += 1
    
    socketio.emit('scan_started', {'scan_id': scan_id, 'target': target})
    socketio.emit('stats_update', scan_stats)
    
    # Phase 1: External tools
    if scan_config['use_tools']:
        socketio.emit('log', {'message': 'Running external tools...'})
        
        subdomains = tool_manager.run_tool('subfinder', target)
        if subdomains.get('success'):
            scan_info['tools_output']['subfinder'] = subdomains.get('output', [])
            socketio.emit('log', {'message': f'Found {len(subdomains.get("output", []))} subdomains'})
        
        ports = tool_manager.run_tool('nmap', target)
        if ports.get('success'):
            scan_info['tools_output']['nmap'] = ports.get('output', [])
            socketio.emit('log', {'message': f'Found {len(ports.get("output", []))} open ports'})
        
        nuclei = tool_manager.run_tool('nuclei', target)
        if nuclei.get('success'):
            scan_info['tools_output']['nuclei'] = nuclei.get('output', [])
            socketio.emit('log', {'message': f'Found {len(nuclei.get("output", []))} nuclei findings'})
    
    # Phase 2: Crawl
    socketio.emit('log', {'message': f'Crawling {target}...'})
    test_urls = param_finder.find(target)
    
    if test_urls:
        socketio.emit('log', {'message': f'Found {len(test_urls)} URLs to test'})
    else:
        test_urls = [target]
    
    # Phase 3: Test vulnerabilities
    total_tests = len(vuln_types) * len(test_urls)
    tests_done = 0
    
    for vuln in vuln_types:
        elapsed = time.time() - scan_config['current_scan_start']
        if scan_config['auto_stop'] and elapsed > scan_config['max_time']:
            socketio.emit('log', {'message': 'Time limit reached'})
            break
        
        if not engine.has_payloads(vuln):
            continue
            
        socketio.emit('log', {'message': f'Testing {vuln.upper()}...'})
        scan_info['tested_types'].append(vuln)
        
        for test_url in test_urls:
            results = engine.test(test_url, vuln)
            
            for result in results:
                if result.get('vulnerable'):
                    # AI Verification
                    if scan_config['use_ai']:
                        ai_result = ai_analyzer.analyze(result)
                        result['ai_confidence'] = ai_result.get('confidence', 0)
                        result['ai_verdict'] = ai_result.get('verdict', 'unknown')
                        
                        if ai_result.get('confidence', 100) < 50:
                            socketio.emit('log', {'message': f'AI flagged as false positive: {vuln}'})
                            continue
                    
                    # CVE Check
                    if scan_config['check_cve'] and result.get('service_info'):
                        cve_results = cve_checker.check_service(result.get('service_info'))
                        if cve_results:
                            result['cve_matches'] = cve_results
                            scan_stats['cve_matches'].extend(cve_results)
                            for cve in cve_results:
                                socketio.emit('log', {'message': f'CVE: {cve.get("id")}'})
                    
                    scan_stats['vulnerabilities_found'] += 1
                    scan_stats['by_type'][vuln] += 1
                    scan_info['findings'].append(result)
                    socketio.emit('vulnerability_found', result)
                    
                    # Update real-time stats mid-scan
                    socketio.emit('stats_update', scan_stats)
            
            tests_done += 1
            progress = (tests_done / total_tests) * 100
            scan_info['progress'] = progress
            socketio.emit('progress_update', {
                'progress': progress,
                'current': vuln,
                'elapsed': int(elapsed)
            })
    
    # Phase 4: Save report
    scan_info['status'] = 'completed'
    scan_info['end_time'] = datetime.now().isoformat()
    scan_info['total_time'] = int(time.time() - scan_config['current_scan_start'])
    
    report_path = reporter.save(target, scan_info)
    tool_manager.export_to_burp(scan_info['findings'])
    
    socketio.emit('scan_completed', {
        'findings': scan_info['findings'],
        'report': report_path,
        'total_time': scan_info['total_time'],
        'cve_matches': scan_stats['cve_matches']
    })
    socketio.emit('stats_update', scan_stats)

if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)
