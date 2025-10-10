#!/usr/bin/env node

/**
 * Helper script to set up Telegram webhook
 * Usage: node webhook-setup.js <webhook-url>
 */

require('dotenv').config();
const axios = require('axios');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const webhookUrl = process.argv[2];

if (!BOT_TOKEN) {
    console.error('❌ TELEGRAM_BOT_TOKEN not found in .env file');
    process.exit(1);
}

if (!webhookUrl) {
    console.error('❌ Usage: node webhook-setup.js <webhook-url>');
    console.error('   Example: node webhook-setup.js https://your-server.com/webhook/telegram');
    process.exit(1);
}

async function setWebhook() {
    try {
        console.log('🔧 Setting up Telegram webhook...');
        console.log(`📡 Webhook URL: ${webhookUrl}`);
        
        const response = await axios.post(
            `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`,
            {
                url: webhookUrl,
                drop_pending_updates: true,
                allowed_updates: ['message', 'channel_post']
            }
        );

        if (response.data.ok) {
            console.log('✅ Webhook set successfully!');
            console.log('');
            await getWebhookInfo();
        } else {
            console.error('❌ Failed to set webhook:', response.data.description);
        }
    } catch (error) {
        console.error('❌ Error setting webhook:', error.message);
        if (error.response) {
            console.error('   Details:', error.response.data);
        }
    }
}

async function getWebhookInfo() {
    try {
        console.log('📊 Current webhook info:');
        const response = await axios.get(
            `https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`
        );

        const info = response.data.result;
        console.log(`   URL: ${info.url || 'Not set'}`);
        console.log(`   Pending updates: ${info.pending_update_count}`);
        if (info.last_error_date) {
            console.log(`   Last error: ${info.last_error_message}`);
        } else {
            console.log('   Status: ✅ Working properly');
        }
    } catch (error) {
        console.error('❌ Error getting webhook info:', error.message);
    }
}

async function deleteWebhook() {
    try {
        console.log('🗑️  Deleting webhook...');
        const response = await axios.post(
            `https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook`
        );

        if (response.data.ok) {
            console.log('✅ Webhook deleted successfully!');
        } else {
            console.error('❌ Failed to delete webhook:', response.data.description);
        }
    } catch (error) {
        console.error('❌ Error deleting webhook:', error.message);
    }
}

// Check command
if (webhookUrl === 'info') {
    getWebhookInfo();
} else if (webhookUrl === 'delete') {
    deleteWebhook();
} else {
    setWebhook();
}
