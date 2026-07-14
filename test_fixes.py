#!/usr/bin/env python3
"""
Script de test pour vérifier les corrections des pages
Network Dissector et Red Team
"""

import requests
import json
import time
from typing import Dict, Any

# Configuration
BACKEND_URL = "http://localhost:8005"
FRONTEND_URL = "http://localhost:3001"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'

def print_header(text: str):
    print(f"\n{Colors.BLUE}{'='*70}{Colors.RESET}")
    print(f"{Colors.BLUE}{text.center(70)}{Colors.RESET}")
    print(f"{Colors.BLUE}{'='*70}{Colors.RESET}\n")

def print_success(text: str):
    print(f"{Colors.GREEN}✓ {text}{Colors.RESET}")

def print_error(text: str):
    print(f"{Colors.RED}✗ {text}{Colors.RESET}")

def print_warning(text: str):
    print(f"{Colors.YELLOW}⚠ {text}{Colors.RESET}")

def test_backend_health():
    """Test 1: Vérifier que le backend est en ligne"""
    print_header("TEST 1: Backend Health Check")
    
    try:
        response = requests.get(f"{BACKEND_URL}/api/health", timeout=5)
        if response.status_code == 200:
            print_success("Backend is online")
            data = response.json()
            print(f"  Status: {data.get('status')}")
            print(f"  Environment: {data.get('environment')}")
            return True
        else:
            print_error(f"Backend returned status {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Backend is offline: {e}")
        return False

