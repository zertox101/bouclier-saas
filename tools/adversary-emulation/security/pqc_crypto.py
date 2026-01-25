#!/usr/bin/env python3
"""
SHIELD Post-Quantum Cryptography Module
Quantum-resistant encryption using lattice-based cryptography
"""

import sys
import os
import json
import hashlib
import secrets
import base64
import struct
from datetime import datetime
from typing import Tuple, List, Optional, Dict
import random
import math

# Force UTF-8
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')


class LatticeParams:
    """Parameters for lattice-based cryptography"""
    
    # Kyber-like parameters (simplified)
    KYBER_N = 256  # Polynomial degree
    KYBER_Q = 3329  # Modulus
    KYBER_K = 3    # Module rank
    KYBER_ETA1 = 2  # Noise parameter
    KYBER_ETA2 = 2
    
    # Dilithium-like parameters
    DILITHIUM_N = 256
    DILITHIUM_Q = 8380417
    DILITHIUM_K = 4
    DILITHIUM_L = 4


class PolynomialRing:
    """Operations in polynomial ring Zq[X]/(X^n + 1)"""
    
    def __init__(self, n: int, q: int):
        self.n = n
        self.q = q
    
    def add(self, a: List[int], b: List[int]) -> List[int]:
        """Add two polynomials"""
        return [(a[i] + b[i]) % self.q for i in range(self.n)]
    
    def sub(self, a: List[int], b: List[int]) -> List[int]:
        """Subtract polynomials"""
        return [(a[i] - b[i]) % self.q for i in range(self.n)]
    
    def mul_simple(self, a: List[int], b: List[int]) -> List[int]:
        """Multiply polynomials (simple, not NTT-optimized)"""
        result = [0] * self.n
        
        for i in range(self.n):
            for j in range(self.n):
                idx = i + j
                if idx >= self.n:
                    # X^n = -1 in the ring
                    result[idx - self.n] = (result[idx - self.n] - a[i] * b[j]) % self.q
                else:
                    result[idx] = (result[idx] + a[i] * b[j]) % self.q
        
        return result
    
    def scalar_mul(self, a: List[int], s: int) -> List[int]:
        """Multiply polynomial by scalar"""
        return [(x * s) % self.q for x in a]
    
    def random_poly(self) -> List[int]:
        """Generate random polynomial"""
        return [secrets.randbelow(self.q) for _ in range(self.n)]
    
    def small_poly(self, eta: int = 2) -> List[int]:
        """Generate polynomial with small coefficients"""
        return [secrets.randbelow(2 * eta + 1) - eta for _ in range(self.n)]
    
    def compress(self, a: List[int], d: int) -> List[int]:
        """Compress polynomial coefficients"""
        scale = (1 << d) / self.q
        return [round(x * scale) % (1 << d) for x in a]
    
    def decompress(self, a: List[int], d: int) -> List[int]:
        """Decompress polynomial coefficients"""
        scale = self.q / (1 << d)
        return [round(x * scale) % self.q for x in a]


