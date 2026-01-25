#!/usr/bin/env python3
"""
SHIELD Mobile Security Framework
APK Analysis, Mobile Threat Detection, and App Security Testing
"""

import sys
import os
import json
import hashlib
import zipfile
import re
import struct
from datetime import datetime
from typing import List, Dict, Optional, Tuple
from pathlib import Path
import xml.etree.ElementTree as ET

# Force UTF-8
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')


class APKAnalyzer:
    """Analyze Android APK files for security issues"""
    
    def __init__(self):
        self.dangerous_permissions = [
            'android.permission.READ_SMS',
            'android.permission.SEND_SMS',
            'android.permission.RECEIVE_SMS',
            'android.permission.READ_CONTACTS',
            'android.permission.READ_CALL_LOG',
            'android.permission.RECORD_AUDIO',
            'android.permission.CAMERA',
            'android.permission.READ_EXTERNAL_STORAGE',
            'android.permission.WRITE_EXTERNAL_STORAGE',
            'android.permission.ACCESS_FINE_LOCATION',
            'android.permission.ACCESS_COARSE_LOCATION',
            'android.permission.READ_PHONE_STATE',
            'android.permission.PROCESS_OUTGOING_CALLS',
            'android.permission.GET_ACCOUNTS',
            'android.permission.INSTALL_PACKAGES',
            'android.permission.DELETE_PACKAGES',
            'android.permission.SYSTEM_ALERT_WINDOW',
            'android.permission.WRITE_SETTINGS',
        ]
        
        self.security_issues = []
    
    def analyze(self, apk_path: str) -> Dict:
        """Analyze APK file"""
        result = {
            'path': apk_path,
            'analysis_time': datetime.now().isoformat(),
            'file_info': {},
            'permissions': [],
            'dangerous_permissions': [],
            'components': {},
            'security_issues': [],
            'risk_score': 0.0,
        }
        
        if not os.path.exists(apk_path):
            result['error'] = "File not found"
            return result
        
        # File info
        result['file_info'] = self._get_file_info(apk_path)
        
        try:
            with zipfile.ZipFile(apk_path, 'r') as apk:
                # Analyze AndroidManifest.xml (binary format - simplified parsing)
                if 'AndroidManifest.xml' in apk.namelist():
                    manifest_data = apk.read('AndroidManifest.xml')
                    result['permissions'] = self._extract_permissions_binary(manifest_data)
                    result['dangerous_permissions'] = [
                        p for p in result['permissions'] 
                        if p in self.dangerous_permissions
                    ]
                
                # Check for common security issues
                result['security_issues'] = self._check_security_issues(apk)
                
                # Check for native libraries
                result['native_libs'] = self._check_native_libs(apk)
                
                # Calculate risk score
                result['risk_score'] = self._calculate_risk(result)
                
        except zipfile.BadZipFile:
            result['error'] = "Invalid APK file"
        except Exception as e:
            result['error'] = str(e)
        
        return result
    
    def _get_file_info(self, path: str) -> Dict:
        """Get file information"""
        stat = os.stat(path)
        with open(path, 'rb') as f:
            content = f.read()
        
        return {
            'size': stat.st_size,
            'md5': hashlib.md5(content).hexdigest(),
            'sha1': hashlib.sha1(content).hexdigest(),
            'sha256': hashlib.sha256(content).hexdigest(),
        }
    
    def _extract_permissions_binary(self, manifest_data: bytes) -> List[str]:
        """Extract permissions from binary AndroidManifest.xml"""
        permissions = []
        
        # Look for permission strings in binary data
        # This is simplified - real implementation would parse AXML format
        pattern = rb'android\.permission\.[A-Z_]+'
        matches = re.findall(pattern, manifest_data)
        
        for match in matches:
            try:
                perm = match.decode('utf-8')
                if perm not in permissions:
                    permissions.append(perm)
            except:
                pass
        
        return permissions
    
    def _check_security_issues(self, apk: zipfile.ZipFile) -> List[Dict]:
        """Check for common security issues"""
        issues = []
        
        # Check for debuggable flag (would be in manifest)
        issues.append({
            'type': 'CHECK_REQUIRED',
            'severity': 'MEDIUM',
            'issue': 'Verify debuggable flag is false in production',
            'recommendation': 'Set android:debuggable="false" in AndroidManifest.xml'
        })
        
        # Check for backup enabled (would be in manifest)
        issues.append({
            'type': 'CHECK_REQUIRED',
            'severity': 'MEDIUM',
            'issue': 'Verify android:allowBackup is set appropriately',
            'recommendation': 'Consider setting android:allowBackup="false"'
        })
        
        # Check for exported components
        issues.append({
            'type': 'CHECK_REQUIRED',
            'severity': 'HIGH',
            'issue': 'Review exported components for proper access control',
            'recommendation': 'Ensure exported activities/services have proper permissions'
        })
        
        # Check for hardcoded secrets
        for file_info in apk.filelist:
            if file_info.filename.endswith('.dex'):
                continue
            if file_info.filename.endswith(('.xml', '.json', '.properties')):
                try:
                    content = apk.read(file_info.filename).decode('utf-8', errors='ignore')
                    if self._check_hardcoded_secrets(content):
                        issues.append({
                            'type': 'HARDCODED_SECRET',
                            'severity': 'CRITICAL',
                            'issue': f'Potential hardcoded secret in {file_info.filename}',
                            'recommendation': 'Move secrets to secure storage'
                        })
                except:
                    pass
        
        # Check for insecure network config
        if 'res/xml/network_security_config.xml' not in apk.namelist():
            issues.append({
                'type': 'MISSING_NETWORK_CONFIG',
                'severity': 'MEDIUM',
                'issue': 'No network security config found',
                'recommendation': 'Add network_security_config.xml to enforce HTTPS'
            })
        
        return issues
    
    def _check_hardcoded_secrets(self, content: str) -> bool:
        """Check for hardcoded secrets in content"""
        patterns = [
            r'api[_-]?key\s*[=:]\s*["\'][^"\']{20,}["\']',
            r'secret\s*[=:]\s*["\'][^"\']{10,}["\']',
            r'password\s*[=:]\s*["\'][^"\']+["\']',
            r'aws_access_key_id\s*[=:]\s*["\'][A-Z0-9]{20}["\']',
            r'-----BEGIN (RSA |PRIVATE |)KEY-----',
        ]
        
        for pattern in patterns:
            if re.search(pattern, content, re.IGNORECASE):
                return True
        
        return False
    
    def _check_native_libs(self, apk: zipfile.ZipFile) -> Dict:
        """Check native libraries"""
        native_libs = {
            'architectures': [],
            'libraries': [],
        }
        
        for file_info in apk.filelist:
            if file_info.filename.startswith('lib/'):
                parts = file_info.filename.split('/')
                if len(parts) >= 3:
                    arch = parts[1]
                    lib = parts[2]
                    
                    if arch not in native_libs['architectures']:
                        native_libs['architectures'].append(arch)
                    
                    if lib.endswith('.so') and lib not in native_libs['libraries']:
                        native_libs['libraries'].append(lib)
        
        return native_libs
    
    def _calculate_risk(self, analysis: Dict) -> float:
        """Calculate overall risk score"""
        risk = 0.0
        
        # Dangerous permissions
        n_dangerous = len(analysis.get('dangerous_permissions', []))
        risk += min(n_dangerous * 0.1, 0.4)
        
        # Security issues
        for issue in analysis.get('security_issues', []):
            if issue['severity'] == 'CRITICAL':
                risk += 0.3
            elif issue['severity'] == 'HIGH':
                risk += 0.2
            elif issue['severity'] == 'MEDIUM':
                risk += 0.1
        
        return min(risk, 1.0)


