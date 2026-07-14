import sys
import time
import json
from gvm.connections import RemoteConnection
from gvm.protocols.latest import Gmp
from gvm.transforms import EtreeTransform

def run_scan(target_host):
    connection = RemoteConnection(hostname='openvas', port=9390)
    transform = EtreeTransform()
    
    print("[*] Waiting for OpenVAS/GVM service to be ready...")
    max_retries = 30
    for i in range(max_retries):
        try:
            with Gmp(connection=connection, transform=transform) as gmp:
                gmp.authenticate('admin', 'admin')
                break
        except Exception:
            if i == max_retries - 1:
                print("[-] Timeout waiting for OpenVAS service.")
                sys.exit(1)
            time.sleep(10)

    try:
        with Gmp(connection=connection, transform=transform) as gmp:
            # Login
            gmp.authenticate('admin', 'admin')
            print("[+] Authenticated with OpenVAS/GVM.")

            # 1. Create Target
            target_name = f"Target {target_host} {int(time.time())}"
            response = gmp.create_target(name=target_name, hosts=[target_host])
            target_id = response.xpath('@id')[0]
            print(f"[+] Created Target: {target_id}")

            # 2. Find "Full and fast" scan config
            configs = gmp.get_scan_configs()
            config_id = None
            for config in configs.xpath('//config'):
                if "Full and fast" in config.xpath('name/text()')[0]:
                    config_id = config.xpath('@id')[0]
                    break
            
            if not config_id:
                config_id = configs.xpath('//config/@id')[0] # Fallback
            
            # 3. Create Task
            task_name = f"Scan {target_host} {int(time.time())}"
            response = gmp.create_task(name=task_name, config_id=config_id, target_id=target_id, scanner_id="08b69003-5fc2-4037-a479-93b440211c73")
            task_id = response.xpath('@id')[0]
            print(f"[+] Created Task: {task_id}")

            # 4. Start Task
            gmp.start_task(task_id)
            print("[*] Task started. Monitoring progress...")

            # 5. Monitor
            while True:
                response = gmp.get_task(task_id)
                status = response.xpath('//status/text()')[0]
                progress = response.xpath('//progress/text()')[0]
                print(f"[*] Status: {status} ({progress}%)")
                
                if status in ["Done", "Stopped", "Error"]:
                    break
                time.sleep(10)

            # 6. Get Results
            report_id = response.xpath('//last_report/report/@id')[0]
            results = gmp.get_report(report_id)
            
            # Simplified output for the terminal
            print("\n[!] SCAN COMPLETE. VULNERABILITIES FOUND:")
            for r in results.xpath('//result'):
                name = r.xpath('name/text()')[0]
                severity = r.xpath('severity/text()')[0]
                print(f"- [{severity}] {name}")

    except Exception as e:
        print(f"[-] OpenVAS Error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python openvas_runner.py <target>")
        sys.exit(1)
    run_scan(sys.argv[1])
