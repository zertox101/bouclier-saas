import os
import base64
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from dotenv import load_dotenv

load_dotenv()

# Master Key for encryption at rest
# In production, this should be stored in a HSM or secure vault
MASTER_KEY_HEX = os.getenv("ENCRYPTION_MASTER_KEY", "7c9e13512cde8c55464b13512cde8c55464b13512cde8c55")

def get_master_key():
    # Key must be 16, 24, or 32 bytes
    key = bytes.fromhex(MASTER_KEY_HEX)
    if len(key) not in [16, 24, 32]:
        # Fallback/Pad for demo
        return key[:32].ljust(32, b"0")
    return key

def encrypt_secret(secret: str) -> str:
    if not secret:
        return ""
    aesgcm = AESGCM(get_master_key())
    nonce = os.urandom(12)
    ciphertext = aesgcm.encrypt(nonce, secret.encode(), None)
    # Combine nonce + ciphertext
    combined = nonce + ciphertext
    return base64.b64encode(combined).decode()

def decrypt_secret(encrypted_secret: str) -> str:
    if not encrypted_secret:
        return ""
    data = base64.b64decode(encrypted_secret)
    nonce = data[:12]
    ciphertext = data[12:]
    aesgcm = AESGCM(get_master_key())
    decrypted = aesgcm.decrypt(nonce, ciphertext, None)
    return decrypted.decode()
