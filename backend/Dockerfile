# Backend Dockerfile
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    gcc \
    nmap \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Environment variables
ENV PYTHONUNBUFFERED=1
ENV APP_MODULE=app.main:app

EXPOSE 8005

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8005"]
