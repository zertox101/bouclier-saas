#!/usr/bin/env python3
"""
Inject CICIDS data directly into PostgreSQL
Bypasses the streaming API to populate the database quickly
"""
import pandas as pd
import psycopg2
from psycopg2.extras import execute_batch
from datetime import datetime, timedelta
import random
import sys

# Database connection
DB_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "user": "bouclier_user",
    "password": "bouclier_password_prod",
    "database": "bouclier_data"
}

CICIDS_FILE = "backend/app/ml/data/cicids2017_sample.csv"

def connect_db():
    """Connect to PostgreSQL"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        return conn
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return None

def load_cicids_sample(limit=1000):
    """Load CICIDS sample data"""
    print(f"📂 Loading CICIDS data (limit: {limit} rows)...")
    try:
        df = pd.read_csv(CICIDS_FILE, nrows=limit)
        print(f"✅ Loaded {len(df)} rows")
        return df
    except Exception as e:
        print(f"❌ Failed to load data: {e}")
        return None

def inject_events(conn, df, batch_size=100):
    """Inject events into telemetry_events table"""
    print(f"\n💉 Injecting {len(df)} events into database...")
    
    cursor = conn.cursor()
    
    # Create table if not exists
    create_table_sql = """
    CREATE TABLE IF NOT EXISTS telemetry_events (
        id SERIAL PRIMARY KEY,
        timestamp TIMESTAMP NOT NULL,
        event_type VARCHAR(100),
        severity VARCHAR(50),
        source_ip VARCHAR(50),
        destination_ip VARCHAR(50),
        source_port INTEGER,
        destination_port INTEGER,
        protocol VARCHAR(20),
        country VARCHAR(10),
        blocked BOOLEAN DEFAULT FALSE,
        description TEXT,
        raw_data JSONB,
        created_at TIMESTAMP DEFAULT NOW()
    );
    """
    
    try:
        cursor.execute(create_table_sql)
        conn.commit()
        print("✅ Table ensured")
    except Exception as e:
        print(f"⚠️  Table creation: {e}")
        conn.rollback()
    
    # Prepare data
    events = []
    base_time = datetime.now() - timedelta(hours=24)
    
    for idx, row in df.iterrows():
        # Extract relevant fields
        timestamp = base_time + timedelta(seconds=idx * 10)
        
        # Map CICIDS columns
        label = str(row.get('Label', row.get(' Label', 'BENIGN'))).strip()
        
        # Determine severity
        if 'DDoS' in label or 'DoS' in label:
            severity = 'Critical'
            event_type = 'DDoS Attack'
        elif 'PortScan' in label:
            severity = 'High'
            event_type = 'Port Scan'
        elif 'Bot' in label:
            severity = 'Critical'
            event_type = 'Botnet'
        elif 'Infiltration' in label:
            severity = 'Critical'
            event_type = 'Infiltration'
        elif 'Brute' in label or 'FTP' in label or 'SSH' in label:
            severity = 'High'
            event_type = 'Brute Force'
        elif 'Web' in label or 'XSS' in label or 'SQL' in label:
            severity = 'High'
            event_type = 'Web Attack'
        elif 'BENIGN' in label:
            severity = 'Low'
            event_type = 'Normal Traffic'
        else:
            severity = 'Medium'
            event_type = label
        
        # Get IPs and ports
        src_ip = str(row.get(' Source IP', row.get('Source IP', f'192.168.{random.randint(1,255)}.{random.randint(1,255)}')))
        dst_ip = str(row.get(' Destination IP', row.get('Destination IP', f'10.0.{random.randint(1,255)}.{random.randint(1,255)}')))
        src_port = int(row.get(' Source Port', row.get('Source Port', random.randint(1024, 65535))))
        dst_port = int(row.get(' Destination Port', row.get('Destination Port', random.randint(1, 1024))))
        protocol = str(row.get(' Protocol', row.get('Protocol', 'TCP')))
        
        country = random.choice(['US', 'CN', 'RU', 'FR', 'DE', 'UK', 'BR'])
        blocked = severity in ['Critical', 'High']
        
        events.append((
            timestamp,
            event_type,
            severity,
            src_ip,
            dst_ip,
            src_port,
            dst_port,
            protocol,
            country,
            blocked,
            f"CICIDS2017: {label}",
            None  # raw_data
        ))
    
    # Insert in batches
    insert_sql = """
    INSERT INTO telemetry_events 
    (timestamp, event_type, severity, source_ip, destination_ip, 
     source_port, destination_port, protocol, country, blocked, description, raw_data)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    
    try:
        execute_batch(cursor, insert_sql, events, page_size=batch_size)
        conn.commit()
        print(f"✅ Inserted {len(events)} events successfully")
        return True
    except Exception as e:
        print(f"❌ Insertion failed: {e}")
        conn.rollback()
        return False
    finally:
        cursor.close()

def main():
    print("\n" + "="*60)
    print("🛡️  BOUCLIER - CICIDS Data Injector")
    print("="*60 + "\n")
    
    # Connect to database
    print("🔌 Connecting to PostgreSQL...")
    conn = connect_db()
    if not conn:
        sys.exit(1)
    print("✅ Connected\n")
    
    # Load data
    limit = int(input("How many rows to inject? [default: 1000]: ").strip() or "1000")
    df = load_cicids_sample(limit)
    if df is None:
        conn.close()
        sys.exit(1)
    
    # Inject
    success = inject_events(conn, df)
    
    conn.close()
    
    if success:
        print("\n" + "="*60)
        print("✅ Data injection complete!")
        print("="*60)
        print("\n📊 Refresh your dashboard at http://localhost:3001")
        print("   You should now see real CICIDS2017 data!\n")
    else:
        print("\n❌ Injection failed")
        sys.exit(1)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Interrupted by user")
        sys.exit(0)
