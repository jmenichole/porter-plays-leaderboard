# Quick Start Guide - Telegram to Discord Webhook

This is a quick 5-minute setup guide for the Porter Plays webhook service.

## 📝 Prerequisites Checklist

- [ ] Node.js 16+ installed
- [ ] Telegram account
- [ ] Discord server with admin access
- [ ] Server or hosting platform (or ngrok for testing)

## 🚀 Setup Steps

### 1. Install Dependencies (1 minute)

```bash
cd webhook-service
npm install
```

### 2. Create Telegram Bot (2 minutes)

1. Open Telegram, search for `@BotFather`
2. Send: `/newbot`
3. Choose a name: "Porter Plays Bot"
4. Choose username: "porterplaysbot" (must end in 'bot')
5. Copy the Bot Token (looks like: `123456789:ABCdefGHIjklMNOpqrs`)
6. Send: `/setprivacy` → select your bot → select "Disable"

### 3. Add Bot to Telegram Channels (1 minute)

1. Go to your Telegram channel
2. Add the bot as admin
3. Grant permission to post messages

### 4. Create Discord Webhooks (2 minutes)

For each casino Discord channel:

1. Open Discord channel (e.g., #thrill-codes)
2. Click gear icon → Integrations → Webhooks
3. Click "New Webhook"
4. Name: "Porter Plays Bot"
5. Copy webhook URL
6. Repeat for Shuffle and Goated channels

### 5. Configure Environment (1 minute)

```bash
cp .env.example .env
nano .env  # or use your favorite editor
```

Paste your credentials:
```env
TELEGRAM_BOT_TOKEN=YOUR_BOT_TOKEN_HERE
DISCORD_WEBHOOK_THRILL=YOUR_THRILL_WEBHOOK_URL
DISCORD_WEBHOOK_SHUFFLE=YOUR_SHUFFLE_WEBHOOK_URL
DISCORD_WEBHOOK_GOATED=YOUR_GOATED_WEBHOOK_URL
PORT=3000
```

### 6. Start the Service

```bash
npm start
```

You should see:
```
🚀 Porter Plays Webhook Service running on port 3000
📡 Telegram webhook: http://localhost:3000/webhook/telegram
❤️  Health check: http://localhost:3000/health
```

### 7. Make Service Public

**For Testing (Using ngrok):**
```bash
ngrok http 3000
```
Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

**For Production:**
Deploy to Heroku, Railway, or your own server.

### 8. Register Webhook with Telegram

```bash
# Replace YOUR_BOT_TOKEN and YOUR_PUBLIC_URL
curl -X POST "https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url":"YOUR_PUBLIC_URL/webhook/telegram"}'
```

Or use the helper script:
```bash
node webhook-setup.js https://your-server.com/webhook/telegram
```

### 9. Test It!

Post a message in your Telegram channel:
```
New THRILL promo code: PORTERVIP
```

Check your Discord #thrill-codes channel - you should see the message!

## ✅ Verification

Check webhook status:
```bash
node webhook-setup.js info
```

Check service health:
```bash
curl http://localhost:3000/health
```

## 🐛 Troubleshooting

**Bot not receiving messages?**
- Make sure bot is admin in Telegram channel
- Check privacy mode is disabled
- Verify webhook URL is set correctly

**Messages not posting to Discord?**
- Check webhook URLs in .env are correct
- Verify Discord webhooks haven't been deleted
- Check service logs for errors

**Service won't start?**
- Verify all environment variables are set
- Check port 3000 is not in use
- Run `npm install` again

## 📚 Next Steps

- Read full [README.md](README.md) for advanced configuration
- Set up systemd service for auto-restart
- Configure Docker for containerized deployment
- Add ALLOWED_TELEGRAM_CHANNELS filter for security

## 🆘 Need Help?

- Check logs: The console shows all activity
- Discord: [Join Porter Plays](https://discord.gg/porterplays)
- Issues: [GitHub Issues](https://github.com/jmenichole/porter-plays-leaderboard/issues)
