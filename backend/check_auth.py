import os, sys
sys.path.insert(0, '/app')
from app.core.database import SessionLocal
from app.models.sql import User
from app.core.security import hash_password, verify_password
db = SessionLocal()
u = db.query(User).filter(User.email == 'admin@bouclier.local').first()
if u:
    print(f'Hash stored: {u.hashed_password[:80]}...')
    print(f'Verify admin123: {verify_password("admin123", u.hashed_password)}')
    print(f'Verify test123: {verify_password("test123", u.hashed_password)}')
else:
    print('User not found')
db.close()
