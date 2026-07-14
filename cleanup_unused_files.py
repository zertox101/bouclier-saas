#!/usr/bin/env python3
"""
Cleanup Unused Files - BOUCLIER SAAS
Supprime les fichiers temporaires, logs anciens, et fichiers inutiles
"""
import os
import shutil
from pathlib import Path
from datetime import datetime

# Dossier racine
ROOT = Path(__file__).parent

# Fichiers et dossiers à supprimer
CLEANUP_TARGETS = {
    # Fichiers temporaires Python
    "**/__pycache__": "dir",
    "**/*.pyc": "file",
    "**/*.pyo": "file",
    "**/*.pyd": "file",
    
    # Fichiers temporaires Node
    "**/node_modules/.cache": "dir",
    "**/.next/cache": "dir",
    
    # Logs anciens (garder les 3 derniers jours)
    "infra/logs/*.log": "file_old",
    "backend/logs/*.log": "file_old",
    "*.log": "file_old",
    
    # Fichiers de build temporaires
    "**/.pytest_cache": "dir",
    "**/.coverage": "file",
    "**/coverage": "dir",
    "**/*.egg-info": "dir",
    
    # Fichiers Docker temporaires
    "**/docker-compose.override.yml": "file",
    
    # Fichiers de test temporaires
    "**/test_*.tmp": "file",
    "**/tmp_*": "file",
    
    # Fichiers de backup
    "**/*.bak": "file",
    "**/*.backup": "file",
    "**/*~": "file",
    
    # Fichiers système
    "**/.DS_Store": "file",
    "**/Thumbs.db": "file",
    "**/desktop.ini": "file",
}

# Fichiers spécifiques à supprimer (créés pendant le debug)
SPECIFIC_FILES = [
    "apt_simulation_process.log",
    "ai_pentester_process.log",
    "backend/ai_pentester_process.log",
    "backend/shield.db",  # SQLite fallback (on utilise PostgreSQL)
    "backend/shield.db-shm",
    "backend/shield.db-wal",
]

# Dossiers à nettoyer complètement
CLEAN_DIRS = [
    "infra/postgres_data_old",  # Ancien volume PostgreSQL
    ".pytest_cache",
    ".mypy_cache",
    ".ruff_cache",
]

def get_file_age_days(filepath):
    """Retourne l'âge du fichier en jours"""
    try:
        mtime = os.path.getmtime(filepath)
        age = (datetime.now().timestamp() - mtime) / 86400
        return age
    except:
        return 0

def cleanup():
    """Nettoie les fichiers inutiles"""
    print("\n" + "="*60)
    print("🧹 BOUCLIER - Cleanup Unused Files")
    print("="*60 + "\n")
    
    total_size = 0
    total_files = 0
    total_dirs = 0
    
    # 1. Supprimer les fichiers spécifiques
    print("📁 Cleaning specific files...")
    for file_path in SPECIFIC_FILES:
        full_path = ROOT / file_path
        if full_path.exists():
            try:
                size = full_path.stat().st_size
                full_path.unlink()
                total_size += size
                total_files += 1
                print(f"   ✅ Deleted: {file_path} ({size/1024:.1f} KB)")
            except Exception as e:
                print(f"   ❌ Failed: {file_path} - {e}")
    
    # 2. Supprimer les dossiers complets
    print("\n📂 Cleaning directories...")
    for dir_path in CLEAN_DIRS:
        full_path = ROOT / dir_path
        if full_path.exists() and full_path.is_dir():
            try:
                # Calculer la taille
                dir_size = sum(f.stat().st_size for f in full_path.rglob('*') if f.is_file())
                shutil.rmtree(full_path)
                total_size += dir_size
                total_dirs += 1
                print(f"   ✅ Deleted: {dir_path} ({dir_size/1024/1024:.1f} MB)")
            except Exception as e:
                print(f"   ❌ Failed: {dir_path} - {e}")
    
    # 3. Nettoyer selon les patterns
    print("\n🔍 Cleaning by patterns...")
    for pattern, file_type in CLEANUP_TARGETS.items():
        matches = list(ROOT.rglob(pattern))
        
        for match in matches:
            try:
                # Skip si dans node_modules ou .venv
                if 'node_modules' in str(match) or '.venv' in str(match):
                    continue
                
                if file_type == "dir" and match.is_dir():
                    dir_size = sum(f.stat().st_size for f in match.rglob('*') if f.is_file())
                    shutil.rmtree(match)
                    total_size += dir_size
                    total_dirs += 1
                    print(f"   ✅ Deleted dir: {match.relative_to(ROOT)}")
                
                elif file_type == "file" and match.is_file():
                    size = match.stat().st_size
                    match.unlink()
                    total_size += size
                    total_files += 1
                    if size > 1024 * 1024:  # > 1MB
                        print(f"   ✅ Deleted: {match.relative_to(ROOT)} ({size/1024/1024:.1f} MB)")
                
                elif file_type == "file_old" and match.is_file():
                    # Supprimer seulement si > 3 jours
                    age = get_file_age_days(match)
                    if age > 3:
                        size = match.stat().st_size
                        match.unlink()
                        total_size += size
                        total_files += 1
                        print(f"   ✅ Deleted old: {match.relative_to(ROOT)} ({age:.0f} days old)")
            
            except Exception as e:
                print(f"   ⚠️  Skip: {match.relative_to(ROOT)} - {e}")
    
    # 4. Résumé
    print("\n" + "="*60)
    print("📊 CLEANUP SUMMARY")
    print("="*60)
    print(f"   Files deleted: {total_files}")
    print(f"   Directories deleted: {total_dirs}")
    print(f"   Space freed: {total_size/1024/1024:.2f} MB")
    print("\n✅ Cleanup completed!")
    print("="*60 + "\n")

if __name__ == "__main__":
    try:
        cleanup()
    except KeyboardInterrupt:
        print("\n\n⚠️  Cleanup interrupted by user")
    except Exception as e:
        print(f"\n❌ Cleanup failed: {e}")
