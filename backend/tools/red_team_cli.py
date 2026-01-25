import sys
import time
import socket
import random
import threading
import requests
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
    ║       SHIELD RED TEAM CLI - v1.0           ║
    ║       Live Security Auditing Tool          ║
    ╚════════════════════════════════════════════╝
    """ + Colors.ENDC)

def scan_ports(target):
    print(Colors.BLUE + f"[*] Starting SYN Scan on {target}..." + Colors.ENDC)
    open_ports = []
    # Common ports to scan quickly
    ports = [21, 22, 23, 25, 53, 80, 443, 3000, 3001, 5432, 6379, 8000, 8005, 8080]
    
    for port in ports:
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(0.5)
            result = sock.connect_ex((target, port))
            if result == 0:
                print(Colors.GREEN + f"    [+] Port {port} OPEN" + Colors.ENDC)
                open_ports.append(port)
            sock.close()
        except:
            pass
    return open_ports

def simulate_attack(type_name, count=100):
    print(Colors.WARNING + f"[*] Launching {type_name} Simulation..." + Colors.ENDC)
    # We simulate traffic by hitting the API, which the Shield backend monitors
    # The 'live' traffic monitor scans established connections
    
    def flood():
        try:
            # Connect to a service to create an ESTABLISHED state for netstat to pick up
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.connect((TARGET_IP, TARGET_PORT))
            time.sleep(random.uniform(0.1, 2.0)) # Hold connection
            s.close()
        except:
            pass

    threads = []
    print(f"    Sending {count} packets/requests...")
    for _ in range(count):
        t = threading.Thread(target=flood)
        t.start()
        threads.append(t)
        time.sleep(0.05) # Rate limit slightly to not crash local machine
        
    for t in threads:
        t.join()
        
    print(Colors.GREEN + "[+] Attack Simulation Complete." + Colors.ENDC)

def main():
    print_banner()
    while True:
        print("\n" + Colors.HEADER + "SELECT MODULE:" + Colors.ENDC)
        print("1. 🔍 Recon: Port Scanner")
        print("2. 💥 Attack: SYN Flood (Stress Test)")
        print("3. 🕷️ Web: Fuzzing / Directory Brute")
        print("4. 🚪 Exit")
        
        choice = input("\nshield-cli > ")
        
        if choice == '1':
            scan_ports(TARGET_IP)
        elif choice == '2':
            simulate_attack("SYN Flood", count=50)
        elif choice == '3':
            print(Colors.BLUE + "[*] Fuzzing endpoints..." + Colors.ENDC)
            simulate_attack("HTTP Fuzzing", count=20)
        elif choice == '4':
            simulate_sqli()
        elif choice == '5':
            sys.exit(0)
        else:
            print("Invalid command.")

def simulate_sqli():
    print(Colors.WARNING + "[*] Launching SQL Injection Simulation..." + Colors.ENDC)
    payloads = ["' OR 1=1 --", "admin' --", "UNION SELECT 1,2,3--"]
    
    for i in range(10):
        # Simulate connecting to web port with bad payload
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.connect((TARGET_IP, TARGET_PORT))
            payload = random.choice(payloads)
            req = f"GET /api/login?user={payload} HTTP/1.1\r\nHost: {TARGET_IP}\r\n\r\n"
            s.send(req.encode())
            s.close()
            print(f"    [+] Injected payload: {payload}")
            time.sleep(0.1)
        except:
            pass
    print(Colors.GREEN + "[+] SQLi Simulation Complete." + Colors.ENDC)

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "--auto":
        print_banner()
        print(Colors.WARNING + "[!] AUTO-MODE ENGAGED" + Colors.ENDC)
        scan_ports(TARGET_IP)
        simulate_attack("SYN Flood", count=50)
        simulate_attack("HTTP Fuzzing", count=20)
        simulate_sqli()
        print(Colors.GREEN + "[+] Auto-Test Complete." + Colors.ENDC)
    else:
        main()
