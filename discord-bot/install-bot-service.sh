#!/bin/bash

echo "🤖 Porter Plays Discord Bot - Service Installation"
echo "===================================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Please run as root (use sudo)"
    exit 1
fi

# Get current directory
INSTALL_DIR=$(pwd)
echo "📁 Installation directory: $INSTALL_DIR"

# Check if .env exists
if [ ! -f "$INSTALL_DIR/.env" ]; then
    echo "⚠️  .env file not found. Creating from example..."
    cp "$INSTALL_DIR/.env.example" "$INSTALL_DIR/.env"
    echo "⚠️  Please edit .env file with your bot token and configuration"
    echo "   Then run this script again."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Install dependencies if not already installed
if [ ! -d "$INSTALL_DIR/node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
fi

echo "✅ Dependencies installed"

# Create systemd service file
echo "📝 Creating systemd service file..."

cat > /etc/systemd/system/porter-plays-bot.service << EOF
[Unit]
Description=Porter Plays Discord Bot
After=network.target

[Service]
Type=simple
User=$SUDO_USER
WorkingDirectory=$INSTALL_DIR
ExecStart=/usr/bin/node $INSTALL_DIR/bot.js
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=porter-plays-bot

[Install]
WantedBy=multi-user.target
EOF

echo "✅ Service file created"

# Reload systemd
echo "🔄 Reloading systemd..."
systemctl daemon-reload

echo ""
echo "✅ Installation complete!"
echo ""
echo "To start the bot:"
echo "  sudo systemctl start porter-plays-bot"
echo ""
echo "To enable auto-start on boot:"
echo "  sudo systemctl enable porter-plays-bot"
echo ""
echo "To check status:"
echo "  sudo systemctl status porter-plays-bot"
echo ""
echo "To view logs:"
echo "  sudo journalctl -u porter-plays-bot -f"
echo ""
