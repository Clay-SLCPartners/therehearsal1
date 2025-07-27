// Authentication and user management module
const AuthModule = {
    
    // Initialize authentication
    init() {
        this.loadStoredAuth();
        this.setupEventListeners();
    },
    
    // Setup event listeners
    setupEventListeners() {
        const loginBtn = document.getElementById('loginBtn');
        const signupBtn = document.getElementById('signupBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const closeModalBtn = document.getElementById('closeModalBtn');
        const modal = document.getElementById('loginModal');
        
        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.showLoginModal());
        }
        
        if (signupBtn) {
            signupBtn.addEventListener('click', () => this.handleSignup());
        }
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }
        
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => this.hideLoginModal());
        }
        
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideLoginModal();
                }
            });
        }
        
        // Handle form submission
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }
    },
    
    // Load stored authentication data
    loadStoredAuth() {
        try {
            const userData = localStorage.getItem('rehearsalUserData');
            if (userData) {
                const parsedData = JSON.parse(userData);
                appState.user = parsedData;
                this.updateUIForLoggedInUser();
            }
        } catch (error) {
            console.error('Error loading stored auth:', error);
            localStorage.removeItem('rehearsalUserData');
        }
    },
    
    // Show login modal
    showLoginModal() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.style.display = 'flex';
            modal.setAttribute('aria-hidden', 'false');
            
            // Focus on first input
            const firstInput = modal.querySelector('input');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
        }
    },
    
    // Hide login modal
    hideLoginModal() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.style.display = 'none';
            modal.setAttribute('aria-hidden', 'true');
        }
    },
    
    // Handle login
    handleLogin() {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        
        if (!username || !password) {
            this.showAuthError('Please enter both username and password');
            return;
        }
        
        // Create mock authentication
        const userData = {
            id: Date.now(),
            username: username,
            joinDate: new Date().toISOString(),
            rehearsalData: {
                totalSessions: 0,
                favoriteScenarios: [],
                achievements: [],
                stats: {
                    empathy: 5,
                    trust: 5,
                    effectiveness: 5
                }
            },
            preferences: {
                enableNathanAnalysis: true,
                enableCrisisDetection: true,
                enableAnalytics: true
            }
        };
        
        // Store user data
        try {
            localStorage.setItem('rehearsalUserData', JSON.stringify(userData));
            appState.user = userData;
            
            this.updateUIForLoggedInUser();
            this.hideLoginModal();
            this.showAuthSuccess(`Welcome, ${username}! Your rehearsal data is being saved locally.`);
            
        } catch (error) {
            console.error('Error saving user data:', error);
            this.showAuthError('Error saving user data. Please try again.');
        }
    },
    
    // Handle signup
    handleSignup() {
        // For simplicity, signup is the same as login for now
        this.handleLogin();
    },
    
    // Handle logout
    handleLogout() {
        if (confirm('Are you sure you want to log out? Your rehearsal data will remain saved locally.')) {
            appState.user = null;
            localStorage.removeItem('rehearsalUserData');
            this.updateUIForLoggedOutUser();
            this.showAuthSuccess('Successfully logged out. See you next rehearsal!');
        }
    },
    
    // Update UI for logged in user
    updateUIForLoggedInUser() {
        const loginBtn = document.getElementById('loginBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const userDisplay = document.getElementById('userDisplay');
        
        if (loginBtn) loginBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
        
        if (userDisplay && appState.user) {
            userDisplay.style.display = 'inline-block';
            userDisplay.textContent = `👤 ${appState.user.username}`;
        }
        
        // Enable all features
        this.enableAllFeatures();
    },
    
    // Update UI for logged out user
    updateUIForLoggedOutUser() {
        const loginBtn = document.getElementById('loginBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const userDisplay = document.getElementById('userDisplay');
        
        if (loginBtn) loginBtn.style.display = 'inline-block';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (userDisplay) userDisplay.style.display = 'none';
        
        // Limit features for guests
        this.limitGuestFeatures();
    },
    
    // Enable all features for logged in users
    enableAllFeatures() {
        // Remove any guest restrictions
        const restrictedElements = document.querySelectorAll('.guest-restricted');
        restrictedElements.forEach(el => {
            el.classList.remove('guest-restricted');
            el.removeAttribute('disabled');
        });
    },
    
    // Limit features for guest users
    limitGuestFeatures() {
        // Add guest restrictions (if any)
        console.log('Running in guest mode - some features may be limited');
    },
    
    // Show authentication error
    showAuthError(message) {
        const errorDiv = document.getElementById('authError');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                errorDiv.style.display = 'none';
            }, 5000);
        } else {
            alert(`Error: ${message}`);
        }
    },
    
    // Show authentication success
    showAuthSuccess(message) {
        // Create a temporary success message
        const successDiv = document.createElement('div');
        successDiv.className = 'auth-success';
        successDiv.textContent = message;
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 10000;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            animation: slideInRight 0.3s ease-out;
        `;
        
        document.body.appendChild(successDiv);
        
        // Remove after 3 seconds
        setTimeout(() => {
            successDiv.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (successDiv.parentNode) {
                    successDiv.parentNode.removeChild(successDiv);
                }
            }, 300);
        }, 3000);
    },
    
    // Check if user is logged in
    isLoggedIn() {
        return appState.user !== null;
    },
    
    // Get current user
    getCurrentUser() {
        return appState.user;
    },
    
    // Update user rehearsal data
    updateUserProgress(data) {
        if (!this.isLoggedIn()) return;
        
        try {
            // Update rehearsal data
            if (data.scenario) {
                appState.user.rehearsalData.totalSessions++;
                
                // Track favorite scenarios
                const favorites = appState.user.rehearsalData.favoriteScenarios;
                const existing = favorites.find(f => f.scenario === data.scenario);
                
                if (existing) {
                    existing.attempts++;
                } else {
                    favorites.push({
                        scenario: data.scenario,
                        attempts: 1,
                        firstAttempt: new Date().toISOString()
                    });
                }
            }
            
            // Update stats
            if (data.stats) {
                Object.assign(appState.user.rehearsalData.stats, data.stats);
            }
            
            // Save to localStorage
            localStorage.setItem('rehearsalUserData', JSON.stringify(appState.user));
            
        } catch (error) {
            console.error('Error updating user progress:', error);
        }
    },
    
    // Get user statistics
    getUserStats() {
        if (!this.isLoggedIn()) {
            return {
                totalSessions: 0,
                favoriteScenarios: [],
                achievements: []
            };
        }
        
        return appState.user.rehearsalData;
    },
    
    // Export user data
    exportUserData() {
        if (!this.isLoggedIn()) {
            alert('Please log in to export your data.');
            return;
        }
        
        const exportData = {
            username: appState.user.username,
            exportDate: new Date().toISOString(),
            rehearsalData: appState.user.rehearsalData,
            preferences: appState.user.preferences
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `rehearsal-data-${appState.user.username}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showAuthSuccess('User data exported successfully!');
    }
};

// Make globally accessible
window.AuthModule = AuthModule;
window.exportUserData = () => AuthModule.exportUserData();