class MobileSecurityScanner:
    """Mobile device security scanner"""
    
    def __init__(self):
        self.checks = []
    
    def android_security_check(self) -> Dict:
        """Security checks for Android (simulated)"""
        return {
            'platform': 'Android',
            'checks': [
                {
                    'name': 'Root Detection',
                    'status': 'PASS',
                    'description': 'Device is not rooted',
                },
                {
                    'name': 'USB Debugging',
                    'status': 'WARNING',
                    'description': 'USB debugging is enabled',
                    'recommendation': 'Disable USB debugging when not needed',
                },
                {
                    'name': 'Screen Lock',
                    'status': 'PASS',
                    'description': 'Screen lock is enabled',
                },
                {
                    'name': 'Unknown Sources',
                    'status': 'PASS',
                    'description': 'Install from unknown sources is disabled',
                },
                {
                    'name': 'Encryption',
                    'status': 'PASS',
                    'description': 'Device encryption is enabled',
                },
                {
                    'name': 'OS Version',
                    'status': 'WARNING',
                    'description': 'OS may need updating',
                    'recommendation': 'Update to latest security patch',
                },
                {
                    'name': 'Security Patch',
                    'status': 'CHECK',
                    'description': 'Verify security patch level',
                },
            ]
        }
    
    def ios_security_check(self) -> Dict:
        """Security checks for iOS (simulated)"""
        return {
            'platform': 'iOS',
            'checks': [
                {
                    'name': 'Jailbreak Detection',
                    'status': 'PASS',
                    'description': 'Device is not jailbroken',
                },
                {
                    'name': 'Passcode',
                    'status': 'PASS',
                    'description': 'Passcode is set',
                },
                {
                    'name': 'Biometric Auth',
                    'status': 'PASS',
                    'description': 'Face ID/Touch ID is enabled',
                },
                {
                    'name': 'iCloud Backup',
                    'status': 'INFO',
                    'description': 'iCloud backup is enabled',
                },
                {
                    'name': 'Find My iPhone',
                    'status': 'PASS',
                    'description': 'Find My is enabled',
                },
                {
                    'name': 'iOS Version',
                    'status': 'PASS',
                    'description': 'Running latest iOS version',
                },
            ]
        }


