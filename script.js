// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    initializeLeaderboard();
    initializeTabSwitching();
    initializeSmoothScrolling();
    initializeAnimations();
    initializeChatSystem();
    initializeAdminSystem();
});

// Configuration Management
class ConfigManager {
    constructor() {
        this.apiConfig = this.loadApiConfig();
    }

    loadApiConfig() {
        const saved = localStorage.getItem('porterPlaysApiConfig');
        return saved ? JSON.parse(saved) : {
            thrillApiUrl: '',
            goatedApiUrl: '',
            apiKey: ''
        };
    }

    saveApiConfig(config) {
        this.apiConfig = { ...this.apiConfig, ...config };
        localStorage.setItem('porterPlaysApiConfig', JSON.stringify(this.apiConfig));
    }

    getApiConfig() {
        return this.apiConfig;
    }
}

// Admin System
class AdminSystem {
    constructor() {
        this.isLoggedIn = false;
        this.adminPassword = 'porterplaysyourmom';
        this.configManager = new ConfigManager();
        this.bindEvents();
    }

    bindEvents() {
        const adminLoginBtn = document.getElementById('adminLoginBtn');
        const adminModal = document.getElementById('adminModal');
        const closeAdmin = document.querySelector('.close-admin');
        const adminLoginForm = document.getElementById('adminLoginForm');
        const logoutBtn = document.getElementById('logoutBtn');
        const saveApiConfigBtn = document.getElementById('saveApiConfig');

        adminLoginBtn.addEventListener('click', () => this.showLoginModal());
        closeAdmin.addEventListener('click', () => this.hideLoginModal());
        adminLoginForm.addEventListener('submit', (e) => this.handleLogin(e));
        logoutBtn.addEventListener('click', () => this.logout());
        saveApiConfigBtn.addEventListener('click', () => this.saveApiConfiguration());

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === adminModal) {
                this.hideLoginModal();
            }
        });
    }

    showLoginModal() {
        const modal = document.getElementById('adminModal');
        modal.style.display = 'block';
    }

    hideLoginModal() {
        const modal = document.getElementById('adminModal');
        modal.style.display = 'none';
        document.getElementById('adminPassword').value = '';
    }

    handleLogin(e) {
        e.preventDefault();
        const password = document.getElementById('adminPassword').value;
        
        if (password === this.adminPassword) {
            this.isLoggedIn = true;
            this.hideLoginModal();
            this.showAdminPanel();
            this.loadApiConfiguration();
        } else {
            alert('Invalid password');
        }
    }

    showAdminPanel() {
        const panel = document.getElementById('adminPanel');
        panel.classList.remove('hidden');
    }

    hideAdminPanel() {
        const panel = document.getElementById('adminPanel');
        panel.classList.add('hidden');
    }

    logout() {
        this.isLoggedIn = false;
        this.hideAdminPanel();
    }

    loadApiConfiguration() {
        const config = this.configManager.getApiConfig();
        document.getElementById('thrillApiUrl').value = config.thrillApiUrl || '';
        document.getElementById('goatedApiUrl').value = config.goatedApiUrl || '';
        document.getElementById('apiKey').value = config.apiKey || '';
    }

    saveApiConfiguration() {
        const config = {
            thrillApiUrl: document.getElementById('thrillApiUrl').value,
            goatedApiUrl: document.getElementById('goatedApiUrl').value,
            apiKey: document.getElementById('apiKey').value
        };

        this.configManager.saveApiConfig(config);
        
        // Update leaderboard with new config
        if (leaderboardManager) {
            leaderboardManager.updateApiConfig(config);
        }

        alert('API configuration saved successfully!');
    }
}

// Leaderboard Management
class LeaderboardManager {
    constructor() {
        this.currentCasino = 'thrill';
        this.updateInterval = 30000;
        this.isLoading = false;
        this.configManager = new ConfigManager();
    }

    updateApiConfig(config) {
        this.configManager.saveApiConfig(config);
    }

