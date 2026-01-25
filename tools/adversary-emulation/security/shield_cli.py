#!/usr/bin/env python3
"""
SHIELD Security Toolkit - Master CLI v2.1
Unified interface for all security tools
For authorized security testing only!
"""

import sys
import os
import argparse
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Force UTF-8
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')


def print_main_banner():
    print("""
\033[96m
███████╗██╗  ██╗██╗███████╗██╗     ██████╗ 
██╔════╝██║  ██║██║██╔════╝██║     ██╔══██╗
███████╗███████║██║█████╗  ██║     ██║  ██║
╚════██║██╔══██║██║██╔══╝  ██║     ██║  ██║
███████║██║  ██║██║███████╗███████╗██████╔╝
╚══════╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝╚═════╝ 
\033[0m
\033[93m    ╔═══════════════════════════════════════════╗
    ║     ADVANCED SECURITY TOOLKIT v2.1        ║
    ║       Enterprise Penetration Testing      ║
    ╚═══════════════════════════════════════════╝\033[0m
    
    \033[91m⚠  For authorized security testing only!  ⚠\033[0m
    """)


def print_menu():
    print("""
\033[96m╔═══════════════════════════════════════════════════════════════╗
║                    \033[97mSECURITY MODULES\033[96m                            ║
╠═══════════════════════════════════════════════════════════════╣\033[0m

  \033[93m━━━ RECONNAISSANCE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\033[0m
  
   [\033[96m1\033[0m]  Network Recon          Port scanning, OS fingerprinting
   [\033[96m2\033[0m]  OSINT Recon            DNS, WHOIS, subdomain enumeration
   [\033[96m3\033[0m]  Web Scanner            XSS, SQLi, LFI, security headers

  \033[93m━━━ VULNERABILITY ASSESSMENT ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\033[0m
  
   [\033[96m4\033[0m]  Vuln Scanner           Local system security assessment
   [\033[96m5\033[0m]  Network Scanner        Discover network devices
   [\033[96m6\033[0m]  Password Auditor       Hash cracking, strength analysis

  \033[93m━━━ ADVANCED SECURITY ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\033[0m
  
   [\033[96m7\033[0m]  AI Threat Detection    ML-based anomaly detection
   [\033[96m8\033[0m]  Post-Quantum Crypto    Quantum-resistant encryption
   [\033[96m9\033[0m]  Zero Trust Framework   Identity & access management

  \033[93m━━━ EXPLOITATION ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\033[0m
  
   [\033[96m10\033[0m] Exploit Framework      Payload generation, exploits
   [\033[96m11\033[0m] Auth Auditor           SSH/SMB/RDP brute force
   [\033[96m12\033[0m] C2 Simulator           Command & Control testing

  \033[93m━━━ ANALYSIS & REPORTING ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\033[0m
  
   [\033[96m13\033[0m] Packet Sniffer         Network traffic analysis
   [\033[96m14\033[0m] Mobile Security        APK analysis, app testing
   [\033[96m15\033[0m] Report Generator       Professional PDF/HTML reports

  \033[93m━━━ SOC & THREAT INTEL ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\033[0m
  
   [\033[96m17\033[0m] Threat Hunting         IOC lookup, MITRE queries
   [\033[96m18\033[0m] Malware Analyzer       Static analysis, YARA rules
   [\033[96m19\033[0m] Honeypot System        Fake services, attacker detection
   [\033[96m20\033[0m] IP Scanner             Geolocation, threat intel, ports

  \033[93m━━━ HARDENING & DEFENSE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\033[0m

   [\033[96m21\033[0m] RDP Hardener           Secure Registry, NLA, Firewall Rules

  \033[93m━━━ SIMULATION ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\033[0m
  
   [\033[96m16\033[0m] Attack Simulator       Generate security events

\033[96m╠═══════════════════════════════════════════════════════════════╣
║\033[0m   [\033[91m0\033[0m]  Exit                                                    \033[96m║
╚═══════════════════════════════════════════════════════════════╝\033[0m
    """)


