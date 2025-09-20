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
                thrill: { enabled: true, prizeTotal: 5000, placesPaid: 3, customPrizes: [] },
                goated: { enabled: true, prizeTotal: 1000, placesPaid: 3, customPrizes: [] }
            }
        };
        // Migrate old configs without settings
        if (!base.settings) {
            base.settings = {
                thrill: { enabled: true, prizeTotal: 5000, placesPaid: 3, customPrizes: [] },
                goated: { enabled: true, prizeTotal: 1000, placesPaid: 3, customPrizes: [] }
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
    this.thrillPrizeEditor = document.getElementById('thrillPrizeEditor');
    this.goatedPrizeTotal = document.getElementById('goatedPrizeTotal');
    this.goatedPlacesPaid = document.getElementById('goatedPlacesPaid');
    this.goatedEnabled = document.getElementById('goatedEnabled');
    this.goatedPrizeEditor = document.getElementById('goatedPrizeEditor');
    this.shufflePrizeTotal = document.getElementById('shufflePrizeTotal');
    this.shufflePlacesPaid = document.getElementById('shufflePlacesPaid');
    this.shuffleEnabled = document.getElementById('shuffleEnabled');
    this.shufflePrizeEditor = document.getElementById('shufflePrizeEditor');

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

        // Individual settings save listeners
        const saveThrillSettingsBtn = document.getElementById('saveThrillSettings');
        const saveGoatedSettingsBtn = document.getElementById('saveGoatedSettings');
        const saveShuffleSettingsBtn = document.getElementById('saveShuffleSettings');
        if (saveThrillSettingsBtn) saveThrillSettingsBtn.addEventListener('click', () => this.saveLeaderboardSettings('thrill'));
        if (saveGoatedSettingsBtn) saveGoatedSettingsBtn.addEventListener('click', () => this.saveLeaderboardSettings('goated'));
        if (saveShuffleSettingsBtn) saveShuffleSettingsBtn.addEventListener('click', () => this.saveLeaderboardSettings('shuffle'));
        // Save settings on change
        [this.thrillPrizeTotal, this.thrillPlacesPaid, this.thrillEnabled, this.goatedPrizeTotal, this.goatedPlacesPaid, this.goatedEnabled].forEach(el => {
            if (!el) return;
            el.addEventListener('change', () => this.saveSettings());
        });
        // Rebuild editors when placesPaid changes
        if (this.thrillPlacesPaid) this.thrillPlacesPaid.addEventListener('change', () => this.renderPrizeEditor('thrill'));
        if (this.goatedPlacesPaid) this.goatedPlacesPaid.addEventListener('change', () => this.renderPrizeEditor('goated'));
        if (this.shufflePlacesPaid) this.shufflePlacesPaid.addEventListener('change', () => this.renderPrizeEditor('shuffle'));

        // Preset button listeners
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('preset-btn')) {
                const casino = e.target.dataset.casino;
                const preset = e.target.dataset.preset;
                this.applyPreset(casino, preset);
            }
        });

        // News management listeners
        const addNewsBtn = document.getElementById('addNewsItem');
        if (addNewsBtn) addNewsBtn.addEventListener('click', () => this.addNewsItem());

        // Help modal listeners
        const helpBtn = document.getElementById('helpBtn');
        const closeHelpBtn = document.getElementById('closeHelpBtn');
        if (helpBtn) helpBtn.addEventListener('click', () => this.showHelpModal());
        if (closeHelpBtn) closeHelpBtn.addEventListener('click', () => this.hideHelpModal());

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === adminModal) {
                this.hideLoginModal();
            }
            if (e.target === document.getElementById('helpModal')) {
                this.hideHelpModal();
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
        // Initialize news management
        this.initializeNewsManagement();
    }

    hideAdminPanel() {
        const panel = document.getElementById('adminPanel');
        panel.classList.add('hidden');
    }

    showHelpModal() {
        const modal = document.getElementById('helpModal');
        modal.classList.remove('hidden');
    }

    hideHelpModal() {
        const modal = document.getElementById('helpModal');
        modal.classList.add('hidden');
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
        if (this.shufflePrizeTotal) this.shufflePrizeTotal.value = config.settings?.shuffle?.prizeTotal ?? 2000;
        if (this.shufflePlacesPaid) this.shufflePlacesPaid.value = config.settings?.shuffle?.placesPaid ?? 3;
        if (this.shuffleEnabled) this.shuffleEnabled.checked = config.settings?.shuffle?.enabled ?? true;
        // Render editors with any existing custom prizes
        this.renderPrizeEditor('thrill');
        this.renderPrizeEditor('goated');
        this.renderPrizeEditor('shuffle');
    }

    saveApiConfiguration() {
        const config = {
            thrillApiUrl: document.getElementById('thrillApiUrl').value,
            goatedApiUrl: document.getElementById('goatedApiUrl').value,
            shuffleApiUrl: document.getElementById('shuffleApiUrl').value,
            apiKey: document.getElementById('apiKey').value
        };

        this.configManager.saveApiConfig(config);
        
        // Update leaderboard with new config
        if (leaderboardManager) {
            leaderboardManager.updateApiConfig(config);
            // Refresh leaderboards with new config
            leaderboardManager.updateLeaderboard('thrill');
            leaderboardManager.updateLeaderboard('goated');
            leaderboardManager.updateLeaderboard('shuffle');
        }

        alert('API configuration saved and leaderboards updated!');
    }

    saveSettings() {
        const config = this.configManager.getApiConfig();
        const thrillCustom = this.collectCustomPrizes('thrill');
        const goatedCustom = this.collectCustomPrizes('goated');
        const shuffleCustom = this.collectCustomPrizes('shuffle');
        config.settings = {
            thrill: {
                enabled: this.thrillEnabled?.checked ?? true,
                prizeTotal: Number(this.thrillPrizeTotal?.value ?? 5000),
                placesPaid: Number(this.thrillPlacesPaid?.value ?? 3),
                customPrizes: thrillCustom
            },
            goated: {
                enabled: this.goatedEnabled?.checked ?? true,
                prizeTotal: Number(this.goatedPrizeTotal?.value ?? 1000),
                placesPaid: Number(this.goatedPlacesPaid?.value ?? 3),
                customPrizes: goatedCustom
            },
            shuffle: {
                enabled: this.shuffleEnabled?.checked ?? true,
                prizeTotal: Number(this.shufflePrizeTotal?.value ?? 2000),
                placesPaid: Number(this.shufflePlacesPaid?.value ?? 3),
                customPrizes: shuffleCustom
            }
        };
        this.configManager.saveApiConfig(config);
        if (leaderboardManager) {
            leaderboardManager.applySettings(config.settings);
            leaderboardManager.updateLeaderboard('thrill');
            leaderboardManager.updateLeaderboard('goated');
            leaderboardManager.updateLeaderboard('shuffle');
        }
    }

    saveLeaderboardSettings(casino) {
        const config = this.configManager.getApiConfig();
        const customPrizes = this.collectCustomPrizes(casino);
        
        // Get the specific values for this casino
        let prizeTotal, placesPaid, enabled;
        if (casino === 'thrill') {
            prizeTotal = Number(this.thrillPrizeTotal?.value ?? 5000);
            placesPaid = Number(this.thrillPlacesPaid?.value ?? 3);
            enabled = this.thrillEnabled?.checked ?? true;
        } else if (casino === 'goated') {
            prizeTotal = Number(this.goatedPrizeTotal?.value ?? 1000);
            placesPaid = Number(this.goatedPlacesPaid?.value ?? 3);
            enabled = this.goatedEnabled?.checked ?? true;
        } else if (casino === 'shuffle') {
            prizeTotal = Number(this.shufflePrizeTotal?.value ?? 2000);
            placesPaid = Number(this.shufflePlacesPaid?.value ?? 3);
            enabled = this.shuffleEnabled?.checked ?? true;
        }

        // Update only this casino's settings
        if (!config.settings) config.settings = {};
        config.settings[casino] = {
            enabled: enabled,
            prizeTotal: prizeTotal,
            placesPaid: placesPaid,
            customPrizes: customPrizes
        };

        this.configManager.saveApiConfig(config);
        if (leaderboardManager) {
            leaderboardManager.applySettings(config.settings);
            leaderboardManager.updateLeaderboard(casino);
        }

        alert(`${casino.charAt(0).toUpperCase() + casino.slice(1)} settings saved successfully!`);
    }

    renderPrizeEditor(casino) {
        const config = this.configManager.getApiConfig();
        let places;
        let container;
        
        if (casino === 'thrill') {
            places = Number(this.thrillPlacesPaid?.value || 0);
            container = this.thrillPrizeEditor;
        } else if (casino === 'goated') {
            places = Number(this.goatedPlacesPaid?.value || 0);
            container = this.goatedPrizeEditor;
        } else if (casino === 'shuffle') {
            places = Number(this.shufflePlacesPaid?.value || 0);
            container = this.shufflePrizeEditor;
        }
        
        if (!container || !places) return;
        const existing = (config.settings?.[casino]?.customPrizes || []).slice(0, places);
        const html = Array.from({ length: places }).map((_, idx) => {
            const val = existing[idx] ?? '';
            return `<div class="prize-input"><label>#${idx+1}</label><input type="number" class="prize-${casino}" data-rank="${idx+1}" placeholder="$" min="0" step="50" value="${val}"></div>`;
        }).join('');
        container.innerHTML = html;
        // Save on input change
        container.querySelectorAll(`.prize-${casino}`).forEach(input => {
            input.addEventListener('change', () => this.saveSettings());
        });
    }

    collectCustomPrizes(casino) {
        let container;
        if (casino === 'thrill') {
            container = this.thrillPrizeEditor;
        } else if (casino === 'goated') {
            container = this.goatedPrizeEditor;
        } else if (casino === 'shuffle') {
            container = this.shufflePrizeEditor;
        }
        
        if (!container) return [];
        const inputs = Array.from(container.querySelectorAll(`.prize-${casino}`));
        const values = inputs
            .map(input => {
                const raw = String(input.value || '').trim();
                if (raw === '') return 0; // treat blank as no custom value
                const n = Number(raw);
                return isNaN(n) ? 0 : n;
            })
            .filter(v => v > 0);
        return values;
    }

    applyPreset(casino, preset) {
        const total = Number((casino === 'thrill' ? this.thrillPrizeTotal?.value : this.goatedPrizeTotal?.value) || 0);
        const places = Number((casino === 'thrill' ? this.thrillPlacesPaid?.value : this.goatedPlacesPaid?.value) || 0);
        if (!total || !places) return;

        let distribution = [];
        switch (preset) {
            case 'even':
                const even = Math.floor(total / places);
                distribution = Array(places).fill(even);
                break;
            case 'winner':
                distribution = [total, ...Array(places - 1).fill(0)];
                break;
            case '70-30':
                if (places >= 2) {
                    const first = Math.floor(total * 0.7);
                    const second = total - first;
                    distribution = [first, second, ...Array(places - 2).fill(0)];
                }
                break;
            case '50-30-20':
                if (places >= 3) {
                    const first = Math.floor(total * 0.5);
                    const second = Math.floor(total * 0.3);
                    const third = total - first - second;
                    distribution = [first, second, third, ...Array(places - 3).fill(0)];
                }
                break;
            case '40-30-20-10':
                if (places >= 4) {
                    const first = Math.floor(total * 0.4);
                    const second = Math.floor(total * 0.3);
                    const third = Math.floor(total * 0.2);
                    const fourth = total - first - second - third;
                    distribution = [first, second, third, fourth, ...Array(places - 4).fill(0)];
                }
                break;
            case '35-25-20-10-10':
                if (places >= 5) {
                    const first = Math.floor(total * 0.35);
                    const second = Math.floor(total * 0.25);
                    const third = Math.floor(total * 0.2);
                    const fourth = Math.floor(total * 0.1);
                    const fifth = total - first - second - third - fourth;
                    distribution = [first, second, third, fourth, fifth, ...Array(places - 5).fill(0)];
                }
                break;
            case 'clear':
                distribution = Array(places).fill('');
                break;
            default:
                return;
        }

        // Apply to inputs
        const container = casino === 'thrill' ? this.thrillPrizeEditor : this.goatedPrizeEditor;
        if (!container) return;
        const inputs = container.querySelectorAll(`.prize-${casino}`);
        inputs.forEach((input, idx) => {
            input.value = distribution[idx] || '';
        });

        // Save settings
        this.saveSettings();
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
        
        // Update the leaderboard with new date range
        if (leaderboardManager) {
            leaderboardManager.updateLeaderboard(casino);
        }
        
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
        
        // Update all leaderboards with new date ranges
        if (leaderboardManager) {
            leaderboardManager.updateLeaderboard('thrill');
            leaderboardManager.updateLeaderboard('goated');
            leaderboardManager.updateLeaderboard('shuffle');
        }
        
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

    // News Management Methods
    addNewsItem() {
        const title = document.getElementById('newsTitle').value.trim();
        const content = document.getElementById('newsContent').value.trim();
        const source = document.getElementById('newsSource').value;
        const handle = document.getElementById('newsHandle').value.trim();
        const url = document.getElementById('newsUrl').value.trim();
        const embed = document.getElementById('newsEmbed').value.trim();
        const date = document.getElementById('newsDate').value;

        if (!content) {
            alert('Please enter news content.');
            return;
        }

        if (!handle) {
            alert('Please enter a source/handle name.');
            return;
        }

        if (!date) {
            alert('Please select a date.');
            return;
        }

        const newsItem = {
            id: Date.now().toString(),
            title: title || null,
            content: content,
            source: source,
            handle: handle,
            url: url || null,
            embed: embed || null,
            date: date,
            createdAt: new Date().toISOString()
        };

        this.saveNewsItem(newsItem);
        this.clearNewsForm();
        this.loadNewsItems();
        alert('News item added successfully!');
    }

    saveNewsItem(newsItem) {
        const newsItems = this.getNewsItems();
        newsItems.unshift(newsItem); // Add to beginning of array
        localStorage.setItem('newsItems', JSON.stringify(newsItems));
    }

    getNewsItems() {
        return JSON.parse(localStorage.getItem('newsItems') || '[]');
    }

    loadNewsItems() {
        const newsItems = this.getNewsItems();
        const container = document.getElementById('newsItemsList');
        if (!container) return;

        container.innerHTML = '';

        if (newsItems.length === 0) {
            container.innerHTML = '<p style="color: var(--pp-text-dim); text-align: center; padding: 20px;">No news items yet. Add your first news item above.</p>';
            return;
        }

        newsItems.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'news-item-admin';
            itemDiv.innerHTML = `
                <div class="news-item-content">
                    <div class="news-item-title">${item.title || 'Social Post'}</div>
                    <div class="news-item-meta">${item.handle} • ${new Date(item.date).toLocaleDateString()}</div>
                </div>
                <div class="news-item-actions">
                    <button class="btn-small btn-danger" onclick="adminSystem.deleteNewsItem('${item.id}')">Delete</button>
                </div>
            `;
            container.appendChild(itemDiv);
        });
    }

    deleteNewsItem(id) {
        if (!confirm('Are you sure you want to delete this news item?')) return;

        const newsItems = this.getNewsItems();
        const filteredItems = newsItems.filter(item => item.id !== id);
        localStorage.setItem('newsItems', JSON.stringify(filteredItems));
        this.loadNewsItems();
        alert('News item deleted successfully!');
    }

    clearNewsForm() {
        document.getElementById('newsTitle').value = '';
        document.getElementById('newsContent').value = '';
        document.getElementById('newsSource').value = 'x';
        document.getElementById('newsHandle').value = '';
        document.getElementById('newsUrl').value = '';
        document.getElementById('newsEmbed').value = '';
        document.getElementById('newsDate').value = '';
    }

    // Initialize news management when admin panel loads
    initializeNewsManagement() {
        this.loadNewsItems();
        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('newsDate').value = today;
    }
}

