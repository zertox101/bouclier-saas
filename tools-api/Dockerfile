FROM python:3.11-slim

ENV DEBIAN_FRONTEND=noninteractive
ENV SAFE_MODE=false
ENV PIP_BREAK_SYSTEM_PACKAGES=1

# Install system dependencies (lighter set)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    wget \
    unzip \
    git \
    procps \
    net-tools \
    iputils-ping \
    dnsutils \
    nmap \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Python security tools
RUN pip install --no-cache-dir \
    requests \
    beautifulsoup4 \
    shodan \
    scapy \
    psutil

# Install WSTG-Scan
RUN git clone --depth 1 https://github.com/afsh4ck/WSTG-Scan.git /opt/wstg-scan \
    && cd /opt/wstg-scan \
    && pip install --no-cache-dir -r requirements.txt 2>/dev/null \
    && chmod +x wstg-scan.py || true

WORKDIR /opt/tools-api

# Setup virtual environment
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY tools-api/requirements.txt /opt/tools-api/requirements.txt
RUN pip install --no-cache-dir -r /opt/tools-api/requirements.txt

COPY tools-api/*.py /opt/tools-api/
COPY tools-api/*.txt /opt/tools-api/
COPY tools-api/core /opt/tools-api/core

EXPOSE 8100

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8100", "--loop", "asyncio"]
