# Troubleshooting Guide

Common issues and solutions for the Porter Plays Telegram to Discord webhook service.

## 🔍 Quick Diagnostics

Run these commands to check your setup:

```bash
# 1. Check service health
curl http://localhost:3000/health

# 2. Check Telegram webhook status
node webhook-setup.js info

# 3. Test local logic (no API calls)
npm test

# 4. Check environment variables
env | grep -E "TELEGRAM|DISCORD|PORT"
```

## 🐛 Common Issues

### Issue 1: Service Won't Start

**Symptoms:**
- Error: "Cannot find module 'express'"
- Error: "EADDRINUSE: address already in use"
- Service exits immediately

**Solutions:**

```bash
# A. Missing dependencies
npm install

# B. Port already in use
# Check what's using port 3000
lsof -i :3000
# Kill the process or change PORT in .env
PORT=3001 npm start

# C. Check for syntax errors
node -c server.js

# D. Verify Node.js version
node --version
# Should be 16.0.0 or higher
```

### Issue 2: Bot Not Receiving Messages

**Symptoms:**
- Telegram messages posted but nothing happens
- No logs appear when posting to Telegram
- Webhook shows errors in getWebhookInfo

**Solutions:**

```bash
# A. Verify webhook is set
curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"

# Should show:
# - url: your webhook URL
# - pending_update_count: 0 or small number
# - last_error_message: should be empty

# B. Check bot is admin in channel
# Go to Telegram → Channel → Administrators
# Bot must be listed with proper permissions

# C. Verify privacy mode is disabled
# Talk to @BotFather:
# /setprivacy → select your bot → Disable

# D. Test webhook manually
curl -X POST "http://your-server.com/webhook/telegram" \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "text": "Test THRILL code: TEST123",
      "chat": {"id": 123, "title": "Test"}
    }
  }'

# E. Check service is accessible
curl http://your-server.com/health

# F. Verify HTTPS (Telegram requires it)
# If using ngrok: URL must be https://...
# If self-hosted: Must have valid SSL certificate
```

### Issue 3: Messages Not Posting to Discord

**Symptoms:**
- Telegram messages received (shown in logs)
- Casino detected, codes extracted
- But nothing appears in Discord

**Solutions:**

```bash
# A. Test Discord webhook directly
curl -X POST "YOUR_DISCORD_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{"content": "Test message"}'

# Should post "Test message" to Discord

# B. Verify webhook URL is correct
# Discord webhook URLs look like:
# https://discord.com/api/webhooks/123456789/abc...xyz

# Check .env file:
cat .env | grep DISCORD_WEBHOOK

# C. Check webhook hasn't been deleted
# Go to Discord → Channel Settings → Integrations
# Verify webhook still exists

# D. Check Discord webhook permissions
# Bot needs permission to post in the channel

# E. Look for errors in logs
# Check console output for error messages
# Common: "401 Unauthorized" or "404 Not Found"
```

### Issue 4: Casino Not Detected

**Symptoms:**
- Message posted to Telegram
- Service receives it (shown in logs)
- But says "No casino keywords detected"

**Solutions:**

```javascript
// A. Check if keywords match
// Current keywords in server.js:
const CODE_PATTERNS = {
    thrill: ['thrill', 'portervip', 'playthrill'],
    shuffle: ['shuffle', 'playshuffle', 'playshuffleus'],
    goated: ['goated', 'playgoated', 'discord']
};

// Message must contain at least one keyword (case-insensitive)

// B. Test detection locally
node test-local.js

// C. Add custom keywords
// Edit server.js, add more keywords to the array
// Then restart service

// D. Check message format
// Keywords must be in the message text or caption
// Images without text won't be detected
```

### Issue 5: Codes Not Extracted

**Symptoms:**
- Casino detected correctly
- Message appears in Discord
- But no codes shown in "Detected Codes" field

**Solutions:**

```javascript
// A. Understand code pattern
// Current regex: /\b[A-Z0-9]{4,}(?:[A-Z0-9-_]*[A-Z0-9])?\b/g
// Matches: uppercase alphanumeric, 4+ characters
// Examples:
//   ✅ PORTERVIP
//   ✅ THRILL2024
//   ✅ CODE-123
//   ❌ code (lowercase)
//   ❌ vip (too short)

// B. Test extraction locally
node -e "
const regex = /\b[A-Z0-9]{4,}(?:[A-Z0-9-_]*[A-Z0-9])?\b/g;
const text = 'Your message here';
console.log(text.match(regex));
"

// C. Adjust regex if needed
// Edit server.js, function extractCodes()
// Modify the codeRegex pattern

// D. Codes must be UPPERCASE
// "portervip" won't match
// "PORTERVIP" will match
```

### Issue 6: Wrong Channel Routing

**Symptoms:**
- Thrill codes going to Shuffle channel
- Or codes going to wrong Discord channel

**Solutions:**

```bash
# A. Verify webhook configuration
cat .env

# Check that:
# DISCORD_WEBHOOK_THRILL → goes to #thrill-codes
# DISCORD_WEBHOOK_SHUFFLE → goes to #shuffle-codes
# DISCORD_WEBHOOK_GOATED → goes to #goated-codes

# B. Test each webhook separately
# Thrill
curl -X POST "$DISCORD_WEBHOOK_THRILL" \
  -H "Content-Type: application/json" \
  -d '{"content": "Test Thrill"}'

# Shuffle
curl -X POST "$DISCORD_WEBHOOK_SHUFFLE" \
  -H "Content-Type: application/json" \
  -d '{"content": "Test Shuffle"}'

# Goated
curl -X POST "$DISCORD_WEBHOOK_GOATED" \
  -H "Content-Type: application/json" \
  -d '{"content": "Test Goated"}'

# C. Check keyword detection
# Message must contain casino-specific keyword
# See Issue 4 for keyword list

# D. Restart service after .env changes
# .env is only read at startup
pkill -f server.js
npm start
```

