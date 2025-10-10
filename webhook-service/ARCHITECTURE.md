# Architecture Overview

## 🏗️ System Architecture

```
┌─────────────────┐
│  Telegram Bot   │
│   (@BotFather)  │
└────────┬────────┘
         │
         │ Creates bot token
         │
         ▼
┌─────────────────────────────────────────────────────┐
│             Telegram Channels                        │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐│
│  │   Thrill     │  │   Shuffle    │  │   Goated   ││
│  │   Channel    │  │   Channel    │  │   Channel  ││
│  └──────┬───────┘  └──────┬───────┘  └──────┬─────┘│
└─────────┼──────────────────┼──────────────────┼──────┘
          │                  │                  │
          │ Messages posted  │                  │
          │                  │                  │
          └──────────────────┴──────────────────┘
                             │
                             │ Webhook updates
                             │
                             ▼
          ┌─────────────────────────────────────┐
          │   Porter Plays Webhook Service      │
          │         (Node.js + Express)         │
          │                                     │
          │  ┌──────────────────────────────┐  │
          │  │  POST /webhook/telegram      │  │
          │  │  - Receives message          │  │
          │  │  - Detects casino type       │  │
          │  │  - Extracts promo codes      │  │
          │  │  - Formats Discord embed     │  │
          │  └──────────────────────────────┘  │
          │                                     │
          │  Health Check: GET /health          │
          └─────────────────┬───────────────────┘
                           │
                           │ Posts to Discord
                           │
          ┌────────────────┴────────────────┐
          │                                 │
          ▼                                 ▼
    ┌──────────┐     ┌──────────┐    ┌──────────┐
    │ Discord  │     │ Discord  │    │ Discord  │
    │  Thrill  │     │ Shuffle  │    │  Goated  │
    │  Codes   │     │  Codes   │    │  Codes   │
    │ Channel  │     │ Channel  │    │ Channel  │
    └──────────┘     └──────────┘    └──────────┘
```

## 🔄 Message Flow

### 1. Message Posted to Telegram
```
User posts: "New THRILL code: PORTERVIP for VIP status!"
```

### 2. Telegram Sends Webhook Update
```json
{
  "message": {
    "text": "New THRILL code: PORTERVIP for VIP status!",
    "chat": {
      "id": -1001234567890,
      "title": "Thrill Codes"
    }
  }
}
```

### 3. Webhook Service Processes Message

**Step A: Casino Detection**
```javascript
detectCasinoType("New THRILL code: PORTERVIP")
// Returns: "thrill"
```

**Step B: Code Extraction**
```javascript
extractCodes("New THRILL code: PORTERVIP for VIP status!")
// Returns: ["THRILL", "PORTERVIP"]
```

**Step C: Format Discord Embed**
```javascript
{
  title: "🎰 New Thrill Codes Alert!",
  description: "New THRILL code: PORTERVIP for VIP status!",
  color: 0x00FF7F,
  fields: [{
    name: "🎁 Detected Codes",
    value: "`THRILL`\n`PORTERVIP`"
  }],
  timestamp: "2024-01-15T12:00:00.000Z"
}
```

### 4. Post to Discord
```
Discord Webhook POST → #thrill-codes channel
Message appears with formatted embed
```

## 🧩 Components

### Server.js
Main application file containing:
- **Express Server**: HTTP server for webhook endpoint
- **Message Processor**: Detects casino type and extracts codes
- **Discord Poster**: Formats and posts to Discord webhooks
- **Health Monitor**: Provides health check endpoint

### Code Detection Engine

```javascript
const CODE_PATTERNS = {
    thrill: {
        keywords: ['thrill', 'portervip', 'playthrill'],
        channelName: 'Thrill Codes',
        color: 0x00FF7F,
        icon: '🎰'
    },
    // ... other casinos
}
```

**Detection Logic:**
1. Convert message to lowercase
2. Check for keyword matches
3. Return first matching casino type
4. If no match, return null (message ignored)

### Code Extraction

```javascript
// Regex: Uppercase alphanumeric, 4+ chars, may include hyphens/underscores
const codeRegex = /\b[A-Z0-9]{4,}(?:[A-Z0-9-_]*[A-Z0-9])?\b/g;

// Filters out common words
const commonWords = ['HTTP', 'HTTPS', 'HTML', 'CODE', 'BONUS', 'PROMO', 'FREE'];
```

**Examples:**
- `PORTERVIP` ✅ Detected
- `THRILL2024-VIP` ✅ Detected
- `CODE` ❌ Filtered (common word)
- `vip` ❌ Not detected (lowercase)

## 🔐 Security Layers

### 1. Channel Filtering
```javascript
const ALLOWED_CHANNELS = process.env.ALLOWED_TELEGRAM_CHANNELS
    ? process.env.ALLOWED_TELEGRAM_CHANNELS.split(',')
    : [];

if (ALLOWED_CHANNELS.length > 0 && !ALLOWED_CHANNELS.includes(chatId)) {
    // Ignore message from unauthorized channel
}
```

