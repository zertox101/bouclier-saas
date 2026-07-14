FROM kalilinux/kali-rolling

ENV DEBIAN_FRONTEND=noninteractive
ENV SAFE_MODE=false
ENV PIP_BREAK_SYSTEM_PACKAGES=1

# Install the professional offensive arsenal (Full Kali Power)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-setuptools \
    python3-wheel \
    python3-venv \
    curl \
    wget \
    unzip \
    git \
    gnupg \
    procps \
    net-tools \
    iputils-ping \
    dnsutils \
    whois \
    nmap \
    nikto \
    exploitdb \
    tcpdump \
    traceroute \
    netcat-traditional \
    arp-scan \
    ffuf \
    gobuster \
    hydra \
    sqlmap \
    metasploit-framework \
    commix \
    bettercap \
    crunch \
    john \
    hashcat \
    masscan \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Nuclei (for vulnerability scanning)
RUN wget -q https://github.com/projectdiscovery/nuclei/releases/download/v3.1.8/nuclei_3.1.8_linux_amd64.zip -O /tmp/nuclei.zip \
    && unzip /tmp/nuclei.zip -d /usr/local/bin/ \
    && rm /tmp/nuclei.zip

# Install Python-based security tools
RUN pip3 install --no-cache-dir --break-system-packages \
    requests \
    beautifulsoup4 \
    shodan \
    scapy \
    psutil

# Install WSTG-Scan (OWASP Web Security Testing Scanner)
RUN git clone https://github.com/afsh4ck/WSTG-Scan.git /opt/wstg-scan \
    && cd /opt/wstg-scan \
    && pip3 install --no-cache-dir --break-system-packages -r requirements.txt \
    && chmod +x wstg-scan.py

# Install RAPTOR (Autonomous Security Research Framework)
COPY raptor-main /opt/raptor-main
RUN pip3 install --no-cache-dir --break-system-packages -r /opt/raptor-main/requirements.txt 2>/dev/null || true

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
