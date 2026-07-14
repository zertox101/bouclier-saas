#!/usr/bin/env bash
# Bouclier SaaS - VPS Deployment Script (Ubuntu/Debian)
# Usage: bash deploy.sh [production|staging]
set -euo pipefail

MODE="${1:-production}"
REPO="https://github.com/zertox101/bouclier-saas.git"
BRANCH="main"
APP_DIR="/opt/bouclier-saas"
DOMAIN="${DOMAIN:-bouclier.local}"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@bouclier.local}"
JWT_SECRET="${JWT_SECRET:-$(openssl rand -hex 32)}"

echo "=== Bouclier SaaS Deployment ($MODE) ==="

# Prerequisites
if ! command -v docker &>/dev/null; then
    echo "[1/6] Installing Docker..."
    curl -fsSL https://get.docker.com | bash
    sudo usermod -aG docker "$USER"
fi

if ! command -v docker compose &>/dev/null; then
    echo "[2/6] Installing Docker Compose..."
    sudo apt-get install -y docker-compose-plugin
fi

# Clone / update code
echo "[3/6] Cloning/updating repository..."
if [ -d "$APP_DIR" ]; then
    cd "$APP_DIR" && git pull
else
    git clone --branch "$BRANCH" "$REPO" "$APP_DIR"
    cd "$APP_DIR"
fi

# Environment
echo "[4/6] Configuring environment..."
if [ ! -f .env ]; then
    cat > .env <<EOF
# Bouclier SaaS - Production Environment
JWT_SECRET=$JWT_SECRET
JWT_EXPIRE_MINUTES=60
DB_USER=bouclier_user
DB_PASS=$(openssl rand -hex 16)
DB_NAME=bouclier_data
ADMIN_EMAIL=$ADMIN_EMAIL
ADMIN_PASS=$(openssl rand -hex 8)
DOMAIN=$DOMAIN
CORS_ORIGINS=https://$DOMAIN
NEXT_PUBLIC_API_URL=https://$DOMAIN/api
NEXT_PUBLIC_TOOLS_API_BASE=https://$DOMAIN/agent
NEXTAUTH_SECRET=$(openssl rand -hex 32)
NEXTAUTH_URL=https://$DOMAIN
EOF
    echo "  .env created with secure random secrets"
fi

# Build and start
echo "[5/6] Building and starting containers..."
docker compose build --no-cache
docker compose up -d

# Health check
echo "[6/6] Running health checks..."
sleep 10
HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8005/health)
if [ "$HEALTH" = "200" ]; then
    echo "  ✅ Backend healthy (HTTP $HEALTH)"
else
    echo "  ⚠️ Backend returned HTTP $HEALTH (might still be starting)"
fi

GW=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/health)
if [ "$GW" = "200" ]; then
    echo "  ✅ Gateway healthy (HTTP $GW)"
else
    echo "  ⚠️ Gateway returned HTTP $GW"
fi

echo ""
echo "=== Deployment complete ==="
echo "  Frontend: http://localhost:8080"
echo "  Backend:  http://localhost:8005"
echo "  Gateway:  http://localhost:80"
echo "  Login:    $ADMIN_EMAIL"
echo ""
echo "Set up DNS A record pointing to this server, then:"
echo "  sudo apt install -y nginx certbot"
echo "  sudo certbot --nginx -d $DOMAIN"