### 2. Environment Variables
- Bot tokens stored in `.env` file
- Never committed to version control
- Separate credentials per environment

### 3. HTTPS Required
- Telegram requires HTTPS for webhooks
- SSL/TLS encryption for all communication
- Protects token and message data

## 📊 Data Flow Diagram

```
┌──────────────┐
│   Telegram   │
│   Message    │
└──────┬───────┘
       │
       │ HTTPS POST
       │
       ▼
┌──────────────────────────────────────┐
│  Express Endpoint                    │
│  POST /webhook/telegram              │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  Parse Request Body                  │
│  Extract message text & chat info    │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  Channel Filter (Optional)           │
│  Check if chat ID is allowed         │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  Casino Detection                    │
│  Match keywords → casino type        │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  Code Extraction                     │
│  Regex match → list of codes         │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  Format Discord Embed                │
│  Create rich message with codes      │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  Post to Discord Webhook             │
│  HTTPS POST to Discord API           │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  Log Result & Send Response          │
│  Return 200 OK to Telegram           │
└──────────────────────────────────────┘
```

## 🎯 Key Design Decisions

### 1. Stateless Architecture
- No database required
- Each request processed independently
- Easy to scale horizontally
- Minimal resource footprint

### 2. Pattern-Based Detection
- Keywords identify casino type
- Regex extracts potential codes
- Flexible and easy to extend
- No ML/AI overhead

### 3. Single Endpoint Design
- One webhook handles all channels
- Routing based on message content
- Simplified configuration
- Easier to maintain

### 4. Error Handling
```javascript
try {
    // Process message
    await postToDiscord(...)
} catch (error) {
    console.error('Error:', error)
    // Still return 200 to prevent retries
    res.status(200).send('OK')
}
```

### 5. Graceful Degradation
- Missing webhook URL? Log warning, continue
- Code detection fails? Send message anyway
- Discord post fails? Log error, no crash

## 🚀 Performance Characteristics

### Resource Usage
- **Memory**: ~50-100MB per instance
- **CPU**: Minimal (mostly I/O bound)
- **Network**: ~1-3KB per message

### Latency
- **Telegram → Service**: <100ms (Telegram's network)
- **Processing**: <10ms (detection + extraction)
- **Service → Discord**: <200ms (Discord API)
- **Total**: ~300ms end-to-end

### Scalability
- **Single instance**: Handles 100+ messages/minute
- **Horizontal scaling**: Add instances behind load balancer
- **Bottleneck**: Discord rate limits (30 requests/minute per webhook)

## 🔧 Configuration Management

### Environment Variables
```
TELEGRAM_BOT_TOKEN     → Bot authentication
DISCORD_WEBHOOK_*      → Discord posting endpoints
PORT                   → HTTP server port
NODE_ENV               → Environment (production/development)
ALLOWED_TELEGRAM_CHANNELS → Security whitelist
```

### Code Patterns (server.js)
```javascript
const CODE_PATTERNS = {
    casino: {
        keywords: [...],      // Detection keywords
        channelName: '...',   // Display name
        color: 0x000000,      // Discord embed color
        icon: '...'           // Emoji icon
    }
}
```

## 📈 Monitoring Points

### Health Check
```
GET /health
→ Returns service status + webhook configuration
```

### Logs
```javascript
console.log('📨 Received message from...')
console.log('🎰 Detected casino type...')
console.log('✅ Posted to Discord')
console.error('❌ Error:...')
```

### Telegram Webhook Status
```
GET https://api.telegram.org/bot<TOKEN>/getWebhookInfo
→ Shows webhook URL, pending updates, errors
```

## 🧪 Testing Strategy

### Unit Tests (test-local.js)
- Test casino detection logic
- Test code extraction regex
- Verify pattern matching
- No external dependencies

### Integration Tests
- Mock Telegram webhooks
- Test Discord posting (dry run)
- Verify error handling

### End-to-End Tests
- Post test message to Telegram
- Verify Discord receives message
- Check code formatting
- Validate routing

## 🔄 Future Enhancements

### Potential Features
- [ ] Database for message history
- [ ] Analytics dashboard
- [ ] Multiple Discord servers
- [ ] Custom code patterns per channel
- [ ] Rate limiting
- [ ] Message filtering/moderation
- [ ] Admin commands via Telegram
- [ ] Scheduled code posting
- [ ] Code validation/verification

### Scalability Improvements
- [ ] Redis for state management
- [ ] Load balancer for multiple instances
- [ ] Queue system for high volume
- [ ] Caching layer for patterns

---

**Architecture Version**: 1.0  
**Last Updated**: 2024-01-15  
**Maintained by**: Porter Plays Development Team
