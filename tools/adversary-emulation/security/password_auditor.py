#!/usr/bin/env python3
"""
SHIELD Password Auditing & Hash Cracking Toolkit
Test password strength and hash security
For authorized security testing only!
"""

import hashlib
import bcrypt
import base64
import os
import sys
import json
import time
import string
import itertools
from datetime import datetime
from typing import List, Dict, Optional, Tuple
from concurrent.futures import ThreadPoolExecutor, as_completed

# Force UTF-8
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')


class PasswordAuditor:
    """Password Security Auditing Toolkit"""
    
    def __init__(self):
        self.common_passwords = self.load_common_passwords()
        self.results = []
    
    def print_banner(self):
        print("""
+==============================================================+
|     SHIELD PASSWORD AUDITOR v1.0                             |
|          Hash Analysis & Password Strength Testing           |
|     For authorized security testing only!                    |
+==============================================================+
        """)
    
    def load_common_passwords(self) -> List[str]:
        """Load common password list"""
        # Top 100 common passwords
        return [
            "123456", "password", "123456789", "12345678", "12345",
            "1234567", "1234567890", "qwerty", "abc123", "111111",
            "123123", "admin", "letmein", "welcome", "monkey",
            "password1", "1234", "sunshine", "princess", "dragon",
            "master", "login", "football", "baseball", "iloveyou",
            "trustno1", "batman", "superman", "qwerty123", "michael",
            "shadow", "ashley", "123321", "654321", "passw0rd",
            "password123", "admin123", "root", "toor", "pass",
            "test", "guest", "master123", "changeme", "1q2w3e4r",
            "qwertyuiop", "1qaz2wsx", "qazwsx", "123qwe", "zaq12wsx",
            "!@#$%^&*", "121212", "flower", "hottie", "loveme",
            "zaq1zaq1", "666666", "asshole", "fuckyou", "hunter",
            "harley", "pepper", "joshua", "matthew", "daniel",
            "andrew", "tigger", "robert", "jordan", "austin",
            "buster", "hockey", "ranger", "thomas", "klaster",
            "george", "soccer", "summer", "cookie", "banana",
            "testing", "maggie", "killer", "samantha", "secret",
            "tennis", "hockey1", "nicole", "chelsea", "biteme",
            "access", "thunder", "dallas", "taylor", "cheese",
            "corvette", "computer", "internet", "iceman", "jessica",
        ]
    
    # ==================== HASH IDENTIFICATION ====================
    
    def identify_hash(self, hash_string: str) -> List[str]:
        """Identify possible hash type"""
        hash_string = hash_string.strip()
        length = len(hash_string)
        
        possible_types = []
        
        # Check length patterns
        if length == 32:
            possible_types.extend(["MD5", "NTLM", "MD4"])
        elif length == 40:
            possible_types.append("SHA1")
        elif length == 56:
            possible_types.append("SHA224")
        elif length == 64:
            possible_types.extend(["SHA256", "SHA3-256"])
        elif length == 96:
            possible_types.append("SHA384")
        elif length == 128:
            possible_types.extend(["SHA512", "SHA3-512"])
        
        # Check for bcrypt
        if hash_string.startswith("$2a$") or hash_string.startswith("$2b$") or hash_string.startswith("$2y$"):
            possible_types = ["bcrypt"]
        
        # Check for MD5 crypt
        if hash_string.startswith("$1$"):
            possible_types = ["MD5-crypt"]
        
        # Check for SHA256 crypt
        if hash_string.startswith("$5$"):
            possible_types = ["SHA256-crypt"]
        
        # Check for SHA512 crypt
        if hash_string.startswith("$6$"):
            possible_types = ["SHA512-crypt"]
        
        # Check hex validity
        if all(c in string.hexdigits for c in hash_string):
            if not possible_types:
                possible_types.append("Unknown HEX hash")
        
        return possible_types if possible_types else ["Unknown"]
    
    # ==================== HASH GENERATION ====================
    
    def generate_hash(self, password: str, algorithm: str = "sha256") -> str:
        """Generate hash of password"""
        algorithms = {
            "md5": hashlib.md5,
            "sha1": hashlib.sha1,
            "sha224": hashlib.sha224,
            "sha256": hashlib.sha256,
            "sha384": hashlib.sha384,
            "sha512": hashlib.sha512,
        }
        
        if algorithm.lower() == "bcrypt":
            salt = bcrypt.gensalt(rounds=12)
            return bcrypt.hashpw(password.encode(), salt).decode()
        
        if algorithm.lower() in algorithms:
            return algorithms[algorithm.lower()](password.encode()).hexdigest()
        
        return None
    
    def generate_hash_variants(self, password: str) -> Dict[str, str]:
        """Generate multiple hash types for a password"""
        variants = {}
        
        for algo in ["md5", "sha1", "sha256", "sha512"]:
            variants[algo] = self.generate_hash(password, algo)
        
        # Add bcrypt
        variants["bcrypt"] = self.generate_hash(password, "bcrypt")
        
        # Add NTLM (simplified)
        variants["ntlm"] = hashlib.new('md4', password.encode('utf-16le')).hexdigest()
        
        return variants
    
    # ==================== DICTIONARY ATTACK ====================
    
    def dictionary_attack(self, target_hash: str, hash_type: str = "sha256", 
                         wordlist: List[str] = None) -> Optional[str]:
        """Attempt to crack hash using dictionary"""
        if wordlist is None:
            wordlist = self.common_passwords
        
        print(f"\n    [*] Dictionary attack: {len(wordlist)} words")
        
        hash_type = hash_type.lower()
        
        for i, password in enumerate(wordlist):
            if i % 1000 == 0 and i > 0:
                print(f"        Progress: {i}/{len(wordlist)}")
            
            try:
                if hash_type == "bcrypt":
                    if target_hash.startswith("$2"):
                        if bcrypt.checkpw(password.encode(), target_hash.encode()):
                            return password
                elif hash_type == "ntlm":
                    test_hash = hashlib.new('md4', password.encode('utf-16le')).hexdigest()
                    if test_hash.lower() == target_hash.lower():
                        return password
                else:
                    test_hash = self.generate_hash(password, hash_type)
                    if test_hash and test_hash.lower() == target_hash.lower():
                        return password
                        
            except Exception:
                pass
        
        return None
    
    # ==================== BRUTE FORCE ATTACK ====================
    
    def brute_force(self, target_hash: str, hash_type: str = "md5",
                   charset: str = "lowercase", max_length: int = 4) -> Optional[str]:
        """Brute force attack (limited for demo)"""
        
        charsets = {
            "lowercase": string.ascii_lowercase,
            "uppercase": string.ascii_uppercase,
            "letters": string.ascii_letters,
            "digits": string.digits,
            "alphanumeric": string.ascii_lowercase + string.digits,
            "all": string.ascii_letters + string.digits + "!@#$%"
        }
        
        chars = charsets.get(charset, string.ascii_lowercase)
        
        total = sum(len(chars) ** i for i in range(1, max_length + 1))
        print(f"\n    [*] Brute force: {total} combinations (max {max_length} chars)")
        
        tried = 0
        for length in range(1, max_length + 1):
            for combo in itertools.product(chars, repeat=length):
                password = ''.join(combo)
                tried += 1
                
                if tried % 10000 == 0:
                    print(f"        Progress: {tried}/{total}")
                
                try:
                    test_hash = self.generate_hash(password, hash_type)
                    if test_hash and test_hash.lower() == target_hash.lower():
                        return password
                except Exception:
                    pass
        
        return None
    
    # ==================== PASSWORD STRENGTH ANALYSIS ====================
    
    def analyze_strength(self, password: str) -> Dict:
        """Analyze password strength"""
        result = {
            "password": password,
            "length": len(password),
            "score": 0,
            "strength": "Very Weak",
            "issues": [],
            "recommendations": []
        }
        
        # Length scoring
        if len(password) >= 16:
            result["score"] += 30
        elif len(password) >= 12:
            result["score"] += 25
        elif len(password) >= 10:
            result["score"] += 20
        elif len(password) >= 8:
            result["score"] += 15
        else:
            result["issues"].append("Password too short (< 8 characters)")
            result["recommendations"].append("Use at least 12 characters")
        
        # Character variety
        has_lower = any(c in string.ascii_lowercase for c in password)
        has_upper = any(c in string.ascii_uppercase for c in password)
        has_digit = any(c in string.digits for c in password)
        has_special = any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password)
        
        variety_count = sum([has_lower, has_upper, has_digit, has_special])
        result["score"] += variety_count * 15
        
        if not has_upper:
            result["issues"].append("No uppercase letters")
        if not has_lower:
            result["issues"].append("No lowercase letters")
        if not has_digit:
            result["issues"].append("No numbers")
        if not has_special:
            result["issues"].append("No special characters")
            result["recommendations"].append("Add special characters like !@#$%")
        
        # Common password check
        if password.lower() in [p.lower() for p in self.common_passwords]:
            result["score"] = max(0, result["score"] - 40)
            result["issues"].append("Common password detected!")
            result["recommendations"].append("Use a unique password not in common lists")
        
        # Pattern detection
        if password.isdigit():
            result["score"] = max(0, result["score"] - 20)
            result["issues"].append("Numbers only")
        
        if password.isalpha():
            result["score"] = max(0, result["score"] - 10)
            result["issues"].append("Letters only")
        
        # Repeated characters
        for i in range(len(password) - 2):
            if password[i] == password[i+1] == password[i+2]:
                result["score"] = max(0, result["score"] - 10)
                result["issues"].append("Three or more repeated characters")
                break
        
        # Sequential characters
        sequences = ["123", "234", "345", "456", "567", "678", "789", 
                    "abc", "bcd", "cde", "def", "qwe", "wer", "ert"]
        for seq in sequences:
            if seq in password.lower():
                result["score"] = max(0, result["score"] - 10)
                result["issues"].append("Sequential characters detected")
                break
        
        # Keyboard patterns
        patterns = ["qwerty", "asdf", "zxcv", "1234", "password", "admin"]
        for pattern in patterns:
            if pattern in password.lower():
                result["score"] = max(0, result["score"] - 15)
                result["issues"].append(f"Keyboard pattern detected: {pattern}")
                break
        
        # Determine strength label
        if result["score"] >= 80:
            result["strength"] = "Very Strong"
        elif result["score"] >= 60:
            result["strength"] = "Strong"
        elif result["score"] >= 40:
            result["strength"] = "Medium"
        elif result["score"] >= 20:
            result["strength"] = "Weak"
        else:
            result["strength"] = "Very Weak"
        
        # Estimate crack time
        charset_size = 26 * has_lower + 26 * has_upper + 10 * has_digit + 32 * has_special
        if charset_size == 0:
            charset_size = 26
        
        combinations = charset_size ** len(password)
        # Assume 10 billion attempts per second
        seconds = combinations / 10_000_000_000
        
        if seconds < 1:
            result["crack_time"] = "Instant"
        elif seconds < 60:
            result["crack_time"] = f"{int(seconds)} seconds"
        elif seconds < 3600:
            result["crack_time"] = f"{int(seconds/60)} minutes"
        elif seconds < 86400:
            result["crack_time"] = f"{int(seconds/3600)} hours"
        elif seconds < 31536000:
            result["crack_time"] = f"{int(seconds/86400)} days"
        else:
            years = seconds / 31536000
            if years > 1000000:
                result["crack_time"] = "Millions of years"
            else:
                result["crack_time"] = f"{int(years)} years"
        
        return result
    
    # ==================== HASH FILE PROCESSING ====================
    
    def process_hash_file(self, filepath: str, hash_type: str = "auto") -> List[Dict]:
        """Process file containing hashes"""
        results = []
        
        try:
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                lines = f.readlines()
            
            print(f"\n  [*] Processing {len(lines)} hashes from {filepath}")
            
            for i, line in enumerate(lines):
                line = line.strip()
                if not line or line.startswith('#'):
                    continue
                
                # Handle user:hash format
                if ':' in line:
                    parts = line.split(':')
                    username = parts[0]
                    hash_string = parts[-1]
                else:
                    username = None
                    hash_string = line
                
                # Identify hash type if auto
                if hash_type == "auto":
                    detected_types = self.identify_hash(hash_string)
                    detected = detected_types[0] if detected_types else "Unknown"
                else:
                    detected = hash_type
                
                # Try to crack
                cracked = self.dictionary_attack(hash_string, detected)
                
                result = {
                    "username": username,
                    "hash": hash_string[:20] + "...",
                    "type": detected,
                    "cracked": cracked is not None,
                    "password": cracked
                }
                results.append(result)
                
                if cracked:
                    print(f"    [+] Cracked: {username or 'N/A'} = {cracked}")
            
        except Exception as e:
            print(f"  [!] Error: {e}")
        
        return results
    
    # ==================== REPORT GENERATION ====================
    
    def generate_report(self, results: List[Dict], filename: str = None) -> str:
        """Generate audit report"""
        if filename is None:
            filename = f"password_audit_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        report = {
            "audit_time": datetime.now().isoformat(),
            "total_passwords": len(results),
            "weak_passwords": sum(1 for r in results if r.get("strength") in ["Weak", "Very Weak"]),
            "cracked_passwords": sum(1 for r in results if r.get("cracked")),
            "results": results
        }
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        print(f"\n  [+] Report saved: {filename}")
        return filename


