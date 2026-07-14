import httpx

r = httpx.get("http://localhost:8005/api/offensive/report/pdf/ENG-0001", follow_redirects=True, timeout=30)
print(f"Status: {r.status_code}")
print(f"Content-Type: {r.headers.get('content-type')}")
print(f"Size: {len(r.content)} bytes")
if r.status_code == 200:
    print("PDF OK!")
else:
    print(f"Error: {r.text[:200]}")