### Issue 7: Service Crashes

**Symptoms:**
- Service starts but crashes after a message
- "Unhandled promise rejection" errors
- Process exits unexpectedly

**Solutions:**

```bash
# A. Check logs for error details
# Look for stack traces

# B. Common causes:
# - Invalid Discord webhook URL
# - Network timeout
# - Missing environment variable

# C. Add more error logging
# Edit server.js, add console.error statements

# D. Run with detailed logging
NODE_ENV=development npm start

# E. Test with minimal config
# Remove ALLOWED_TELEGRAM_CHANNELS
# Use only one Discord webhook
# See if it works

# F. Check for memory leaks
# If crashes after many messages:
free -h
ps aux | grep node
# Restart service periodically
```

### Issue 8: Webhook Timeout

**Symptoms:**
- Telegram shows "Last error: Connection timeout"
- Service takes too long to respond
- Messages queued up

**Solutions:**

```javascript
// A. Check response time
// Service should respond in <1 second
// Check logs for slow operations

// B. Respond to Telegram immediately
// The code already does this correctly:
res.status(200).send('OK');
// This happens before Discord posting

// C. Check server resources
free -h
top

// D. Verify network connectivity
curl -I https://discord.com/api

// E. Consider async processing
// If needed, queue messages for later processing
```

### Issue 9: Deployment Issues

**Symptoms:**
- Works locally but not in production
- Different behavior on server
- Environment differences

**Solutions:**

```bash
# A. Check Node.js version matches
node --version
# Should be same as local (16+)

# B. Verify all environment variables set
# Heroku: heroku config
# Railway: Check Variables tab
# Server: cat .env

# C. Check logs
# Heroku: heroku logs --tail
# Railway: railway logs
# Server: journalctl -u porter-plays-webhook -f

# D. Test health endpoint
curl https://your-deployment.com/health

# E. Verify HTTPS
# Telegram requires HTTPS for webhooks
# Check that URL starts with https://

# F. Check firewall rules
# Port 3000 must be accessible
# Or use reverse proxy (Nginx)
```

### Issue 10: High Memory Usage

**Symptoms:**
- Service uses >500MB RAM
- Memory grows over time
- Server runs out of memory

**Solutions:**

```bash
# A. Check current usage
ps aux | grep node

# B. Normal usage: 50-100MB
# If higher, there may be a leak

# C. Restart service periodically
# Add to crontab:
0 4 * * * systemctl restart porter-plays-webhook

# D. Check for unclosed connections
netstat -an | grep ESTABLISHED | grep :3000

# E. Monitor with htop or similar
htop

# F. Consider increasing server RAM
# Or switch to platform with more resources
```

## 🔧 Debug Mode

Enable detailed logging:

```bash
# A. Set debug environment
NODE_ENV=development npm start

# B. Add temporary logging
# Edit server.js, add:
console.log('Debug:', JSON.stringify(data, null, 2));

# C. Test with verbose curl
curl -v http://localhost:3000/health
```

## 📊 Monitoring

### Health Checks

Set up external monitoring:

```bash
# UptimeRobot
# Add monitor for: https://your-server.com/health
# Should return 200 status

# Check frequency: Every 5 minutes
# Alert if: Status not 200 or response > 5 seconds
```

### Log Aggregation

Forward logs to external service:

```bash
# Papertrail
# Add to syslog or use their API

# Loggly
# Configure Node.js Winston logging

# CloudWatch (AWS)
# Use CloudWatch agent
```

## 🆘 Getting Help

If none of these solutions work:

1. **Gather Information:**
   ```bash
   # System info
   uname -a
   node --version
   npm --version
   
   # Service status
   systemctl status porter-plays-webhook
   
   # Recent logs
   journalctl -u porter-plays-webhook -n 100 --no-pager
   
   # Webhook status
   node webhook-setup.js info
   ```

2. **Create Minimal Reproduction:**
   - Start fresh with clean install
   - Use minimal .env configuration
   - Test with one casino only
   - Document exact steps to reproduce

3. **Ask for Help:**
   - Discord: [Porter Plays Community](https://discord.gg/porterplays)
   - GitHub Issues: Include all gathered information
   - Stack Overflow: Tag with `node.js`, `telegram-bot`, `discord-webhook`

## 📝 Checklist for Issues

When reporting issues, include:

- [ ] Operating system and version
- [ ] Node.js version (`node --version`)
- [ ] Service version / git commit
- [ ] .env configuration (hide sensitive data)
- [ ] Error logs (full stack trace)
- [ ] Steps to reproduce
- [ ] Expected vs actual behavior
- [ ] Webhook info output
- [ ] Health endpoint response

## 🎯 Prevention Tips

Avoid issues by:

1. **Always use HTTPS** for webhooks
2. **Keep dependencies updated** (`npm update`)
3. **Monitor logs regularly**
4. **Test changes locally first**
5. **Use environment variables** for config
6. **Document any customizations**
7. **Keep backups** of working configuration
8. **Use version control** for code changes

---

**Last Updated**: 2024-01-15  
**For more help**: See [README.md](README.md) and [DEPLOYMENT.md](DEPLOYMENT.md)
