# Deployment Guide - Telegram to Discord Webhook Service

This guide covers various deployment options for the Porter Plays webhook service.

## 🌐 Deployment Options

### Option 1: Heroku (Recommended for Beginners)

**Pros:** Easy setup, free tier available, auto-scaling  
**Cons:** May sleep after 30 minutes of inactivity (free tier)

#### Steps:

1. **Install Heroku CLI**
   ```bash
   # macOS
   brew install heroku/brew/heroku
   
   # Windows
   # Download from https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Login and Create App**
   ```bash
   heroku login
   cd webhook-service
   heroku create porter-plays-webhook
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set TELEGRAM_BOT_TOKEN=your_token
   heroku config:set DISCORD_WEBHOOK_THRILL=your_url
   heroku config:set DISCORD_WEBHOOK_SHUFFLE=your_url
   heroku config:set DISCORD_WEBHOOK_GOATED=your_url
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

5. **Get Your Webhook URL**
   ```bash
   heroku info
   # Look for "Web URL" - that's your base URL
   # Webhook endpoint: https://your-app.herokuapp.com/webhook/telegram
   ```

6. **Set Telegram Webhook**
   ```bash
   node webhook-setup.js https://your-app.herokuapp.com/webhook/telegram
   ```

### Option 2: Railway

**Pros:** Modern platform, generous free tier, no sleep  
**Cons:** Newer platform, less documentation

#### Steps:

