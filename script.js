// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    initializeLeaderboard();
    initializeTabSwitching();
    initializeSmoothScrolling();
    initializeAnimations();
    initializeChatSystem();
    initializeAdminSystem();
    initializeFloatingCTA();
});

// Configuration Management
class ConfigManager {
    constructor() {
        this.apiConfig = this.loadApiConfig();
    }

    loadApiConfig() {
        const saved = localStorage.getItem('porterPlaysApiConfig');
        const base = saved ? JSON.parse(saved) : {
            thrillApiUrl: '',
            goatedApiUrl: '',
            apiKey: '',
            settings: {
                thrill: { enabled: true, prizeTotal: 5000, placesPaid: 3 },
                goated: { enabled: true, prizeTotal: 1000, placesPaid: 3 }
            }
        };
        // Migrate old configs without settings
        if (!base.settings) {
            base.settings = {
                thrill: { enabled: true, prizeTotal: 5000, placesPaid: 3 },
                goated: { enabled: true, prizeTotal: 1000, placesPaid: 3 }
            };
        }
        return base;
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
        this.isDeveloper = false;
        // Load password from localStorage if exists
        this.adminPassword = localStorage.getItem('porterPlaysAdminPassword') || 'porterplaysyourmom';
        this.developerPassword = 'jmenichole0098'; // Developer password - always constant
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
        const changePasswordBtn = document.getElementById('changePassword');
        const sendSupportBtn = document.getElementById('sendSupportMessage');

        // New leaderboard management event listeners
        const saveThrillDatesBtn = document.getElementById('saveThrillDates');
        const saveGoatedDatesBtn = document.getElementById('saveGoatedDates');
        const saveShuffleDatesBtn = document.getElementById('saveShuffleDates');
        const saveAllDatesBtn = document.getElementById('saveAllDates');
        const resetToDefaultsBtn = document.getElementById('resetToDefaults');
    // Settings inputs
    this.thrillPrizeTotal = document.getElementById('thrillPrizeTotal');
    this.thrillPlacesPaid = document.getElementById('thrillPlacesPaid');
    this.thrillEnabled = document.getElementById('thrillEnabled');
    this.goatedPrizeTotal = document.getElementById('goatedPrizeTotal');
    this.goatedPlacesPaid = document.getElementById('goatedPlacesPaid');
    this.goatedEnabled = document.getElementById('goatedEnabled');

        adminLoginBtn.addEventListener('click', () => this.showLoginModal());
        closeAdmin.addEventListener('click', () => this.hideLoginModal());
        adminLoginForm.addEventListener('submit', (e) => this.handleLogin(e));
        logoutBtn.addEventListener('click', () => this.logout());
        saveApiConfigBtn.addEventListener('click', () => this.saveApiConfiguration());
        changePasswordBtn.addEventListener('click', () => this.changePassword());
        sendSupportBtn.addEventListener('click', () => this.sendSupportMessage());

        // Leaderboard management listeners
        if (saveThrillDatesBtn) saveThrillDatesBtn.addEventListener('click', () => this.saveLeaderboardDates('thrill'));
        if (saveGoatedDatesBtn) saveGoatedDatesBtn.addEventListener('click', () => this.saveLeaderboardDates('goated'));
        if (saveShuffleDatesBtn) saveShuffleDatesBtn.addEventListener('click', () => this.saveLeaderboardDates('shuffle'));
        if (saveAllDatesBtn) saveAllDatesBtn.addEventListener('click', () => this.saveAllLeaderboardDates());
        if (resetToDefaultsBtn) resetToDefaultsBtn.addEventListener('click', () => this.resetToDefaultPeriods());
        // Save settings on change
        [this.thrillPrizeTotal, this.thrillPlacesPaid, this.thrillEnabled, this.goatedPrizeTotal, this.goatedPlacesPaid, this.goatedEnabled].forEach(el => {
            if (!el) return;
            el.addEventListener('change', () => this.saveSettings());
        });

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
            this.isDeveloper = false;
            this.hideLoginModal();
            this.showAdminPanel();
            this.loadApiConfiguration();
            this.loadLeaderboardDates();
        } else if (password === this.developerPassword) {
            this.isLoggedIn = true;
            this.isDeveloper = true;
            this.hideLoginModal();
            this.showAdminPanel();
            this.loadApiConfiguration();
            this.loadLeaderboardDates();
            // Show developer indicator
            const adminHeader = document.querySelector('.admin-header h3');
            adminHeader.textContent = 'Developer Dashboard';
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
        this.isDeveloper = false;
        this.hideAdminPanel();
        // Reset header title
        const adminHeader = document.querySelector('.admin-header h3');
        adminHeader.textContent = 'Admin Dashboard';
    }

