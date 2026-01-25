FROM kalilinux/kali-rolling

ENV DEBIAN_FRONTEND=noninteractive
ENV SAFE_MODE=true

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-setuptools \
    python3-wheel \
    python3-venv \
    nmap \
    tcpdump \
    arp-scan \
    nikto \
    whois \
    traceroute \
    curl \
    wget \
    openssl \
    whatweb \
    gobuster \
    ffuf \
    sqlmap \
    hydra \
    masscan \
    hping3 \
    net-tools \
    iputils-ping \
    iproute2 \
    dnsutils \
    netcat-traditional \
    build-essential \
    libxml2-dev \
    libxslt1-dev \
    libffi-dev \
    libssl-dev \
    libpcap-dev \
    tshark \
    ngrep \
    iftop \
    nethogs \
    wapiti \
    nuclei \
    sslscan \
    metasploit-framework \
    exploitdb \
    crackmapexec \
    theharvester \
    recon-ng \
    amass \
    subfinder \
    john \
    hashcat \
    crunch \
    aircrack-ng \
    wifite \
    binwalk \
    foremost \
    yara \
    jq \
    git \
    vim \
    tmux \
    python3-scapy \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /opt/tools-api

RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY tools-api/requirements.txt /opt/tools-api/requirements.txt
RUN pip install --no-cache-dir -r /opt/tools-api/requirements.txt

COPY tools/adversary-emulation/security/requirements.txt /opt/tools-api/tools-requirements.txt
RUN pip install --no-cache-dir -r /opt/tools-api/tools-requirements.txt

COPY tools-api/app.py /opt/tools-api/app.py

EXPOSE 8100

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8100"]
