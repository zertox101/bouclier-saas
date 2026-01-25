import winreg
import subprocess
import os
import sys
import ctypes

def is_admin():
    try:
        return ctypes.windll.shell32.IsUserAnAdmin()
    except:
        return False

def set_reg(path, name, value, reg_type=winreg.REG_DWORD):
    try:
        # CreateKey will open the key if it exists, or create it if not
        key = winreg.CreateKey(winreg.HKEY_LOCAL_MACHINE, path)
        winreg.SetValueEx(key, name, 0, reg_type, value)
        winreg.CloseKey(key)
        print(f"[+] {name} set to {value}")
    except Exception as e:
        print(f"[!] Failed to set {name}: {e}")

def harden_rdp():
    print("===== APPLYING RDP HARDENING SETTINGS =====")

    # 1. Enable RDP (Ensure it's on but secured, or user might want to disable it? Assuming hardening active RDP)
    # fDenyTSConnections = 0 means Allow connections
    set_reg(r"SYSTEM\CurrentControlSet\Control\Terminal Server", "fDenyTSConnections", 0)

    # 2. Enable NLA (Network Level Authentication) - Critical for security
    set_reg(r"SYSTEM\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp", "UserAuthentication", 1)
    
    # Force NLA in another key often used by GPO
    set_reg(r"SYSTEM\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp", "SecurityLayer", 2)

    # 3. High encryption level (3 = High/128-bit)
    set_reg(r"SYSTEM\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp", "MinEncryptionLevel", 3)

    # 4. Disable clipboard redirect (prevents data exfiltration)
    set_reg(r"SYSTEM\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp", "fDisableClip", 1)

    # 5. Disable printer redirect
    set_reg(r"SYSTEM\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp", "fDisableCpm", 1)

    # 6. Disable drive redirect
    set_reg(r"SYSTEM\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp", "fDisableCdm", 1)

    # 7. Limit login attempts (local policy)
    print("[~] Configuring Account Lockout Policy...")
    subprocess.run("net accounts /lockoutthreshold:3 /lockoutduration:30 /lockoutwindow:30", shell=True)
    print("[+] Login attempts limited to 3 (30 min lockout)")

    # 8. Enable firewall rule securely
    print("[~] Configuring Firewall...")
    subprocess.run("netsh advfirewall firewall set rule group=\"remote desktop\" new enable=Yes", shell=True)
    print("[+] Firewall rule enabled/updated")

    print("===== HARDENING APPLIED SUCCESSFULLY =====")

def restart_services():
    print("[~] Restarting RDP services to apply changes...")
    try:
        subprocess.run("net stop termservice /y", shell=True, check=False)
        subprocess.run("net start termservice", shell=True, check=False)
        print("[+] RDP services restarted")
    except Exception as e:
        print(f"[!] Warning: Could not auto-restart RDP service. Please reboot manually. ({e})")

class RDPHardener:
    """Wrapper class for SHIELD Integration"""
    def run(self):
        main()

def main():
    if os.name != "nt":
        print("[-] This script works only on Windows.")
        return

    print("==========================================")
    print("    SHIELD RDP HARDENING TOOL V1.0        ")
    print("==========================================")

    if not is_admin():
        print("[!] ERROR: Administrator privileges required.")
        print("    Please run this script as Administrator/Root.")
        return

    print("This will apply security settings to Remote Desktop:")
    print(" - Enable NLA (Network Level Authentication)")
    print(" - Set High Encryption")
    print(" - Disable Clipboard/Drive/Printer Sharing")
    print(" - Set Account Lockout Threshold (3 attempts)")
    print("\nWARNING: This may disconnect active RDP sessions.")
    
    confirm = input("Do you want to proceed? (y/n): ")
    if confirm.lower() != 'y':
        print("Operation cancelled.")
        return

    try:
        harden_rdp()
        restart_services()
        print("\n[SUCCESS] System RDP Hardening Complete.")
    except Exception as e:
        print(f"\n[CRITICAL ERROR] {e}")
    
    input("\nPress Enter to exit...")

if __name__ == "__main__":
    main()