    loadApiConfiguration() {
        const config = this.configManager.getApiConfig();
        document.getElementById('thrillApiUrl').value = config.thrillApiUrl || '';
        document.getElementById('goatedApiUrl').value = config.goatedApiUrl || '';
        document.getElementById('apiKey').value = config.apiKey || '';
        // Load settings
        if (this.thrillPrizeTotal) this.thrillPrizeTotal.value = config.settings?.thrill?.prizeTotal ?? 5000;
        if (this.thrillPlacesPaid) this.thrillPlacesPaid.value = config.settings?.thrill?.placesPaid ?? 3;
        if (this.thrillEnabled) this.thrillEnabled.checked = config.settings?.thrill?.enabled ?? true;
        if (this.goatedPrizeTotal) this.goatedPrizeTotal.value = config.settings?.goated?.prizeTotal ?? 1000;
        if (this.goatedPlacesPaid) this.goatedPlacesPaid.value = config.settings?.goated?.placesPaid ?? 3;
        if (this.goatedEnabled) this.goatedEnabled.checked = config.settings?.goated?.enabled ?? true;
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
            // Refresh leaderboards with new config
            leaderboardManager.updateLeaderboard('thrill');
            leaderboardManager.updateLeaderboard('goated');
        }

        alert('API configuration saved and leaderboards updated!');
    }

    saveSettings() {
        const config = this.configManager.getApiConfig();
        config.settings = {
            thrill: {
                enabled: this.thrillEnabled?.checked ?? true,
                prizeTotal: Number(this.thrillPrizeTotal?.value ?? 5000),
                placesPaid: Number(this.thrillPlacesPaid?.value ?? 3)
            },
            goated: {
                enabled: this.goatedEnabled?.checked ?? true,
                prizeTotal: Number(this.goatedPrizeTotal?.value ?? 1000),
                placesPaid: Number(this.goatedPlacesPaid?.value ?? 3)
            }
        };
        this.configManager.saveApiConfig(config);
        if (leaderboardManager) {
            leaderboardManager.applySettings(config.settings);
            leaderboardManager.updateLeaderboard('thrill');
            leaderboardManager.updateLeaderboard('goated');
        }
    }

    changePassword() {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (!currentPassword || !newPassword || !confirmPassword) {
            alert('Please fill in all password fields.');
            return;
        }

        if (currentPassword !== this.adminPassword) {
            alert('Current password is incorrect.');
            return;
        }

        if (newPassword !== confirmPassword) {
            alert('New passwords do not match.');
            return;
        }

        if (newPassword.length < 8) {
            alert('New password must be at least 8 characters long.');
            return;
        }

        // Update password
        this.adminPassword = newPassword;
        localStorage.setItem('porterPlaysAdminPassword', newPassword);

        // Clear form
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';

        alert('Password changed successfully!');
    }

    sendSupportMessage() {
        const subject = document.getElementById('supportSubject').value;
        const message = document.getElementById('supportMessage').value;

        if (!message.trim()) {
            alert('Please enter a message.');
            return;
        }

        // Create email content
        const emailSubject = `Porter Plays Support: ${subject}`;
        const emailBody = `Support Request from Porter Plays Admin Panel:

Subject: ${subject}
Message: ${message}

Site: ${window.location.href}
Timestamp: ${new Date().toISOString()}`;

        // Create mailto link
        const mailtoLink = `mailto:jmenichole007@outlook.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
        
        // Try to open email client
        window.location.href = mailtoLink;

        // Clear form
        document.getElementById('supportMessage').value = '';

        alert('Email client opened. Please send the email to complete your support request.');
    }

    // Leaderboard Date Management Functions
    loadLeaderboardDates() {
        const savedDates = JSON.parse(localStorage.getItem('leaderboardDates') || '{}');
        
        // Load Thrill dates
        if (savedDates.thrill) {
            document.getElementById('thrillStartDate').value = savedDates.thrill.startDate || '';
            document.getElementById('thrillEndDate').value = savedDates.thrill.endDate || '';
        }
        
        // Load Goated dates  
        if (savedDates.goated) {
            document.getElementById('goatedStartDate').value = savedDates.goated.startDate || '';
            document.getElementById('goatedEndDate').value = savedDates.goated.endDate || '';
        }
        
        // Load Shuffle dates
        if (savedDates.shuffle) {
            document.getElementById('shuffleStartDate').value = savedDates.shuffle.startDate || '';
            document.getElementById('shuffleEndDate').value = savedDates.shuffle.endDate || '';
        }
    }

    saveLeaderboardDates(casino) {
        if (!this.isLoggedIn) {
            alert('You must be logged in to change leaderboard dates.');
            return;
        }

        const startDateEl = document.getElementById(`${casino}StartDate`);
        const endDateEl = document.getElementById(`${casino}EndDate`);
        
        const startDate = startDateEl.value;
        const endDate = endDateEl.value;

        if (!startDate || !endDate) {
            alert('Please select both start and end dates.');
            return;
        }

        if (new Date(startDate) >= new Date(endDate)) {
            alert('Start date must be before end date.');
            return;
        }

        // Save to localStorage
        const savedDates = JSON.parse(localStorage.getItem('leaderboardDates') || '{}');
        savedDates[casino] = {
            startDate: startDate,
            endDate: endDate,
            updatedBy: this.isDeveloper ? 'developer' : 'admin',
            updatedAt: new Date().toISOString()
        };
        
        localStorage.setItem('leaderboardDates', JSON.stringify(savedDates));
        
        // Update the leaderboard display if needed
        this.updateLeaderboardDisplay(casino, startDate, endDate);
        
        alert(`${casino.charAt(0).toUpperCase() + casino.slice(1)} leaderboard timeframe updated successfully!`);
    }

    saveAllLeaderboardDates() {
        if (!this.isLoggedIn) {
            alert('You must be logged in to change leaderboard dates.');
            return;
        }

        const casinos = ['thrill', 'goated', 'shuffle'];
        let allValid = true;
        let invalidCasinos = [];

        // Validate all dates first
        casinos.forEach(casino => {
            const startDate = document.getElementById(`${casino}StartDate`).value;
            const endDate = document.getElementById(`${casino}EndDate`).value;

            if (!startDate || !endDate) {
                allValid = false;
                invalidCasinos.push(`${casino} (missing dates)`);
            } else if (new Date(startDate) >= new Date(endDate)) {
                allValid = false;
                invalidCasinos.push(`${casino} (start date after end date)`);
            }
        });

        if (!allValid) {
            alert(`Please fix the following issues:\n${invalidCasinos.join('\n')}`);
            return;
        }

        // Save all dates
        const savedDates = JSON.parse(localStorage.getItem('leaderboardDates') || '{}');
        
        casinos.forEach(casino => {
            const startDate = document.getElementById(`${casino}StartDate`).value;
            const endDate = document.getElementById(`${casino}EndDate`).value;
            
            savedDates[casino] = {
                startDate: startDate,
                endDate: endDate,
                updatedBy: this.isDeveloper ? 'developer' : 'admin',
                updatedAt: new Date().toISOString()
            };
            
            this.updateLeaderboardDisplay(casino, startDate, endDate);
        });
        
        localStorage.setItem('leaderboardDates', JSON.stringify(savedDates));
        alert('All leaderboard timeframes updated successfully!');
    }

    resetToDefaultPeriods() {
        if (!this.isLoggedIn) {
            alert('You must be logged in to reset leaderboard dates.');
            return;
        }

        if (!confirm('Are you sure you want to reset all leaderboards to their default periods? This will clear all custom date settings.')) {
            return;
        }

        // Clear saved dates
        localStorage.removeItem('leaderboardDates');
        
        // Set default periods based on current date
        const now = new Date();
        
        // Thrill - Biweekly (2 weeks from current Monday)
        const thrillStart = this.getLastMonday(now);
        const thrillEnd = new Date(thrillStart);
        thrillEnd.setDate(thrillEnd.getDate() + 14);
        
        // Goated - Monthly (current month)
        const goatedStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const goatedEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        // Shuffle - Weekly (current week from Monday)
        const shuffleStart = this.getLastMonday(now);
        const shuffleEnd = new Date(shuffleStart);
        shuffleEnd.setDate(shuffleEnd.getDate() + 7);

        // Update form fields
        document.getElementById('thrillStartDate').value = this.formatDateForInput(thrillStart);
        document.getElementById('thrillEndDate').value = this.formatDateForInput(thrillEnd);
        document.getElementById('goatedStartDate').value = this.formatDateForInput(goatedStart);
        document.getElementById('goatedEndDate').value = this.formatDateForInput(goatedEnd);
        document.getElementById('shuffleStartDate').value = this.formatDateForInput(shuffleStart);
        document.getElementById('shuffleEndDate').value = this.formatDateForInput(shuffleEnd);

        alert('All leaderboards reset to default periods. Click "Save All Timeframes" to apply these changes.');
    }

    updateLeaderboardDisplay(casino, startDate, endDate) {
        // Update any visible leaderboard timing displays
        const startFormatted = new Date(startDate).toLocaleDateString();
        const endFormatted = new Date(endDate).toLocaleDateString();
        
        // This function can be extended to update UI elements that show the current leaderboard period
        console.log(`${casino} leaderboard updated: ${startFormatted} to ${endFormatted}`);
    }

    getLastMonday(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
        d.setDate(diff);
        d.setHours(0, 0, 0, 0);
        return d;
    }

    formatDateForInput(date) {
        // Format date for datetime-local input
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }
}

// Leaderboard Management
class LeaderboardManager {
    constructor() {
        this.currentCasino = 'thrill';
        this.updateInterval = 30000;
        this.isLoading = false;
        this.configManager = new ConfigManager();
        this.settings = this.configManager.getApiConfig().settings;
    }

    updateApiConfig(config) {
        this.configManager.saveApiConfig(config);
        if (config.settings) this.settings = config.settings;
    }

    applySettings(settings) {
        this.settings = settings;
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
                // Only add API key if provided
                if (config.apiKey && config.apiKey.trim()) {
                    headers['Authorization'] = `Bearer ${config.apiKey}`;
                }

                const response = await fetch(apiEndpoints[casino], { 
                    headers,
                    method: 'GET'
                });
                
                if (response.ok) {
                    const data = await response.json();
                    // Anonymize usernames from API data
                    if (data.players) {
                        data.players = data.players.map(player => ({
                            ...player,
                            username: this.anonymizeUsername(player.username)
                        }));
                    }
                    return { ...data, isMock: false };
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
                    { rank: 1, username: 'P***r2024', wager: '$125,000', profit: '+$12,500' },
                    { rank: 2, username: 'V***amer', wager: '$98,750', profit: '+$8,900' },
                    { rank: 3, username: 'H***oller', wager: '$87,300', profit: '+$7,200' },
                    { rank: 4, username: 'C***oKing', wager: '$76,500', profit: '+$5,800' },
                    { rank: 5, username: 'S***aster', wager: '$65,200', profit: '+$4,100' },
                    { rank: 6, username: 'B***east', wager: '$54,800', profit: '+$3,200' },
                    { rank: 7, username: 'C***haser', wager: '$43,600', profit: '+$2,800' },
                    { rank: 8, username: 'R***Dice', wager: '$38,900', profit: '+$2,400' },
                    { rank: 9, username: 'L***reak', wager: '$32,100', profit: '+$1,900' },
                    { rank: 10, username: 'W***Wars', wager: '$28,500', profit: '+$1,500' }
                ],
                lastUpdated: new Date().toLocaleTimeString(),
                isMock: true
            },
            goated: {
                players: [
                    { rank: 1, username: 'G***dGamer', wager: '$156,000', profit: '+$15,600' },
                    { rank: 2, username: 'P***rVIP', wager: '$134,200', profit: '+$13,400' },
                    { rank: 3, username: 'E***Player', wager: '$118,800', profit: '+$11,200' },
                    { rank: 4, username: 'M***Better', wager: '$102,500', profit: '+$9,800' },
                    { rank: 5, username: 'P***ambler', wager: '$89,300', profit: '+$7,900' },
                    { rank: 6, username: 'H***takes', wager: '$76,700', profit: '+$6,500' },
                    { rank: 7, username: 'C***rusher', wager: '$65,400', profit: '+$5,200' },
                    { rank: 8, username: 'B***ully', wager: '$58,900', profit: '+$4,700' },
                    { rank: 9, username: 'W***izard', wager: '$49,600', profit: '+$3,800' },
                    { rank: 10, username: 'S***ensei', wager: '$42,100', profit: '+$3,200' }
                ],
                lastUpdated: new Date().toLocaleTimeString(),
                isMock: true
            }
        };

        return new Promise(resolve => {
            setTimeout(() => resolve(mockData[casino]), 1000);
        });
    }

    anonymizeUsername(username) {
        if (username.length <= 3) return username;
        const firstChar = username.charAt(0);
        const lastChar = username.charAt(username.length - 1);
        const stars = '*'.repeat(Math.min(username.length - 2, 3));
        return `${firstChar}${stars}${lastChar}`;
    }

    async updateLeaderboard(casino = this.currentCasino) {
        if (this.isLoading) return;
        
        this.isLoading = true;
    const container = document.getElementById(`${casino}-leaderboard`);
    if (!container) { this.isLoading = false; return; }
        
        try {
            const data = await this.fetchLeaderboardData(casino);
            // Render full table for the correct tab only; respect enable toggle
            if (container) {
                const enabled = this.settings?.[casino]?.enabled !== false;
                if (!enabled) {
                    container.innerHTML = `<div class="leaderboard-loading">Leaderboard is currently disabled for ${casino}.</div>`;
                } else {
                    this.renderLeaderboard(container, data, casino);
                }
            }
        } catch (error) {
            console.error('Error updating leaderboard:', error);
            if (container) this.renderError(container);
        } finally {
            this.isLoading = false;
        }
    }

    // Render the top snapshot rows in the new pp-table layout
    renderSnapshot(data) {
        const table = document.querySelector('.pp-table');
        if (!table) return;

        // Only populate when using real API data to avoid fabricated numbers
        if (!data || data.isMock || !Array.isArray(data.players)) {
            return;
        }

        const top3 = data.players.slice(0, 3);
        top3.forEach((player, idx) => {
            const row = table.querySelector(`.pp-row-${idx + 1}`);
            if (!row) return;
            const userEl = row.querySelector('.pp-user');
            const wagerEl = row.querySelector('.pp-wager');
            const prizeEl = row.querySelector('.pp-prize');

            if (userEl) userEl.textContent = player.username || '';
            if (wagerEl) {
                wagerEl.textContent = player.wager ?? '';
                wagerEl.removeAttribute('data-placeholder');
            }
            if (prizeEl) {
                // Populate prize if provided by API; otherwise leave em dash
                if (player.prize !== undefined && player.prize !== null && `${player.prize}`.trim() !== '') {
                    prizeEl.textContent = player.prize;
                    prizeEl.removeAttribute('data-placeholder');
                }
            }
        });
    }

    renderLeaderboard(container, data, casino) {
        const settings = this.settings?.[casino] || { prizeTotal: casino === 'thrill' ? 5000 : 1000, placesPaid: 3 };
        const lastUpdated = data.lastUpdated || new Date().toLocaleTimeString();
        // Compute prize breakdown equally among places paid
        const prizePerPlace = settings.placesPaid > 0 ? Math.floor((settings.prizeTotal || 0) / settings.placesPaid) : 0;
        const prizeForRank = (rank) => rank <= settings.placesPaid ? `$${prizePerPlace.toLocaleString()}` : '—';
        const liveDot = '<span class="live-dot" aria-hidden="true"></span>';
        const html = `
            <div class="leaderboard-header">
                <div class="live-indicator">${liveDot}<span class="live-text">Live</span></div>
                <h3>Top Players</h3>
                <p class="last-updated">Last updated: ${lastUpdated}</p>
            </div>
            <table class="leaderboard-table">
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Player</th>
                        <th>Total Wager</th>
                        <th>Prize</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.players.map(player => `
                        <tr class="fade-in">
                            <td class="leaderboard-rank">#${player.rank}</td>
                            <td class="leaderboard-player">${player.username}</td>
                            <td class="leaderboard-wager">${player.wager}</td>
                            <td class="leaderboard-prize">${prizeForRank(player.rank)}</td>
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
                .leaderboard-prize { font-weight: 700; color: #ffd700; }
                .leaderboard-header { 
                    padding: 0.5rem 0 1rem; 
                    border-bottom: 2px solid var(--primary-color); 
                    margin-bottom: 1rem; 
                    display: grid;
                    grid-template-columns: 1fr auto 1fr;
                    align-items: center;
                    gap: 8px;
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
                .live-indicator { display: inline-flex; align-items: center; gap: 8px; justify-content: flex-start; }
                .live-dot { width: 8px; height: 8px; background: #ff4444; border-radius: 50%; animation: blink 1s infinite; box-shadow: 0 0 8px rgba(255,68,68,0.7); }
                @keyframes blink { 0%,50%{opacity:1} 51%,100%{opacity:.3} }
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
                code: 'PLAYSHUFFLE',
                bonus: 'VIP benefits',
                features: 'exclusive slot tournaments',
                url: 'https://shuffle.com/?r=playShuffle',
                telegramChannels: [
                    { name: 'Shuffle Boost', url: 'https://t.me/shuffleboost' },
                    { name: 'Shuffle VIP', url: 'https://t.me/shufflevip' }
                ],
                porterChannel: 'https://t.me/playshuffle'
            },
            thrill: {
                name: 'Thrill',
                code: 'PORTERVIP',
                bonus: 'VIP status transfer',
                features: 'instant withdrawals & dedicated VIP host',
                url: 'https://thrill.com/?r=porterplays',
                telegramChannels: [
                    { name: 'Thrill Official', url: 'https://t.me/thrillcom' }
                ],
                porterChannel: 'https://t.me/playthrill'
            },
            goated: {
                name: 'Goated',
                code: 'PLAYGOATED or DISCORD',
                bonus: 'enhanced cashback rates',
                features: 'monthly leaderboard competitions',
                url: 'https://www.goated.com/r/PLAYGOATED',
                telegramChannels: [
                    { name: 'Goated Drops', url: 'https://t.me/goateddrops' }
                ],
                porterChannel: 'https://t.me/playatgoated'
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
                
                📢 **Join the communities:**
                • Porter's ${info.name} channel: ${info.porterChannel}
                ${info.telegramChannels.map(ch => `• ${ch.name}: ${ch.url}`).join('\n                ')}
                • Main hub: @porterplays
                • Discord: https://discord.gg/porterplays
                
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
        // Convert newlines to <br> and linkify URLs for clickability
        const withBreaks = text.replace(/\n/g, '<br>');
        const linkified = withBreaks.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1<\/a>');
        messageDiv.innerHTML = `<div class="message-text">${linkified}</div>`;
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
    // Choose initial tab based on enabled settings
    const settings = leaderboardManager.settings;
    const preferThrill = settings?.thrill?.enabled !== false;
    const initial = preferThrill ? 'thrill' : 'goated';
    leaderboardManager.currentCasino = initial;
    // Activate the correct tab visually
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.casino === initial);
    });
    const contents = document.querySelectorAll('.leaderboard-content');
    contents.forEach(c => c.style.display = c.id.startsWith(initial) ? 'block' : 'none');
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
                const headerEl = document.querySelector('.header') || document.querySelector('.pp-header');
                const headerHeight = headerEl ? headerEl.offsetHeight : 0;
                const targetPosition = target.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Period chips (UI only)
document.addEventListener('DOMContentLoaded', () => {
    const chips = document.querySelectorAll('.pp-controls .pp-chip');
    if (!chips.length) return;
    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            chips.forEach(c => c.classList.remove('is-active'));
            chip.classList.add('is-active');
            // Hook for future: we could filter data based on selected period if API supports it.
        });
    });
});

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

// Floating CTA functionality
function initializeFloatingCTA() {
    const floatingCTA = document.getElementById('floatingCTA');
    let isVisible = false;
    let isHidden = localStorage.getItem('floatingCTAHidden') === 'true';

    function showCTA() {
        if (!isHidden && !isVisible) {
            floatingCTA.classList.add('visible');
            isVisible = true;
        }
    }

    function hideCTA() {
        if (isVisible) {
            floatingCTA.classList.remove('visible');
            isVisible = false;
        }
    }

    // Show CTA after scrolling down a bit
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const heroHeight = window.innerHeight * 0.8;

        if (scrolled > heroHeight && !isHidden) {
            showCTA();
        }
    });

    // Auto-show after 15 seconds if not hidden
    if (!isHidden) {
        setTimeout(() => {
            showCTA();
        }, 15000);
    }
}

function hideFloatingCTA() {
    const floatingCTA = document.getElementById('floatingCTA');
    floatingCTA.classList.remove('visible');
    localStorage.setItem('floatingCTAHidden', 'true');
}

// FAQ Toggle functionality
function toggleFAQ(element) {
    const faqItem = element.parentElement;
    const isActive = faqItem.classList.contains('active');
    
    // Close all FAQ items
    document.querySelectorAll('.faq-item.active').forEach(item => {
        if (item !== faqItem) {
            item.classList.remove('active');
        }
    });
    
    // Toggle current item
    if (isActive) {
        faqItem.classList.remove('active');
    } else {
        faqItem.classList.add('active');
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