FROM nginx:alpine

RUN mkdir -p /var/log/nginx /etc/nginx/common /etc/nginx/certs && \
    apk add --no-cache openssl && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
      -keyout /etc/nginx/certs/bouclier.key \
      -out /etc/nginx/certs/bouclier.crt \
      -subj "/CN=bouclier.local/O=Bouclier SaaS/C=FR" \
      -addext "subjectAltName=DNS:bouclier.local,DNS:localhost,IP:127.0.0.1"

COPY nginx.conf       /etc/nginx/nginx.conf
COPY common/          /etc/nginx/common/

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/health || exit 1

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