def run_module(module_name: str):
    """Run a security module"""
    modules = {
        '1': ('network_recon', 'NetworkRecon', 'Network Reconnaissance'),
        '2': ('osint_recon', 'OSINTRecon', 'OSINT Reconnaissance'),
        '3': ('web_scanner', 'WebSecurityScanner', 'Web Application Scanner'),
        '4': ('vuln_scanner', None, 'Vulnerability Scanner'),
        '5': ('network_scanner', None, 'Network Scanner'),
        '6': ('password_auditor', 'PasswordAuditor', 'Password Auditor'),
        '7': ('ai_threat_detector', 'AIThreatDetector', 'AI Threat Detection'),
        '8': ('pqc_crypto', None, 'Post-Quantum Cryptography'),
        '9': ('zero_trust', 'ZeroTrustFramework', 'Zero Trust Framework'),
        '10': ('exploit_framework', 'ExploitFramework', 'Exploit Framework'),
        '11': ('auth_auditor', 'AuthAuditor', 'Authentication Auditor'),
        '12': ('c2_simulator', None, 'C2 Simulator'),
        '13': ('packet_sniffer', 'PacketSniffer', 'Packet Sniffer'),
        '14': ('mobile_security', 'MobileSecurityFramework', 'Mobile Security'),
        '15': ('report_generator', None, 'Report Generator'),
        '16': ('attack_sim', None, 'Attack Simulator'),
        '17': ('threat_hunting', 'ThreatHuntingEngine', 'Threat Hunting'),
        '18': ('malware_analyzer', 'MalwareAnalyzer', 'Malware Analyzer'),
        '19': ('honeypot_system', 'HoneypotSystem', 'Honeypot System'),
        '20': ('ip_scanner', 'AdvancedIPScanner', 'IP Scanner'),
        '21': ('rdp_hardening', 'RDPHardener', 'RDP Hardening Tool'),
    }
    
    if module_name not in modules:
        print(f"\n  \033[91m[!] Invalid selection: {module_name}\033[0m")
        return
    
    module_file, class_name, display_name = modules[module_name]
    
    print(f"\n  \033[96m[*] Loading {display_name}...\033[0m\n")
    
    try:
        # Try importing from current directory first
        if module_file in ['vuln_scanner', 'network_scanner', 'attack_sim']:
            # These are in simulation folder
            sim_path = os.path.join(os.path.dirname(__file__), '..', 'simulation')
            sys.path.insert(0, sim_path)
        
        module = __import__(module_file)
        
        if class_name:
            cls = getattr(module, class_name)
            instance = cls()
            
            if hasattr(instance, 'demo'):
                instance.demo()
            elif hasattr(instance, 'run_demo'):
                instance.run_demo()
            elif hasattr(instance, 'run_interactive'):
                instance.run_interactive()
            elif hasattr(instance, 'run'):
                instance.run()
            else:
                print(f"  \033[93m[*] Module loaded. Use interactively:\033[0m")
                print(f"      from {module_file} import {class_name}")
                print(f"      obj = {class_name}()")
        else:
            # Run main function
            if hasattr(module, 'main'):
                module.main()
            elif hasattr(module, 'demo'):
                module.demo()
            else:
                print(f"  \033[93m[*] Module loaded successfully.\033[0m")
                
    except ImportError as e:
        print(f"  \033[91m[!] Error loading module: {e}\033[0m")
        print(f"  \033[93m[*] Try running directly: python {module_file}.py\033[0m")
    except Exception as e:
        print(f"  \033[91m[!] Error: {e}\033[0m")


def interactive_mode():
    """Run interactive menu"""
    print_main_banner()
    
    while True:
        print_menu()
        
        try:
            choice = input("  \033[97mSelect module\033[0m [\033[96m0-21\033[0m]: ").strip()
            
            if choice == '0':
                print("\n  \033[96m[*] Thank you for using SHIELD Security Toolkit!\033[0m")
                print("  \033[93m[!] Remember: Only test systems you own!\033[0m\n")
                break
            elif choice in [str(i) for i in range(1, 22)]:
                run_module(choice)
                input("\n  \033[90mPress Enter to continue...\033[0m")
            else:
                print(f"\n  \033[91m[!] Invalid selection. Please enter 0-21.\033[0m")
                
        except KeyboardInterrupt:
            print("\n\n  \033[93m[*] Use '0' to exit properly.\033[0m")
        except Exception as e:
            print(f"\n  \033[91m[!] Error: {e}\033[0m")


