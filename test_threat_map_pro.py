"""
Test Script pour Threat Map Pro
Vérifie que toutes les corrections sont fonctionnelles
"""

import requests
import json
import time
from datetime import datetime
from colorama import init, Fore, Style

init(autoreset=True)

API_URL = "http://localhost:8005"
FRONTEND_URL = "http://localhost:3001"

def print_header(text):
    print(f"\n{Fore.CYAN}{'='*60}")
    print(f"{Fore.CYAN}{text:^60}")
    print(f"{Fore.CYAN}{'='*60}\n")

def print_success(text):
    print(f"{Fore.GREEN}✓ {text}")

def print_error(text):
    print(f"{Fore.RED}✗ {text}")

def print_info(text):
    print(f"{Fore.YELLOW}ℹ {text}")

def test_backend_health():
    """Test 1: Vérifier que le backend est en ligne"""
    print_header("TEST 1: Backend Health Check")
    
    try:
        response = requests.get(f"{API_URL}/api/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print_success(f"Backend en ligne: {data.get('status')}")
            print_info(f"Timestamp: {data.get('timestamp')}")
            return True
        else:
            print_error(f"Backend erreur: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Backend inaccessible: {e}")
        return False

def test_threat_analysis_api():
    """Test 2: Vérifier l'API d'analyse de menaces"""
    print_header("TEST 2: Threat Analysis API")
    
    # Test avec un event_id fictif
    event_id = "EVT-12345"
    
    try:
        response = requests.get(f"{API_URL}/api/threat-analysis/{event_id}", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print_success(f"API threat-analysis fonctionne")
            print_info(f"Event ID: {data.get('event_id')}")
            print_info(f"Severity: {data.get('severity')}")
            print_info(f"Confidence: {data.get('confidence', 0)*100:.1f}%")
            print_info(f"Attack Type: {data.get('attack_type')}")
            print_info(f"Source IP: {data.get('source_ip')}")
            print_info(f"Risk Score: {data.get('risk_score')}/100")
            print_info(f"Recommendations: {len(data.get('recommendations', []))} items")
            print_info(f"Countermeasures: {len(data.get('countermeasures', []))} items")
            
            # Vérifier les champs requis
            required_fields = [
                'event_id', 'severity', 'confidence', 'source_ip', 
                'attack_type', 'attack_vector', 'risk_score', 
                'recommendations', 'countermeasures'
            ]
            
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                print_error(f"Champs manquants: {', '.join(missing_fields)}")
                return False
            else:
                print_success("Tous les champs requis présents")
                return True
        else:
            print_error(f"API erreur: {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Erreur API: {e}")
        return False

def test_countermeasures_api():
    """Test 3: Vérifier l'API de déploiement de contre-mesures"""
    print_header("TEST 3: Countermeasures Deployment API")
    
    payload = {
        "event_id": "EVT-12345",
        "action": "block_ip",
        "target": "192.168.1.100",
        "reason": "Test deployment from test script"
    }
    
    try:
        response = requests.post(
            f"{API_URL}/api/threat-analysis/countermeasures/deploy",
            json=payload,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            print_success(f"Déploiement réussi")
            print_info(f"Status: {data.get('status')}")
            print_info(f"Action: {data.get('action')}")
            print_info(f"Target: {data.get('target')}")
            print_info(f"Message: {data.get('message')}")
            
            details = data.get('details', {})
            if details:
                print_info(f"Firewall Rule ID: {details.get('firewall_rule_id')}")
                print_info(f"Affected Devices: {details.get('affected_devices')}")
                print_info(f"Propagation Time: {details.get('propagation_time')}")
            
            return True
        else:
            print_error(f"Déploiement échoué: {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Erreur déploiement: {e}")
        return False

def test_timeline_api():
    """Test 4: Vérifier l'API de timeline"""
    print_header("TEST 4: Attack Timeline API")
    
    event_id = "EVT-12345"
    
    try:
        response = requests.get(f"{API_URL}/api/threat-analysis/timeline/{event_id}", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            timeline = data.get('timeline', [])
            
            print_success(f"Timeline récupérée")
            print_info(f"Event ID: {data.get('event_id')}")
            print_info(f"Total Duration: {data.get('total_duration')}")
            print_info(f"Current Stage: {data.get('current_stage')}")
            print_info(f"Timeline Events: {len(timeline)}")
            
            if timeline:
                print_info("\nPremiers événements:")
                for i, event in enumerate(timeline[:3]):
                    print(f"  {i+1}. [{event.get('severity')}] {event.get('stage')}: {event.get('description')}")
            
            return True
        else:
            print_error(f"Timeline erreur: {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Erreur timeline: {e}")
        return False

def test_correlation_api():
    """Test 5: Vérifier l'API de corrélation"""
    print_header("TEST 5: Correlation Graph API")
    
    event_id = "EVT-12345"
    
    try:
        response = requests.get(f"{API_URL}/api/threat-analysis/correlation/{event_id}", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            nodes = data.get('nodes', [])
            edges = data.get('edges', [])
            
            print_success(f"Graphe de corrélation récupéré")
            print_info(f"Event ID: {data.get('event_id')}")
            print_info(f"Total Nodes: {data.get('total_nodes')}")
            print_info(f"Total Edges: {data.get('total_edges')}")
            
            if nodes:
                print_info("\nNœuds:")
                for node in nodes[:5]:
                    print(f"  - {node.get('label')} ({node.get('type')}) - {node.get('severity')}")
            
            if edges:
                print_info("\nConnexions:")
                for edge in edges[:5]:
                    print(f"  - {edge.get('from')} → {edge.get('to')} ({edge.get('label')})")
            
            return True
        else:
            print_error(f"Corrélation erreur: {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Erreur corrélation: {e}")
        return False

def test_stats_api():
    """Test 6: Vérifier l'API de statistiques"""
    print_header("TEST 6: Threat Statistics API")
    
    try:
        response = requests.get(f"{API_URL}/api/threat-analysis/stats/summary", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            
            print_success(f"Statistiques récupérées")
            print_info(f"Total Events 24h: {data.get('total_events_24h'):,}")
            print_info(f"Critical Events: {data.get('critical_events'):,}")
            print_info(f"High Events: {data.get('high_events'):,}")
            print_info(f"Blocked IPs: {data.get('blocked_ips'):,}")
            print_info(f"Active Countermeasures: {data.get('active_countermeasures'):,}")
            
            top_attacks = data.get('top_attack_types', [])
            if top_attacks:
                print_info("\nTop Attack Types:")
                for attack in top_attacks[:3]:
                    print(f"  - {attack.get('type')}: {attack.get('count'):,}")
            
            top_countries = data.get('top_source_countries', [])
            if top_countries:
                print_info("\nTop Source Countries:")
                for country in top_countries[:3]:
                    print(f"  - {country.get('country')}: {country.get('count'):,}")
            
            return True
        else:
            print_error(f"Stats erreur: {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Erreur stats: {e}")
        return False

def test_frontend_page():
    """Test 7: Vérifier que la page frontend est accessible"""
    print_header("TEST 7: Frontend Page Accessibility")
    
    try:
        response = requests.get(f"{FRONTEND_URL}/threat-map-pro", timeout=10)
        
        if response.status_code == 200:
            print_success(f"Page Threat Map Pro accessible")
            print_info(f"Status Code: {response.status_code}")
            print_info(f"Content Length: {len(response.content)} bytes")
            
            # Vérifier que certains éléments clés sont présents
            content = response.text.lower()
            
            checks = {
                "world_threat_matrix": "world_threat_matrix" in content or "threat" in content,
                "deploy_counter_measures": "deploy" in content or "counter" in content,
            }
            
            for check_name, check_result in checks.items():
                if check_result:
                    print_success(f"Élément trouvé: {check_name}")
                else:
                    print_error(f"Élément manquant: {check_name}")
            
            return all(checks.values())
        else:
            print_error(f"Page inaccessible: {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Erreur frontend: {e}")
        print_info("Assurez-vous que le frontend est démarré (npm run dev)")
        return False

def test_invalid_action():
    """Test 8: Vérifier la gestion d'erreur pour action invalide"""
    print_header("TEST 8: Error Handling - Invalid Action")
    
    payload = {
        "event_id": "EVT-12345",
        "action": "invalid_action",
        "target": "192.168.1.100",
        "reason": "Test error handling"
    }
    
    try:
        response = requests.post(
            f"{API_URL}/api/threat-analysis/countermeasures/deploy",
            json=payload,
            timeout=10
        )
        
        if response.status_code == 400:
            print_success(f"Erreur correctement gérée (400 Bad Request)")
            data = response.json()
            print_info(f"Message d'erreur: {data.get('detail')}")
            return True
        else:
            print_error(f"Mauvaise gestion d'erreur: {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Erreur test: {e}")
        return False

def run_all_tests():
    """Exécuter tous les tests"""
    print(f"\n{Fore.MAGENTA}{'='*60}")
    print(f"{Fore.MAGENTA}{'THREAT MAP PRO - TEST SUITE':^60}")
    print(f"{Fore.MAGENTA}{'='*60}\n")
    
    print_info(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print_info(f"Backend URL: {API_URL}")
    print_info(f"Frontend URL: {FRONTEND_URL}")
    
    tests = [
        ("Backend Health Check", test_backend_health),
        ("Threat Analysis API", test_threat_analysis_api),
        ("Countermeasures API", test_countermeasures_api),
        ("Timeline API", test_timeline_api),
        ("Correlation API", test_correlation_api),
        ("Statistics API", test_stats_api),
        ("Frontend Page", test_frontend_page),
        ("Error Handling", test_invalid_action),
    ]
    
    results = []
    
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
            time.sleep(0.5)  # Pause entre les tests
        except Exception as e:
            print_error(f"Test {test_name} a crashé: {e}")
            results.append((test_name, False))
    
    # Résumé
    print_header("RÉSUMÉ DES TESTS")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = f"{Fore.GREEN}✓ PASS" if result else f"{Fore.RED}✗ FAIL"
        print(f"{status} - {test_name}")
    
    print(f"\n{Fore.CYAN}{'='*60}")
    percentage = (passed / total * 100) if total > 0 else 0
    
    if passed == total:
        print(f"{Fore.GREEN}✓ TOUS LES TESTS RÉUSSIS: {passed}/{total} ({percentage:.0f}%)")
        print(f"{Fore.GREEN}✓ Threat Map Pro est prêt pour production!")
    elif passed >= total * 0.75:
        print(f"{Fore.YELLOW}⚠ TESTS PARTIELS: {passed}/{total} ({percentage:.0f}%)")
        print(f"{Fore.YELLOW}⚠ Quelques corrections nécessaires")
    else:
        print(f"{Fore.RED}✗ TESTS ÉCHOUÉS: {passed}/{total} ({percentage:.0f}%)")
        print(f"{Fore.RED}✗ Corrections majeures requises")
    
    print(f"{Fore.CYAN}{'='*60}\n")
    
    return passed == total

if __name__ == "__main__":
    try:
        success = run_all_tests()
        exit(0 if success else 1)
    except KeyboardInterrupt:
        print(f"\n{Fore.YELLOW}Tests interrompus par l'utilisateur")
        exit(1)
    except Exception as e:
        print(f"\n{Fore.RED}Erreur fatale: {e}")
        exit(1)
