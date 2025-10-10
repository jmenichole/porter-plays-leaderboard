#!/bin/bash

echo "🎰 Porter Plays - Webhook Service Setup"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚙️  Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env file with your actual credentials:"
    echo "   - TELEGRAM_BOT_TOKEN"
    echo "   - DISCORD_WEBHOOK_THRILL"
    echo "   - DISCORD_WEBHOOK_SHUFFLE"
    echo "   - DISCORD_WEBHOOK_GOATED"
    echo ""
else
    echo "✅ .env file already exists"
    echo ""
fi

# Display next steps
echo "✨ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Edit .env file with your credentials"
echo "   2. Run 'npm start' to start the service"
echo "   3. Set up your Telegram webhook (see README.md)"
echo ""
echo "For detailed setup instructions, see README.md"
