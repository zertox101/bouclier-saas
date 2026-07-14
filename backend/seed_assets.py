#!/usr/bin/env python3
"""
Seed assets into the backend database.
Assets are distributed across orgs proportionally.
"""
import os, sys, random

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal
from app.models.sql import Asset

PRO_ORG_ID = "00000000-0000-0000-0000-000000000001"
FREE_ORG_ID = "00000000-0000-0000-0000-000000000002"
ENTERPRISE_ORG_ID = "00000000-0000-0000-0000-000000000003"
ORG_IDS = [FREE_ORG_ID, PRO_ORG_ID, ENTERPRISE_ORG_ID]

def seed_assets():
    db = SessionLocal()
    try:
        existing = db.query(Asset).count()
        if existing > 0:
            print(f"Assets already seeded ({existing}). Use --force to re-run.")
            if "--force" not in sys.argv:
                return
            db.query(Asset).delete()

        initial_assets = [
            {'asset_tag': 'AS-001', 'name': 'CORE-FW-01', 'type': 'Firewall', 'ip_address': '192.168.1.1', 'risk_level': 'Low', 'status': 'Healthy', 'performance_load': 12},
            {'asset_tag': 'AS-002', 'name': 'SRV-DATACENTER-A', 'type': 'Database', 'ip_address': '10.0.0.45', 'risk_level': 'Medium', 'status': 'Warning', 'performance_load': 88},
            {'asset_tag': 'AS-003', 'name': 'WKS-ADMIN-X', 'type': 'Workstation', 'ip_address': '10.0.2.14', 'risk_level': 'High', 'status': 'Breached', 'performance_load': 4},
            {'asset_tag': 'AS-004', 'name': 'APP-AUTH-SECURE', 'type': 'Server', 'ip_address': '172.16.0.5', 'risk_level': 'Low', 'status': 'Healthy', 'performance_load': 34},
            {'asset_tag': 'AS-005', 'name': 'WIFI-GUEST-AP', 'type': 'Access Point', 'ip_address': '192.168.50.2', 'risk_level': 'Medium', 'status': 'Suspicious', 'performance_load': 65},
            {'asset_tag': 'AS-006', 'name': 'EXT-WEB-PORTAL', 'type': 'Web App', 'ip_address': '203.0.113.4', 'risk_level': 'Low', 'status': 'Healthy', 'performance_load': 21},
            {'asset_tag': 'AS-007', 'name': 'SRV-WEB-PROD', 'type': 'Server', 'ip_address': '10.0.1.10', 'risk_level': 'High', 'status': 'Warning', 'performance_load': 45},
            {'asset_tag': 'AS-008', 'name': 'DB-CLUSTER-MAIN', 'type': 'Database', 'ip_address': '10.0.0.1', 'risk_level': 'Critical', 'status': 'Healthy', 'performance_load': 72},
            {'asset_tag': 'AS-009', 'name': 'SWITCH-CORE', 'type': 'Network', 'ip_address': '10.0.0.254', 'risk_level': 'Low', 'status': 'Healthy', 'performance_load': 30},
        ]

        weights = [0.20, 0.30, 0.50]
        for asset_data in initial_assets:
            org_id = random.choices(ORG_IDS, weights)[0]
            db.add(Asset(**asset_data, org_id=org_id))

        db.commit()
        print(f"Successfully seeded {len(initial_assets)} assets across {len(ORG_IDS)} orgs.")
    except Exception as e:
        print(f"Error seeding assets: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_assets()
