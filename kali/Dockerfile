FROM kalilinux/kali-rolling:latest

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        ca-certificates \
        curl \
        dnsutils \
        iputils-ping \
        nmap \
        nikto \
        gobuster \
        netcat-traditional \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /opt/scan

COPY entrypoint.sh run_forever.sh scan_to_ingest.sh targets.txt /opt/scan/

ENTRYPOINT ["/bin/bash", "/opt/scan/entrypoint.sh"]
