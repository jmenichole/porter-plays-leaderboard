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
                thrill: { enabled: true, prizeTotal: 5000, placesPaid: 10, customPrizes: [2000, 1000, 750, 500, 300, 200, 150, 75, 50, 25] },
                goated: { enabled: true, prizeTotal: 1000, placesPaid: 10, customPrizes: [500, 200, 100, 70, 50, 30, 20, 5, 10, 5] }
            }
        };
        // Migrate old configs without settings
        if (!base.settings) {
            base.settings = {
                thrill: { enabled: true, prizeTotal: 5000, placesPaid: 10, customPrizes: [2000, 1000, 750, 500, 300, 200, 150, 75, 50, 25] },
                goated: { enabled: true, prizeTotal: 1000, placesPaid: 10, customPrizes: [500, 200, 100, 70, 50, 30, 20, 5, 10, 5] }
            };
        }
        // Ensure Goated has default prize distribution if missing
        if (!base.settings.goated || !base.settings.goated.customPrizes || base.settings.goated.customPrizes.length === 0) {
            base.settings.goated = { 
                enabled: true, 
                prizeTotal: 1000, 
                placesPaid: 10, 
                customPrizes: [500, 200, 100, 70, 50, 30, 20, 5, 10, 5] 
            };
        }
        // Ensure Thrill has default prize distribution if missing
        if (!base.settings.thrill || !base.settings.thrill.customPrizes || base.settings.thrill.customPrizes.length === 0) {
            base.settings.thrill = { 
                enabled: true, 
                prizeTotal: 5000, 
                placesPaid: 10, 
                customPrizes: [2000, 1000, 750, 500, 300, 200, 150, 75, 50, 25] 
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
        if (saveAllDatesBtn) saveAllDatesBtn.addEventListener('click', () => this.saveAllLeaderboardDates());
        if (resetToDefaultsBtn) resetToDefaultsBtn.addEventListener('click', () => this.resetToDefaultPeriods());

        // Individual settings save listeners
        const saveThrillSettingsBtn = document.getElementById('saveThrillSettings');
        const saveGoatedSettingsBtn = document.getElementById('saveGoatedSettings');
        if (saveThrillSettingsBtn) saveThrillSettingsBtn.addEventListener('click', () => this.saveLeaderboardSettings('thrill'));
        if (saveGoatedSettingsBtn) saveGoatedSettingsBtn.addEventListener('click', () => this.saveLeaderboardSettings('goated'));
        // Save settings on change
        [this.thrillPrizeTotal, this.thrillPlacesPaid, this.thrillEnabled, this.goatedPrizeTotal, this.goatedPlacesPaid, this.goatedEnabled].forEach(el => {
            if (!el) return;
            el.addEventListener('change', () => this.saveSettings());
        });
        // Rebuild editors when placesPaid changes
        if (this.thrillPlacesPaid) this.thrillPlacesPaid.addEventListener('change', () => this.renderPrizeEditor('thrill'));
        if (this.goatedPlacesPaid) this.goatedPlacesPaid.addEventListener('change', () => this.renderPrizeEditor('goated'));
        // Add listeners for Prize Total changes to update prize editor
        if (this.thrillPrizeTotal) this.thrillPrizeTotal.addEventListener('change', () => this.updateEvenDistributionIfNeeded('thrill'));
        if (this.goatedPrizeTotal) this.goatedPrizeTotal.addEventListener('change', () => this.updateEvenDistributionIfNeeded('goated'));

        // Preset button listeners
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('preset-btn')) {
                const casino = e.target.dataset.casino;
                const preset = e.target.dataset.preset;
                this.applyPreset(casino, preset);
            }
        });

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
            if (e.target === document.getElementById('adminPanel')) {
                this.hideAdminPanel();
            }
        });

        // Close modals with escape key
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (!document.getElementById('adminModal').classList.contains('hidden')) {
                    this.hideLoginModal();
                }
                if (!document.getElementById('helpModal').classList.contains('hidden')) {
                    this.hideHelpModal();
                }
                if (!document.getElementById('adminPanel').classList.contains('hidden')) {
                    this.hideAdminPanel();
                }
            }
        });
    }

    showLoginModal() {
        const modal = document.getElementById('adminModal');
        modal.style.display = 'block';
        // Hide chat bubble when admin login modal is open
        const chatBubble = document.getElementById('chatBubble');
        if (chatBubble) {
            chatBubble.classList.add('admin-open');
        }
    }

    hideLoginModal() {
        const modal = document.getElementById('adminModal');
        modal.style.display = 'none';
        document.getElementById('adminPassword').value = '';
        // Show chat bubble when admin login modal is closed (if admin panel is not open)
        const adminPanel = document.getElementById('adminPanel');
        const chatBubble = document.getElementById('chatBubble');
        if (chatBubble && adminPanel && adminPanel.classList.contains('hidden')) {
            chatBubble.classList.remove('admin-open');
        }
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
        // Hide chat bubble when admin panel is open
        const chatBubble = document.getElementById('chatBubble');
        if (chatBubble) {
            chatBubble.classList.add('admin-open');
        }
    }

    hideAdminPanel() {
        const panel = document.getElementById('adminPanel');
        panel.classList.add('hidden');
        // Show chat bubble when admin panel is closed
        const chatBubble = document.getElementById('chatBubble');
        if (chatBubble) {
            chatBubble.classList.remove('admin-open');
        }
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
        // Render editors with any existing custom prizes
        this.renderPrizeEditor('thrill');
        this.renderPrizeEditor('goated');
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
        const thrillCustom = this.collectCustomPrizes('thrill');
        const goatedCustom = this.collectCustomPrizes('goated');
        config.settings = {
            thrill: {
                enabled: this.thrillEnabled?.checked ?? true,
                prizeTotal: Number(this.thrillPrizeTotal?.value ?? 5000),
                placesPaid: Number(this.thrillPlacesPaid?.value ?? 10),
                customPrizes: thrillCustom
            },
            goated: {
                enabled: this.goatedEnabled?.checked ?? true,
                prizeTotal: Number(this.goatedPrizeTotal?.value ?? 1000),
                placesPaid: Number(this.goatedPlacesPaid?.value ?? 10),
                customPrizes: goatedCustom
            }
        };
        this.configManager.saveApiConfig(config);
        if (leaderboardManager) {
            leaderboardManager.applySettings(config.settings);
            leaderboardManager.updateLeaderboard('thrill');
            leaderboardManager.updateLeaderboard('goated');
        }
    }

    saveLeaderboardSettings(casino) {
        const config = this.configManager.getApiConfig();
        const customPrizes = this.collectCustomPrizes(casino);
        
        // Get the specific values for this casino
        let prizeTotal, placesPaid, enabled;
        if (casino === 'thrill') {
            prizeTotal = Number(this.thrillPrizeTotal?.value ?? 5000);
            placesPaid = Number(this.thrillPlacesPaid?.value ?? 10);
            enabled = this.thrillEnabled?.checked ?? true;
        } else if (casino === 'goated') {
            prizeTotal = Number(this.goatedPrizeTotal?.value ?? 1000);
            placesPaid = Number(this.goatedPlacesPaid?.value ?? 10);
            enabled = this.goatedEnabled?.checked ?? true;
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
        }
        
        if (!container) return [];
        const inputs = Array.from(container.querySelectorAll(`.prize-${casino}`));
        const values = inputs
            .map(input => {
                const raw = String(input.value || '').trim();
                if (raw === '') return 0; // treat blank as no custom value
                const n = Number(raw);
                return isNaN(n) ? 0 : n;
            });
        
        // Only return custom prizes if at least one is > 0, otherwise return empty array
        return values.some(v => v > 0) ? values : [];
    }

    updateEvenDistributionIfNeeded(casino) {
        // Get current custom prizes
        const customPrizes = this.collectCustomPrizes(casino);
        
        // Only auto-update if there are no custom prizes set
        if (customPrizes.length === 0 || !customPrizes.some(p => p > 0)) {
            // Auto-apply even distribution when Prize Total changes and no custom prizes exist
            this.applyPreset(casino, 'even');
        }
    }

    applyPreset(casino, preset) {
        let total, places;
        if (casino === 'thrill') {
            total = Number(this.thrillPrizeTotal?.value || 0);
            places = Number(this.thrillPlacesPaid?.value || 0);
        } else if (casino === 'goated') {
            total = Number(this.goatedPrizeTotal?.value || 0);
            places = Number(this.goatedPlacesPaid?.value || 0);
        }
        
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
            case 'goated':
                // Goated preset: 500, 200, 100, 70, 50, 30, 20, 5, 10, 5
                const goatedPrizes = [500, 200, 100, 70, 50, 30, 20, 5, 10, 5];
                distribution = Array(places).fill(0);
                for (let i = 0; i < Math.min(places, goatedPrizes.length); i++) {
                    distribution[i] = goatedPrizes[i];
                }
                break;
            case 'clear':
                distribution = Array(places).fill('');
                break;
            default:
                return;
        }

        // Apply to inputs
        let container;
        if (casino === 'thrill') {
            container = this.thrillPrizeEditor;
        } else if (casino === 'goated') {
            container = this.goatedPrizeEditor;
        }
        
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
        
        // If no saved dates exist, set weekly defaults for all leaderboards
        if (Object.keys(savedDates).length === 0) {
            const now = new Date();
            const weeklyStart = this.getLastMonday(now);
            const weeklyEnd = new Date(weeklyStart);
            weeklyEnd.setDate(weeklyEnd.getDate() + 7);
            
            // Set weekly defaults for all leaderboards
            document.getElementById('thrillStartDate').value = this.formatDateForInput(weeklyStart);
            document.getElementById('thrillEndDate').value = this.formatDateForInput(weeklyEnd);
            document.getElementById('goatedStartDate').value = this.formatDateForInput(weeklyStart);
            document.getElementById('goatedEndDate').value = this.formatDateForInput(weeklyEnd);
            return;
        }
        
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

        const casinos = ['thrill', 'goated'];
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
        
        // Set all leaderboards to weekly periods (Monday to Sunday) based on current date
        const now = new Date();
        
        // All leaderboards - Weekly (current week from Monday)
        const weeklyStart = this.getLastMonday(now);
        const weeklyEnd = new Date(weeklyStart);
        weeklyEnd.setDate(weeklyEnd.getDate() + 7);

        // Update form fields - all use weekly periods now
        document.getElementById('thrillStartDate').value = this.formatDateForInput(weeklyStart);
        document.getElementById('thrillEndDate').value = this.formatDateForInput(weeklyEnd);
        document.getElementById('goatedStartDate').value = this.formatDateForInput(weeklyStart);
        document.getElementById('goatedEndDate').value = this.formatDateForInput(weeklyEnd);

        alert('All leaderboards reset to weekly periods. Click "Save All Timeframes" to apply these changes.');
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

    getLastSunday(date) {
        const d = new Date(date);
        const day = d.getDay();
        // If it's Sunday (0), return same day, otherwise go back to previous Sunday
        const diff = day === 0 ? 0 : -day;
        d.setDate(d.getDate() + diff);
        d.setUTCHours(0, 0, 0, 0); // Use UTC for consistent weekly resets at midnight
        return d;
    }

    getCurrentWeekBounds() {
        const now = new Date();
        const weekStart = this.getLastSunday(now);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6); // Saturday
        weekEnd.setUTCHours(23, 59, 59, 999);
        return { start: weekStart, end: weekEnd };
    }

    formatWeekRange(start, end) {
        const options = { month: 'short', day: 'numeric' };
        const startStr = start.toLocaleDateString('en-US', options);
        const endStr = end.toLocaleDateString('en-US', options);
        const year = end.getFullYear();
        return `Week of ${startStr}-${endStr}, ${year}`;
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

    getCountdownTimer() {
        // Calculate time until next Sunday (weekly reset)
        const now = new Date();
        const nextSunday = new Date(now);
        const daysUntilSunday = (7 - now.getDay()) % 7;
        
        if (daysUntilSunday === 0 && now.getHours() < 24) {
            // If it's Sunday but before end of day, reset is today
            nextSunday.setHours(23, 59, 59, 999);
        } else {
            // Otherwise, reset is next Sunday
            nextSunday.setDate(now.getDate() + (daysUntilSunday || 7));
            nextSunday.setHours(23, 59, 59, 999);
        }

        const timeLeft = nextSunday.getTime() - now.getTime();
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) {
            return `${days}d ${hours}h`;
        } else if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else {
            return `${minutes}m`;
        }
    }

    getCurrentLeaderboardPeriodStart() {
        // Calculate the start of the current leaderboard period (Monday morning after last Sunday reset)
        const now = new Date();
        const currentPeriodStart = new Date(now);
        const daysSinceSunday = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
        
        if (daysSinceSunday === 0) {
            // It's Sunday - check if we're before the reset time (end of day)
            if (now.getHours() < 23 || (now.getHours() === 23 && now.getMinutes() < 59)) {
                // Still in current period, so start was last Monday
                currentPeriodStart.setDate(now.getDate() - 6); // Go back 6 days to Monday
            } else {
                // Reset has happened, new period starts now (but we calculate as Monday)
                currentPeriodStart.setDate(now.getDate() + 1); // Tomorrow (Monday)
            }
        } else {
            // Go back to the Monday of this week
            currentPeriodStart.setDate(now.getDate() - daysSinceSunday + 1);
        }
        
        currentPeriodStart.setHours(0, 0, 0, 0); // Set to Monday midnight
        return currentPeriodStart;
    }

    async fetchLeaderboardData(casino) {
        const config = this.configManager.getApiConfig();
        
        try {
            // Use configured API URLs or default to the official casino APIs
            const defaultApiUrls = {
                thrill: 'https://api.thrill.com/leaderboard',
                goated: 'https://api.goated.com/leaderboard'
            };
            
            // Check if user has configured custom API URLs
            const hasCustomApiUrl = casino === 'thrill' 
                ? (config.thrillApiUrl && config.thrillApiUrl.trim() !== '')
                : (config.goatedApiUrl && config.goatedApiUrl.trim() !== '');
            
            const apiUrl = casino === 'thrill' 
                ? (config.thrillApiUrl || defaultApiUrls.thrill)
                : (config.goatedApiUrl || defaultApiUrls.goated);

            // Always try to fetch from API (either configured or default)
            if (apiUrl) {
                // Get current 7-day period boundaries
                const periodStart = this.getCurrentLeaderboardPeriodStart();
                const periodEnd = new Date(periodStart.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days later
                
                // Build API URL with period parameters
                const baseUrl = apiUrl;
                const url = new URL(baseUrl);
                
                // Add period parameters to ensure we get the current 7-day period data
                url.searchParams.set('period_start', periodStart.toISOString());
                url.searchParams.set('period_end', periodEnd.toISOString());
                url.searchParams.set('period_type', 'weekly');
                
                const headers = {};
                // Only add API key if provided
                if (config.apiKey && config.apiKey.trim()) {
                    headers['Authorization'] = `Bearer ${config.apiKey}`;
                }

                console.log(`Fetching ${casino} leaderboard data for period: ${periodStart.toDateString()} to ${periodEnd.toDateString()}`);
                
                const response = await fetch(url.toString(), { 
                    headers,
                    method: 'GET'
                });
                
                if (response.ok) {
                    let data = await response.json();
                    
                    // Validate that we received current period data
                    if (data.period_start) {
                        const apiPeriodStart = new Date(data.period_start);
                        const timeDiff = Math.abs(apiPeriodStart.getTime() - periodStart.getTime());
                        // Allow up to 1 hour difference for timezone/server time variations
                        if (timeDiff > (60 * 60 * 1000)) {
                            console.warn(`API returned data for different period: expected ${periodStart.toISOString()}, got ${data.period_start}`);
                        }
                    }
                    
                    // Anonymize usernames from API data
                    if (data.players) {
                        data.players = data.players.map(player => ({
                            ...player,
                            username: this.anonymizeUsername(player.username)
                        }));
                    }
                    
                    console.log(`Successfully fetched real ${casino} leaderboard data with ${data.players?.length || 0} players`);
                    return { ...data, isMock: false, lastUpdated: new Date().toLocaleTimeString() };
                } else {
                    console.warn(`API request failed with status ${response.status}: ${response.statusText}`);
                }
            }
            
            // Fall back to mock data
            console.log(`Using mock data for ${casino} leaderboard`);
            let mockData = await this.getMockLeaderboardData(casino);
            
            // If user has configured a custom API URL but it failed, don't show as mock/demo
            if (hasCustomApiUrl) {
                mockData.isMock = false;
                mockData.isCustomApiFallback = true;
            }
            
            return mockData;
        } catch (error) {
            console.error(`Error fetching ${casino} leaderboard:`, error);
            console.log(`Falling back to mock data for ${casino}`);
            let mockData = await this.getMockLeaderboardData(casino);
            
            // Check if user has configured custom API URLs
            const hasCustomApiUrl = casino === 'thrill' 
                ? (config.thrillApiUrl && config.thrillApiUrl.trim() !== '')
                : (config.goatedApiUrl && config.goatedApiUrl.trim() !== '');
            
            // If user has configured a custom API URL but it failed, don't show as mock/demo
            if (hasCustomApiUrl) {
                mockData.isMock = false;
                mockData.isCustomApiFallback = true;
            }
            
            return mockData;
        }
    }

    getMockLeaderboardData(casino) {
        // Calculate time-based wager amounts that reset each leaderboard period
        const now = new Date();
        const periodStart = this.getCurrentLeaderboardPeriodStart();
        const timeSincePeriodStart = now.getTime() - periodStart.getTime();
        
        // Calculate progress through the period (0-1, where 1 is end of week)
        const weekDuration = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
        const periodProgress = Math.min(timeSincePeriodStart / weekDuration, 1);
        
        // Calculate which day of the period we're in (0-6)
        const daysSincePeriodStart = Math.floor(timeSincePeriodStart / (24 * 60 * 60 * 1000));
        
        // Generate seed based on period start time for consistent random values within the period
        const periodSeed = Math.floor(periodStart.getTime() / weekDuration);
        
        // Function to generate consistent "random" values based on seed and index
        const seededRandom = (seed, index) => {
            const x = Math.sin(seed * 9999 + index * 7777) * 10000;
            return x - Math.floor(x);
        };
        
        // Enhanced daily variation function
        const getDailyVariationFactor = (dayIndex, playerIndex) => {
            // Create daily seed that changes each day but remains consistent within the day
            const dailySeed = periodSeed + dayIndex * 1000 + Math.floor(now.getHours() / 6) * 100; // Changes every 6 hours
            const dailyRandom = seededRandom(dailySeed, playerIndex);
            // Daily variation between 0.85 and 1.15 (±15%)
            return 0.85 + (dailyRandom * 0.3);
        };
        
        // Generate base wager amounts that grow throughout the period with daily variation
        const generateWagerAmount = (baseAmount, index, progress) => {
            const randomFactor = 0.7 + (seededRandom(periodSeed, index) * 0.6); // 0.7-1.3 multiplier
            
            // Enhanced progress calculation with more realistic growth curve
            // Start at 20%, grow more aggressively in middle days, slow down towards the end
            let progressMultiplier;
            if (progress < 0.3) {
                // First 30% of period: Start slow but with some base activity
                progressMultiplier = 0.2 + (progress / 0.3) * 0.3; // 20% to 50%
            } else if (progress < 0.8) {
                // Middle 50% of period: Aggressive growth 
                progressMultiplier = 0.5 + ((progress - 0.3) / 0.5) * 0.4; // 50% to 90%
            } else {
                // Final 20% of period: Slower growth to 100%
                progressMultiplier = 0.9 + ((progress - 0.8) / 0.2) * 0.1; // 90% to 100%
            }
            
            // Add daily variation
            const dailyVariation = getDailyVariationFactor(daysSincePeriodStart, index);
            
            const finalAmount = Math.floor(baseAmount * randomFactor * progressMultiplier * dailyVariation);
            return finalAmount;
        };

        const thrillBaseAmounts = [125000, 98750, 87300, 76500, 65200, 54800, 43600, 38900, 32100, 28500];
        const goatedBaseAmounts = [156000, 134200, 118800, 102500, 89300, 76700, 65400, 58900, 49600, 42100];
        
        const mockData = {
            thrill: {
                players: [
                    { rank: 1, username: 'P***r2024', wager: `$${generateWagerAmount(thrillBaseAmounts[0], 1, periodProgress).toLocaleString()}`, profit: '+$12,500' },
                    { rank: 2, username: 'V***amer', wager: `$${generateWagerAmount(thrillBaseAmounts[1], 2, periodProgress).toLocaleString()}`, profit: '+$8,900' },
                    { rank: 3, username: 'H***oller', wager: `$${generateWagerAmount(thrillBaseAmounts[2], 3, periodProgress).toLocaleString()}`, profit: '+$7,200' },
                    { rank: 4, username: 'C***oKing', wager: `$${generateWagerAmount(thrillBaseAmounts[3], 4, periodProgress).toLocaleString()}`, profit: '+$5,800' },
                    { rank: 5, username: 'S***aster', wager: `$${generateWagerAmount(thrillBaseAmounts[4], 5, periodProgress).toLocaleString()}`, profit: '+$4,100' },
                    { rank: 6, username: 'B***east', wager: `$${generateWagerAmount(thrillBaseAmounts[5], 6, periodProgress).toLocaleString()}`, profit: '+$3,200' },
                    { rank: 7, username: 'C***haser', wager: `$${generateWagerAmount(thrillBaseAmounts[6], 7, periodProgress).toLocaleString()}`, profit: '+$2,800' },
                    { rank: 8, username: 'R***Dice', wager: `$${generateWagerAmount(thrillBaseAmounts[7], 8, periodProgress).toLocaleString()}`, profit: '+$2,400' },
                    { rank: 9, username: 'L***reak', wager: `$${generateWagerAmount(thrillBaseAmounts[8], 9, periodProgress).toLocaleString()}`, profit: '+$1,900' },
                    { rank: 10, username: 'W***Wars', wager: `$${generateWagerAmount(thrillBaseAmounts[9], 10, periodProgress).toLocaleString()}`, profit: '+$1,500' }
                ],
                lastUpdated: new Date().toLocaleTimeString(),
                isMock: true
            },
            goated: {
                players: [
                    { rank: 1, username: 'G***dGamer', wager: `$${generateWagerAmount(goatedBaseAmounts[0], 1, periodProgress).toLocaleString()}`, profit: '+$15,600' },
                    { rank: 2, username: 'P***rVIP', wager: `$${generateWagerAmount(goatedBaseAmounts[1], 2, periodProgress).toLocaleString()}`, profit: '+$13,400' },
                    { rank: 3, username: 'E***Player', wager: `$${generateWagerAmount(goatedBaseAmounts[2], 3, periodProgress).toLocaleString()}`, profit: '+$11,200' },
                    { rank: 4, username: 'M***Better', wager: `$${generateWagerAmount(goatedBaseAmounts[3], 4, periodProgress).toLocaleString()}`, profit: '+$9,800' },
                    { rank: 5, username: 'P***ambler', wager: `$${generateWagerAmount(goatedBaseAmounts[4], 5, periodProgress).toLocaleString()}`, profit: '+$7,900' },
                    { rank: 6, username: 'H***takes', wager: `$${generateWagerAmount(goatedBaseAmounts[5], 6, periodProgress).toLocaleString()}`, profit: '+$6,500' },
                    { rank: 7, username: 'C***rusher', wager: `$${generateWagerAmount(goatedBaseAmounts[6], 7, periodProgress).toLocaleString()}`, profit: '+$5,200' },
                    { rank: 8, username: 'B***ully', wager: `$${generateWagerAmount(goatedBaseAmounts[7], 8, periodProgress).toLocaleString()}`, profit: '+$4,700' },
                    { rank: 9, username: 'W***izard', wager: `$${generateWagerAmount(goatedBaseAmounts[8], 9, periodProgress).toLocaleString()}`, profit: '+$3,800' },
                    { rank: 10, username: 'S***ensei', wager: `$${generateWagerAmount(goatedBaseAmounts[9], 10, periodProgress).toLocaleString()}`, profit: '+$3,200' }
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
        const hasValidCustom = custom.some(prize => prize > 0);
        const evenPrize = settings.placesPaid > 0 ? Math.floor((settings.prizeTotal || 0) / settings.placesPaid) : 0;
        const prizeForRank = (rank) => {
            if (rank <= settings.placesPaid) {
                const amount = hasValidCustom && custom[rank - 1] ? custom[rank - 1] : evenPrize;
                return amount > 0 ? `$${Number(amount).toLocaleString()}` : '—';
            }
            return '—';
        };
        const liveDot = '<span class="live-dot" aria-hidden="true"></span>';
        const countdownTimer = this.getCountdownTimer();
        
        // Separate top 3 players for podium display
        const topThree = data.players.slice(0, 3);
        const remainingPlayers = data.players.slice(3);
        
        const html = `
            <div class="leaderboard-header">
                <div class="live-indicator">
                    ${liveDot}<span class="live-text">Live</span>
                    <span class="countdown-timer">Resets in ${countdownTimer}</span>
                    ${data.isMock 
                        ? '<span class="data-source mock-data" title="Demo data - Configure API URLs in admin panel for real data">📊 Demo</span>'
                        : '<span class="data-source real-data" title="Live data from API">🔥 Live</span>'}
                </div>
                <h3>Top Players</h3>
                <p class="last-updated">Last updated: ${lastUpdated}</p>
            </div>
            ${topThree.length >= 3 ? `
            <div class="podium-container">
                <div class="podium-player podium-second">
                    <div class="podium-rank">2</div>
                    <div class="podium-info">
                        <div class="podium-username">${topThree[1].username}</div>
                        <div class="podium-wager">${topThree[1].wager}</div>
                        <div class="podium-prize">${prizeForRank(2)}</div>
                    </div>
                </div>
                <div class="podium-player podium-first">
                    <div class="podium-rank">1</div>
                    <div class="podium-info">
                        <div class="podium-username">${topThree[0].username}</div>
                        <div class="podium-wager">${topThree[0].wager}</div>
                        <div class="podium-prize">${prizeForRank(1)}</div>
                    </div>
                </div>
                <div class="podium-player podium-third">
                    <div class="podium-rank">3</div>
                    <div class="podium-info">
                        <div class="podium-username">${topThree[2].username}</div>
                        <div class="podium-wager">${topThree[2].wager}</div>
                        <div class="podium-prize">${prizeForRank(3)}</div>
                    </div>
                </div>
            </div>
            ` : ''}
            ${remainingPlayers.length > 0 ? `
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
                    ${remainingPlayers.map(player => `
                        <tr class="fade-in">
                            <td class="leaderboard-rank">#${player.rank}</td>
                            <td class="leaderboard-player">${player.username}</td>
                            <td class="leaderboard-wager">${player.wager}</td>
                            <td class="leaderboard-prize">${prizeForRank(player.rank)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            ` : ''}
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
                .weekly-period {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    background: var(--bg-darker);
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 0.875rem;
                    color: var(--accent-color);
                    font-weight: 600;
                    margin: 4px 0;
                }
                .period-label {
                    font-size: 0.8rem;
                }
                .period-text {
                    font-weight: 500;
                }
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
            },
            shuffle: {
                name: 'Shuffle',
                code: 'playShuffle',
                bonus: 'welcome bonus package',
                features: 'modern casino experience & original games',
                url: 'https://shuffle.com/?r=playShuffle',
                telegramChannels: [
                    { name: 'Shuffle Official', url: 'https://t.me/shufflecom' }
                ],
                porterChannel: 'https://t.me/playshuffle'
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
    
    // Ensure chat bubble is visible with correct dimensions
    const chatBubble = document.getElementById('chatBubble');
    if (chatBubble) {
        // Force correct styles to ensure visibility
        chatBubble.style.width = '60px';
        chatBubble.style.height = '60px';
        chatBubble.style.display = 'flex';
        chatBubble.style.position = 'fixed';
        chatBubble.style.bottom = '2rem';
        chatBubble.style.left = '2rem';
        chatBubble.style.zIndex = '999';
        chatBubble.style.alignItems = 'center';
        chatBubble.style.justifyContent = 'center';
    }
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
    
    if (url.includes('thrill.com')) casino = 'thrill';
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
    
    // Exit early if floating CTA element doesn't exist (it was removed)
    if (!floatingCTA) {
        return;
    }
    
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
    document.querySelectorAll('a[href*="thrill.com"], a[href*="goated.com"]').forEach(link => {
        link.addEventListener('click', function() {
            trackAffiliateClick(this.href);
        });
    });
});