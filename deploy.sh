#!/usr/bin/env bash
# Bouclier SaaS - VPS Deployment Script (Ubuntu 22.04/24.04)
# Usage: bash deploy.sh [production|staging]
set -euo pipefail

MODE="${1:-production}"
REPO="https://github.com/zertox101/bouclier-saas.git"
BRANCH="main"
APP_DIR="/opt/bouclier-saas"
DOMAIN="${DOMAIN:-bouclier.local}"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@bouclier.local}"
JWT_SECRET="${JWT_SECRET:-$(openssl rand -hex 32)}"
ADMIN_PASS="${ADMIN_PASS:-$(openssl rand -hex 8)}"

log() { echo "[$(date +%H:%M:%S)] $*"; }
error_exit() { echo "ERROR: $*" >&2; exit 1; }

log "=== Bouclier SaaS Deployment ($MODE) on $(hostname) ==="

# --- 1. Prerequisites ---
log "[1/8] Installing system dependencies..."
sudo apt-get update -qq
sudo apt-get install -y -qq curl git ufw nginx certbot python3-certbot-nginx

if ! command -v docker &>/dev/null; then
    log " Installing Docker..."
    curl -fsSL https://get.docker.com | bash
    sudo usermod -aG docker "$USER"
fi

if ! command -v docker compose &>/dev/null; then
    log " Installing Docker Compose plugin..."
    sudo apt-get install -y -qq docker-compose-plugin
fi

# --- 2. Firewall ---
log "[2/8] Configuring UFW firewall..."
sudo ufw --force reset
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw --force enable
log "  UFW active: SSH, HTTP(80), HTTPS(443)"

# --- 3. Clone / update code ---
log "[3/8] Cloning/updating repository..."
if [ -d "$APP_DIR" ]; then
    cd "$APP_DIR" && sudo -u "$(stat -c '%U' "$APP_DIR")" git pull
else
    sudo git clone --branch "$BRANCH" "$REPO" "$APP_DIR"
    sudo chown -R "$USER:$USER" "$APP_DIR"
    cd "$APP_DIR"
fi
cd "$APP_DIR"

# --- 4. Environment ---
log "[4/8] Configuring environment..."
if [ ! -f .env ]; then
    cat > .env <<EOF
# Bouclier SaaS - $MODE Environment
JWT_SECRET=$JWT_SECRET
JWT_EXPIRE_MINUTES=60
DB_USER=bouclier_user
DB_PASS=$(openssl rand -hex 16)
DB_NAME=bouclier_data
ADMIN_EMAIL=$ADMIN_EMAIL
ADMIN_PASS=$ADMIN_PASS
DOMAIN=$DOMAIN
CORS_ORIGINS=https://$DOMAIN
NEXT_PUBLIC_API_URL=https://$DOMAIN/api
NEXT_PUBLIC_TOOLS_API_BASE=https://$DOMAIN/agent
NEXTAUTH_SECRET=$(openssl rand -hex 32)
NEXTAUTH_URL=https://$DOMAIN
EOF
    log "  .env created with secure random secrets"
    log "  └─ Admin login: $ADMIN_EMAIL / $ADMIN_PASS"
else
    log "  .env already exists, keeping it"
fi

# --- 5. Nginx Reverse Proxy ---
log "[5/8] Configuring Nginx reverse proxy..."
sudo tee /etc/nginx/sites-available/bouclier > /dev/null <<NGINX
server {
    listen 80;
    server_name $DOMAIN;
    client_max_body_size 100M;

    # Gateway (traefik) runs on port 80 inside Docker
    location / {
        proxy_pass http://127.0.0.1:80;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # WebSocket support
    location /api/offensive/ws {
        proxy_pass http://127.0.0.1:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
    }
}
NGINX

sudo ln -sf /etc/nginx/sites-available/bouclier /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t || error_exit "Nginx config invalid"
sudo systemctl reload nginx
log "  Nginx configured for $DOMAIN"

# --- 6. Build and start Docker ---
log "[6/8] Building and starting containers..."
docker compose build --no-cache 2>&1 | tail -5
docker compose up -d
log "  Containers starting..."

# --- 7. Health check ---
log "[7/8] Running health checks..."
sleep 15
for i in 1 2 3; do
    HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8005/health 2>/dev/null || echo "000")
    if [ "$HEALTH" = "200" ]; then break; fi
    log "  Waiting for backend (attempt $i/3)..."
    sleep 10
done

HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8005/health 2>/dev/null || echo "000")
GW=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/health 2>/dev/null || echo "000")

log "  Backend health: $HEALTH"
log "  Gateway health: $GW"

# --- 8. SSL via Let's Encrypt (if real domain) ---
log "[8/8] Setting up SSL..."
if [ "$DOMAIN" != "bouclier.local" ] && [ "$DOMAIN" != "localhost" ]; then
    sudo certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --email "$ADMIN_EMAIL" || \
        log "  ⚠️ Certbot failed (DNS must resolve to this server)"
    log "  SSL configured for https://$DOMAIN"
else
    log "  Skipping SSL (placeholder domain $DOMAIN)"
fi

# --- Summary ---
echo ""
log "=== Deployment complete ==="
log "  Frontend: http://localhost:8080"
log "  Backend:  http://localhost:8005"
log "  Gateway:  http://localhost:80"
log "  Login:    $ADMIN_EMAIL"
log ""
log "If DNS points here, visit: https://$DOMAIN"
