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
            apiKey: '',
            settings: {
                thrill: { enabled: true, prizeTotal: 5000, placesPaid: 10, customPrizes: [2000, 1000, 750, 500, 300, 200, 150, 75, 50, 25] },
                goated: { enabled: true, prizeTotal: 1000, placesPaid: 10, customPrizes: [500, 200, 100, 70, 50, 30, 20, 15, 10, 5] }
            }
        };
        // Migrate old configs without settings
        if (!base.settings) {
            base.settings = {
                thrill: { enabled: true, prizeTotal: 5000, placesPaid: 10, customPrizes: [2000, 1000, 750, 500, 300, 200, 150, 75, 50, 25] },
                goated: { enabled: true, prizeTotal: 1000, placesPaid: 10, customPrizes: [500, 200, 100, 70, 50, 30, 20, 15, 10, 5] }
            };
        }
        // Ensure Goated has default prize distribution if missing
        if (!base.settings.goated || !base.settings.goated.customPrizes || base.settings.goated.customPrizes.length === 0) {
            base.settings.goated = { 
                enabled: true, 
                prizeTotal: 1000, 
                placesPaid: 10, 
                customPrizes: [500, 200, 100, 70, 50, 30, 20, 15, 10, 5] 
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
        this.updateInterval = 3600000; // 1 hour (3600000 ms) for more reliable updates
        this.isLoading = false;
        this.configManager = new ConfigManager();
        this.settings = this.configManager.getApiConfig().settings;
        this.lastSuccessfulUpdate = null;
        this.errorCount = 0;
        this.maxErrors = 3; // After 3 consecutive errors, increase interval
    }

    updateApiConfig(config) {
        this.configManager.saveApiConfig(config);
        // Reload the config to ensure the configManager has the latest data
        this.configManager.apiConfig = this.configManager.loadApiConfig();
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
        
        // Check if user has configured custom API URLs
        const hasCustomApiUrl = casino === 'thrill' 
            ? (config.thrillApiUrl && config.thrillApiUrl.trim() !== '')
            : true; // Goated always has API URL hardcoded
            
        const defaultApiUrls = {
            thrill: 'https://api.thrill.com/leaderboard',
            goated: 'https://apis.goated.com/user/affiliate/referral-leaderboard/UCW47GH'
        };
        
        const apiUrl = casino === 'thrill' 
            ? (config.thrillApiUrl || defaultApiUrls.thrill)
            : defaultApiUrls.goated; // Always use hardcoded URL for goated

        // If no API URL is available, throw error immediately
        if (!apiUrl) {
            throw new Error(`No API URL configured for ${casino} leaderboard`);
        }

        // Get current 7-day period boundaries
        const periodStart = this.getCurrentLeaderboardPeriodStart();
        const periodEnd = new Date(periodStart.getTime() + (7 * 24 * 60 * 60 * 1000));
        
        // Validate and build API URL with period parameters
        let url;
        try {
            url = new URL(apiUrl);
        } catch (urlError) {
            throw new Error(`Invalid API URL format: ${apiUrl}. Please check the API URL configuration.`);
        }
        
        // Add query parameters for the leaderboard request
        url.searchParams.set('period_start', periodStart.toISOString());
        url.searchParams.set('period_end', periodEnd.toISOString());
        url.searchParams.set('period_type', 'weekly');
        
        // Add additional parameters that some APIs might expect
        url.searchParams.set('format', 'json');
        url.searchParams.set('limit', '50'); // Reasonable limit for leaderboard entries
        
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'Porter-Plays-Leaderboard/1.0'
        };
        
        // Only add API key if provided
        if (config.apiKey && config.apiKey.trim()) {
            headers['Authorization'] = `Bearer ${config.apiKey}`;
        }

        console.log(`Fetching ${casino} leaderboard data for period: ${periodStart.toDateString()} to ${periodEnd.toDateString()}`);
        console.log(`API URL: ${url.toString()}`);
        
        // Attempt API call with retries
        const maxRetries = 3;
        const retryDelay = 2000; // 2 seconds
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`API attempt ${attempt}/${maxRetries} for ${casino}`);
                
                // Create AbortController for proper timeout handling
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 15000); // Increased timeout
                
                let fetchUrl = url.toString();
                let fetchOptions = {
                    method: 'GET',
                    headers,
                    mode: 'cors',
                    credentials: 'omit',
                    cache: 'no-cache',
                    signal: controller.signal
                };
                
                // For Goated API, try different approaches to bypass CORS
                if (casino === 'goated' && attempt > 1) {
                    const corsProxies = [
                        'https://api.allorigins.win/raw?url=',
                        'https://corsproxy.io/?'
                    ];
                    
                    const proxyIndex = attempt - 2; // Start from 0 for attempt 2
                    if (proxyIndex < corsProxies.length) {
                        fetchUrl = corsProxies[proxyIndex] + encodeURIComponent(url.toString());
                        console.log(`Using CORS proxy ${proxyIndex + 1} for attempt ${attempt}: ${fetchUrl}`);
                        
                        // Remove custom headers for proxy requests
                        fetchOptions.headers = {
                            'Accept': 'application/json'
                        };
                    }
                }
                
                const response = await fetch(fetchUrl, fetchOptions);
                
                clearTimeout(timeoutId);
                
                if (response.ok) {
                    // Check if response is actually JSON
                    const contentType = response.headers.get('content-type');
                    if (!contentType || !contentType.includes('application/json')) {
                        console.warn(`API returned non-JSON response. Content-Type: ${contentType}`);
                        throw new Error(`API returned invalid content type: ${contentType || 'unknown'}. Expected JSON.`);
                    }
                    
                    let data;
                    try {
                        data = await response.json();
                    } catch (jsonError) {
                        throw new Error(`Failed to parse API response as JSON: ${jsonError.message}`);
                    }
                    
                    // Enhanced data structure validation
                    if (!data || typeof data !== 'object') {
                        throw new Error('Invalid data structure: API response is not an object');
                    }
                    
                    // Handle Goated API specific format
                    if (casino === 'goated' && data.success && data.data) {
                        // Transform Goated API response to expected format
                        const playersData = Array.isArray(data.data) ? data.data : [];
                        
                        // Sort by this_week wager amount (descending) and assign ranks
                        const sortedPlayers = playersData
                            .filter(player => player.wagered && typeof player.wagered.this_week === 'number')
                            .sort((a, b) => b.wagered.this_week - a.wagered.this_week)
                            .map((player, index) => ({
                                rank: index + 1,
                                username: player.name || 'Anonymous',
                                wager: `$${player.wagered.this_week.toLocaleString()}`,
                                uid: player.uid
                            }));
                        
                        // Create the expected data structure
                        data = {
                            players: sortedPlayers,
                            period_start: periodStart.toISOString(),
                            period_end: periodEnd.toISOString(),
                            total_today: data.today || 0,
                            total_week: data.this_week || 0
                        };
                        
                        console.log(`Transformed Goated API data: ${sortedPlayers.length} players, top wager: ${sortedPlayers[0]?.wager || '$0'}`);
                    } else {
                        // Handle other API formats
                        if (!data.players) {
                            // Check for common alternative field names
                            if (data.leaderboard) {
                                data.players = data.leaderboard;
                            } else if (data.results) {
                                data.players = data.results;
                            } else if (data.data) {
                                data.players = data.data;
                            } else {
                                throw new Error('Invalid data structure: missing players/leaderboard data field');
                            }
                        }
                    }
                    
                    if (!Array.isArray(data.players)) {
                        throw new Error(`Invalid data structure: players field is not an array (got ${typeof data.players})`);
                    }
                    
                    if (data.players.length === 0) {
                        console.warn('API returned empty leaderboard data');
                        // Allow empty data - might be valid for new periods
                    }
                    
                    // Validate that we received current period data
                    if (data.period_start) {
                        const apiPeriodStart = new Date(data.period_start);
                        const timeDiff = Math.abs(apiPeriodStart.getTime() - periodStart.getTime());
                        // Allow up to 1 hour difference for timezone/server time variations
                        if (timeDiff > (60 * 60 * 1000)) {
                            console.warn(`API returned data for different period: expected ${periodStart.toISOString()}, got ${data.period_start}`);
                        }
                    }
                    
                    // Anonymize usernames from API data (only if not already anonymized)
                    data.players = data.players.map(player => ({
                        ...player,
                        username: this.anonymizeUsername(player.username || player.name || 'Anonymous')
                    }));
                    
                    console.log(`Successfully fetched real ${casino} leaderboard data with ${data.players.length} players`);
                    return { ...data, lastUpdated: new Date().toLocaleTimeString() };
                } else {
                    // Handle various HTTP status codes with specific error messages
                    let errorMessage;
                    switch (response.status) {
                        case 400:
                            errorMessage = `Bad Request (400): Invalid request parameters. Check API URL parameters.`;
                            throw new Error(`CONFIG_ERROR:${response.status}:${errorMessage}`);
                        case 401:
                            errorMessage = `Unauthorized (401): Invalid or missing API key.`;
                            throw new Error(`API_KEY_ERROR:${response.status}:${errorMessage}`);
                        case 403:
                            errorMessage = `Forbidden (403): Access denied. Check API key permissions.`;
                            throw new Error(`API_KEY_ERROR:${response.status}:${errorMessage}`);
                        case 404:
                            errorMessage = `Not Found (404): API endpoint does not exist.`;
                            throw new Error(`CONFIG_ERROR:${response.status}:${errorMessage}`);
                        case 429:
                            errorMessage = `Too Many Requests (429): Rate limit exceeded. Wait and retry.`;
                            throw new Error(`RATE_LIMIT_ERROR:${response.status}:${errorMessage}`);
                        case 500:
                            errorMessage = `Internal Server Error (500): API server error.`;
                            throw new Error(`SERVER_ERROR:${response.status}:${errorMessage}`);
                        case 502:
                            errorMessage = `Bad Gateway (502): API server unavailable.`;
                            throw new Error(`SERVER_ERROR:${response.status}:${errorMessage}`);
                        case 503:
                            errorMessage = `Service Unavailable (503): API temporarily down.`;
                            throw new Error(`SERVER_ERROR:${response.status}:${errorMessage}`);
                        case 504:
                            errorMessage = `Gateway Timeout (504): API server timeout.`;
                            throw new Error(`SERVER_ERROR:${response.status}:${errorMessage}`);
                        default:
                            if (response.status >= 500) {
                                errorMessage = `Server Error (${response.status}): ${response.statusText}`;
                                throw new Error(`SERVER_ERROR:${response.status}:${errorMessage}`);
                            } else {
                                errorMessage = `Client Error (${response.status}): ${response.statusText}`;
                                throw new Error(`CONFIG_ERROR:${response.status}:${errorMessage}`);
                            }
                    }
                }
            } catch (error) {
                console.error(`API attempt ${attempt} failed for ${casino}:`, error);
                
                // Enhanced error classification
                let errorType = 'UNKNOWN_ERROR';
                if (error.name === 'AbortError') {
                    errorType = 'TIMEOUT_ERROR';
                    error.message = 'Request timed out after 10 seconds';
                } else if (error.message.includes('Failed to fetch')) {
                    if (error.message.includes('ERR_BLOCKED_BY_CLIENT')) {
                        errorType = 'BLOCKED_ERROR';
                        error.message = 'Request blocked by browser/firewall (ERR_BLOCKED_BY_CLIENT)';
                    } else if (error.message.includes('ERR_NAME_NOT_RESOLVED')) {
                        errorType = 'DNS_ERROR';
                        error.message = 'DNS resolution failed - domain not found';
                    } else if (error.message.includes('ERR_CONNECTION_REFUSED')) {
                        errorType = 'CONNECTION_REFUSED';
                        error.message = 'Connection refused by server';
                    } else {
                        errorType = 'NETWORK_ERROR';
                        error.message = 'Network connectivity issue or CORS policy blocking request';
                    }
                } else if (error.message.includes('NetworkError')) {
                    errorType = 'NETWORK_ERROR';
                }
                
                // Add error type to error object for better diagnostics
                error.type = errorType;
                
                // If it's a specific error type, don't retry
                if (error.message.includes('API_KEY_ERROR') || error.message.includes('CONFIG_ERROR')) {
                    throw error;
                }
                
                // If this was the last attempt, throw the error
                if (attempt === maxRetries) {
                    throw error;
                }
                
                // Wait before retry
                console.log(`Waiting ${retryDelay}ms before retry...`);
                await new Promise(resolve => setTimeout(resolve, retryDelay));
            }
        }
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
        if (!container) { 
            this.isLoading = false; 
            return; 
        }
        
        try {
            // Check if leaderboard is enabled
            const enabled = this.settings?.[casino]?.enabled !== false;
            if (!enabled) {
                container.innerHTML = `<div class="leaderboard-loading">Leaderboard is currently disabled for ${casino}.</div>`;
                return;
            }

            // For Thrill, check if API URL is configured
            const config = this.configManager.getApiConfig();
            if (casino === 'thrill' && (!config.thrillApiUrl || config.thrillApiUrl.trim() === '')) {
                container.innerHTML = `<div class="leaderboard-empty">
                    <p>Thrill leaderboard is not configured.</p>
                    <p>Please configure the API URL in the admin panel to display leaderboard data.</p>
                </div>`;
                return;
            }
            
            // Show loading state
            container.innerHTML = `<div class="leaderboard-loading">Loading ${casino} leaderboard data...</div>`;
            
            const data = await this.fetchLeaderboardData(casino);
            this.renderLeaderboard(container, data, casino);
            
        } catch (error) {
            console.error(`Error updating ${casino} leaderboard:`, error);
            this.renderError(container, error, casino);
        } finally {
            this.isLoading = false;
        }
    }

    // Render the top snapshot rows in the new pp-table layout
    renderSnapshot(data) {
        const table = document.querySelector('.pp-table');
        if (!table) return;

        // Only populate when we have valid data
        if (!data || !Array.isArray(data.players)) {
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
                    <span class="data-source real-data" title="Live data from API">🔥 Live</span>
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

    getApiUrl(casino) {
        const config = this.configManager.getApiConfig();
        const defaultApiUrls = {
            thrill: 'https://api.thrill.com/leaderboard',
            goated: 'https://apis.goated.com/user/affiliate/referral-leaderboard/UCW47GH'
        };
        
        return casino === 'thrill' 
            ? (config.thrillApiUrl || defaultApiUrls.thrill)
            : defaultApiUrls.goated; // Always use hardcoded URL for goated
    }

    analyzeError(error, apiUrl) {
        const analysis = {
            endpoint: apiUrl || 'Unknown',
            type: error?.type || 'Unknown',
            message: error?.message || 'No error message available',
            showDiagnostics: true,
            suggestion: null
        };

        if (error?.message || error?.type) {
            // Use enhanced error type classification
            switch (error.type) {
                case 'TIMEOUT_ERROR':
                    analysis.type = 'Request Timeout';
                    analysis.suggestion = 'Request timed out after 10 seconds. API may be slow or unreachable. Check API performance or network connectivity.';
                    break;
                case 'BLOCKED_ERROR':
                    analysis.type = 'Request Blocked';
                    analysis.suggestion = 'Request blocked by browser/firewall (ERR_BLOCKED_BY_CLIENT). Check network settings, firewall rules, or try from a different environment.';
                    break;
                case 'DNS_ERROR':
                    analysis.type = 'DNS Resolution Error';
                    analysis.suggestion = 'Domain name could not be resolved. Check if the API domain exists and is accessible from your network.';
                    break;
                case 'CONNECTION_REFUSED':
                    analysis.type = 'Connection Refused';
                    analysis.suggestion = 'Server refused the connection. API may be down, check server status or contact API provider.';
                    break;
                case 'NETWORK_ERROR':
                    analysis.type = 'Network/CORS Error';
                    analysis.suggestion = 'Network connectivity issue or CORS policy blocking the request. Verify API endpoint is accessible and CORS is configured.';
                    break;
                default:
                    // Fallback to message-based analysis
                    if (error.message.includes('Failed to fetch')) {
                        analysis.type = 'Network/CORS Error';
                        if (error.message.includes('ERR_BLOCKED_BY_CLIENT')) {
                            analysis.suggestion = 'API endpoint may be blocked by browser/firewall. Check network settings or try from a different environment.';
                        } else {
                            analysis.suggestion = 'Network connectivity issue or CORS policy blocking the request. Verify API endpoint is accessible and CORS is configured.';
                        }
                    } else if (error.message.includes('timeout')) {
                        analysis.type = 'Timeout Error';
                        analysis.suggestion = 'API response took too long. Check API performance or increase timeout settings.';
                    } else if (error.message.includes('404')) {
                        analysis.type = 'API Endpoint Not Found';
                        analysis.suggestion = 'API endpoint URL may be incorrect. Verify the API URL configuration.';
                    } else if (error.message.includes('500')) {
                        analysis.type = 'Internal Server Error';
                        analysis.suggestion = 'API server is experiencing issues. Contact API provider.';
                    } else if (error.message.includes('403') || error.message.includes('401')) {
                        analysis.type = 'Authentication/Authorization Error';
                        analysis.suggestion = 'API key may be invalid or missing. Check API key configuration.';
                    } else {
                        analysis.type = 'Generic Error';
                    }
                    break;
            }
        }

        // Enhanced logging for developers
        console.group(`🔍 API Error Analysis - ${new Date().toISOString()}`);
        console.log('Endpoint:', analysis.endpoint);
        console.log('Error Type:', analysis.type);
        console.log('Raw Error:', error);
        console.log('Suggestion:', analysis.suggestion);
        console.groupEnd();

        return analysis;
    }

    renderError(container, error, casino) {
        let errorMessage = '';
        let contactInfo = '';
        let diagnosticInfo = '';
        let retryButton = `<button onclick="leaderboardManager.updateLeaderboard('${casino}')" class="btn-primary">Retry</button>`;
        
        // Enhanced error diagnostics
        const apiUrl = this.getApiUrl(casino);
        const errorDetails = this.analyzeError(error, apiUrl);
        
        if (error && error.message) {
            if (error.message.includes('API_KEY_ERROR')) {
                errorMessage = '🔑 Authentication Error: Invalid or missing API key.';
                contactInfo = 'Please contact your administrator to update the API key in the admin panel.';
            } else if (error.message.includes('SERVER_ERROR')) {
                errorMessage = '🔧 Server Error: The API provider is experiencing issues.';
                contactInfo = 'Please contact the API provider or try again later. This is not a configuration issue.';
            } else if (error.message.includes('CONFIG_ERROR')) {
                errorMessage = '⚙️ Configuration Error: Invalid API endpoint or parameters.';
                contactInfo = 'Please contact the developer to review the API configuration settings.';
            } else if (error.message.includes('No API URL configured')) {
                errorMessage = '🚫 No API Configured: No leaderboard data source has been set up.';
                contactInfo = 'Please configure an API URL in the admin panel to display leaderboard data.';
                retryButton = ''; // No retry button for configuration issues
            } else if (error.message.includes('Invalid data structure')) {
                errorMessage = '📊 Data Format Error: API returned invalid data structure.';
                contactInfo = 'Please contact the developer - the API response format may have changed.';
            } else {
                errorMessage = '❌ Connection Error: Unable to reach the leaderboard API.';
                contactInfo = 'Please check your internet connection or contact the developer if the issue persists.';
            }
        } else {
            errorMessage = '❌ Unknown Error: An unexpected error occurred.';
            contactInfo = 'Please contact the developer for assistance.';
        }

        // Add diagnostic information for developers
        if (errorDetails.showDiagnostics) {
            diagnosticInfo = `
                <details class="error-diagnostics">
                    <summary>🔍 Technical Details (for developers)</summary>
                    <div class="diagnostic-info">
                        <p><strong>API Endpoint:</strong> ${errorDetails.endpoint}</p>
                        <p><strong>Error Type:</strong> ${errorDetails.type}</p>
                        <p><strong>Error Message:</strong> ${errorDetails.message}</p>
                        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
                        ${errorDetails.suggestion ? `<p><strong>Suggestion:</strong> ${errorDetails.suggestion}</p>` : ''}
                    </div>
                </details>
            `;
        }

        container.innerHTML = `
            <div class="leaderboard-error">
                <h3>${errorMessage}</h3>
                <p>${contactInfo}</p>
                <div class="error-actions">
                    ${retryButton}
                </div>
                ${diagnosticInfo}
                <small>Last attempt: ${new Date().toLocaleTimeString()}</small>
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
        // Initial update
        this.performScheduledUpdate();
        
        // Set up interval with adaptive error handling
        this.updateIntervalId = setInterval(() => {
            this.performScheduledUpdate();
        }, this.updateInterval);
        
        console.log(`Auto-update started with ${this.updateInterval / 60000} minute intervals`);
    }
    
    async performScheduledUpdate() {
        try {
            // Update both leaderboards
            await Promise.all([
                this.updateLeaderboard('goated'),
                this.updateLeaderboard('thrill')
            ]);
            
            // Reset error count on successful update
            this.errorCount = 0;
            this.lastSuccessfulUpdate = new Date();
            console.log('Scheduled update completed successfully');
            
        } catch (error) {
            console.error('Scheduled update failed:', error);
            this.errorCount++;
            
            // After multiple consecutive errors, reduce update frequency
            if (this.errorCount >= this.maxErrors && this.updateInterval < 7200000) { // Don't exceed 2 hours
                this.updateInterval *= 2; // Double the interval
                console.log(`Increasing update interval to ${this.updateInterval / 60000} minutes due to consecutive errors`);
                
                // Restart interval with new timing
                if (this.updateIntervalId) {
                    clearInterval(this.updateIntervalId);
                    this.updateIntervalId = setInterval(() => {
                        this.performScheduledUpdate();
                    }, this.updateInterval);
                }
            }
        }
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