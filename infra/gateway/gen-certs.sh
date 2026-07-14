#!/bin/sh
# Generate self-signed certificates for development
mkdir -p /etc/nginx/certs
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/nginx/certs/bouclier.key \
  -out /etc/nginx/certs/bouclier.crt \
  -subj "/CN=bouclier.local/O=Bouclier SaaS/C=FR" \
  -addext "subjectAltName=DNS:bouclier.local,DNS:localhost,IP:127.0.0.1"
