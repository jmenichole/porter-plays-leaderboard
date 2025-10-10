/**
 * Local testing script for webhook service
 * Tests the message processing logic without requiring Telegram/Discord setup
 */

// Mock environment for testing
process.env.TELEGRAM_BOT_TOKEN = 'test_token';
process.env.DISCORD_WEBHOOK_THRILL = 'https://discord.com/test/thrill';
process.env.DISCORD_WEBHOOK_SHUFFLE = 'https://discord.com/test/shuffle';
process.env.DISCORD_WEBHOOK_GOATED = 'https://discord.com/test/goated';

// Test messages
const testMessages = [
    {
        name: 'Thrill code message',
        text: 'New THRILL bonus code: PORTERVIP - Get your VIP status now!',
        expectedCasino: 'thrill',
        expectedCodes: ['PORTERVIP']
    },
    {
        name: 'Shuffle code message',
        text: '🎲 SHUFFLE promo: Use code PLAYSHUFFLE for bonus',
        expectedCasino: 'shuffle',
        expectedCodes: ['SHUFFLE', 'PLAYSHUFFLE']
    },
    {
        name: 'Goated code message',
        text: 'GOATED community code PLAYGOATED and DISCORD',
        expectedCasino: 'goated',
        expectedCodes: ['GOATED', 'PLAYGOATED', 'DISCORD']
    },
    {
        name: 'No casino keywords',
        text: 'Just a regular message with CODE123',
        expectedCasino: null,
        expectedCodes: ['CODE123']
    },
    {
        name: 'Mixed content',
        text: 'Check out Thrill casino! New code: THRILL2024-VIP available',
        expectedCasino: 'thrill',
        expectedCodes: ['THRILL2024-VIP']
    }
];

// Import detection functions (we'll need to extract them)
function detectCasinoType(message) {
    const lowerMessage = message.toLowerCase();
    
    const patterns = {
        thrill: ['thrill', 'portervip', 'playthrill'],
        shuffle: ['shuffle', 'playshuffle', 'playshuffleus'],
        goated: ['goated', 'playgoated', 'discord']
    };
    
    for (const [casino, keywords] of Object.entries(patterns)) {
        if (keywords.some(keyword => lowerMessage.includes(keyword))) {
            return casino;
        }
    }
    
    return null;
}

function extractCodes(message) {
    const codeRegex = /\b[A-Z0-9]{4,}(?:[A-Z0-9-_]*[A-Z0-9])?\b/g;
    const potentialCodes = message.match(codeRegex) || [];
    const commonWords = ['HTTP', 'HTTPS', 'HTML', 'CODE', 'BONUS', 'PROMO', 'FREE'];
    return potentialCodes.filter(code => !commonWords.includes(code));
}

// Run tests
console.log('🧪 Running local tests for webhook service\n');
console.log('='.repeat(60));

let passed = 0;
let failed = 0;

testMessages.forEach((test, index) => {
    console.log(`\nTest ${index + 1}: ${test.name}`);
    console.log(`Message: "${test.text}"`);
    
    const detectedCasino = detectCasinoType(test.text);
    const extractedCodes = extractCodes(test.text);
    
    console.log(`Expected casino: ${test.expectedCasino || 'none'}`);
    console.log(`Detected casino: ${detectedCasino || 'none'}`);
    console.log(`Expected codes: [${test.expectedCodes.join(', ')}]`);
    console.log(`Extracted codes: [${extractedCodes.join(', ')}]`);
    
    const casinoMatch = detectedCasino === test.expectedCasino;
    // Codes match if extracted contains all expected (may have extras)
    const codesMatch = test.expectedCodes.every(code => extractedCodes.includes(code));
    
    if (casinoMatch && codesMatch) {
        console.log('✅ PASSED');
        passed++;
    } else {
        console.log('❌ FAILED');
        if (!casinoMatch) console.log('   - Casino detection mismatch');
        if (!codesMatch) console.log('   - Code extraction mismatch');
        failed++;
    }
});

console.log('\n' + '='.repeat(60));
console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);

if (failed === 0) {
    console.log('✅ All tests passed!');
    process.exit(0);
} else {
    console.log('❌ Some tests failed');
    process.exit(1);
}
