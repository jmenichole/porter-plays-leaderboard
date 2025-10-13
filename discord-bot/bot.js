require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

// Configuration
const config = {
    token: process.env.DISCORD_BOT_TOKEN,
    guildId: process.env.GUILD_ID || '1203402161707425862',
    supportChannelId: process.env.SUPPORT_CHANNEL_ID || '1256569414455922719',
    modRoleId: process.env.MOD_ROLE_ID || '1271984805436854283',
    prefix: process.env.BOT_PREFIX || '!'
};

// Casino information
const casinoInfo = {
    thrill: {
        name: 'Thrill.com',
        emoji: '🎰',
        bonus: '$2,500 Welcome Bonus + VIP Status Transfer',
        code: 'PORTERVIP',
        url: 'https://thrill.com?r=porterplays',
        color: 0x00FF7F,
        features: 'High-energy gameplay, instant deposits, competitive leaderboards'
    },
    goated: {
        name: 'Goated.com',
        emoji: '🔥',
        bonus: 'Exclusive VIP Program + Daily Rakeback',
        code: 'PLAYGOATED',
        url: 'https://goated.com/r/PLAYGOATED',
        color: 0xFF6B35,
        features: 'Premium casino experience, VIP transfer support, monthly competitions'
    },
    shuffle: {
        name: 'Shuffle.com',
        emoji: '🎲',
        bonus: 'Welcome Bonus + Original Games',
        code: 'playShuffle',
        url: 'https://shuffle.com?r=playShuffle',
        color: 0x7717FF,
        features: 'Modern platform, original games, active community events'
    },
    shuffleus: {
        name: 'Shuffle US',
        emoji: '🇺🇸',
        bonus: 'US Players Welcome + Exclusive Bonuses',
        code: 'playShuffleUS',
        url: 'https://shuffle.com?r=playShuffleUS',
        color: 0x4169E1,
        features: 'USA-friendly, same great platform, competitive odds'
    }
};

// FAQ data
const faqData = [
    {
        question: 'How do I join the leaderboard?',
        answer: 'Simply sign up at one of our partner casinos (Thrill, Goated, or Shuffle) using the promo codes provided, start playing, and your wagers will automatically count towards the leaderboard!'
    },
    {
        question: 'How do I claim my bonus?',
        answer: 'Use the promo code during signup at your chosen casino. The bonus will be automatically applied to your account. Make sure to read the terms and conditions for each bonus.'
    },
    {
        question: 'Where can I find promo codes?',
        answer: 'Promo codes are posted regularly in our dedicated code channels (#thrill-codes, #shuffle-codes, #goated-codes). You can also use `!codes` to get the latest codes.'
    },
    {
        question: 'How do I transfer my VIP status?',
        answer: 'If you have VIP status at another casino, contact support at your new casino with proof of your VIP level. Most casinos will match or transfer your status!'
    },
    {
        question: 'When are leaderboard prizes paid out?',
        answer: 'Prize payouts are typically processed within 48-72 hours after the competition ends. Check the leaderboard page for specific dates and prize distributions.'
    }
];

// Create Discord client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// Active tickets (in-memory storage)
const activeTickets = new Map();

// Bot ready event
client.once('ready', () => {
    console.log('🤖 Porter Plays Bot is online!');
    console.log(`📋 Logged in as ${client.user.tag}`);
    console.log(`🎮 Guild ID: ${config.guildId}`);
    console.log(`💬 Support Channel ID: ${config.supportChannelId}`);
    console.log(`👮 Mod Role ID: ${config.modRoleId}`);
    console.log(`🎯 Command Prefix: ${config.prefix}`);
    
    // Set bot status
    client.user.setActivity('!help for support', { type: 'WATCHING' });
});

// Message handler
client.on('messageCreate', async (message) => {
    // Ignore bot messages
    if (message.author.bot) return;
    
    // Check if message starts with prefix
    if (!message.content.startsWith(config.prefix)) return;
    
    // Parse command and arguments
    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    
    try {
        // Route to command handlers
        switch (command) {
            case 'help':
                await handleHelpCommand(message);
                break;
            case 'ticket':
                await handleTicketCommand(message, args);
                break;
            case 'casino':
                await handleCasinoCommand(message, args);
                break;
            case 'codes':
                await handleCodesCommand(message);
                break;
            case 'faq':
                await handleFaqCommand(message);
                break;
            case 'close':
                await handleCloseCommand(message);
                break;
            case 'claim':
                await handleClaimCommand(message);
                break;
            default:
                // Unknown command
                await message.reply(`❌ Unknown command. Use \`${config.prefix}help\` to see available commands.`);
        }
    } catch (error) {
        console.error('Error handling command:', error);
        await message.reply('❌ An error occurred while processing your command. Please try again later.');
    }
});

