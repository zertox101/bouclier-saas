FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY src .

EXPOSE 8000

# FastMCP defaults to stdio, but can run on SSE. Let's use the CLI `fastmcp run`
ENTRYPOINT ["fastmcp", "run", "server.py", "--transport", "sse", "--host", "0.0.0.0", "--port", "8000"]