def main():
    auditor = PasswordAuditor()
    auditor.print_banner()
    
    # Demo: Analyze sample passwords
    print("\n  === PASSWORD STRENGTH ANALYSIS ===")
    
    test_passwords = [
        "password123",
        "Admin@2024!",
        "correct-horse-battery-staple",
        "P@$$w0rd!2024#Secure",
        "123456",
        "MyD0g's_N@me_Is_Max!",
    ]
    
    results = []
    for pwd in test_passwords:
        result = auditor.analyze_strength(pwd)
        results.append(result)
        
        print(f"\n    Password: {pwd}")
        print(f"    Score: {result['score']}/100")
        print(f"    Strength: {result['strength']}")
        print(f"    Crack Time: {result['crack_time']}")
        if result['issues']:
            print(f"    Issues: {', '.join(result['issues'][:3])}")
    
    # Demo: Hash identification
    print("\n\n  === HASH IDENTIFICATION ===")
    
    test_hashes = [
        "5f4dcc3b5aa765d61d8327deb882cf99",  # MD5 of 'password'
        "5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8",  # SHA1 of 'password'
        "5e884898da28047d9169e18afea5f0e7d3b0e4d5",  # SHA256 of 'password' (truncated)
        "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4gG64JQPcQ8J8gye",  # bcrypt
    ]
    
    for h in test_hashes:
        types = auditor.identify_hash(h)
        print(f"\n    Hash: {h[:40]}...")
        print(f"    Possible types: {', '.join(types)}")
    
    # Demo: Dictionary attack
    print("\n\n  === DICTIONARY ATTACK DEMO ===")
    
    md5_hash = "5f4dcc3b5aa765d61d8327deb882cf99"  # MD5 of 'password'
    cracked = auditor.dictionary_attack(md5_hash, "md5")
    
    if cracked:
        print(f"\n    [+] Hash cracked: {cracked}")
    else:
        print(f"\n    [-] Hash not cracked")
    
    # Generate report
    auditor.generate_report(results)
    
    print("\n  [+] Password audit complete!")


if __name__ == "__main__":
    main()
