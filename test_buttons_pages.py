#!/usr/bin/env python3
"""
Script de test automatique pour vérifier tous les boutons et pages
"""

import requests
import json
from typing import Dict, List, Tuple
from datetime import datetime

# Configuration
BACKEND_URL = "http://localhost:8005"
FRONTEND_URL = "http://localhost:3001"

# Couleurs
GREEN = '\033[0;32m'
RED = '\033[0;31m'
YELLOW = '\033[1;33m'
CYAN = '\033[0;36m'
WHITE = '\033[1;37m'
NC = '\033[0m'


class ButtonTester:
    """Testeur automatique de boutons et endpoints"""
    
    def __init__(self):
        self.results = {
            'passed': 0,
            'failed': 0,
            'warnings': 0
        }
        self.failed_tests = []
    
    def print_header(self, text: str):
        print(f"\n{CYAN}{'='*60}")
        print(f" {text}")
        print(f"{'='*60}{NC}\n")
    
    def print_status(self, status: str, message: str):
        colors = {
            'PASS': GREEN,
            'FAIL': RED,
            'WARN': YELLOW,
            'INFO': WHITE
        }
        color = colors.get(status, NC)
        print(f"  {color}[{status}]{NC} {message}")
        
        if status == 'PASS':
            self.results['passed'] += 1
        elif status == 'FAIL':
            self.results['failed'] += 1
            self.failed_tests.append(message)
        elif status == 'WARN':
            self.results['warnings'] += 1
    
    def test_endpoint(self, method: str, endpoint: str, description: str, 
                     expected_status: int = 200, data: Dict = None) -> bool:
        """Test un endpoint API"""
        url = f"{BACKEND_URL}{endpoint}"
        
        try:
            if method == 'GET':
                response = requests.get(url, timeout=5)
            elif method == 'POST':
                response = requests.post(url, json=data, timeout=5)
            elif method == 'PUT':
                response = requests.put(url, json=data, timeout=5)
            elif method == 'DELETE':
                response = requests.delete(url, timeout=5)
            else:
                self.print_status('FAIL', f"{description} - Méthode HTTP invalide")
                return False
            
            if response.status_code == expected_status:
                self.print_status('PASS', f"{description} - Status {response.status_code}")
                return True
            else:
                self.print_status('FAIL', f"{description} - Status {response.status_code} (attendu {expected_status})")
                return False
                
        except requests.exceptions.ConnectionError:
            self.print_status('FAIL', f"{description} - Connexion refusée (service arrêté?)")
            return False
        except requests.exceptions.Timeout:
            self.print_status('WARN', f"{description} - Timeout (>5s)")
            return False
        except Exception as e:
            self.print_status('FAIL', f"{description} - Erreur: {str(e)}")
            return False
    
    def test_backend_endpoints(self):
        """Test tous les endpoints backend"""
        self.print_header("TEST DES ENDPOINTS BACKEND")
        
        # Health checks
        self.test_endpoint('GET', '/api/saas/control/health', 'Health Check')
        self.test_endpoint('GET', '/api/saas/control/pulse', 'System Pulse')
        
        # Alerts
        self.test_endpoint('GET', '/alerts', 'Get Alerts')
        self.test_endpoint('GET', '/api/alerts/stats', 'Alert Stats')
        
        # Telemetry
        self.test_endpoint('GET', '/api/telemetry/stats', 'Telemetry Stats')
        self.test_endpoint('GET', '/api/telemetry/report', 'Generate Report')
        
        # Traffic
        self.test_endpoint('GET', '/api/traffic/stats', 'Traffic Stats')
        
        # Forensics
        self.test_endpoint('GET', '/api/forensics/executive-summary', 'Executive Summary')
        
        # AI Reasoning
        self.test_endpoint('GET', '/api/ai-reasoning/stats', 'AI Reasoning Stats')
        
        # CICIDS Stream
        self.test_endpoint('GET', '/api/cicids/stream/status', 'CICIDS Stream Status')
        
        # SOC Expert
        self.test_endpoint('GET', '/api/soc-expert/health', 'SOC Expert Health')
    
    def test_critical_buttons(self):
        """Test les boutons critiques"""
        self.print_header("TEST DES BOUTONS CRITIQUES")
        
        # Reports - Export PDF
        self.print_status('INFO', "Bouton 'Export PDF' - Nécessite données en temps réel")
        
        # Reports - Export CSV
        self.test_endpoint('GET', '/alerts', 'Bouton Export CSV (données alertes)')
        
        # Reports - Generate Slides
        self.print_status('WARN', "Bouton 'Generate Slides' - Nécessite données CICIDS")
        
        # Alerts - Resolve
        self.print_status('FAIL', "Bouton 'Resolve Alert' - Endpoint manquant")
        
        # Incidents - Create
        self.print_status('FAIL', "Bouton 'Create Incident' - Endpoint manquant")
        
        # Incidents - Assign
        self.print_status('FAIL', "Bouton 'Assign Incident' - Endpoint manquant")
        
        # Traffic - Export PCAP
        self.print_status('FAIL', "Bouton 'Export PCAP' - Non implémenté")
        
        # Mythos - Deploy
        self.test_endpoint('POST', '/api/saas/control/redteam/mythos', 
                          'Bouton Mythos Deploy', 
                          expected_status=422,  # Sans target, retourne 422
                          data={})
    
    def test_page_accessibility(self):
        """Test l'accessibilité des pages frontend"""
        self.print_header("TEST D'ACCESSIBILITÉ DES PAGES")
        
        pages = [
            '/overview',
            '/mythos-intelligence',
            '/arsenal',
            '/red-team',
            '/reports',
            '/alerts',
            '/traffic',
            '/incidents',
            '/assets',
            '/saas-control'
        ]
        
        for page in pages:
            url = f"{FRONTEND_URL}{page}"
            try:
                response = requests.get(url, timeout=5)
                if response.status_code == 200:
                    self.print_status('PASS', f"Page {page} accessible")
                else:
                    self.print_status('FAIL', f"Page {page} - Status {response.status_code}")
            except requests.exceptions.ConnectionError:
                self.print_status('FAIL', f"Page {page} - Frontend arrêté")
                break
            except Exception as e:
                self.print_status('FAIL', f"Page {page} - Erreur: {str(e)}")
    
    def test_data_availability(self):
        """Test la disponibilité des données"""
        self.print_header("TEST DE DISPONIBILITÉ DES DONNÉES")
        
        # Test alerts data
        try:
            response = requests.get(f"{BACKEND_URL}/alerts", timeout=5)
            if response.status_code == 200:
                data = response.json()
                alert_count = len(data.get('alerts', []))
                if alert_count > 0:
                    self.print_status('PASS', f"Alertes disponibles: {alert_count}")
                else:
                    self.print_status('WARN', "Aucune alerte disponible")
        except:
            self.print_status('FAIL', "Impossible de récupérer les alertes")
        
        # Test telemetry data
        try:
            response = requests.get(f"{BACKEND_URL}/api/telemetry/stats", timeout=5)
            if response.status_code == 200:
                self.print_status('PASS', "Données télémétrie disponibles")
            else:
                self.print_status('WARN', "Données télémétrie indisponibles")
        except:
            self.print_status('FAIL', "Impossible de récupérer la télémétrie")
        
        # Test CICIDS stream
        try:
            response = requests.get(f"{BACKEND_URL}/api/cicids/stream/status", timeout=5)
            if response.status_code == 200:
                data = response.json()
                if data.get('is_running'):
                    self.print_status('PASS', f"Stream CICIDS actif - {data.get('rows_streamed', 0)} rows")
                else:
                    self.print_status('WARN', "Stream CICIDS arrêté")
        except:
            self.print_status('WARN', "Status stream CICIDS indisponible")
    
    def generate_report(self):
        """Génère un rapport de synthèse"""
        self.print_header("RAPPORT DE SYNTHÈSE")
        
        total = self.results['passed'] + self.results['failed'] + self.results['warnings']
        pass_rate = (self.results['passed'] / total * 100) if total > 0 else 0
        
        print(f"  {GREEN}✓ Tests réussis:{NC} {self.results['passed']}")
        print(f"  {RED}✗ Tests échoués:{NC} {self.results['failed']}")
        print(f"  {YELLOW}⚠ Avertissements:{NC} {self.results['warnings']}")
        print(f"  {WHITE}━ Total:{NC} {total}")
        print(f"\n  {WHITE}Taux de réussite:{NC} {pass_rate:.1f}%")
        
        if self.results['failed'] > 0:
            print(f"\n  {RED}Tests échoués:{NC}")
            for test in self.failed_tests:
                print(f"    • {test}")
        
        # Status global
        print(f"\n  {WHITE}Statut Global:{NC}")
        if pass_rate >= 90:
            print(f"  {GREEN}✓ EXCELLENT{NC} - Système opérationnel")
        elif pass_rate >= 70:
            print(f"  {YELLOW}⚠ BON{NC} - Quelques corrections nécessaires")
        elif pass_rate >= 50:
            print(f"  {YELLOW}⚠ MOYEN{NC} - Corrections importantes nécessaires")
        else:
            print(f"  {RED}✗ CRITIQUE{NC} - Système nécessite des corrections majeures")
        
        # Sauvegarder le rapport
        report_data = {
            'timestamp': datetime.now().isoformat(),
            'results': self.results,
            'failed_tests': self.failed_tests,
            'pass_rate': pass_rate
        }
        
        with open('test_report.json', 'w') as f:
            json.dump(report_data, f, indent=2)
        
        print(f"\n  {WHITE}Rapport sauvegardé:{NC} test_report.json")


def main():
    print(f"{CYAN}")
    print("╔══════════════════════════════════════════════════════════╗")
    print("║   TEST AUTOMATIQUE - BOUTONS ET PAGES                   ║")
    print("║   BOUCLIER SAAS - Vérification Complète                 ║")
    print("╚══════════════════════════════════════════════════════════╝")
    print(f"{NC}")
    
    tester = ButtonTester()
    
    # Exécuter les tests
    tester.test_backend_endpoints()
    tester.test_critical_buttons()
    tester.test_page_accessibility()
    tester.test_data_availability()
    
    # Générer le rapport
    tester.generate_report()
    
    print(f"\n{WHITE}Pour démarrer les services:{NC}")
    print(f"  cd bouclier-saas")
    print(f"  docker-compose up -d")
    print(f"\n{WHITE}Pour tester manuellement:{NC}")
    print(f"  Frontend: http://localhost:3001")
    print(f"  Backend API: http://localhost:8005/docs")
    print()


if __name__ == "__main__":
    main()