    async fetchLeaderboardData(casino) {
        const config = this.configManager.getApiConfig();
        const apiEndpoints = {
            thrill: config.thrillApiUrl || 'https://api.thrill.com/leaderboard',
            goated: config.goatedApiUrl || 'https://api.goated.com/leaderboard'
        };

        try {
            // Try to fetch from actual API if configured
            if (config.thrillApiUrl || config.goatedApiUrl) {
                const headers = {};
                if (config.apiKey) {
                    headers['Authorization'] = `Bearer ${config.apiKey}`;
                }

                const response = await fetch(apiEndpoints[casino], { headers });
                if (response.ok) {
                    return await response.json();
                }
            }
            
            // Fall back to mock data
            return this.getMockLeaderboardData(casino);
        } catch (error) {
            console.error(`Error fetching ${casino} leaderboard:`, error);
            return this.getMockLeaderboardData(casino);
        }
    }

    getMockLeaderboardData(casino) {
        const mockData = {
            thrill: {
                players: [
                    { rank: 1, username: 'PorterFan2024', wager: '$125,000', profit: '+$12,500' },
                    { rank: 2, username: 'VIPGamer', wager: '$98,750', profit: '+$8,900' },
                    { rank: 3, username: 'HighRoller', wager: '$87,300', profit: '+$7,200' },
                    { rank: 4, username: 'CasinoKing', wager: '$76,500', profit: '+$5,800' },
                    { rank: 5, username: 'SlotMaster', wager: '$65,200', profit: '+$4,100' },
                    { rank: 6, username: 'BetBeast', wager: '$54,800', profit: '+$3,200' },
                    { rank: 7, username: 'ChipChaser', wager: '$43,600', profit: '+$2,800' },
                    { rank: 8, username: 'RollTheDice', wager: '$38,900', profit: '+$2,400' },
                    { rank: 9, username: 'LuckyStreak', wager: '$32,100', profit: '+$1,900' },
                    { rank: 10, username: 'WagerWars', wager: '$28,500', profit: '+$1,500' }
                ],
                lastUpdated: new Date().toLocaleTimeString()
            },
            goated: {
                players: [
                    { rank: 1, username: 'GoatedGamer', wager: '$156,000', profit: '+$15,600' },
                    { rank: 2, username: 'PorterVIP', wager: '$134,200', profit: '+$13,400' },
                    { rank: 3, username: 'ElitePlayer', wager: '$118,800', profit: '+$11,200' },
                    { rank: 4, username: 'MegaBetter', wager: '$102,500', profit: '+$9,800' },
                    { rank: 5, username: 'ProGambler', wager: '$89,300', profit: '+$7,900' },
                    { rank: 6, username: 'HighStakes', wager: '$76,700', profit: '+$6,500' },
                    { rank: 7, username: 'CashCrusher', wager: '$65,400', profit: '+$5,200' },
                    { rank: 8, username: 'BetBully', wager: '$58,900', profit: '+$4,700' },
                    { rank: 9, username: 'WinWizard', wager: '$49,600', profit: '+$3,800' },
                    { rank: 10, username: 'SpinSensei', wager: '$42,100', profit: '+$3,200' }
                ],
                lastUpdated: new Date().toLocaleTimeString()
            }
        };

        return new Promise(resolve => {
            setTimeout(() => resolve(mockData[casino]), 1000);
        });
    }

    async updateLeaderboard(casino = this.currentCasino) {
        if (this.isLoading) return;
        
        this.isLoading = true;
        const container = document.getElementById(`${casino}-leaderboard`);
        
        try {
            const data = await this.fetchLeaderboardData(casino);
            this.renderLeaderboard(container, data);
            
            if (casino === 'thrill') {
                this.updateHeroPreview(data);
            }
        } catch (error) {
            console.error('Error updating leaderboard:', error);
            this.renderError(container);
        } finally {
            this.isLoading = false;
        }
    }

    renderLeaderboard(container, data) {
        const html = `
            <div class="leaderboard-header">
                <h3>Top Players</h3>
                <p class="last-updated">Last updated: ${data.lastUpdated}</p>
            </div>
            <table class="leaderboard-table">
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Player</th>
                        <th>Total Wager</th>
                        <th>Profit</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.players.map(player => `
                        <tr class="fade-in">
                            <td class="leaderboard-rank">#${player.rank}</td>
                            <td class="leaderboard-player">${player.username}</td>
                            <td class="leaderboard-wager">${player.wager}</td>
                            <td class="leaderboard-profit ${player.profit.startsWith('+') ? 'positive' : 'negative'}">
                                ${player.profit}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
        container.innerHTML = html;
        this.addLeaderboardStyles();
    }

