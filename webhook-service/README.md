# Porter Plays - Telegram to Discord Webhook Service

A Node.js service that monitors Telegram messages for casino codes and automatically posts them to specific Discord channels.

## 🎯 Features

- **Automatic Code Detection**: Monitors Telegram channels for casino-related messages
- **Smart Routing**: Routes codes to appropriate Discord channels based on casino type:
  - **Thrill codes** → Thrill Codes Discord channel
  - **Shuffle codes** → Shuffle Codes Discord channel  
  - **Goated codes** → Goated Codes Discord channel
- **Code Extraction**: Automatically detects and highlights promo codes in messages
- **Rich Embeds**: Posts formatted messages with embeds, colors, and icons
- **Channel Filtering**: Optional whitelist for specific Telegram channels
- **Health Monitoring**: Built-in health check endpoint

## 📋 Prerequisites

- Node.js 16+ 
- A Telegram Bot (with Bot Token)
- Discord Webhook URLs for each casino channel
- (Optional) A server/hosting platform to run the service

## 🚀 Quick Start

### 1. Installation

```bash
cd webhook-service
npm install
```

### 2. Configuration

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Get this from @BotFather on Telegram
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz

# Get these from Discord channel settings → Integrations → Webhooks
DISCORD_WEBHOOK_THRILL=https://discord.com/api/webhooks/xxxxx/yyyyy
DISCORD_WEBHOOK_SHUFFLE=https://discord.com/api/webhooks/xxxxx/yyyyy
DISCORD_WEBHOOK_GOATED=https://discord.com/api/webhooks/xxxxx/yyyyy

# Server settings
PORT=3000
NODE_ENV=production

# Optional: Only accept messages from specific Telegram channels
ALLOWED_TELEGRAM_CHANNELS=-1001234567890,-1009876543210
```

### 3. Running the Service

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

## 🔧 Setup Guide

### Step 1: Create a Telegram Bot

1. Open Telegram and search for `@BotFather`
2. Send `/newbot` and follow the prompts
3. Save the Bot Token provided
4. Send `/setprivacy` to `@BotFather` and disable privacy mode to allow the bot to read group messages

### Step 2: Add Bot to Telegram Channels

1. Add your bot to the Telegram channels you want to monitor
2. Make the bot an admin (required to receive messages)
3. To get the channel ID, forward a message from the channel to `@userinfobot`

### Step 3: Create Discord Webhooks

For each Discord channel you want to post to:

1. Go to Discord Channel → Settings → Integrations
2. Click "Create Webhook" or "View Webhooks"
3. Create a new webhook (name it "Porter Plays Bot" or similar)
4. Copy the webhook URL
5. Paste it into your `.env` file

### Step 4: Set Up Webhook URL

Your service needs to be accessible from the internet for Telegram to send updates.

**Option A: Using ngrok (for testing)**
```bash
ngrok http 3000
```
Copy the HTTPS URL provided (e.g., `https://abc123.ngrok.io`)

**Option B: Deploy to a server**
Deploy to Heroku, Railway, DigitalOcean, AWS, etc.

### Step 5: Register Webhook with Telegram

Once your service is running and accessible:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://your-server.com/webhook/telegram"}'
```

Replace `<YOUR_BOT_TOKEN>` with your actual token and `your-server.com` with your service URL.

To verify it's working:
```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
```

## 📡 API Endpoints

### `POST /webhook/telegram`
Receives updates from Telegram. This is automatically called by Telegram when messages are posted.

### `GET /health`
Health check endpoint. Returns service status and webhook configuration.

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T12:00:00.000Z",
  "webhooks": {
    "thrill": true,
    "shuffle": true,
    "goated": true
  }
}
```

### `GET /`
Service information endpoint.

## 🎰 How It Works

### Casino Detection

The service detects which casino a message is about by looking for keywords:

- **Thrill**: `thrill`, `portervip`, `playthrill`
- **Shuffle**: `shuffle`, `playshuffle`, `playshuffleus`
- **Goated**: `goated`, `playgoated`, `discord`

### Code Extraction

The service automatically extracts potential promo codes using pattern matching:
- Uppercase alphanumeric strings
- Minimum 4 characters
- May include hyphens or underscores

Examples: `PORTERVIP`, `PLAYGOATED`, `SHUFFLE2024`, `THRILL-BONUS`

### Message Routing

1. Message received from Telegram
2. Casino type detected from keywords
3. Codes extracted from message text
4. Message formatted as Discord embed
5. Posted to appropriate Discord webhook

## 🎨 Customization

### Adding More Casinos

Edit `server.js` and add a new entry to `CODE_PATTERNS`:

```javascript
const CODE_PATTERNS = {
    // ... existing casinos ...
    newcasino: {
        keywords: ['newcasino', 'casino-code'],
        channelName: 'New Casino Codes',
        color: 0xFF0000, // Hex color
        icon: '🎮'
    }
};
```

Then add the Discord webhook URL to `.env`:
```env
DISCORD_WEBHOOK_NEWCASINO=https://discord.com/api/webhooks/...
```

### Adjusting Code Detection

Modify the `extractCodes` function in `server.js` to change how codes are detected:

```javascript
function extractCodes(message) {
    // Your custom regex pattern
    const codeRegex = /YOUR_PATTERN/g;
    return message.match(codeRegex) || [];
}
```

## 🐛 Troubleshooting

### Bot Not Receiving Messages

1. Ensure bot is admin in the Telegram channel
2. Check that privacy mode is disabled (`@BotFather` → `/setprivacy`)
3. Verify webhook is set correctly (use `getWebhookInfo`)
4. Check server logs for errors

### Messages Not Posting to Discord

1. Verify Discord webhook URLs are correct
2. Check Discord webhook hasn't been deleted
3. Ensure bot has permission to use webhooks in the channel
4. Check server logs for error details

### No Codes Detected

1. Messages may not contain recognized keywords
2. Adjust `CODE_PATTERNS` keywords if needed
3. Check logs to see what's being detected

### Service Not Starting

1. Verify all required environment variables are set
2. Check that port 3000 (or your chosen port) is available
3. Ensure Node.js version is 16 or higher

## 📊 Monitoring

Check service health:
```bash
curl http://localhost:3000/health
```

View logs:
```bash
# If using systemd
journalctl -u porter-plays-webhook -f

# If running directly
# Logs appear in console
```

## 🚀 Deployment

### Heroku

```bash
heroku create porter-plays-webhook
heroku config:set TELEGRAM_BOT_TOKEN=your_token
heroku config:set DISCORD_WEBHOOK_THRILL=your_url
# ... set other env vars ...
git push heroku main
```

### Railway

1. Connect your GitHub repository
2. Add environment variables in Railway dashboard
3. Railway will automatically deploy

### Docker (Optional)

Create `Dockerfile`:
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

Build and run:
```bash
docker build -t porter-plays-webhook .
docker run -p 3000:3000 --env-file .env porter-plays-webhook
```

## 🔒 Security

- Never commit `.env` file to version control
- Keep Bot Token and Webhook URLs secret
- Use HTTPS for webhook URL (required by Telegram)
- Consider adding authentication for health endpoint in production
- Regularly rotate API tokens and webhook URLs

## 📝 License

MIT License - See main repository for details

## 🆘 Support

- **Discord**: [Join Porter Plays community](https://discord.gg/porterplays)
- **Issues**: [GitHub Issues](https://github.com/jmenichole/porter-plays-leaderboard/issues)
- **Developer**: @jmenichole

---

**Made for the Porter Plays community** 🎰🐐
