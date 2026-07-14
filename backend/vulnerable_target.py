import uvicorn
from fastapi import FastAPI, Request, Response
from fastapi.responses import HTMLResponse
import os

app = FastAPI(title="Vulnerable Corp API", version="0.1.0")

# 1. Exposed Credentials (Hardcoded)
ADMIN_USER = "admin"
ADMIN_PASS = "supersecret_db_pass_2026"

@app.get("/", response_class=HTMLResponse)
async def root():
    return """
    <html>
        <head><title>Internal Corp Portal</title></head>
        <body style="background: black; color: green; font-family: monospace;">
            <h1>Internal Corporate Portal</h1>
            <p>Welcome. Please login to access the database.</p>
            <!-- TODO: Remove /api/exec endpoint before production! -->
            <form action="/login" method="post">
                User: <input type="text" name="username"><br>
                Pass: <input type="password" name="password"><br>
                <input type="submit" value="Login">
            </form>
        </body>
    </html>
    """

# 2. Simulated SQL Injection Vulnerability
@app.post("/login")
async def login(request: Request):
    form = await request.form()
    username = form.get("username", "")
    password = form.get("password", "")
    
    # Very bad SQL logic simulation
    query = f"SELECT * FROM users WHERE username = '{username}' AND password = '{password}'"
    
    if "' OR '1'='1" in username or username == ADMIN_USER:
        return {"status": "success", "token": "JWT_CORP_ADMIN_773", "message": "Logged in as Admin"}
    
    return {"status": "error", "message": "Invalid credentials", "executed_query": query}

# 3. Command Injection Vulnerability
@app.get("/api/exec")
async def execute_command(cmd: str = "whoami"):
    try:
        # DANGEROUS: Executing direct shell commands
        stream = os.popen(cmd)
        output = stream.read()
        return {"command": cmd, "output": output}
    except Exception as e:
        return {"error": str(e)}

# 4. Exposed Environment Variables
@app.get("/.env")
async def get_env():
    return Response(content="AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE\nAWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY\nDB_PASS=supersecret_db_pass_2026", media_type="text/plain")

if __name__ == "__main__":
    print("[!] WARNING: Starting Vulnerable Target Server on port 9000")
    uvicorn.run(app, host="0.0.0.0", port=9000)
