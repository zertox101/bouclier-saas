import os, sys
sys.path.insert(0, '/app')
from app.core.database import SessionLocal
from app.models.sql import User
from app.core.security import hash_password
db = SessionLocal()
u = db.query(User).filter(User.email == 'admin@bouclier.local').first()
if u:
    new_hash = hash_password('admin123')
    print(f'New hash: {new_hash}')
    u.hashed_password = new_hash
    db.commit()
    print('Password reset to admin123')
    
    # Verify it works
    from app.core.security import verify_password
    print(f'Verify: {verify_password("admin123", new_hash)}')
else:
    print('User not found')
db.close()