def quick_run(module: str, target: str = None):
    """Quick run a module with target"""
    print_main_banner()
    
    module_map = {
        'recon': '1',
        'osint': '2',
        'web': '3',
        'vuln': '4',
        'network': '5',
        'password': '6',
        'ai': '7',
        'pqc': '8',
        'zerotrust': '9',
        'exploit': '10',
        'auth': '11',
        'c2': '12',
        'sniffer': '13',
        'mobile': '14',
        'report': '15',
        'attack': '16',
        'hunter': '17',
        'malware': '18',
        'honeypot': '19',
        'ipscan': '20',
        'rdp': '21',
    }
    
    if module.lower() in module_map:
        run_module(module_map[module.lower()])
    else:
        print(f"\n  \033[91m[!] Unknown module: {module}\033[0m")
        print("  \033[93mAvailable modules:\033[0m")
        for m in module_map.keys():
            print(f"    - {m}")


def main():
    parser = argparse.ArgumentParser(
        description="SHIELD Security Toolkit - Advanced Penetration Testing Suite",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python shield_cli.py                    # Interactive mode
  python shield_cli.py -m recon           # Run network recon
  python shield_cli.py -m web             # Run web scanner
  python shield_cli.py -m rdp             # Run RDP hardening
  python shield_cli.py --list             # List all modules
  
Available Modules:
  recon     - Network Reconnaissance
  osint     - OSINT Reconnaissance  
  web       - Web Application Scanner
  vuln      - Vulnerability Scanner
  network   - Network Device Scanner
  password  - Password Auditor
  ai        - AI Threat Detection
  pqc       - Post-Quantum Cryptography
  zerotrust - Zero Trust Framework
  exploit   - Exploit Framework
  auth      - Authentication Auditor
  c2        - C2 Simulator
  sniffer   - Packet Sniffer
  mobile    - Mobile Security
  report    - Report Generator
  attack    - Attack Simulator
  hunter    - Threat Hunting
  malware   - Malware Analyzer
  honeypot  - Honeypot System
  ipscan    - IP Scanner
  rdp       - RDP Hardener
        """
    )
    
    parser.add_argument('-m', '--module', 
                       help='Module to run (see list below)')
    parser.add_argument('-t', '--target',
                       help='Target IP/URL/domain')
    parser.add_argument('-o', '--output',
                       help='Output file')
    parser.add_argument('--list', action='store_true',
                       help='List all available modules')
    parser.add_argument('-i', '--interactive', action='store_true',
                       help='Force interactive mode')
    
    args = parser.parse_args()
    
    if args.list:
        print_main_banner()
        print("\n  \033[96mAvailable Modules:\033[0m\n")
        modules = [
            ('recon', 'Network Reconnaissance', 'Port scanning, OS fingerprinting'),
            ('osint', 'OSINT Reconnaissance', 'DNS, WHOIS, subdomains, emails'),
            ('web', 'Web Scanner', 'XSS, SQLi, LFI, security headers'),
            ('vuln', 'Vuln Scanner', 'Local system security assessment'),
            ('network', 'Network Scanner', 'Discover network devices'),
            ('password', 'Password Auditor', 'Hash cracking, strength analysis'),
            ('ai', 'AI Threat Detection', 'ML-based anomaly detection'),
            ('pqc', 'Post-Quantum Crypto', 'Quantum-resistant encryption'),
            ('zerotrust', 'Zero Trust', 'Identity & access management'),
            ('exploit', 'Exploit Framework', 'Payload generation, exploits'),
            ('auth', 'Auth Auditor', 'SSH/SMB/RDP brute force'),
            ('c2', 'C2 Simulator', 'Command & Control testing'),
            ('sniffer', 'Packet Sniffer', 'Network traffic analysis'),
            ('mobile', 'Mobile Security', 'APK analysis, app testing'),
            ('report', 'Report Generator', 'PDF/HTML security reports'),
            ('attack', 'Attack Simulator', 'Generate security events'),
            ('hunter', 'Threat Hunting', 'IOC lookup, MITRE queries'),
            ('malware', 'Malware Analyzer', 'Static analysis, YARA rules'),
            ('honeypot', 'Honeypot System', 'Fake services, attacker detection'),
            ('ipscan', 'IP Scanner', 'Geolocation, threat intel, ports'),
            ('rdp', 'RDP Hardener', 'Secure Registry, NLA, Firewall Rules'),
        ]
        for name, title, desc in modules:
            print(f"    \033[96m{name:12}\033[0m {title:25} \033[90m{desc}\033[0m")
        print()
        return
    
    if args.module:
        quick_run(args.module, args.target)
    else:
        interactive_mode()


if __name__ == "__main__":
    main()