1. **Connect Repository**
   - Go to [railway.app](https://railway.app)
   - Sign in with GitHub
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository

2. **Configure Service**
   - Set root directory to `webhook-service`
   - Railway will auto-detect Node.js

3. **Add Environment Variables**
   - Go to Variables tab
   - Add all variables from `.env.example`

4. **Generate Domain**
   - Go to Settings → Generate Domain
   - Copy the URL

5. **Set Telegram Webhook**
   ```bash
   node webhook-setup.js https://your-app.railway.app/webhook/telegram
   ```

### Option 3: DigitalOcean App Platform

**Pros:** Simple, integrated with DO ecosystem  
**Cons:** Minimum $5/month

#### Steps:

1. **Create App**
   - Go to DigitalOcean dashboard
   - Click "Create" → "Apps"
   - Connect your GitHub repository

2. **Configure**
   - Select `webhook-service` directory
   - Build command: `npm install`
   - Run command: `npm start`
   - Port: 3000

3. **Environment Variables**
   - Add all variables from `.env.example`

4. **Deploy**
   - Click "Create Resources"
   - Wait for deployment

### Option 4: AWS EC2 (Advanced)

**Pros:** Full control, scalable  
**Cons:** Requires AWS knowledge, manual setup

#### Steps:

1. **Launch EC2 Instance**
   - Ubuntu Server 22.04 LTS
   - t2.micro (free tier eligible)
   - Allow HTTP/HTTPS in security group

2. **SSH into Instance**
   ```bash
   ssh -i your-key.pem ubuntu@your-instance-ip
   ```

3. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

4. **Clone and Setup**
   ```bash
   git clone https://github.com/jmenichole/porter-plays-leaderboard.git
   cd porter-plays-leaderboard/webhook-service
   npm install
   cp .env.example .env
   nano .env  # Add your credentials
   ```

5. **Install PM2**
   ```bash
   sudo npm install -g pm2
   pm2 start server.js --name porter-webhook
   pm2 startup
   pm2 save
   ```

6. **Install Nginx (Optional - for HTTPS)**
   ```bash
   sudo apt-get install nginx certbot python3-certbot-nginx
   ```

   Create Nginx config at `/etc/nginx/sites-available/webhook`:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   Enable site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/webhook /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

   Setup SSL:
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

### Option 5: Docker (Any Platform)

**Pros:** Consistent environment, portable  
**Cons:** Requires Docker knowledge

#### Steps:

1. **Build Image**
   ```bash
   cd webhook-service
   docker build -t porter-webhook .
   ```

2. **Run Container**
   ```bash
   docker run -d \
     --name porter-webhook \
     -p 3000:3000 \
     --env-file .env \
     --restart unless-stopped \
     porter-webhook
   ```

   Or use docker-compose:
   ```bash
   docker-compose up -d
   ```

3. **View Logs**
   ```bash
   docker logs -f porter-webhook
   ```

### Option 6: VPS with Systemd (Linux Servers)

**Pros:** Full control, reliable  
**Cons:** Requires Linux knowledge

#### Steps:

1. **Copy Files to Server**
   ```bash
   scp -r webhook-service user@server:/opt/porter-plays-webhook
   ```

2. **Setup Service**
   ```bash
   ssh user@server
   cd /opt/porter-plays-webhook
   npm install --production
   cp .env.example .env
   nano .env  # Add credentials
   ```

3. **Install Systemd Service**
   ```bash
   sudo cp porter-plays-webhook.service /etc/systemd/system/
   sudo systemctl daemon-reload
   sudo systemctl enable porter-plays-webhook
   sudo systemctl start porter-plays-webhook
   ```

4. **Check Status**
   ```bash
   sudo systemctl status porter-plays-webhook
   sudo journalctl -u porter-plays-webhook -f
   ```

## 🔒 Production Best Practices

### Security

1. **Environment Variables**
   - Never commit `.env` file
   - Use platform-specific secret management
   - Rotate tokens regularly

2. **HTTPS Required**
   - Telegram requires HTTPS for webhooks
   - Use Let's Encrypt for free SSL
   - Most platforms provide HTTPS automatically

3. **Rate Limiting**
   - Consider adding rate limiting for production
   - Telegram has built-in rate limits

4. **Channel Filtering**
   - Use `ALLOWED_TELEGRAM_CHANNELS` to whitelist specific channels
   - Prevents unauthorized messages

### Monitoring

1. **Health Checks**
   - Most platforms support health checks
   - Use `/health` endpoint
   - Set check interval to 30-60 seconds

2. **Logging**
   - All events are logged to console
   - Configure log aggregation (Papertrail, Loggly, etc.)
   - Monitor for errors

3. **Uptime Monitoring**
   - Use UptimeRobot or similar
   - Monitor webhook endpoint
   - Alert on downtime

### Performance

1. **Scaling**
   - Single instance handles most workloads
   - Scale horizontally if needed
   - Each instance needs same webhook URL

2. **Memory**
   - Service uses ~50-100MB RAM
   - 256MB minimum recommended
   - 512MB comfortable for production

3. **Bandwidth**
   - Minimal bandwidth usage
   - ~1KB per message
   - Discord embeds ~2-3KB

## 🧪 Testing Your Deployment

### 1. Check Service Health
```bash
curl https://your-deployment.com/health
```

Expected response:
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

### 2. Verify Telegram Webhook
```bash
curl https://api.telegram.org/bot<TOKEN>/getWebhookInfo
```

Should show your webhook URL and no errors.

### 3. Test with Real Message
Post a message in your Telegram channel:
```
Test THRILL code: TESTCODE123
```

Check Discord for the message.

### 4. Monitor Logs
Watch for any errors:
```bash
# Heroku
heroku logs --tail

# Railway
railway logs

# Docker
docker logs -f porter-webhook

# Systemd
sudo journalctl -u porter-plays-webhook -f
```

## 🔄 Updating Your Deployment

### Git-based Platforms (Heroku, Railway)
```bash
git push platform main
```
Automatic deployment on push.

### Manual Deployments
```bash
ssh user@server
cd /opt/porter-plays-webhook
git pull
npm install
sudo systemctl restart porter-plays-webhook
```

### Docker
```bash
docker-compose down
git pull
docker-compose up -d --build
```

## 🚨 Troubleshooting

### Webhook Not Receiving Messages

1. **Check webhook is set:**
   ```bash
   node webhook-setup.js info
   ```

2. **Verify bot is admin in channel**

3. **Check bot privacy settings:**
   ```bash
   # Should be disabled
   ```

4. **Test with direct message to bot**

### Messages Not Posting to Discord

1. **Verify webhook URLs:**
   ```bash
   curl -X POST "YOUR_WEBHOOK_URL" \
     -H "Content-Type: application/json" \
     -d '{"content": "Test message"}'
   ```

2. **Check Discord webhook exists**

3. **Verify webhook permissions**

### Service Crashes

1. **Check logs for errors**

2. **Verify all environment variables set**

3. **Check Node.js version (16+)**

4. **Ensure port is available**

## 📊 Cost Comparison

| Platform | Free Tier | Paid Plans | Best For |
|----------|-----------|------------|----------|
| Heroku | 550 hours/mo | $7/mo | Testing, small projects |
| Railway | $5 credit/mo | Usage-based | Production, small teams |
| DigitalOcean | None | $5/mo | Full control |
| AWS EC2 | 750 hours/mo (1yr) | Variable | Enterprise |
| VPS (Linode/DO) | None | $5/mo | Long-term hosting |

## 🆘 Support

Need help with deployment?
- Discord: [Porter Plays Community](https://discord.gg/porterplays)
- Issues: [GitHub Issues](https://github.com/jmenichole/porter-plays-leaderboard/issues)

---

**Good luck with your deployment!** 🚀
