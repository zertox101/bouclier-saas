from sqlalchemy import create_engine, text

try:
    engine = create_engine("postgresql://postgres:postgres@localhost:5432/shield_db")
    with engine.connect() as conn:
        print("Connected to shield_db!")
        events = conn.execute(text("SELECT count(*) FROM events")).scalar()
        alerts = conn.execute(text("SELECT count(*) FROM alerts")).scalar()
        print(f"Events count: {events}")
        print(f"Alerts count: {alerts}")
except Exception as e:
    print(f"Error: {e}")
