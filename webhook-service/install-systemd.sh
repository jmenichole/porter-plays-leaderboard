#!/bin/bash

# Installation script for systemd service
# Run as root or with sudo

set -e

echo "🔧 Porter Plays Webhook - Systemd Installation"
echo "=============================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Please run as root or with sudo"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo "   Install Node.js 16+ first: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Set installation directory
INSTALL_DIR="/opt/porter-plays-webhook"
SERVICE_FILE="/etc/systemd/system/porter-plays-webhook.service"
SERVICE_USER="www-data"

echo ""
echo "📦 Installation settings:"
echo "   Directory: $INSTALL_DIR"
echo "   Service file: $SERVICE_FILE"
echo "   Run as user: $SERVICE_USER"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# Create installation directory
echo "📁 Creating installation directory..."
mkdir -p "$INSTALL_DIR"

# Copy files
echo "📋 Copying files..."
cp server.js "$INSTALL_DIR/"
cp package*.json "$INSTALL_DIR/"
cp webhook-setup.js "$INSTALL_DIR/"

# Install dependencies
echo "📦 Installing dependencies..."
cd "$INSTALL_DIR"
npm ci --only=production

# Copy .env if it doesn't exist
if [ ! -f "$INSTALL_DIR/.env" ]; then
    echo "⚙️  Creating .env file..."
    cp .env.example "$INSTALL_DIR/.env" 2>/dev/null || cat > "$INSTALL_DIR/.env" << 'EOF'
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
DISCORD_WEBHOOK_THRILL=https://discord.com/api/webhooks/your_thrill_webhook
DISCORD_WEBHOOK_SHUFFLE=https://discord.com/api/webhooks/your_shuffle_webhook
DISCORD_WEBHOOK_GOATED=https://discord.com/api/webhooks/your_goated_webhook
PORT=3000
NODE_ENV=production
ALLOWED_TELEGRAM_CHANNELS=
EOF
    echo "⚠️  IMPORTANT: Edit $INSTALL_DIR/.env with your credentials"
fi

# Set permissions
echo "🔒 Setting permissions..."
chown -R $SERVICE_USER:$SERVICE_USER "$INSTALL_DIR"
chmod 600 "$INSTALL_DIR/.env"

# Install systemd service
echo "⚙️  Installing systemd service..."
cat > "$SERVICE_FILE" << 'EOF'
[Unit]
Description=Porter Plays Telegram to Discord Webhook Service
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/porter-plays-webhook
Environment=NODE_ENV=production
EnvironmentFile=/opt/porter-plays-webhook/.env
ExecStart=/usr/bin/node server.js
Restart=on-failure
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=porter-plays-webhook

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd
echo "🔄 Reloading systemd..."
systemctl daemon-reload

# Enable service
echo "✅ Enabling service..."
systemctl enable porter-plays-webhook

echo ""
echo "✨ Installation complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Edit configuration: nano $INSTALL_DIR/.env"
echo "   2. Start service: systemctl start porter-plays-webhook"
echo "   3. Check status: systemctl status porter-plays-webhook"
echo "   4. View logs: journalctl -u porter-plays-webhook -f"
echo ""
echo "🔧 Useful commands:"
echo "   Start:   systemctl start porter-plays-webhook"
echo "   Stop:    systemctl stop porter-plays-webhook"
echo "   Restart: systemctl restart porter-plays-webhook"
echo "   Status:  systemctl status porter-plays-webhook"
echo "   Logs:    journalctl -u porter-plays-webhook -f"
