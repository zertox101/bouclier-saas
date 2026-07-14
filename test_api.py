import requests
import json

url = "http://localhost:5005/rag-chatbot/ask"
payload = {"question": "Qui es-tu ?"}
headers = {"Content-Type": "application/json"}

try:
    response = requests.post(url, data=json.dumps(payload), headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response Body: {response.text}")
except Exception as e:
    print(f"Error: {e}")