    updateHeroPreview(data) {
        const heroPreview = document.querySelector('.leaderboard-preview');
        if (heroPreview && data.players.length > 0) {
            const topPlayers = data.players.slice(0, 3);
            heroPreview.innerHTML = `
                <h3>Live Leaderboard</h3>
                ${topPlayers.map(player => `
                    <div class="preview-player">
                        <span class="preview-rank">#${player.rank}</span>
                        <span class="preview-name">${player.username}</span>
                        <span class="preview-wager">${player.wager}</span>
                    </div>
                `).join('')}
                <p class="preview-updated">Updated: ${data.lastUpdated}</p>
            `;
            this.addPreviewStyles();
        }
    }

    renderError(container) {
        container.innerHTML = `
            <div class="leaderboard-error">
                <p>Unable to load leaderboard data. Please try again later.</p>
                <button onclick="leaderboardManager.updateLeaderboard('${this.currentCasino}')" class="btn-primary">
                    Retry
                </button>
            </div>
        `;
    }

    addLeaderboardStyles() {
        if (!document.querySelector('#leaderboard-table-styles')) {
            const style = document.createElement('style');
            style.id = 'leaderboard-table-styles';
            style.textContent = `
                .leaderboard-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .leaderboard-table th,
                .leaderboard-table td {
                    padding: 1rem;
                    text-align: left;
                    border-bottom: 1px solid var(--border-color);
                }
                .leaderboard-table th {
                    background: var(--bg-secondary);
                    font-weight: 600;
                    color: var(--text-primary);
                }
                .leaderboard-rank {
                    font-weight: 700;
                    color: var(--primary-color);
                }
                .leaderboard-player {
                    font-weight: 600;
                }
                .leaderboard-wager {
                    color: var(--accent-color);
                    font-weight: 600;
                }
                .leaderboard-profit.positive { 
                    color: var(--accent-color); 
                    font-weight: 600; 
                }
                .leaderboard-profit.negative { 
                    color: #ef4444; 
                    font-weight: 600; 
                }
                .leaderboard-header { 
                    padding: 1rem 0; 
                    border-bottom: 2px solid var(--primary-color); 
                    margin-bottom: 1rem; 
                    text-align: center;
                }
                .leaderboard-header h3 {
                    color: var(--primary-color);
                    margin-bottom: 0.5rem;
                }
                .last-updated { 
                    color: var(--text-secondary); 
                    font-size: 0.875rem; 
                    margin: 0; 
                }
            `;
            document.head.appendChild(style);
        }
    }

    addPreviewStyles() {
        if (!document.querySelector('#preview-styles')) {
            const style = document.createElement('style');
            style.id = 'preview-styles';
            style.textContent = `
                .preview-player {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0.75rem 0;
                    border-bottom: 1px solid var(--border-color);
                    font-size: 0.875rem;
                }
                .preview-rank {
                    color: var(--primary-color);
                    font-weight: 700;
                }
                .preview-name {
                    flex: 1;
                    text-align: center;
                    font-weight: 600;
                }
                .preview-wager {
                    color: var(--accent-color);
                    font-weight: 600;
                }
                .preview-updated {
                    text-align: center;
                    font-size: 0.75rem;
                    color: var(--text-light);
                    margin-top: 1rem;
                    margin-bottom: 0;
                }
            `;
            document.head.appendChild(style);
        }
    }

    startAutoUpdate() {
        this.updateLeaderboard();
        setInterval(() => {
            this.updateLeaderboard();
        }, this.updateInterval);
    }
}

// Chat System
class ChatSystem {
    constructor() {
        this.isOpen = false;
        this.currentStep = 'initial';
        this.bindEvents();
    }

