# Porter Plays Leaderboard

A modern, real-time wager leaderboard platform for competitive casino gaming. Track performance, compete for exclusive prize pools, and dominate the leaderboards across multiple casino platforms.

## 🎯 Features

### Live Leaderboards
- **Real-time Updates**: Live wager tracking with 30-second refresh intervals
- **Multi-Casino Support**: Integrated with Thrill, Goated, and Shuffle platforms
- **Dual Leaderboard Types**: Biweekly (Thrill) and Monthly (Goated) competitions
- **Anonymized Rankings**: Player privacy protection with username anonymization
- **Prize Pool Display**: Dynamic prize allocation with customizable distributions

### Admin Dashboard
- **Secure Authentication**: Dual-password system (developer + admin)
- **Timeframe Management**: Configurable start/end dates for each leaderboard
- **Prize Configuration**: Custom prize pools with per-place prize editors
- **Quick Presets**: One-click prize distribution presets (Even, Winner Takes All, 70/30, etc.)
- **API Integration**: Flexible API endpoint configuration with optional authentication
- **Settings Persistence**: All configurations saved to localStorage

### User Experience
- **Responsive Design**: Mobile-optimized dark neon theme
- **Interactive Chat**: AI-powered assistant for onboarding and support
- **Smooth Animations**: Modern UI with fade-in effects and transitions
- **VIP Transfer Program**: Elite status transfer between platforms
- **Casino Promotions**: Direct links to exclusive bonuses and VIP programs

## 🛠️ Tech Stack

- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js (for webhook service)
- **Styling**: Custom CSS with CSS Grid and Flexbox
- **Fonts**: Oxanium (display), Barlow Condensed (UI), Inter (body)
- **Icons**: Unicode emojis and custom SVG assets
- **Storage**: localStorage for configuration persistence
- **Integrations**: Telegram Bot API, Discord Webhooks
- **Version Control**: Git with GitHub integration

## 🚀 Quick Start

### Prerequisites
- Modern web browser with JavaScript enabled
- Internet connection for API data fetching
- Text editor for configuration (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jmenichole/porter-plays-leaderboard.git
   cd porter-plays-leaderboard
   ```

2. **Open in browser**
   - Open `index.html` in your web browser
   - No build process required - it's a static site!

### Configuration

#### Admin Access
- Click the "Admin" button in the top navigation
- Use developer password: `jmenichole0098`
- Or set up your own admin password via the dashboard

#### API Setup
1. Access the admin panel
2. Configure API endpoints for each casino:
   - **Thrill**: Biweekly leaderboard endpoint
   - **Goated**: Monthly leaderboard endpoint
3. Add API keys if required for authentication
4. Set timeframe dates and prize pools

#### Prize Distribution
- Use preset buttons for quick setup (Even, Winner Takes All, etc.)
- Or manually configure per-place prizes
- Leave fields blank for automatic even distribution

## 🎮 Casino Integrations

### Thrill Casino
- **Leaderboard Type**: Biweekly competitions
- **Default Prize Pool**: $5,000
- **Affiliate Link**: `?r=porterplays`
- **Features**: High-energy gameplay, VIP boosts, competitive events

### Goated Casino
- **Leaderboard Type**: Monthly competitions
- **Default Prize Pool**: $1,000
- **Affiliate Link**: `/r/PLAYGOATED`
- **Features**: Premium platform, VIP program with transfer support

### Shuffle Casino
- **Affiliate Link**: `?r=playShuffle`
- **Features**: Modern experience, original games, active events

## 🤖 Telegram to Discord Webhook Service

A separate backend service monitors Telegram channels for casino promo codes and automatically posts them to the appropriate Discord channels.

### Features
- **Automatic Code Detection**: Monitors Telegram messages for promo codes
- **Smart Routing**: Routes codes to specific Discord channels based on casino (Thrill → Thrill Codes channel, etc.)
- **Real-time Updates**: Instant notifications when new codes are posted
- **Code Extraction**: Automatically highlights promo codes in messages

### Setup

See [`webhook-service/README.md`](webhook-service/README.md) for detailed setup instructions.

Quick start:
```bash
cd webhook-service
npm install
cp .env.example .env
# Edit .env with your credentials
npm start
```

Requirements:
- Telegram Bot Token (from @BotFather)
- Discord Webhook URLs for each casino channel
- Server with public HTTPS endpoint

## 📊 Admin Features

### Leaderboard Management
- Enable/disable individual casino leaderboards
- Configure custom timeframes with date pickers
- Set prize totals and places paid
- Customize prize distribution per rank

### Security
- Password-protected admin access
- Secure API key storage
- Developer mode for advanced configuration

### Monitoring
- Real-time leaderboard status
- API connection health
- Last updated timestamps

## 🎨 Design System

### Color Palette
- **Primary**: `#5CFFC1` (Neon Green)
- **Secondary**: `#5956FF` (Electric Blue)
- **Background**: `#1B1D29` (Dark Navy)
- **Text**: `#FFFFFF` (White)

### Typography
- **Display**: Oxanium (bold, futuristic)
- **UI Elements**: Barlow Condensed (compact, readable)
- **Body Text**: Inter (clean, modern)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test thoroughly
5. Commit with descriptive messages
6. Push to your fork
7. Submit a pull request

### Development Guidelines
- Maintain the dark neon theme consistency
- Ensure mobile responsiveness
- Test admin functionality thoroughly
- Follow existing code patterns
- Update documentation for new features

## 📝 License

This project is proprietary software for Porter Plays. All rights reserved.

## ⚠️ Important Notes

- **Age Restriction**: 18+ only
- **Responsible Gaming**: Gamble responsibly - links to GambleAware.org provided
- **VPN Usage**: May be required on some platforms
- **No Guarantees**: Performance data is for entertainment purposes only
- **Terms Apply**: All casino terms and conditions apply

## 🆘 Support

- **Discord**: [Join our community](https://discord.gg/porterplays)
- **Admin Panel**: Built-in support ticket system
- **Documentation**: This README and inline code comments

## 👨‍💻 Developer Credits

### Core Development
- **Lead Developer**: Jamie Nichols (@jmenichole)
- **Project Owner**: Porter Plays Community

### Special Thanks
- **Design Inspiration**: Porter Plays community feedback
- **Testing**: Beta testers and community members
- **Support**: Discord community for ongoing feedback

### Technologies & Tools
- **Built with**: GitHub Copilot assistance
- **Version Control**: Git & GitHub
- **Deployment**: Static hosting

---

**Made for degens by degens** ❤️

*Built with passion for the competitive gaming community* 