// Help command
async function handleHelpCommand(message) {
    const embed = new EmbedBuilder()
        .setColor(0x5CFFC1)
        .setTitle('🎰 Porter Plays Support Bot - Commands')
        .setDescription('Here are all available commands:')
        .addFields(
            { name: `${config.prefix}help`, value: 'Show this help message', inline: false },
            { name: `${config.prefix}ticket <message>`, value: 'Create a support ticket', inline: false },
            { name: `${config.prefix}casino <name>`, value: 'Get info about a casino (thrill, goated, shuffle, shuffleus)', inline: false },
            { name: `${config.prefix}codes`, value: 'Get latest promo codes for all casinos', inline: false },
            { name: `${config.prefix}faq`, value: 'View frequently asked questions', inline: false }
        )
        .addFields(
            { name: '👮 Moderator Commands', value: `\`${config.prefix}close\` - Close a ticket\n\`${config.prefix}claim\` - Claim a ticket`, inline: false }
        )
        .setFooter({ text: 'Porter Plays Community • Made for degens by degens ❤️' })
        .setTimestamp();
    
    await message.reply({ embeds: [embed] });
}

// Ticket command
async function handleTicketCommand(message, args) {
    // Check if in support channel
    if (message.channel.id !== config.supportChannelId) {
        return await message.reply(`❌ Please use the <#${config.supportChannelId}> channel to create tickets.`);
    }
    
    // Check if user already has an active ticket
    if (activeTickets.has(message.author.id)) {
        const ticketThread = activeTickets.get(message.author.id);
        return await message.reply(`❌ You already have an active ticket: <#${ticketThread.id}>`);
    }
    
    // Get ticket content
    const ticketContent = args.join(' ');
    if (!ticketContent) {
        return await message.reply(`❌ Please provide a description for your ticket.\nExample: \`${config.prefix}ticket I need help with my bonus\``);
    }
    
    try {
        // Create a thread for the ticket
        const thread = await message.channel.threads.create({
            name: `🎫 ${message.author.username}'s Ticket`,
            autoArchiveDuration: 1440, // 24 hours
            reason: `Support ticket by ${message.author.tag}`
        });
        
        // Add user to active tickets
        activeTickets.set(message.author.id, thread);
        
        // Create ticket embed
        const ticketEmbed = new EmbedBuilder()
            .setColor(0x5CFFC1)
            .setTitle('🎫 New Support Ticket')
            .setDescription(ticketContent)
            .addFields(
                { name: 'Created by', value: `<@${message.author.id}>`, inline: true },
                { name: 'Status', value: '🟢 Open', inline: true },
                { name: 'Ticket ID', value: `#${thread.id.slice(-6)}`, inline: true }
            )
            .setFooter({ text: 'A moderator will assist you shortly' })
            .setTimestamp();
        
        // Send message in thread
        await thread.send({ 
            content: `<@${message.author.id}> <@&${config.modRoleId}>`,
            embeds: [ticketEmbed] 
        });
        
        // Confirmation message
        await message.reply(`✅ Ticket created! Please continue the conversation in <#${thread.id}>`);
        
        // Auto-delete original message after 5 seconds
        setTimeout(() => {
            message.delete().catch(() => {});
        }, 5000);
        
    } catch (error) {
        console.error('Error creating ticket:', error);
        await message.reply('❌ Failed to create ticket. Please try again or contact a moderator directly.');
    }
}

// Casino command
async function handleCasinoCommand(message, args) {
    const casinoName = args[0]?.toLowerCase();
    
    if (!casinoName || !casinoInfo[casinoName]) {
        return await message.reply(`❌ Please specify a valid casino: thrill, goated, shuffle, or shuffleus\nExample: \`${config.prefix}casino thrill\``);
    }
    
    const casino = casinoInfo[casinoName];
    
    const embed = new EmbedBuilder()
        .setColor(casino.color)
        .setTitle(`${casino.emoji} ${casino.name}`)
        .setDescription(`**Exclusive Offer:** ${casino.bonus}`)
        .addFields(
            { name: '🎁 Promo Code', value: `\`${casino.code}\``, inline: true },
            { name: '🔗 Sign Up', value: `[Click Here](${casino.url})`, inline: true },
            { name: '\u200B', value: '\u200B', inline: true },
            { name: '✨ Features', value: casino.features, inline: false }
        )
        .addFields(
            { 
                name: '📋 How to Get Started', 
                value: `1. Click the sign-up link above\n2. Create your account\n3. Enter code \`${casino.code}\` during registration\n4. Make your first deposit\n5. Claim your bonus and start playing!`, 
                inline: false 
            }
        )
        .setFooter({ text: '18+ • Gamble Responsibly • Terms Apply' })
        .setTimestamp();
    
    await message.reply({ embeds: [embed] });
}

