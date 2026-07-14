# Threat Map Fix - Attack Arcs Not Showing

## Problem
The Tactical Threat Vector Map (World Threat Matrix) is not displaying attack arcs or threat data points.

## Root Cause
1. **Redis Stream Empty**: The `/map/points` endpoint depends on Redis stream data which is empty
2. **No Fallback Data**: When Redis has no data, the map shows nothing
3. **Missing Data Generator**: No automated way to populate threat data

## Solution Implemented

### 1. Created Data Generator Script
**File**: `backend/generate_threat_map_data.py`

**Features**:
- Generates realistic threat events with geo-coordinates
- Supports batch and continuous modes
- 15 realistic threat source locations (Russia, China, Iran, etc.)
- 10 different attack types (Brute Force, SQL Injection, DDoS, etc.)
- Severity levels: critical, high, medium, low
- MITRE ATT&CK tactics included

**Usage**:
```bash
# Generate 50 events
python generate_threat_map_data.py batch 50

# Generate 100 events
python generate_threat_map_data.py batch 100

# Continuous mode (generates events every 2 seconds)
python generate_threat_map_data.py continuous

# Clear all events
python generate_threat_map_data.py clear

# Show statistics
python generate_threat_map_data.py stats
```

### 2. Sample Event Structure
```json
{
  "id": "EVT-1234567890-5678",
  "timestamp": "2024-05-21T10:30:00.000Z",
  "src_ip": "185.220.45.123",
  "src_city": "Moscow",
  "src_country": "Russia",
  "src_country_iso": "RU",
  "src_lat": 55.7558,
  "src_lon": 37.6173,
  "dst_ip": "10.0.0.1",
  "dst_city": "Paris",
  "dst_country": "France",
  "dst_lat": 48.8566,
  "dst_lon": 2.3522,
  "attack_type": "SQL Injection",
  "severity": "critical",
  "threat_score": 95,
  "confidence": 0.98,
  "mitre_tactic": "Initial Access"
}
```

### 3. Threat Source Locations
- **Russia**: Moscow, St Petersburg
- **China**: Beijing, Shanghai
- **North Korea**: Pyongyang
- **Iran**: Tehran
- **Romania**: Bucharest
- **Nigeria**: Lagos
- **Brazil**: São Paulo
- **India**: Mumbai
- **Indonesia**: Jakarta
- **Turkey**: Istanbul
- **Ukraine**: Kiev
- **Poland**: Warsaw
- **Thailand**: Bangkok

### 4. Attack Types
1. Brute Force (high)
2. SQL Injection (critical)
3. DDoS (critical)
4. Malware C2 (critical)
5. Port Scan (medium)
6. Phishing (high)
7. Ransomware (critical)
8. Credential Stuffing (high)
9. XSS Attack (medium)
10. Zero-Day Exploit (critical)

## How to Fix the Map

### Step 1: Start Redis
```bash
# Windows (if Redis installed)
redis-server

# Or use Docker
docker run -d -p 6379:6379 redis:latest
```

### Step 2: Generate Threat Data
```bash
cd backend
python generate_threat_map_data.py batch 100
```

### Step 3: Verify Data
```bash
python generate_threat_map_data.py stats
```

### Step 4: View the Map
Navigate to: `http://localhost:3000/threat-map-pro`

## Alternative: Add Fallback Data to API

If Redis is not available, modify `/map/points` endpoint to return sample data:

```python
@router.get("/map/points")
def map_points(limit: int = 500) -> Dict[str, Any]:
    if not redis_client:
        # Return fallback sample data
        return {
            "points": [
                {
                    "id": f"sample-{i}",
                    "lat": random.uniform(-60, 70),
                    "lng": random.uniform(-180, 180),
                    "country": random.choice(["RU", "CN", "US", "BR", "IN"]),
                    "ip": f"{random.randint(1,255)}.{random.randint(1,255)}.{random.randint(1,255)}.{random.randint(1,255)}",
                    "severity": random.choice(["critical", "high", "medium", "low"])
                }
                for i in range(50)
            ]
        }
    
    # ... existing Redis logic
```

## Testing

### 1. Test Data Generation
```bash
python generate_threat_map_data.py batch 10
```

Expected output:
```
============================================================
  THREAT MAP DATA GENERATOR
============================================================

📊 Batch mode: Generating 10 events

✓ Generated 10/10 events...

✓ Successfully generated 10 events
✓ Stream: flows
✓ View at: http://localhost:3000/threat-map-pro
```

### 2. Test API Endpoint
```bash
curl http://localhost:8005/map/points?limit=10
```

Expected: JSON with array of threat points

### 3. Test Frontend
1. Open `http://localhost:3000/threat-map-pro`
2. Should see:
   - World map with countries
   - Blue attack arcs from threat sources to Paris
   - Red/blue dots on threat source locations
   - Animated effects on arcs
   - Sidebar with live threat events

## Continuous Monitoring Mode

For demo/testing, run continuous mode:

```bash
python generate_threat_map_data.py continuous
```

This will:
- Generate new threat every 2 seconds
- Display real-time console output
- Update map automatically
- Press Ctrl+C to stop

## Performance Considerations

- **Stream Limit**: Keeps last 1000 events (configurable)
- **API Limit**: Default 500 points per request
- **Update Frequency**: Frontend polls every 5 seconds
- **Memory**: ~1MB for 1000 events

## Future Enhancements

1. **Real Data Integration**
   - Connect to actual SIEM/IDS systems
   - Parse real firewall logs
   - Integrate with threat intelligence feeds

2. **Advanced Visualization**
   - Heatmap mode
   - Cluster analysis
   - Time-based replay
   - 3D globe view

3. **Filtering & Search**
   - Filter by severity
   - Filter by country
   - Filter by attack type
   - Search by IP address

4. **Alerts & Notifications**
   - Real-time alerts for critical threats
   - Email notifications
   - Slack/Teams integration
   - Custom alert rules

## Troubleshooting

### Map Still Empty After Generating Data

1. **Check Redis Connection**:
   ```bash
   redis-cli ping
   ```
   Should return: `PONG`

2. **Check Stream Data**:
   ```bash
   redis-cli XLEN flows
   ```
   Should return: number > 0

3. **Check API Response**:
   ```bash
   curl http://localhost:8005/map/points?limit=5
   ```
   Should return JSON with points array

4. **Check Browser Console**:
   - Open DevTools (F12)
   - Check for JavaScript errors
   - Check Network tab for failed requests

### Attack Arcs Not Animating

1. **Check ECharts Version**: Ensure `echarts-for-react` is installed
2. **Check Map Data**: Verify `world.json` is loaded
3. **Check Coordinates**: Ensure lat/lng are valid numbers

### Performance Issues

1. **Reduce Limit**: Use `?limit=50` instead of default 500
2. **Clear Old Data**: Run `python generate_threat_map_data.py clear`
3. **Increase Redis Memory**: Configure `maxmemory` in redis.conf

---

**Status**: ✅ Solution Ready
**Next Step**: Start Redis and run data generator
**Expected Result**: Fully functional threat map with animated attack arcs
