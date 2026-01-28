FROM kalilinux/kali-rolling

ENV DEBIAN_FRONTEND=noninteractive
ENV SAFE_MODE=true
ENV PIP_BREAK_SYSTEM_PACKAGES=1

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
    radare2 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Python-based security tools
RUN pip3 install --no-cache-dir --break-system-packages --ignore-installed \
    cloudsplaining \
    scoutsuite \
    prowler \
    frida-tools \
    mobsf \
    pwntools \
    requests \
    beautifulsoup4 \
    bloodhound \
    impacket \
    ldap3 \
    dnspython

# Install Empire (PowerShell post-exploitation framework)
# RUN git clone --depth=1 https://github.com/BC-SECURITY/Empire /opt/Empire && \
#    cd /opt/Empire && \
#    pip3 install --break-system-packages --ignore-installed -r setup/requirements.txt && \
#    ln -s /opt/Empire/empire /usr/local/bin/empire

# Note: Ghidra requires 500MB+ download and Java runtime
# Mimikatz is Windows-only, IDA Pro is commercial, Shodan/Maltego require API keys

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