// Codes command
async function handleCodesCommand(message) {
    const embed = new EmbedBuilder()
        .setColor(0x5CFFC1)
        .setTitle('🎁 Latest Promo Codes')
        .setDescription('Here are the current promo codes for all our partner casinos:')
        .addFields(
            { 
                name: '🎰 Thrill.com', 
                value: `Code: \`${casinoInfo.thrill.code}\`\n[Sign Up](${casinoInfo.thrill.url})`, 
                inline: true 
            },
            { 
                name: '🔥 Goated.com', 
                value: `Code: \`${casinoInfo.goated.code}\`\n[Sign Up](${casinoInfo.goated.url})`, 
                inline: true 
            },
            { 
                name: '🎲 Shuffle.com', 
                value: `Code: \`${casinoInfo.shuffle.code}\`\n[Sign Up](${casinoInfo.shuffle.url})`, 
                inline: true 
            }
        )
        .addFields(
            { 
                name: '📢 More Codes', 
                value: 'Check out our dedicated channels for more codes:\n• <#thrill-codes>\n• <#shuffle-codes>\n• <#goated-codes>', 
                inline: false 
            }
        )
        .setFooter({ text: 'Codes are updated regularly • Terms and conditions apply' })
        .setTimestamp();
    
    await message.reply({ embeds: [embed] });
}

// FAQ command
async function handleFaqCommand(message) {
    const embed = new EmbedBuilder()
        .setColor(0x5CFFC1)
        .setTitle('❓ Frequently Asked Questions')
        .setDescription('Here are answers to common questions:');
    
    faqData.forEach((faq, index) => {
        embed.addFields({ 
            name: `${index + 1}. ${faq.question}`, 
            value: faq.answer, 
            inline: false 
        });
    });
    
    embed.setFooter({ text: `Still need help? Use ${config.prefix}ticket to create a support ticket` })
        .setTimestamp();
    
    await message.reply({ embeds: [embed] });
}

// Close command (mods only)
async function handleCloseCommand(message) {
    // Check if user is a moderator
    if (!message.member.roles.cache.has(config.modRoleId) && !message.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return await message.reply('❌ You need to be a moderator to use this command.');
    }
    
    // Check if in a thread
    if (!message.channel.isThread()) {
        return await message.reply('❌ This command can only be used in ticket threads.');
    }
    
    try {
        // Find and remove from active tickets
        for (const [userId, thread] of activeTickets.entries()) {
            if (thread.id === message.channel.id) {
                activeTickets.delete(userId);
                break;
            }
        }
        
        // Send closing message
        const closeEmbed = new EmbedBuilder()
            .setColor(0xFF6B35)
            .setTitle('🔒 Ticket Closed')
            .setDescription(`This ticket has been closed by <@${message.author.id}>`)
            .setFooter({ text: 'Thank you for using Porter Plays Support' })
            .setTimestamp();
        
        await message.channel.send({ embeds: [closeEmbed] });
        
        // Archive the thread
        await message.channel.setArchived(true);
        
    } catch (error) {
        console.error('Error closing ticket:', error);
        await message.reply('❌ Failed to close ticket. Please try again.');
    }
}

// Claim command (mods only)
async function handleClaimCommand(message) {
    // Check if user is a moderator
    if (!message.member.roles.cache.has(config.modRoleId) && !message.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return await message.reply('❌ You need to be a moderator to use this command.');
    }
    
    // Check if in a thread
    if (!message.channel.isThread()) {
        return await message.reply('❌ This command can only be used in ticket threads.');
    }
    
    const claimEmbed = new EmbedBuilder()
        .setColor(0x5956FF)
        .setTitle('👮 Ticket Claimed')
        .setDescription(`<@${message.author.id}> is now handling this ticket`)
        .setFooter({ text: 'Porter Plays Support Team' })
        .setTimestamp();
    
    await message.channel.send({ embeds: [claimEmbed] });
}

// Error handling
client.on('error', (error) => {
    console.error('Discord client error:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('Unhandled promise rejection:', error);
});

// Login to Discord
if (!config.token) {
    console.error('❌ DISCORD_BOT_TOKEN is not set in .env file');
    process.exit(1);
}

client.login(config.token).catch((error) => {
    console.error('Failed to login:', error);
    process.exit(1);
});
