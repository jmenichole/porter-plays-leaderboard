# Porter Plays Discord Bot - Help Ticket System

A comprehensive Discord bot that provides automated support ticket management and helpful casino information for the Porter Plays community.

---

## 🎯 Features

### Help Ticket System
- **Ticket Creation**: Users can create support tickets with a simple command
- **Thread-based Tickets**: Each ticket gets its own thread for organized conversation
- **Mod Notifications**: Moderators are automatically notified when new tickets are created
- **Ticket Management**: Mods can claim and close tickets
- **One Ticket per User**: Prevents spam by limiting users to one active ticket at a time

### Casino Information
- **Casino Details**: Get information about Thrill, Goated, Shuffle, and Shuffle US
- **Promo Codes**: Quick access to all current promo codes
- **Bonus Information**: Details about exclusive offers and bonuses

### FAQ System
- **Common Questions**: Automated answers to frequently asked questions
- **Self-service Support**: Users can find answers without needing mod assistance

---

## 🚀 Quick Start

### Prerequisites
- **Node.js 16+** installed
- **Discord Bot Token** from Discord Developer Portal
- Access to Porter Plays Discord server

### Installation

1. **Navigate to directory:**
   ```bash
   cd discord-bot
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your bot token and server IDs
   ```

4. **Start the bot:**
   ```bash
   npm start
   ```

For development with auto-restart:
```bash
npm run dev
```

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file with the following:

```env
# Discord Bot Token (from Discord Developer Portal)
DISCORD_BOT_TOKEN=your_bot_token_here

# Server Configuration
GUILD_ID=1203402161707425862
SUPPORT_CHANNEL_ID=1256569414455922719
MOD_ROLE_ID=1271984805436854283

# Bot Settings
BOT_PREFIX=!
```

### Discord Developer Portal Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create New Application
3. Go to "Bot" section
4. Enable these **Privileged Gateway Intents**:
   - ✅ PRESENCE INTENT
   - ✅ SERVER MEMBERS INTENT
   - ✅ MESSAGE CONTENT INTENT
5. Copy bot token and add to `.env`

### Bot Permissions

When inviting the bot, select these permissions:
- Read Messages/View Channels
- Send Messages
- Embed Links
- Attach Files
- Read Message History
- Add Reactions
- Use Slash Commands
- Manage Messages
- Manage Threads

**Permission Integer:** `414464724032`

**Invite URL Template:**
```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=414464724032&scope=bot%20applications.commands
```

---

## 📖 Commands

### User Commands

| Command | Description | Example |
|---------|-------------|---------|
| `!help` | Show all available commands | `!help` |
| `!ticket <message>` | Create a support ticket | `!ticket I need help with my bonus` |
| `!casino <name>` | Get casino information | `!casino thrill` |
| `!codes` | Get all current promo codes | `!codes` |
| `!faq` | View frequently asked questions | `!faq` |

### Moderator Commands

| Command | Description | Usage |
|---------|-------------|-------|
| `!claim` | Claim a ticket to work on it | Use in ticket thread |
| `!close` | Close and archive a ticket | Use in ticket thread |

---

## 🎫 Ticket System Workflow

### Creating a Ticket

1. User runs `!ticket <description>` in the support channel
2. Bot creates a new thread with the ticket
3. Bot notifies moderators by mentioning the mod role
4. User and mods can discuss in the thread
5. Original message is auto-deleted after 5 seconds to keep channel clean

### Managing Tickets

**For Moderators:**
1. Get notified when ticket is created
2. Use `!claim` to indicate you're handling it
3. Discuss with user in thread
4. Use `!close` when resolved
5. Thread is automatically archived

**Ticket Features:**
- Each ticket gets a unique ID (last 6 digits of thread ID)
- Status tracking (Open, Claimed, Closed)
- User can only have one active ticket at a time
- Threads auto-archive after 24 hours of inactivity

---

## 🎰 Casino Information

The bot provides detailed information about:

### Thrill.com
- Promo Code: `PORTERVIP`
- $2,500 Welcome Bonus + VIP Status Transfer
- High-energy gameplay and competitive leaderboards

### Goated.com
- Promo Code: `PLAYGOATED`
- Exclusive VIP Program + Daily Rakeback
- Premium casino experience with monthly competitions