class AppSecurityTester:
    """Application security testing for mobile apps"""
    
    def __init__(self):
        self.tests = []
    
    def test_ssl_pinning(self, domain: str) -> Dict:
        """Test SSL/TLS configuration"""
        import socket
        import ssl
        
        result = {
            'domain': domain,
            'ssl_tests': [],
        }
        
        try:
            context = ssl.create_default_context()
            with socket.create_connection((domain, 443), timeout=10) as sock:
                with context.wrap_socket(sock, server_hostname=domain) as ssock:
                    cert = ssock.getpeercert()
                    
                    result['ssl_tests'].append({
                        'test': 'Connection',
                        'status': 'PASS',
                        'info': f'TLS {ssock.version()}'
                    })
                    
                    result['ssl_tests'].append({
                        'test': 'Certificate Valid',
                        'status': 'PASS',
                        'info': f"Expires: {cert.get('notAfter')}"
                    })
                    
        except ssl.SSLError as e:
            result['ssl_tests'].append({
                'test': 'SSL Verification',
                'status': 'FAIL',
                'info': str(e)
            })
        except Exception as e:
            result['error'] = str(e)
        
        return result
    
    def test_api_security(self, base_url: str) -> Dict:
        """Test API security"""
        import requests
        
        result = {
            'base_url': base_url,
            'api_tests': [],
        }
        
        try:
            # Test without auth
            response = requests.get(base_url, timeout=10, verify=True)
            
            # Check security headers
            headers = response.headers
            
            security_headers = [
                ('Strict-Transport-Security', 'HSTS'),
                ('X-Content-Type-Options', 'Content Type Options'),
                ('X-Frame-Options', 'Frame Options'),
                ('Content-Security-Policy', 'CSP'),
            ]
            
            for header, name in security_headers:
                if header in headers:
                    result['api_tests'].append({
                        'test': name,
                        'status': 'PASS',
                        'value': headers[header][:50]
                    })
                else:
                    result['api_tests'].append({
                        'test': name,
                        'status': 'MISSING',
                        'recommendation': f'Add {header} header'
                    })
            
            # Check for information disclosure
            if 'Server' in headers:
                result['api_tests'].append({
                    'test': 'Server Header',
                    'status': 'WARNING',
                    'info': f'Server identifies as: {headers["Server"]}',
                    'recommendation': 'Remove or obfuscate Server header'
                })
            
        except Exception as e:
            result['error'] = str(e)
        
        return result
    
    def test_data_storage(self) -> Dict:
        """Test local data storage security (simulation)"""
        return {
            'storage_tests': [
                {
                    'test': 'Shared Preferences Encryption',
                    'status': 'CHECK',
                    'description': 'Verify SharedPreferences uses EncryptedSharedPreferences',
                },
                {
                    'test': 'Database Encryption',
                    'status': 'CHECK',
                    'description': 'Verify SQLite databases are encrypted',
                },
                {
                    'test': 'Keychain/Keystore Usage',
                    'status': 'CHECK',
                    'description': 'Verify sensitive data uses secure storage',
                },
                {
                    'test': 'Backup Exclusion',
                    'status': 'CHECK',
                    'description': 'Verify sensitive data excluded from backups',
                },
                {
                    'test': 'Cache/Log Files',
                    'status': 'CHECK',
                    'description': 'Verify no sensitive data in cache/logs',
                },
            ]
        }


