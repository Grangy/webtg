#!/usr/bin/env bash
# Deploy Web App to server 93.123.39.210 (PM2 app: webapp)
# Usage: DEPLOY_PATH=/var/www/webapp ./scripts/deploy.sh
# Or set SSH_KEY: SSH_KEY=~/.ssh/shared_server_key ./scripts/deploy.sh

set -e

# Сервер webtg (web.grangy.ru)
DEPLOY_HOST="${DEPLOY_HOST:-195.66.27.66}"
DEPLOY_USER="${DEPLOY_USER:-root}"
DEPLOY_PATH="${DEPLOY_PATH:-/var/www/webtg}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/shared_server_key}"
PM2_APP="${PM2_APP:-web.grangy.ru}"

SSH_OPTS=(-o StrictHostKeyChecking=accept-new)
[[ -f "$SSH_KEY" ]] && SSH_OPTS+=(-i "$SSH_KEY")

echo "Deploying to $DEPLOY_USER@$DEPLOY_HOST:$DEPLOY_PATH (PM2: $PM2_APP)"

ssh "${SSH_OPTS[@]}" "$DEPLOY_USER@$DEPLOY_HOST" "cd $DEPLOY_PATH && git pull && npm ci && npm run build && pm2 restart $PM2_APP"

echo "Done. PM2 app '$PM2_APP' restarted."