### Shuffle.com
- Promo Code: `playShuffle`
- Welcome Bonus + Original Games
- Modern platform with active community events

### Shuffle US
- Promo Code: `playShuffleUS`
- US Players Welcome + Exclusive Bonuses
- Same great platform for USA players

---

## 🔧 Production Deployment

### Using PM2 (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Start bot
pm2 start bot.js --name "porter-plays-bot"

# Save PM2 configuration
pm2 save

# Set PM2 to start on system boot
pm2 startup
```

**Managing with PM2:**
```bash
# View status
pm2 status

# View logs
pm2 logs porter-plays-bot

# Restart bot
pm2 restart porter-plays-bot

# Stop bot
pm2 stop porter-plays-bot
```

### Using systemd (Linux)

```bash
# Run installation script
sudo bash install-bot-service.sh

# Start service
sudo systemctl start porter-plays-bot

# Enable on boot
sudo systemctl enable porter-plays-bot

# Check status
sudo systemctl status porter-plays-bot

# View logs
sudo journalctl -u porter-plays-bot -f
```

---

## 🐛 Troubleshooting

### Bot Not Responding

**Check bot is online:**
- Look for green status in Discord
- Check logs: `pm2 logs porter-plays-bot` or `journalctl -u porter-plays-bot`

**Verify configuration:**
- Bot token is correct in `.env`
- All IDs match your Discord server
- Bot has proper permissions in channels

**Common fixes:**
```bash
# Restart bot
pm2 restart porter-plays-bot

# Check logs for errors
pm2 logs porter-plays-bot --lines 100

# Verify environment variables
cat .env
```

### Commands Not Working

**Verify:**
- Bot can read messages in the channel
- Message Content Intent is enabled in Developer Portal
- Command starts with correct prefix (default: `!`)
- No typos in command name

### Ticket System Issues

**If threads aren't created:**
- Bot needs "Manage Threads" permission
- Support channel must allow thread creation
- Check bot logs for specific errors

**If mods aren't notified:**
- Verify mod role ID is correct in `.env`
- Bot must be able to mention the role
- Role must be mentionable or bot needs permissions

---

## 📊 Monitoring

### Health Checks

The bot logs important events:
- ✅ Bot startup and ready status
- 📨 Commands executed
- 🎫 Tickets created/closed
- ❌ Errors and exceptions

### Log Locations

**PM2:**
```bash
~/.pm2/logs/porter-plays-bot-out.log  # Standard output
~/.pm2/logs/porter-plays-bot-error.log  # Errors
```

**systemd:**
```bash
# View all logs
sudo journalctl -u porter-plays-bot

# Follow logs in real-time
sudo journalctl -u porter-plays-bot -f

# View last 100 lines
sudo journalctl -u porter-plays-bot -n 100
```

### Metrics to Monitor

- Bot uptime
- Number of active tickets
- Command usage
- Error rates
- Response times

---

## 🔄 Updates

To update the bot:

```bash
# Navigate to bot directory
cd discord-bot

# Pull latest changes
git pull

# Install any new dependencies
npm install

# Restart bot
pm2 restart porter-plays-bot
# OR
sudo systemctl restart porter-plays-bot
```

---

## 🆘 Support

### Documentation
- Main setup guide: `/SETUP.md`
- Project overview: `/README.md`
- Developer handoff: `/DEVELOPER_HANDOFF.md`

### Getting Help
1. Check logs for error messages
2. Verify configuration in `.env`
3. Review Discord Developer Portal settings
4. Contact Jamie Nichols (@jmenichole) on Discord

### Common Issues & Solutions

**"Invalid Token" error:**
- Verify bot token in `.env`
- Make sure no extra spaces or quotes
- Regenerate token in Developer Portal if needed

**Bot joins but doesn't respond:**
- Enable Message Content Intent in Developer Portal
- Verify bot has read/send message permissions
- Check command prefix matches in `.env`

**Tickets not creating threads:**
- Enable thread creation in support channel settings
- Give bot "Manage Threads" permission
- Verify support channel ID is correct

---

## 📝 License

MIT License - See main repository for details

---

## 👨‍💻 Credits

**Developer:** Jamie Nichols (@jmenichole)  
**Project:** Porter Plays Leaderboard Platform  
**Community:** Porter Plays Discord Server

---

**Made for degens by degens** ❤️
