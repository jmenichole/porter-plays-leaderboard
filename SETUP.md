# 🚀 Porter Plays Platform - Complete Setup Guide

**For Porter**: This document contains everything you need to set up and maintain the Porter Plays Leaderboard Platform independently.

---

## 📋 Table of Contents

1. [Discord Server Configuration](#discord-server-configuration)
2. [Discord Bot Setup (Help Ticket System)](#discord-bot-setup-help-ticket-system)
3. [Webhook Service Setup](#webhook-service-setup)
4. [Frontend Leaderboard Setup](#frontend-leaderboard-setup)
5. [Maintenance & Troubleshooting](#maintenance--troubleshooting)
6. [Quick Reference](#quick-reference)

---

## 🎮 Discord Server Configuration

### Server Information
- **Guild ID**: `1203402161707425862`
- **Support Channel ID**: `1256569414455922719`
- **Mod Role ID**: `1271984805436854283`

### Required Channels
Make sure your Discord server has these channels:
- `#support` or support channel (ID: 1256569414455922719) - For help tickets
- `#thrill-codes` - For Thrill casino promo codes
- `#shuffle-codes` - For Shuffle casino promo codes
- `#goated-codes` - For Goated casino promo codes

---

## 🤖 Discord Bot Setup (Help Ticket System)

The Discord bot provides an automated help ticket system in your support channel with mod notifications.

### Step 1: Create Discord Bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Name it "Porter Plays Support Bot" (or similar)
4. Go to "Bot" section in left sidebar
5. Click "Add Bot" and confirm
6. Under "TOKEN", click "Reset Token" and copy it (save it securely!)
7. Enable these **Privileged Gateway Intents**:
   - ✅ PRESENCE INTENT
   - ✅ SERVER MEMBERS INTENT
   - ✅ MESSAGE CONTENT INTENT

### Step 2: Invite Bot to Your Server

1. In Discord Developer Portal, go to "OAuth2" → "URL Generator"
2. Select these **Scopes**:
   - ✅ `bot`
   - ✅ `applications.commands`
3. Select these **Bot Permissions**:
   - ✅ Read Messages/View Channels
   - ✅ Send Messages
   - ✅ Embed Links
   - ✅ Attach Files
   - ✅ Read Message History
   - ✅ Add Reactions
   - ✅ Use Slash Commands
   - ✅ Manage Messages
   - ✅ Manage Threads
4. Copy the generated URL and open it in your browser
5. Select your server and authorize the bot

### Step 3: Configure Bot Environment

1. Navigate to the `discord-bot` directory:
   ```bash
   cd discord-bot
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file from example:
   ```bash
   cp .env.example .env
   ```

4. Edit `.env` file with your information:
   ```env
   # Bot Configuration
   DISCORD_BOT_TOKEN=your_bot_token_here
   
   # Server IDs
   GUILD_ID=1203402161707425862
   SUPPORT_CHANNEL_ID=1256569414455922719
   MOD_ROLE_ID=1271984805436854283
   
   # Optional Configuration
   BOT_PREFIX=!
   ```

### Step 4: Start the Bot

**For Development/Testing:**
```bash
npm run dev
```

**For Production:**
```bash
npm start
```

**Keep Bot Running 24/7 (Recommended):**

Option A - Using PM2 (Node.js Process Manager):
```bash
# Install PM2 globally
npm install -g pm2

# Start bot with PM2
pm2 start bot.js --name "porter-plays-bot"

# Save PM2 configuration
pm2 save

# Set PM2 to start on system boot
pm2 startup
```

Option B - Using systemd (Linux):
```bash
# Run the installation script
bash install-bot-service.sh

# Start the service
sudo systemctl start porter-plays-bot

# Enable on boot
sudo systemctl enable porter-plays-bot
```

### Bot Features

The bot automatically provides:
- **Help Command**: Users can type `!help` to see available commands
- **Ticket System**: Users can create support tickets
- **Mod Notifications**: Mods are automatically notified when tickets are created
- **FAQ System**: Common questions are answered automatically
- **Casino Information**: Quick info about Thrill, Goated, and Shuffle casinos

### Bot Commands

Users can use:
- `!help` - Show all available commands
- `!ticket <message>` - Create a support ticket
- `!casino <name>` - Get info about a casino (thrill, goated, shuffle)
- `!codes` - Get latest promo codes
- `!faq` - Show frequently asked questions

Moderators can use:
- `!close` - Close a ticket thread
- `!claim` - Claim a ticket to work on it

---

## 🔗 Webhook Service Setup

The webhook service monitors Telegram channels and posts promo codes to Discord automatically.

### Step 1: Create Telegram Bot

1. Open Telegram and search for `@BotFather`
2. Send `/newbot` and follow the prompts
3. Name it "Porter Plays Code Monitor" (or similar)
4. Save the Bot Token provided
5. Send `/setprivacy` to `@BotFather`
6. Select your bot and **disable privacy mode** (allows bot to read group messages)

### Step 2: Add Bot to Telegram Channels

1. Add your bot to each Telegram channel you want to monitor
2. Make the bot an **admin** in each channel (required to receive messages)
3. To get channel IDs:
   - Forward a message from the channel to `@userinfobot`
   - Or check the logs when your bot receives a message

### Step 3: Create Discord Webhooks

For each Discord channel (thrill-codes, shuffle-codes, goated-codes):

1. Go to Discord Channel → Right-click → **Edit Channel**
2. Go to **Integrations** tab
3. Click **Webhooks** → **Create Webhook**
4. Name it "Porter Plays Bot" or similar
5. **Copy the Webhook URL** (you'll need this)
6. Click **Save Changes**

### Step 4: Configure Webhook Service

1. Navigate to webhook service directory:
   ```bash
   cd webhook-service
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file:
   ```bash
   cp .env.example .env
   ```

4. Edit `.env` with your credentials:
   ```env
   # Get this from @BotFather on Telegram
   TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
   
   # Discord webhook URLs from Step 3
   DISCORD_WEBHOOK_THRILL=https://discord.com/api/webhooks/xxxxx/yyyyy
   DISCORD_WEBHOOK_SHUFFLE=https://discord.com/api/webhooks/xxxxx/yyyyy
   DISCORD_WEBHOOK_GOATED=https://discord.com/api/webhooks/xxxxx/yyyyy
   
   # Server settings
   PORT=3000
   NODE_ENV=production
   
   # Optional: Only accept messages from specific Telegram channels
   ALLOWED_TELEGRAM_CHANNELS=-1001234567890,-1009876543210
   ```

### Step 5: Start Webhook Service

**For Testing:**
```bash
npm run dev
```

**For Production:**
```bash
npm start
```

**Keep Service Running 24/7:**

Using PM2:
```bash
pm2 start server.js --name "webhook-service"
pm2 save
```

Using systemd:
```bash
bash install-systemd.sh
sudo systemctl start porter-plays-webhook
sudo systemctl enable porter-plays-webhook
```

### Step 6: Register Webhook with Telegram

You need a **public HTTPS URL** for your webhook service. Options:

**Option A - Use ngrok (for testing):**
```bash
# In a new terminal
ngrok http 3000

# Copy the https URL (e.g., https://abcd1234.ngrok.io)
# Register it with Telegram
node webhook-setup.js set https://abcd1234.ngrok.io/webhook/telegram
```

**Option B - Deploy to a Server (production):**
- Deploy to services like DigitalOcean, AWS, Heroku, Railway, etc.
- Make sure you have HTTPS enabled
- Register your production URL:
  ```bash
  node webhook-setup.js set https://your-domain.com/webhook/telegram
  ```

### Verify Webhook is Working

```bash
# Check webhook status
node webhook-setup.js info

# Should show your webhook URL and "pending_update_count: 0"
```

---

## 🌐 Frontend Leaderboard Setup

The frontend is a static website that displays leaderboards.

### Deployment Options

**Option 1 - GitHub Pages (Current Setup):**
- Already deployed at your repository's GitHub Pages URL
- Automatically updates when you push to main branch
- No additional setup needed!

**Option 2 - Custom Domain:**
1. Purchase a domain (e.g., porterplays.com)
2. In your GitHub repository:
   - Go to Settings → Pages
   - Under "Custom domain", enter your domain
3. Add CNAME record in your domain's DNS settings:
   - Host: `@` or `www`
   - Points to: `yourusername.github.io`
4. Wait for DNS propagation (5-30 minutes)

### Admin Access

**Default Credentials:**
- Developer Password: `jmenichole0098`
- Admin Password: (set your own in admin panel)

**To Configure Leaderboards:**
1. Open the website
2. Click "Admin" button in navigation
3. Enter developer password
4. Configure:
   - API endpoints for each casino
   - Prize pools and distributions
   - Start/end dates for competitions
   - Enable/disable specific leaderboards

### API Integration

If you have API endpoints for casino leaderboards:
1. Access admin panel
2. Enter API URL in respective casino section
3. Add API key if required
4. Test connection
5. Save settings

---

## 🛠️ Maintenance & Troubleshooting

### Checking Bot Status

**Discord Bot:**
```bash
# If using PM2
pm2 list
pm2 logs porter-plays-bot

# If using systemd
sudo systemctl status porter-plays-bot
sudo journalctl -u porter-plays-bot -f
```

**Webhook Service:**
```bash
# If using PM2
pm2 logs webhook-service

# If using systemd
sudo systemctl status porter-plays-webhook
sudo journalctl -u porter-plays-webhook -f
```

### Common Issues

#### Bot Not Responding
1. Check bot is online in Discord (green status)
2. Verify bot has proper permissions in channels
3. Check bot token is correct in `.env`
4. Restart bot: `pm2 restart porter-plays-bot`

#### Webhook Not Posting to Discord
1. Verify Telegram bot is admin in channels
2. Check webhook is registered: `node webhook-setup.js info`
3. Test webhook URLs in Discord channel settings
4. Check logs for errors: `pm2 logs webhook-service`

#### Leaderboard Not Updating
1. Check API endpoints in admin panel
2. Verify API keys are correct
3. Test API URLs in browser or Postman
4. Check browser console for errors (F12)

### Updating Services

**Update Discord Bot:**
```bash
cd discord-bot
git pull
npm install
pm2 restart porter-plays-bot
```

**Update Webhook Service:**
```bash
cd webhook-service
git pull
npm install
pm2 restart webhook-service
```

**Update Frontend:**
- Just push changes to GitHub (if using GitHub Pages)
- Or upload new files to your hosting provider

---

## 📞 Quick Reference

### Important IDs
```
Guild ID: 1203402161707425862
Support Channel: 1256569414455922719
Mod Role: 1271984805436854283
```

### Service Locations
```
Discord Bot: /discord-bot/
Webhook Service: /webhook-service/
Frontend: /index.html, /script.js, /styles.css
```

### Key Files
```
Discord Bot Config: discord-bot/.env
Webhook Config: webhook-service/.env
Bot Token: Get from Discord Developer Portal
Telegram Token: Get from @BotFather
```

### Useful Commands
```bash
# Check all services
pm2 list

# View logs
pm2 logs

# Restart service
pm2 restart <name>

# Check webhook status
cd webhook-service && node webhook-setup.js info

# Test bot commands
!help (in Discord)
```

### Documentation Files
- `README.md` - Main project overview
- `DEVELOPER_HANDOFF.md` - Complete technical documentation
- `WEBHOOK_SERVICE.md` - Webhook service overview
- `webhook-service/README.md` - Detailed webhook setup
- `webhook-service/TROUBLESHOOTING.md` - Webhook debugging

---

## 🆘 Getting Help

### Self-Help Resources
1. Check this SETUP.md file
2. Read DEVELOPER_HANDOFF.md for technical details
3. Check service logs for errors
4. Review webhook-service/TROUBLESHOOTING.md

### Emergency Contacts
- **Developer**: Jamie Nichols (@jmenichole)
- **GitHub Issues**: [Create an issue](https://github.com/jmenichole/porter-plays-leaderboard/issues)
- **Discord**: Porter Plays community server

### Before Asking for Help
1. Check if services are running: `pm2 list`
2. Look at logs: `pm2 logs`
3. Note any error messages
4. Document what you were doing when the issue occurred
5. Try restarting the service: `pm2 restart <name>`

---

## ✅ Setup Checklist

Use this checklist to ensure everything is configured:

### Discord Bot
- [ ] Created bot in Discord Developer Portal
- [ ] Copied bot token
- [ ] Enabled all Privileged Gateway Intents
- [ ] Invited bot to server with proper permissions
- [ ] Created `.env` file with bot token and IDs
- [ ] Installed dependencies (`npm install`)
- [ ] Started bot and verified it's online
- [ ] Tested `!help` command in Discord

### Webhook Service
- [ ] Created Telegram bot via @BotFather
- [ ] Disabled privacy mode for bot
- [ ] Added bot as admin to Telegram channels
- [ ] Created Discord webhooks for each casino channel
- [ ] Created `.env` file with all tokens and URLs
- [ ] Installed dependencies (`npm install`)
- [ ] Deployed service with public HTTPS URL
- [ ] Registered webhook URL with Telegram
- [ ] Verified webhook status (`node webhook-setup.js info`)
- [ ] Tested by posting a code in Telegram

### Frontend
- [ ] Accessed admin panel
- [ ] Configured API endpoints (if available)
- [ ] Set up prize pools and dates
- [ ] Verified leaderboards display correctly
- [ ] Tested on mobile devices

### Production Deployment
- [ ] All services running with PM2 or systemd
- [ ] Services configured to restart on boot
- [ ] Monitoring set up (PM2 or logs)
- [ ] Backup of all `.env` files saved securely

---

**🎉 You're all set!** If you followed all steps, your Porter Plays platform should be fully operational.

For any questions or issues, refer to the documentation or contact the developer.

**Good luck and happy gaming!** 🎰🎲🎮