def test_network_dissector_interfaces():
    """Test 2: Vérifier l'endpoint des interfaces réseau"""
    print_header("TEST 2: Network Dissector - List Interfaces")
    
    try:
        response = requests.get(f"{BACKEND_URL}/api/network/interfaces", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print_success("Interfaces endpoint working")
            print(f"  Source: {data.get('source')}")
            print(f"  Interfaces found: {len(data.get('interfaces', []))}")
            for iface in data.get('interfaces', []):
                print(f"    - {iface['name']}: {iface['description']}")
            return True
        else:
            print_error(f"Interfaces endpoint returned {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Interfaces endpoint failed: {e}")
        return False

def test_network_dissector_action():
    """Test 3: Vérifier l'endpoint d'action sur les packets"""
    print_header("TEST 3: Network Dissector - Packet Actions")
    
    actions = ["FOLLOW", "EXTRACT", "FILTER", "KILL"]
    results = []
    
    for action in actions:
        try:
            response = requests.post(
                f"{BACKEND_URL}/api/network/action",
                json={"action": action, "packet_id": "123"},
                timeout=5
            )
            if response.status_code == 200:
                data = response.json()
                print_success(f"Action {action}: {data.get('message')}")
                results.append(True)
            else:
                print_error(f"Action {action} failed with status {response.status_code}")
                results.append(False)
        except Exception as e:
            print_error(f"Action {action} failed: {e}")
            results.append(False)
    
    return all(results)

def test_red_team_initialize():
    """Test 4: Vérifier l'initialisation Red Team"""
    print_header("TEST 4: Red Team - Initialize")
    
    try:
        response = requests.post(f"{BACKEND_URL}/api/saas/control/redteam/initialize", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print_success("Red Team initialization successful")
            print(f"  Message: {data.get('message')}")
            print(f"  Readiness: {data.get('readiness')}")
            print(f"  Operational: {data.get('operational')}")
            
            print("\n  Modules loaded:")
            for module in data.get('modules', []):
                print(f"    - {module}")
            
            print("\n  Tools status:")
            for tool in data.get('tools', []):
                status_icon = "✓" if tool['status'] == 'available' else "✗"
                print(f"    {status_icon} {tool['tool']}: {tool['status']}")
            
            return True
        else:
            print_error(f"Initialize returned status {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Initialize failed: {e}")
        return False

def test_red_team_mythos():
    """Test 5: Vérifier le scan Mythos"""
    print_header("TEST 5: Red Team - Mythos Scan")
    
    try:
        print("  Scanning target: scanme.nmap.org")
        response = requests.post(
            f"{BACKEND_URL}/api/saas/control/redteam/mythos",
            json={"target": "scanme.nmap.org"},
            timeout=120
        )
        
        if response.status_code == 200:
            data = response.json()
            print_success("Mythos scan completed")
            print(f"  Status: {data.get('status')}")
            print(f"  Target: {data.get('target')}")
            print(f"  Risk: {data.get('risk')}")
            print(f"  Scan method: {data.get('scan_method')}")
            print(f"  Total findings: {data.get('total_findings')}")
            
            if data.get('summary'):
                summary = data['summary']
                print(f"\n  Summary:")
                print(f"    Critical: {summary.get('critical', 0)}")
                print(f"    High: {summary.get('high', 0)}")
                print(f"    Medium: {summary.get('medium', 0)}")
                print(f"    Low: {summary.get('low', 0)}")
            
            print(f"\n  Findings:")
            for finding in data.get('findings', [])[:5]:  # Show first 5
                print(f"    - {finding['vulnerability']} ({finding['severity']})")
            
            return True
        else:
            print_error(f"Mythos scan returned status {response.status_code}")
            try:
                error_data = response.json()
                print(f"  Error: {error_data.get('detail', 'Unknown error')}")
            except:
                pass
            return False
    except Exception as e:
        print_error(f"Mythos scan failed: {e}")
        return False

def test_red_team_status():
    """Test 6: Vérifier le statut Red Team"""
    print_header("TEST 6: Red Team - Status")
    
    try:
        response = requests.get(f"{BACKEND_URL}/api/saas/control/redteam/status", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print_success("Red Team status retrieved")
            print(f"  Status: {data.get('status')}")
            print(f"  C2 Server: {data.get('c2_server')}")
            print(f"  Active operations: {data.get('active_operations')}")
            print(f"  Beacons: {data.get('beacons')}")
            return True
        else:
            print_error(f"Status endpoint returned {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Status endpoint failed: {e}")
        return False

def test_frontend_pages():
    """Test 7: Vérifier que les pages frontend sont accessibles"""
    print_header("TEST 7: Frontend Pages Accessibility")
    
    pages = [
        ("/network-dissector", "Network Dissector"),
        ("/red-team", "Red Team Ops")
    ]
    
    results = []
    for path, name in pages:
        try:
            response = requests.get(f"{FRONTEND_URL}{path}", timeout=5)
            if response.status_code == 200:
                print_success(f"{name} page is accessible")
                results.append(True)
            else:
                print_error(f"{name} page returned status {response.status_code}")
                results.append(False)
        except Exception as e:
            print_warning(f"{name} page check failed: {e}")
            print("  (This is normal if frontend is not running)")
            results.append(False)
    
    return any(results)  # At least one page should be accessible

def main():
    """Exécuter tous les tests"""
    
    print(f"\n{Colors.BLUE}{'='*70}")
    print(f"  BOUCLIER SaaS - Test des Corrections")
    print(f"  Network Dissector & Red Team")
    print(f"{'='*70}{Colors.RESET}\n")
    
    print(f"Backend URL: {BACKEND_URL}")
    print(f"Frontend URL: {FRONTEND_URL}")
    
    # Exécuter les tests
    tests = [
        ("Backend Health", test_backend_health),
        ("Network Interfaces", test_network_dissector_interfaces),
        ("Packet Actions", test_network_dissector_action),
        ("Red Team Initialize", test_red_team_initialize),
        ("Mythos Scan", test_red_team_mythos),
        ("Red Team Status", test_red_team_status),
        ("Frontend Pages", test_frontend_pages)
    ]
    
    results = {}
    for test_name, test_func in tests:
        try:
            results[test_name] = test_func()
        except Exception as e:
            print_error(f"Test {test_name} crashed: {e}")
            results[test_name] = False
        time.sleep(1)  # Pause entre les tests
    
    # Résumé
    print_header("RÉSUMÉ DES TESTS")
    
    passed = sum(1 for r in results.values() if r)
    total = len(results)
    
    for test_name, result in results.items():
        if result:
            print_success(f"{test_name}")
        else:
            print_error(f"{test_name}")
    
    print(f"\n{Colors.BLUE}{'='*70}{Colors.RESET}")
    print(f"\nRésultat: {passed}/{total} tests réussis")
    
    if passed == total:
        print(f"{Colors.GREEN}✓ Tous les tests sont passés!{Colors.RESET}")
        return 0
    elif passed >= total * 0.7:
        print(f"{Colors.YELLOW}⚠ La plupart des tests sont passés{Colors.RESET}")
        return 0
    else:
        print(f"{Colors.RED}✗ Plusieurs tests ont échoué{Colors.RESET}")
        return 1

if __name__ == "__main__":
    exit(main())
