# Usage Examples

Real-world examples of how the webhook service processes and routes messages.

## 📨 Example 1: Thrill Casino Code

### Telegram Message (Input)
```
🎰 NEW THRILL BONUS! 🎰

Use code PORTERVIP for instant VIP status transfer!

Limited time offer - claim now at thrill.com
```

### Detection Process
```javascript
detectCasinoType() → "thrill" (keyword: "thrill")
extractCodes() → ["PORTERVIP"]
```

### Discord Output
```
┌──────────────────────────────────────────┐
│ Porter Plays Bot                BOT      │
├──────────────────────────────────────────┤
│ 🎰 New Thrill Codes Alert!              │
│                                          │
│ 🎰 NEW THRILL BONUS! 🎰                 │
│                                          │
│ Use code PORTERVIP for instant VIP       │
│ status transfer!                         │
│                                          │
│ Limited time offer - claim now at        │
│ thrill.com                              │
│                                          │
│ 🎁 Detected Codes                        │
│ `PORTERVIP`                              │
│                                          │
│ Porter Plays - Telegram Monitor         │
│ Today at 3:45 PM                         │
└──────────────────────────────────────────┘
```
*Embed Color: Lime (#00FF7F)*

---

## 📨 Example 2: Shuffle Casino Code

### Telegram Message (Input)
```
🎲 SHUFFLE EXCLUSIVE CODE 🎲

PLAYSHUFFLE - Welcome bonus package
SHUFFLE2024 - Extra rewards

Visit shuffle.com
```

### Detection Process
```javascript
detectCasinoType() → "shuffle" (keyword: "shuffle")
extractCodes() → ["SHUFFLE", "PLAYSHUFFLE", "SHUFFLE2024"]
```

### Discord Output
```
┌──────────────────────────────────────────┐
│ Porter Plays Bot                BOT      │
├──────────────────────────────────────────┤
│ 🎲 New Shuffle Codes Alert!             │
│                                          │
│ 🎲 SHUFFLE EXCLUSIVE CODE 🎲            │
│                                          │
│ PLAYSHUFFLE - Welcome bonus package      │
│ SHUFFLE2024 - Extra rewards              │
│                                          │
│ Visit shuffle.com                        │
│                                          │
│ 🎁 Detected Codes                        │
│ `SHUFFLE`                                │
│ `PLAYSHUFFLE`                            │
│ `SHUFFLE2024`                            │
│                                          │
│ Porter Plays - Telegram Monitor         │
│ Today at 4:12 PM                         │
└──────────────────────────────────────────┘
```
*Embed Color: Purple (#7717FF)*

---

## 📨 Example 3: Goated Casino Code

### Telegram Message (Input)
```
🐐 GOATED COMMUNITY CODE DROP 🐐

New code: PLAYGOATED
Discord exclusive: DISCORD

Both codes active now!
```

### Detection Process
```javascript
detectCasinoType() → "goated" (keywords: "goated", "discord")
extractCodes() → ["GOATED", "PLAYGOATED", "DISCORD"]
```

### Discord Output
```
┌──────────────────────────────────────────┐
│ Porter Plays Bot                BOT      │
├──────────────────────────────────────────┤
│ 🐐 New Goated Codes Alert!              │
│                                          │
│ 🐐 GOATED COMMUNITY CODE DROP 🐐        │
│                                          │
│ New code: PLAYGOATED                     │
│ Discord exclusive: DISCORD               │
│                                          │
│ Both codes active now!                   │
│                                          │
│ 🎁 Detected Codes                        │
│ `GOATED`                                 │
│ `PLAYGOATED`                             │
│ `DISCORD`                                │
│                                          │
│ Porter Plays - Telegram Monitor         │
│ Today at 5:30 PM                         │
└──────────────────────────────────────────┘
```
*Embed Color: Orange (#FF6B35)*

---

## 📨 Example 4: Message with No Codes

### Telegram Message (Input)
```
Check out our new tournament starting tomorrow!
Prizes and details coming soon.
```

### Detection Process
```javascript
detectCasinoType() → null (no casino keywords)
// Message ignored - not posted to Discord
```

### Discord Output
*No message posted - no casino keywords detected*

---

## 📨 Example 5: Mixed Content Message

### Telegram Message (Input)
```
Today's THRILL promotions:

• Code 1: THRILL-MONDAY
• Code 2: VIP2024
• Code 3: PORTER-SPECIAL

Don't miss out! 🎰
```

### Detection Process
```javascript
detectCasinoType() → "thrill" (keyword: "thrill")
extractCodes() → ["THRILL-MONDAY", "VIP2024", "PORTER-SPECIAL"]
```

### Discord Output
```
┌──────────────────────────────────────────┐
│ Porter Plays Bot                BOT      │
├──────────────────────────────────────────┤
│ 🎰 New Thrill Codes Alert!              │
│                                          │
│ Today's THRILL promotions:               │
│                                          │
│ • Code 1: THRILL-MONDAY                  │
│ • Code 2: VIP2024                        │
│ • Code 3: PORTER-SPECIAL                 │
│                                          │
│ Don't miss out! 🎰                       │
│                                          │
│ 🎁 Detected Codes                        │
│ `THRILL-MONDAY`                          │
│ `VIP2024`                                │
│ `PORTER-SPECIAL`                         │
│                                          │
│ Porter Plays - Telegram Monitor         │
│ Today at 6:15 PM                         │
└──────────────────────────────────────────┘
```
*Embed Color: Lime (#00FF7F)*

---

## 📨 Example 6: Multiple Casino Mention

### Telegram Message (Input)
```
Compare bonuses:
Thrill: PORTERVIP
Shuffle: PLAYSHUFFLE
```

### Detection Process
```javascript
detectCasinoType() → "thrill" (first matching keyword)
extractCodes() → ["PORTERVIP", "PLAYSHUFFLE"]
```

### Discord Output
*Posted to #thrill-codes channel*
```
┌──────────────────────────────────────────┐
│ Porter Plays Bot                BOT      │
├──────────────────────────────────────────┤
│ 🎰 New Thrill Codes Alert!              │
│                                          │
│ Compare bonuses:                         │
│ Thrill: PORTERVIP                        │
│ Shuffle: PLAYSHUFFLE                     │
│                                          │
│ 🎁 Detected Codes                        │
│ `PORTERVIP`                              │
│ `PLAYSHUFFLE`                            │
│                                          │
│ Porter Plays - Telegram Monitor         │
│ Today at 7:00 PM                         │
└──────────────────────────────────────────┘
```

**Note:** Message routes to first detected casino (Thrill). To prevent this, post codes in separate Telegram channels or messages.

---

## 🧪 Testing Examples

### Test Each Casino

```bash
# Test Thrill detection
curl -X POST "http://localhost:3000/webhook/telegram" \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "text": "Test THRILL code: TEST123",
      "chat": {"id": 123, "title": "Test"}
    }
  }'

# Test Shuffle detection
curl -X POST "http://localhost:3000/webhook/telegram" \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "text": "SHUFFLE promo: TESTCODE",
      "chat": {"id": 123, "title": "Test"}
    }
  }'

# Test Goated detection
curl -X POST "http://localhost:3000/webhook/telegram" \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "text": "GOATED bonus: TESTGOAT",
      "chat": {"id": 123, "title": "Test"}
    }
  }'
```

### Test Code Extraction

```javascript
// Run in Node.js console or test file
const regex = /\b[A-Z0-9]{4,}(?:[A-Z0-9-_]*[A-Z0-9])?\b/g;

// Should match
"PORTERVIP".match(regex); // ["PORTERVIP"]
"CODE-123".match(regex);  // ["CODE-123"]
"TEST_2024".match(regex); // ["TEST_2024"]
"ABCD".match(regex);      // ["ABCD"]

// Should not match
"vip".match(regex);       // null (lowercase)
"ABC".match(regex);       // null (too short)
"code test".match(regex); // null (lowercase + space)
```

---

## 📊 Real-World Scenarios

### Scenario 1: Weekly Code Drop
```
Telegram: "🎰 WEEKLY THRILL DROP 🎰
          Codes: WEEK01, WEEK02, WEEK03
          Valid until Sunday!"

Discord:  Posts to #thrill-codes with all 3 codes highlighted
```

### Scenario 2: Urgent Code Update
```
Telegram: "⚡ URGENT: Old code EXPIRED
          New code: THRILL-NEW-2024
          Use before midnight!"

Discord:  Posts to #thrill-codes
          Extracts: ["EXPIRED", "THRILL-NEW-2024"]
```

### Scenario 3: Community Announcement
```
Telegram: "Join our community at discord.gg/porterplays
          No codes today, just saying hi!"

Discord:  Not posted (no casino keywords detected)
```

### Scenario 4: Cross-Casino Post
```
Telegram: "Porter Plays weekly update:
          - Thrill new features
          - Shuffle tournament
          - Goated leaderboard"

Discord:  Posts to #thrill-codes (first keyword match)
          Note: Split into separate posts for better routing
```

---

## 💡 Best Practices

### For Clear Detection
✅ **Good:** "New THRILL code: PORTERVIP"
✅ **Good:** "SHUFFLE promo PLAYSHUFFLE available"
✅ **Good:** "GOATED bonus: PLAYGOATED"

❌ **Avoid:** "Check out this casino code: ABC123"
❌ **Avoid:** "New vip code available now"
❌ **Avoid:** Mixing multiple casinos in one message

### For Code Extraction
✅ **Good:** Use UPPERCASE for codes
✅ **Good:** Codes should be 4+ characters
✅ **Good:** Hyphens and underscores are OK

❌ **Avoid:** lowercase codes
❌ **Avoid:** Very short codes (less than 4 chars)
❌ **Avoid:** Codes with spaces

### For Optimal Routing
✅ **Good:** One casino per message
✅ **Good:** Clear casino name in message
✅ **Good:** Codes clearly identified

❌ **Avoid:** Multiple casinos in one post
❌ **Avoid:** Ambiguous messages
❌ **Avoid:** Hidden or encoded codes

---

## 🎨 Visual Reference

### Discord Embed Colors
- **Thrill:** Bright Lime Green (#00FF7F)
- **Shuffle:** Deep Purple (#7717FF)
- **Goated:** Orange (#FF6B35)

### Icons Used
- **Thrill:** 🎰 (Slot Machine)
- **Shuffle:** 🎲 (Dice)
- **Goated:** 🐐 (Goat)

### Code Display
Codes appear in inline code blocks:
- Single code: `CODE123`
- Multiple codes:
  ```
  `CODE1`
  `CODE2`
  `CODE3`
  ```

---

For more information, see:
- [README.md](README.md) - Full documentation
- [QUICK_START.md](QUICK_START.md) - Setup guide
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Problem solving