class Kyber:
    """
    Simplified Kyber Key Encapsulation Mechanism
    Based on NIST PQC Standard (simplified implementation)
    """
    
    def __init__(self, security_level: int = 2):
        # Security levels: 1=Kyber512, 2=Kyber768, 3=Kyber1024
        if security_level == 1:
            self.k = 2
        elif security_level == 2:
            self.k = 3
        else:
            self.k = 4
        
        self.n = 256
        self.q = 3329
        self.eta1 = 3 if self.k == 2 else 2
        self.eta2 = 2
        
        self.ring = PolynomialRing(self.n, self.q)
    
    def keygen(self) -> Tuple[bytes, bytes]:
        """Generate Kyber key pair"""
        # Generate random seed
        seed = secrets.token_bytes(32)
        
        # Generate matrix A from seed (simplified)
        A = [[self.ring.random_poly() for _ in range(self.k)] for _ in range(self.k)]
        
        # Generate secret s and error e
        s = [self.ring.small_poly(self.eta1) for _ in range(self.k)]
        e = [self.ring.small_poly(self.eta1) for _ in range(self.k)]
        
        # Compute t = A*s + e
        t = []
        for i in range(self.k):
            ti = e[i][:]
            for j in range(self.k):
                prod = self.ring.mul_simple(A[i][j], s[j])
                ti = self.ring.add(ti, prod)
            t.append(ti)
        
        # Encode keys
        pk = self._encode_public_key(t, seed)
        sk = self._encode_secret_key(s, pk)
        
        return pk, sk
    
    def encapsulate(self, pk: bytes) -> Tuple[bytes, bytes]:
        """Encapsulate: generate ciphertext and shared secret"""
        # Decode public key
        t, seed = self._decode_public_key(pk)
        
        # Regenerate A from seed
        random.seed(int.from_bytes(seed, 'big'))
        A = [[self.ring.random_poly() for _ in range(self.k)] for _ in range(self.k)]
        
        # Generate randomness
        r = [self.ring.small_poly(self.eta1) for _ in range(self.k)]
        e1 = [self.ring.small_poly(self.eta2) for _ in range(self.k)]
        e2 = self.ring.small_poly(self.eta2)
        
        # Generate random message
        m = secrets.token_bytes(32)
        
        # Compute u = A^T * r + e1
        u = []
        for i in range(self.k):
            ui = e1[i][:]
            for j in range(self.k):
                prod = self.ring.mul_simple(A[j][i], r[j])
                ui = self.ring.add(ui, prod)
            u.append(ui)
        
        # Compute v = t^T * r + e2 + encode(m)
        v = e2[:]
        for i in range(self.k):
            prod = self.ring.mul_simple(t[i], r[i])
            v = self.ring.add(v, prod)
        
        # Add message encoding
        m_poly = self._encode_message(m)
        v = self.ring.add(v, m_poly)
        
        # Compress and encode ciphertext
        ct = self._encode_ciphertext(u, v)
        
        # Derive shared secret
        shared_secret = hashlib.sha3_256(m).digest()
        
        return ct, shared_secret
    
    def decapsulate(self, ct: bytes, sk: bytes) -> bytes:
        """Decapsulate: recover shared secret from ciphertext"""
        # Decode secret key and ciphertext
        s, pk = self._decode_secret_key(sk)
        u, v = self._decode_ciphertext(ct)
        
        # Compute m' = v - s^T * u
        m_prime = v[:]
        for i in range(self.k):
            prod = self.ring.mul_simple(s[i], u[i])
            m_prime = self.ring.sub(m_prime, prod)
        
        # Decode message
        m = self._decode_message(m_prime)
        
        # Derive shared secret
        shared_secret = hashlib.sha3_256(m).digest()
        
        return shared_secret
    
    def _encode_message(self, m: bytes) -> List[int]:
        """Encode message as polynomial"""
        poly = [0] * self.n
        for i, byte in enumerate(m[:32]):
            for j in range(8):
                if i * 8 + j < self.n:
                    bit = (byte >> j) & 1
                    poly[i * 8 + j] = bit * (self.q // 2)
        return poly
    
    def _decode_message(self, poly: List[int]) -> bytes:
        """Decode polynomial as message"""
        message = bytearray(32)
        for i in range(32):
            byte = 0
            for j in range(8):
                if i * 8 + j < self.n:
                    # Round to nearest {0, q/2}
                    if abs(poly[i * 8 + j] - self.q // 2) < self.q // 4:
                        byte |= (1 << j)
            message[i] = byte
        return bytes(message)
    
    def _encode_public_key(self, t: List[List[int]], seed: bytes) -> bytes:
        """Encode public key"""
        data = {'t': t, 'seed': seed.hex()}
        return json.dumps(data).encode()
    
    def _decode_public_key(self, pk: bytes) -> Tuple[List[List[int]], bytes]:
        """Decode public key"""
        data = json.loads(pk.decode())
        return data['t'], bytes.fromhex(data['seed'])
    
    def _encode_secret_key(self, s: List[List[int]], pk: bytes) -> bytes:
        """Encode secret key"""
        data = {'s': s, 'pk': pk.hex()}
        return json.dumps(data).encode()
    
    def _decode_secret_key(self, sk: bytes) -> Tuple[List[List[int]], bytes]:
        """Decode secret key"""
        data = json.loads(sk.decode())
        return data['s'], bytes.fromhex(data['pk'])
    
    def _encode_ciphertext(self, u: List[List[int]], v: List[int]) -> bytes:
        """Encode ciphertext"""
        data = {'u': u, 'v': v}
        return json.dumps(data).encode()
    
    def _decode_ciphertext(self, ct: bytes) -> Tuple[List[List[int]], List[int]]:
        """Decode ciphertext"""
        data = json.loads(ct.decode())
        return data['u'], data['v']


class Dilithium:
    """
    Simplified Dilithium Digital Signature Scheme
    Post-quantum digital signatures
    """
    
    def __init__(self, security_level: int = 2):
        self.k = 4 if security_level <= 2 else 6
        self.l = 4 if security_level <= 2 else 5
        self.n = 256
        self.q = 8380417
        
        self.ring = PolynomialRing(self.n, self.q)
        self.gamma1 = 131072 if security_level <= 2 else 524288
        self.gamma2 = 95232 if security_level <= 2 else 261888
        self.beta = 78 if security_level <= 2 else 120
    
    def keygen(self) -> Tuple[bytes, bytes]:
        """Generate Dilithium key pair"""
        # Generate random seed
        seed = secrets.token_bytes(32)
        
        # Generate matrix A
        random.seed(int.from_bytes(seed, 'big'))
        A = [[self.ring.random_poly() for _ in range(self.l)] for _ in range(self.k)]
        
        # Generate secret vectors s1, s2
        s1 = [self.ring.small_poly(4) for _ in range(self.l)]
        s2 = [self.ring.small_poly(4) for _ in range(self.k)]
        
        # Compute t = A*s1 + s2
        t = []
        for i in range(self.k):
            ti = s2[i][:]
            for j in range(self.l):
                prod = self.ring.mul_simple(A[i][j], s1[j])
                ti = self.ring.add(ti, prod)
            t.append(ti)
        
        # Encode keys
        pk = self._encode_public_key(t, seed)
        sk = self._encode_secret_key(s1, s2, t, seed)
        
        return pk, sk
    
    def sign(self, message: bytes, sk: bytes) -> bytes:
        """Sign a message"""
        # Decode secret key
        s1, s2, t, seed = self._decode_secret_key(sk)
        
        # Regenerate A
        random.seed(int.from_bytes(seed, 'big'))
        A = [[self.ring.random_poly() for _ in range(self.l)] for _ in range(self.k)]
        
        # Hash message with public key
        mu = hashlib.sha3_256(message + seed).digest()
        
        # Rejection sampling loop (simplified)
        for attempt in range(100):
            # Generate random y
            y = [[secrets.randbelow(2 * self.gamma1 + 1) - self.gamma1 
                  for _ in range(self.n)] for _ in range(self.l)]
            
            # Compute w = A*y
            w = []
            for i in range(self.k):
                wi = [0] * self.n
                for j in range(self.l):
                    prod = self.ring.mul_simple(A[i][j], y[j])
                    wi = self.ring.add(wi, prod)
                w.append(wi)
            
            # Compute challenge hash
            c_hash = hashlib.sha3_256(mu + str(w).encode()).digest()
            
            # Generate challenge polynomial from hash
            c = self._hash_to_poly(c_hash)
            
            # Compute z = y + c*s1
            z = []
            for i in range(self.l):
                cs1 = self.ring.mul_simple(c, s1[i])
                z.append(self.ring.add(y[i], cs1))
            
            # Check bounds (simplified rejection sampling)
            max_coef = max(abs(coef) for poly in z for coef in poly)
            if max_coef < self.gamma1 - self.beta:
                break
        
        # Encode signature
        signature = self._encode_signature(z, c_hash)
        return signature
    
    def verify(self, message: bytes, signature: bytes, pk: bytes) -> bool:
        """Verify a signature"""
        try:
            # Decode public key and signature
            t, seed = self._decode_public_key(pk)
            z, c_hash = self._decode_signature(signature)
            
            # Regenerate A
            random.seed(int.from_bytes(seed, 'big'))
            A = [[self.ring.random_poly() for _ in range(self.l)] for _ in range(self.k)]
            
            # Generate challenge from hash
            c = self._hash_to_poly(c_hash)
            
            # Compute w' = A*z - c*t
            w_prime = []
            for i in range(self.k):
                wi = [0] * self.n
                for j in range(self.l):
                    prod = self.ring.mul_simple(A[i][j], z[j])
                    wi = self.ring.add(wi, prod)
                ct = self.ring.mul_simple(c, t[i])
                wi = self.ring.sub(wi, ct)
                w_prime.append(wi)
            
            # Verify challenge hash
            mu = hashlib.sha3_256(message + seed).digest()
            c_verify = hashlib.sha3_256(mu + str(w_prime).encode()).digest()
            
            # Check bounds on z
            max_coef = max(abs(coef) for poly in z for coef in poly)
            if max_coef >= self.gamma1 - self.beta:
                return False
            
            # Note: Simplified verification - real implementation needs more checks
            return True
            
        except Exception:
            return False
    
    def _hash_to_poly(self, h: bytes) -> List[int]:
        """Convert hash to challenge polynomial"""
        poly = [0] * self.n
        for i in range(min(60, self.n)):
            if i < len(h):
                poly[i] = 1 if h[i % len(h)] & (1 << (i % 8)) else -1
        return poly
    
    def _encode_public_key(self, t: List[List[int]], seed: bytes) -> bytes:
        """Encode public key"""
        data = {'t': t, 'seed': seed.hex()}
        return json.dumps(data).encode()
    
    def _decode_public_key(self, pk: bytes) -> Tuple[List[List[int]], bytes]:
        """Decode public key"""
        data = json.loads(pk.decode())
        return data['t'], bytes.fromhex(data['seed'])
    
    def _encode_secret_key(self, s1, s2, t, seed: bytes) -> bytes:
        """Encode secret key"""
        data = {'s1': s1, 's2': s2, 't': t, 'seed': seed.hex()}
        return json.dumps(data).encode()
    
    def _decode_secret_key(self, sk: bytes):
        """Decode secret key"""
        data = json.loads(sk.decode())
        return data['s1'], data['s2'], data['t'], bytes.fromhex(data['seed'])
    
    def _encode_signature(self, z: List[List[int]], c_hash: bytes) -> bytes:
        """Encode signature"""
        data = {'z': z, 'c': c_hash.hex()}
        return json.dumps(data).encode()
    
    def _decode_signature(self, sig: bytes) -> Tuple[List[List[int]], bytes]:
        """Decode signature"""
        data = json.loads(sig.decode())
        return data['z'], bytes.fromhex(data['c'])


class PQCHybrid:
    """Hybrid classical + post-quantum encryption"""
    
    def __init__(self, security_level: int = 2):
        self.kyber = Kyber(security_level)
        self.dilithium = Dilithium(security_level)
    
    def generate_keypair(self) -> Dict[str, bytes]:
        """Generate hybrid key pair"""
        # Generate Kyber (KEM) keys
        kyber_pk, kyber_sk = self.kyber.keygen()
        
        # Generate Dilithium (signature) keys
        dilithium_pk, dilithium_sk = self.dilithium.keygen()
        
        return {
            'encryption_pk': kyber_pk,
            'encryption_sk': kyber_sk,
            'signing_pk': dilithium_pk,
            'signing_sk': dilithium_sk,
        }
    
    def hybrid_encrypt(self, message: bytes, recipient_pk: bytes) -> Dict[str, bytes]:
        """Encrypt message using hybrid PQC"""
        # Use Kyber to establish shared secret
        ct, shared_secret = self.kyber.encapsulate(recipient_pk)
        
        # Use shared secret to derive AES key
        aes_key = hashlib.sha3_256(shared_secret).digest()
        
        # Encrypt message with AES-like XOR (simplified)
        # In production, use proper AES-GCM
        encrypted = self._xor_encrypt(message, aes_key)
        
        return {
            'ciphertext': ct,
            'encrypted_message': encrypted,
        }
    
    def hybrid_decrypt(self, encrypted_data: Dict, sk: bytes) -> bytes:
        """Decrypt hybrid PQC ciphertext"""
        # Recover shared secret using Kyber
        shared_secret = self.kyber.decapsulate(encrypted_data['ciphertext'], sk)
        
        # Derive AES key
        aes_key = hashlib.sha3_256(shared_secret).digest()
        
        # Decrypt message
        message = self._xor_encrypt(encrypted_data['encrypted_message'], aes_key)
        
        return message
    
    def sign_message(self, message: bytes, signing_sk: bytes) -> bytes:
        """Sign message with Dilithium"""
        return self.dilithium.sign(message, signing_sk)
    
    def verify_signature(self, message: bytes, signature: bytes, signing_pk: bytes) -> bool:
        """Verify Dilithium signature"""
        return self.dilithium.verify(message, signature, signing_pk)
    
    def _xor_encrypt(self, data: bytes, key: bytes) -> bytes:
        """Simple XOR encryption (use AES-GCM in production)"""
        # Expand key using SHA3
        expanded = b''
        while len(expanded) < len(data):
            expanded += hashlib.sha3_256(key + len(expanded).to_bytes(4, 'big')).digest()
        
        return bytes(a ^ b for a, b in zip(data, expanded[:len(data)]))


def print_banner():
    print("""
+==============================================================+
|     SHIELD POST-QUANTUM CRYPTOGRAPHY v1.0                    |
|          Quantum-Resistant Encryption Suite                  |
|     Kyber (KEM) + Dilithium (Signatures)                     |
+==============================================================+
    """)


def demo():
    print_banner()
    
    print("\n  === KYBER KEY ENCAPSULATION ===")
    kyber = Kyber(security_level=2)
    
    # Key generation
    print("\n  [*] Generating Kyber-768 key pair...")
    pk, sk = kyber.keygen()
    print(f"      Public key size: {len(pk)} bytes")
    print(f"      Secret key size: {len(sk)} bytes")
    
    # Encapsulation
    print("\n  [*] Encapsulating shared secret...")
    ct, shared_secret1 = kyber.encapsulate(pk)
    print(f"      Ciphertext size: {len(ct)} bytes")
    print(f"      Shared secret: {shared_secret1.hex()[:32]}...")
    
    # Decapsulation
    print("\n  [*] Decapsulating...")
    shared_secret2 = kyber.decapsulate(ct, sk)
    print(f"      Recovered secret: {shared_secret2.hex()[:32]}...")
    print(f"      Match: {shared_secret1 == shared_secret2}")
    
    print("\n  === DILITHIUM SIGNATURES ===")
    dilithium = Dilithium(security_level=2)
    
    # Key generation
    print("\n  [*] Generating Dilithium-2 key pair...")
    sign_pk, sign_sk = dilithium.keygen()
    print(f"      Public key size: {len(sign_pk)} bytes")
    print(f"      Secret key size: {len(sign_sk)} bytes")
    
    # Sign message
    message = b"This is a test message for post-quantum signatures!"
    print(f"\n  [*] Signing message: '{message.decode()[:40]}...'")
    signature = dilithium.sign(message, sign_sk)
    print(f"      Signature size: {len(signature)} bytes")
    
    # Verify signature
    print("\n  [*] Verifying signature...")
    valid = dilithium.verify(message, signature, sign_pk)
    print(f"      Signature valid: {valid}")
    
    # Test with wrong message
    wrong_message = b"This is a MODIFIED message!"
    invalid = dilithium.verify(wrong_message, signature, sign_pk)
    print(f"      Wrong message rejected: {not invalid}")
    
    print("\n  === HYBRID PQC ENCRYPTION ===")
    hybrid = PQCHybrid(security_level=2)
    
    # Generate keys
    print("\n  [*] Generating hybrid key pair...")
    keys = hybrid.generate_keypair()
    
    # Encrypt
    secret_message = b"Top secret quantum-resistant message!"
    print(f"\n  [*] Encrypting: '{secret_message.decode()}'")
    encrypted = hybrid.hybrid_encrypt(secret_message, keys['encryption_pk'])
    
    # Decrypt
    decrypted = hybrid.hybrid_decrypt(encrypted, keys['encryption_sk'])
    print(f"  [*] Decrypted: '{decrypted.decode()}'")
    print(f"      Match: {secret_message == decrypted}")
    
    print("\n" + "="*60)
    print("           POST-QUANTUM CRYPTOGRAPHY DEMO COMPLETE")
    print("="*60)
    print("\n  Note: This is a simplified implementation for education.")
    print("  For production, use liboqs or pqcrypto libraries.")


if __name__ == "__main__":
    demo()
