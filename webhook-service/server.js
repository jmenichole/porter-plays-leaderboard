require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

// Configuration
const PORT = process.env.PORT || 3000;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const DISCORD_WEBHOOKS = {
    thrill: process.env.DISCORD_WEBHOOK_THRILL,
    shuffle: process.env.DISCORD_WEBHOOK_SHUFFLE,
    goated: process.env.DISCORD_WEBHOOK_GOATED
};

// Allowed Telegram channels (optional filter)
const ALLOWED_CHANNELS = process.env.ALLOWED_TELEGRAM_CHANNELS 
    ? process.env.ALLOWED_TELEGRAM_CHANNELS.split(',').map(id => id.trim())
    : [];

// Code detection patterns
const CODE_PATTERNS = {
    thrill: {
        keywords: ['thrill', 'portervip', 'playthrill'],
        channelName: 'Thrill Codes',
        color: 0x00FF7F, // Thrill lime color
        icon: '🎰'
    },
    shuffle: {
        keywords: ['shuffle', 'playshuffle', 'playshuffleus'],
        channelName: 'Shuffle Codes',
        color: 0x7717FF, // Shuffle purple
        icon: '🎲'
    },
    goated: {
        keywords: ['goated', 'playgoated', 'discord'],
        channelName: 'Goated Codes',
        color: 0xFF6B35, // Goated orange
        icon: '🐐'
    }
};

// Helper function to detect casino type from message
function detectCasinoType(message) {
    const lowerMessage = message.toLowerCase();
    
    for (const [casino, config] of Object.entries(CODE_PATTERNS)) {
        if (config.keywords.some(keyword => lowerMessage.includes(keyword))) {
            return casino;
        }
    }
    
    return null;
}

// Helper function to extract codes from message
function extractCodes(message) {
    // Pattern to detect codes: uppercase alphanumeric, often with special chars
    const codeRegex = /\b[A-Z0-9]{4,}(?:[A-Z0-9-_]*[A-Z0-9])?\b/g;
    const potentialCodes = message.match(codeRegex) || [];
    
    // Filter out common words that aren't codes
    const commonWords = ['HTTP', 'HTTPS', 'HTML', 'CODE', 'BONUS', 'PROMO', 'FREE'];
    return potentialCodes.filter(code => !commonWords.includes(code));
}

// Helper function to post to Discord
async function postToDiscord(webhookUrl, casino, message, codes) {
    if (!webhookUrl) {
        console.log(`No webhook URL configured for ${casino}`);
        return;
    }

    const config = CODE_PATTERNS[casino];
    
    const embed = {
        title: `${config.icon} New ${config.channelName} Alert!`,
        description: message,
        color: config.color,
        fields: codes.length > 0 ? [
            {
                name: '🎁 Detected Codes',
                value: codes.map(code => `\`${code}\``).join('\n'),
                inline: false
            }
        ] : [],
        footer: {
            text: 'Porter Plays - Telegram Monitor'
        },
        timestamp: new Date().toISOString()
    };

    try {
        await axios.post(webhookUrl, {
            embeds: [embed],
            username: 'Porter Plays Bot',
            avatar_url: 'https://jmenichole.github.io/porter-plays-leaderboard/Porterplayslogo.png'
        });
        console.log(`✅ Posted ${casino} message to Discord`);
    } catch (error) {
        console.error(`❌ Error posting to Discord (${casino}):`, error.response?.data || error.message);
    }
}

// Webhook endpoint for Telegram
app.post('/webhook/telegram', async (req, res) => {
    try {
        const update = req.body;
        
        // Handle both channel posts and regular messages
        const message = update.message || update.channel_post;
        
        if (!message) {
            return res.status(200).send('OK');
        }

        const text = message.text || message.caption || '';
        const chatId = message.chat.id;
        const chatTitle = message.chat.title || 'Direct Message';
        
        console.log(`📨 Received message from ${chatTitle} (${chatId})`);
        
        // Filter by allowed channels if configured
        if (ALLOWED_CHANNELS.length > 0 && !ALLOWED_CHANNELS.includes(String(chatId))) {
            console.log(`⚠️  Ignored: Chat ${chatId} not in allowed list`);
            return res.status(200).send('OK');
        }

        // Detect casino type
        const casinoType = detectCasinoType(text);
        
        if (!casinoType) {
            console.log('ℹ️  No casino keywords detected');
            return res.status(200).send('OK');
        }

        // Extract potential codes
        const codes = extractCodes(text);
        
        console.log(`🎰 Detected ${casinoType} message with ${codes.length} potential codes`);
        
        // Post to Discord
        const webhookUrl = DISCORD_WEBHOOKS[casinoType];
        await postToDiscord(webhookUrl, casinoType, text, codes);
        
        res.status(200).send('OK');
    } catch (error) {
        console.error('❌ Error processing webhook:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        webhooks: {
            thrill: !!DISCORD_WEBHOOKS.thrill,
            shuffle: !!DISCORD_WEBHOOKS.shuffle,
            goated: !!DISCORD_WEBHOOKS.goated
        }
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        service: 'Porter Plays Telegram-Discord Webhook',
        version: '1.0.0',
        endpoints: {
            webhook: '/webhook/telegram',
            health: '/health'
        }
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Porter Plays Webhook Service running on port ${PORT}`);
    console.log(`📡 Telegram webhook: http://localhost:${PORT}/webhook/telegram`);
    console.log(`❤️  Health check: http://localhost:${PORT}/health`);
    
    // Log configuration status
    console.log('\n📋 Configuration:');
    console.log(`  Telegram Bot: ${TELEGRAM_BOT_TOKEN ? '✅ Configured' : '❌ Missing'}`);
    console.log(`  Discord Webhooks:`);
    console.log(`    - Thrill: ${DISCORD_WEBHOOKS.thrill ? '✅' : '❌'}`);
    console.log(`    - Shuffle: ${DISCORD_WEBHOOKS.shuffle ? '✅' : '❌'}`);
    console.log(`    - Goated: ${DISCORD_WEBHOOKS.goated ? '✅' : '❌'}`);
    
    if (ALLOWED_CHANNELS.length > 0) {
        console.log(`  Allowed Channels: ${ALLOWED_CHANNELS.join(', ')}`);
    } else {
        console.log(`  Allowed Channels: All channels allowed`);
    }
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('👋 Shutting down gracefully...');
    process.exit(0);
});