// Leaderboard Management
class LeaderboardManager {
    constructor() {
        this.currentCasino = 'goated';
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
            goated: config.goatedApiUrl || 'https://api.goated.com/leaderboard',
            shuffle: config.shuffleApiUrl || 'https://api.shuffle.com/leaderboard'
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
        const settings = this.settings?.[casino] || { prizeTotal: casino === 'thrill' ? 5000 : 1000, placesPaid: 3, customPrizes: [] };
        const lastUpdated = data.lastUpdated || new Date().toLocaleTimeString();
        // Compute prize: prefer customPrizes if provided and valid; otherwise split evenly
        const custom = Array.isArray(settings.customPrizes) ? settings.customPrizes : [];
        const hasCustom = custom.length > 0;
        const evenPrize = settings.placesPaid > 0 ? Math.floor((settings.prizeTotal || 0) / settings.placesPaid) : 0;
        const prizeForRank = (rank) => {
            if (rank <= settings.placesPaid) {
                const amount = hasCustom && custom[rank - 1] ? custom[rank - 1] : evenPrize;
                return amount > 0 ? `$${Number(amount).toLocaleString()}` : '—';
            }
            return '—';
        };
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
    const preferGoated = settings?.goated?.enabled !== false;
    const initial = preferGoated ? 'goated' : 'thrill';
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

// News Management for Public Display
function loadNewsForDisplay() {
    const newsItems = JSON.parse(localStorage.getItem('newsItems') || '[]');
    const container = document.getElementById('newsGrid');

    if (!container) return;

    // If no custom news items, show default news
    if (newsItems.length === 0) {
        container.innerHTML = `
            <article class="news-card">
                <div class="news-header">
                    <div class="news-source">
                        <span class="news-icon">𝕏</span>
                        <span class="news-handle">@ShuffleUSA</span>
                    </div>
                    <time class="news-date">Sep 15, 2025</time>
                </div>
                <div class="news-content">
                    <p>The wait's over… we're officially live! 🇺🇸</p>
                    <p>Try your luck now at <a href="http://shuffle.us" target="_blank" rel="noopener">shuffle.us</a></p>
                </div>
            </article>

            <article class="news-card">
                <div class="news-header">
                    <div class="news-source">
                        <span class="news-icon">𝕏</span>
                        <span class="news-handle">@Goated</span>
                    </div>
                    <time class="news-date">Sep 15, 2025</time>
                </div>
                <div class="news-content">
                    <p>We're excited to officially announce the TGE of $GOATED! 🔥</p>
                    <p>📅 Presale begins at 16:00 UTC on Sep 25th, 2025</p>
                </div>
            </article>

            <article class="news-card">
                <div class="news-header">
                    <div class="news-source">
                        <span class="news-icon">📰</span>
                        <span class="news-handle">GamingToday.com</span>
                    </div>
                    <time class="news-date">Sep 4, 2025</time>
                </div>
                <div class="news-content">
                    <h4>Pragmatic Play pulls out of US sweepstakes casinos amid lawsuits and regulatory shifts</h4>
                    <p>Industry-leading game provider Pragmatic Play has announced it will cease operations with US-based sweepstakes casinos following multiple lawsuits and changing regulatory landscape.</p>
                    <a href="https://gamingtoday.com" target="_blank" rel="noopener" class="news-link">Read full article →</a>
                </div>
            </article>
        `;
        return;
    }

    // Display custom news items
    container.innerHTML = '';
    newsItems.slice(0, 6).forEach(item => { // Show up to 6 items
        const article = document.createElement('article');
        article.className = 'news-card';

        const icon = item.source === 'x' ? '𝕏' : item.source === 'news' ? '📰' : '📢';

        article.innerHTML = `
            <div class="news-header">
                <div class="news-source">
                    <span class="news-icon">${icon}</span>
                    <span class="news-handle">${item.handle}</span>
                </div>
                <time class="news-date">${new Date(item.date).toLocaleDateString()}</time>
            </div>
            <div class="news-content">
                ${item.title ? `<h4>${item.title}</h4>` : ''}
                <p>${item.content.replace(/\n/g, '</p><p>')}</p>
                ${item.embed ? `<div class="news-embed">${getEmbedContent(item.embed)}</div>` : ''}
                ${item.url ? `<a href="${item.url}" target="_blank" rel="noopener" class="news-link">${item.source === 'x' ? 'View Post →' : 'Read More →'}</a>` : ''}
            </div>
        `;

        container.appendChild(article);
    });
}

// Function to handle different types of embed content
function getEmbedContent(embedUrl) {
    if (!embedUrl) return '';

    // Handle YouTube embeds
    if (embedUrl.includes('youtube.com') || embedUrl.includes('youtu.be')) {
        const videoId = extractYouTubeId(embedUrl);
        if (videoId) {
            return `<iframe width="100%" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
        }
    }

    // Handle Twitter/X embeds
    if (embedUrl.includes('twitter.com') || embedUrl.includes('x.com')) {
        const tweetId = extractTweetId(embedUrl);
        if (tweetId) {
            return `<blockquote class="twitter-tweet"><a href="${embedUrl}"></a></blockquote><script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>`;
        }
    }

    // Handle direct iframe embeds (like from other platforms)
    if (embedUrl.includes('<iframe') || embedUrl.includes('<blockquote')) {
        return embedUrl;
    }

    // For other URLs, create a simple embed container
    return `<div class="embed-container"><a href="${embedUrl}" target="_blank" rel="noopener">🔗 ${embedUrl}</a></div>`;
}

// Helper function to extract YouTube video ID
function extractYouTubeId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// Helper function to extract Twitter/X tweet ID
function extractTweetId(url) {
    const regExp = /\/status\/(\d+)/;
    const match = url.match(regExp);
    return match ? match[1] : null;
}

// Initialize news display when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadNewsForDisplay();
});

// Add click tracking to all affiliate links
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('a[href*="shuffle.com"], a[href*="thrill.com"], a[href*="goated.com"]').forEach(link => {
        link.addEventListener('click', function() {
            trackAffiliateClick(this.href);
        });
    });
});