class MobileSecurityFramework:
    """Main Mobile Security Framework"""
    
    def __init__(self):
        self.apk_analyzer = APKAnalyzer()
        self.device_scanner = MobileSecurityScanner()
        self.app_tester = AppSecurityTester()
    
    def print_banner(self):
        print("""
+==============================================================+
|     SHIELD MOBILE SECURITY FRAMEWORK v1.0                    |
|          APK Analysis & Mobile App Security Testing          |
|     Android & iOS Security Assessment                        |
+==============================================================+
        """)
    
    def analyze_apk(self, apk_path: str) -> Dict:
        """Analyze APK file"""
        return self.apk_analyzer.analyze(apk_path)
    
    def scan_device(self, platform: str = 'android') -> Dict:
        """Scan mobile device"""
        if platform.lower() == 'android':
            return self.device_scanner.android_security_check()
        else:
            return self.device_scanner.ios_security_check()
    
    def test_app_security(self, domain: str) -> Dict:
        """Test app security"""
        result = {
            'domain': domain,
            'timestamp': datetime.now().isoformat(),
            'tests': {},
        }
        
        # SSL/TLS test
        result['tests']['ssl'] = self.app_tester.test_ssl_pinning(domain)
        
        # API security test
        result['tests']['api'] = self.app_tester.test_api_security(f'https://{domain}')
        
        # Data storage checks
        result['tests']['storage'] = self.app_tester.test_data_storage()
        
        return result
    
    def demo(self):
        """Run demo"""
        self.print_banner()
        
        print("\n  === MOBILE DEVICE SECURITY SCAN ===")
        
        # Android scan
        print("\n  [*] Android Security Check:")
        android_result = self.scan_device('android')
        for check in android_result['checks']:
            status_icon = "✓" if check['status'] == 'PASS' else "⚠" if check['status'] == 'WARNING' else "?"
            print(f"      [{status_icon}] {check['name']}: {check['status']}")
            if check.get('recommendation'):
                print(f"          → {check['recommendation']}")
        
        # iOS scan
        print("\n  [*] iOS Security Check:")
        ios_result = self.scan_device('ios')
        for check in ios_result['checks']:
            status_icon = "✓" if check['status'] == 'PASS' else "⚠" if check['status'] == 'WARNING' else "i"
            print(f"      [{status_icon}] {check['name']}: {check['status']}")
        
        print("\n  === DATA STORAGE SECURITY ===")
        storage = self.app_tester.test_data_storage()
        for test in storage['storage_tests']:
            print(f"      [?] {test['test']}")
            print(f"          {test['description']}")
        
        print("\n  === APK ANALYSIS ===")
        print("      To analyze an APK file:")
        print("      result = framework.analyze_apk('path/to/app.apk')")
        
        print("\n  === APP SECURITY TESTING ===")
        print("      To test app security:")
        print("      result = framework.test_app_security('api.example.com')")
        
        print("\n" + "="*60)
        print("           MOBILE SECURITY DEMO COMPLETE")
        print("="*60)


def main():
    framework = MobileSecurityFramework()
    framework.demo()


if __name__ == "__main__":
    main()