    bindEvents() {
        const chatBubble = document.getElementById('chatBubble');
        const chatWidget = document.getElementById('chatWidget');
        const closeChatBtn = document.getElementById('closeChatBtn');
        const chatOptions = document.querySelectorAll('.chat-option');

        chatBubble.addEventListener('click', () => this.toggleChat());
        closeChatBtn.addEventListener('click', () => this.closeChat());
        
        chatOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                this.handleCasinoSelection(e.target.dataset.casino);
            });
        });
    }

    toggleChat() {
        const bubble = document.getElementById('chatBubble');
        const widget = document.getElementById('chatWidget');
        
        if (this.isOpen) {
            this.closeChat();
        } else {
            bubble.style.display = 'none';
            widget.classList.remove('hidden');
            this.isOpen = true;
        }
    }

    closeChat() {
        const bubble = document.getElementById('chatBubble');
        const widget = document.getElementById('chatWidget');
        
        bubble.style.display = 'flex';
        widget.classList.add('hidden');
        this.isOpen = false;
    }

    handleCasinoSelection(casino) {
        const messagesContainer = document.getElementById('chatMessages');
        const casinoInfo = {
            shuffle: {
                name: 'Shuffle',
                code: 'PORTER1K',
                bonus: '$1,000 deposit match',
                features: 'exclusive slot challenges',
                url: 'https://shuffle.com/?ref=porter'
            },
            thrill: {
                name: 'Thrill',
                code: 'PORTERVIP',
                bonus: 'VIP status transfer',
                features: 'personal account manager',
                url: 'https://thrill.com/?ref=porter'
            },
            goated: {
                name: 'Goated',
                code: 'PORTERGOAT',
                bonus: 'enhanced cashback rates',
                features: 'elite gaming platform',
                url: 'https://goated.com/?ref=porter'
            }
        };

        const info = casinoInfo[casino];
        
        // Add user message
        this.addMessage(`I'm interested in ${info.name}!`, 'user');
        
        // Add bot response
        setTimeout(() => {
            this.addMessage(
                `Great choice! ${info.name} offers ${info.bonus} and features ${info.features}. 
                
                🎁 **Your exclusive code:** ${info.code}
                
                Here's how to get started:
                1. Click the link below to visit ${info.name}
                2. Create your account
                3. Enter code "${info.code}" during signup
                4. Make your first deposit to claim your bonus!
                
                Ready to join?`,
                'bot'
            );
            
            // Add action button
            this.addActionButton(`Join ${info.name} Now`, info.url);
        }, 1000);

        // Hide options
        document.querySelector('.chat-options').classList.add('hidden');
    }

    addMessage(text, sender) {
        const messagesContainer = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}-message`;
        messageDiv.innerHTML = `<div class="message-text">${text.replace(/\n/g, '<br>')}</div>`;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    addActionButton(text, url) {
        const messagesContainer = document.getElementById('chatMessages');
        const buttonDiv = document.createElement('div');
        buttonDiv.className = 'chat-message bot-message';
        buttonDiv.innerHTML = `
            <div class="message-text">
                <a href="${url}" target="_blank" class="btn-primary" style="display: inline-block; margin-top: 0.5rem;" onclick="trackAffiliateClick('${url}')">
                    ${text}
                </a>
            </div>
        `;
        messagesContainer.appendChild(buttonDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

// Initialize systems
let leaderboardManager;
let adminSystem;
let chatSystem;

function initializeLeaderboard() {
    leaderboardManager = new LeaderboardManager();
    leaderboardManager.startAutoUpdate();
}

function initializeAdminSystem() {
    adminSystem = new AdminSystem();
}

function initializeChatSystem() {
    chatSystem = new ChatSystem();
}

// Tab Switching
function initializeTabSwitching() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const leaderboardContents = document.querySelectorAll('.leaderboard-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const casino = this.dataset.casino;
            
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            leaderboardContents.forEach(content => {
                content.style.display = 'none';
            });
            
            const activeContent = document.getElementById(`${casino}-leaderboard`);
            if (activeContent) {
                activeContent.style.display = 'block';
            }
            
            leaderboardManager.currentCasino = casino;
            leaderboardManager.updateLeaderboard(casino);
        });
    });
}

// Smooth Scrolling
function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Animations
function initializeAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.casino-card, .benefit, .section-title, .community-card');
    animatedElements.forEach(el => {
        observer.observe(el);
    });
}

// Utility Functions
function trackAffiliateClick(url) {
    let casino = 'unknown';
    
    if (url.includes('shuffle.com')) casino = 'shuffle';
    else if (url.includes('thrill.com')) casino = 'thrill';
    else if (url.includes('goated.com')) casino = 'goated';
    
    console.log(`Affiliate link clicked: ${casino}`);
    
    // Analytics tracking
    if (typeof gtag !== 'undefined') {
        gtag('event', 'click', {
            event_category: 'affiliate',
            event_label: casino,
            value: 1
        });
    }
}

// Add click tracking to all affiliate links
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('a[href*="shuffle.com"], a[href*="thrill.com"], a[href*="goated.com"]').forEach(link => {
        link.addEventListener('click', function() {
            trackAffiliateClick(this.href);
        });
    });
});