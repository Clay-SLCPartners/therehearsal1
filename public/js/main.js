// Main application initialization and orchestration
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎭 The Rehearsal AI - Initializing...');
    
    // Initialize application state
    initializeAppState();
    
    // Initialize all modules
    initializeModules();
    
    // Setup global event listeners
    setupGlobalEventListeners();
    
    // Initialize quick tools functionality
    initializeQuickTools();
    
    // Initialize crisis detection
    initializeCrisisDetection();
    
    // Show initial view
    showInitialView();
    
    console.log('✅ The Rehearsal AI - Ready for rehearsal!');
});

// Initialize application state
function initializeAppState() {
    // Generate unique session ID
    appState.sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    // Reset player stats
    appState.playerStats = {
        empathy: 5,
        trust: 5,
        effectiveness: 5
    };
    
    // Initialize arrays
    appState.conversationHistory = [];
    appState.breakthroughs = [];
    appState.analytics = [];
    
    // Initialize rehearsal attempts tracking
    appState.rehearsalAttempts = {};
    
    // Set default memory percentage
    appState.memoryPercentage = 87;
    
    // Initialize Nathan's notes
    appState.nathanNotes = [
        "This conversation structure mirrors episode 47 of my show, but with less awkward silence.",
        "Notice how the dialogue branches create exactly 1,024 possible outcomes? That's not a coincidence.",
        "In my experience, rehearsing conversations reduces real-world anxiety by approximately 73.4%.",
        "The key insight here is that every conversation is performance art, whether you realize it or not.",
        "I once rehearsed ordering coffee 127 times. This feels more important than that.",
        "Statistical analysis suggests you're developing genuine conversational confidence.",
        "Remember: in real life, there are no do-overs. But here, you can practice until perfect."
    ];
    
    console.log('📊 App state initialized:', appState.sessionId);
}

// Initialize all modules
function initializeModules() {
    console.log('🔧 Initializing modules...');
    
    try {
        // Check if modules are loaded
        console.log('Module availability:');
        console.log('- AuthModule:', typeof AuthModule !== 'undefined' ? '✅' : '❌');
        console.log('- AnalyticsModule:', typeof AnalyticsModule !== 'undefined' ? '✅' : '❌');
        console.log('- ScenariosModule:', typeof ScenariosModule !== 'undefined' ? '✅' : '❌');
        console.log('- ConversationModule:', typeof ConversationModule !== 'undefined' ? '✅' : '❌');
        
        // Initialize authentication first
        if (typeof AuthModule !== 'undefined' && AuthModule.init) {
            AuthModule.init();
            console.log('✅ AuthModule initialized');
        } else {
            console.warn('⚠️ AuthModule not available');
        }
        
        // Initialize analytics and tracking
        if (typeof AnalyticsModule !== 'undefined' && AnalyticsModule.init) {
            AnalyticsModule.init();
            console.log('✅ AnalyticsModule initialized');
        } else {
            console.warn('⚠️ AnalyticsModule not available');
        }
        
        // Initialize scenarios module
        if (typeof ScenariosModule !== 'undefined' && ScenariosModule.init) {
            ScenariosModule.init();
            console.log('✅ ScenariosModule initialized');
        } else {
            console.warn('⚠️ ScenariosModule not available');
        }
        
        console.log('✅ Core modules initialization completed');
        
    } catch (error) {
        console.error('❌ Error initializing modules:', error);
        // Don't show error message to user for non-critical initialization issues
        console.warn('⚠️ Some modules may not be fully functional');
    }
}

// Setup global event listeners
function setupGlobalEventListeners() {
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Window resize
    window.addEventListener('resize', handleWindowResize);
    
    // Handle escape key globally
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            handleEscapeKey();
        }
    });
    
    // Handle focus management
    document.addEventListener('focusin', (e) => {
        // Ensure proper focus management for accessibility
        if (e.target.closest('.modal')) {
            e.target.closest('.modal').setAttribute('aria-hidden', 'false');
        }
    });
    
    // Track user interactions for analytics
    document.addEventListener('click', (e) => {
        // Track clicks for analytics (non-sensitive elements only)
        if (e.target.classList.contains('scenario-card') || 
            e.target.classList.contains('choice-button') ||
            e.target.closest('.scenario-card') ||
            e.target.closest('.choice-button')) {
            
            AnalyticsModule.trackEvent('user_interaction', {
                type: 'click',
                element: e.target.tagName,
                classes: Array.from(e.target.classList),
                timestamp: new Date().toISOString()
            });
        }
    });
}

// Initialize crisis detection system
function initializeCrisisDetection() {
    // Crisis keywords for detection
    const crisisKeywords = [
        'suicide', 'kill myself', 'end it all', 'not worth living',
        'hurt myself', 'self harm', 'cutting', 'overdose',
        'can\'t go on', 'hopeless', 'worthless', 'burden'
    ];
    
    // Setup crisis detection on text inputs
    document.addEventListener('input', (e) => {
        if (e.target.type === 'text' || e.target.tagName === 'TEXTAREA') {
            const text = e.target.value.toLowerCase();
            
            const hasCrisisLanguage = crisisKeywords.some(keyword => 
                text.includes(keyword.toLowerCase())
            );
            
            if (hasCrisisLanguage) {
                showCrisisResources();
            }
        }
    });
    
    // Monitor conversation choices for crisis indicators
    document.addEventListener('choiceMade', (e) => {
        const choice = e.detail.choice.toLowerCase();
        const hasCrisisLanguage = crisisKeywords.some(keyword => 
            choice.includes(keyword)
        );
        
        if (hasCrisisLanguage) {
            showCrisisResources();
        }
    });
}

// Show crisis resources
function showCrisisResources() {
    const banner = document.getElementById('crisisBanner');
    if (banner) {
        banner.style.display = 'block';
        banner.setAttribute('aria-live', 'assertive');
        
        // Log crisis detection for analytics
        AnalyticsModule.trackEvent('crisis_detected', {
            timestamp: new Date().toISOString(),
            source: 'automated_detection'
        });
    }
}

// Handle keyboard shortcuts
function handleKeyboardShortcuts(e) {
    // Ctrl/Cmd + shortcuts
    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
            case 'h':
                e.preventDefault();
                showHelp();
                break;
            case 's':
                e.preventDefault();
                ScenariosModule.showScenarioSelection();
                break;
            case 'r':
                e.preventDefault();
                if (appState.currentScenario) {
                    ConversationModule.tryAgain();
                }
                break;
            case 'e':
                e.preventDefault();
                if (AuthModule.isLoggedIn()) {
                    AuthModule.exportUserData();
                }
                break;
        }
    }
    
    // Number keys for choice selection
    if (e.key >= '1' && e.key <= '9') {
        const choiceIndex = parseInt(e.key) - 1;
        const choices = document.querySelectorAll('.choice-button');
        
        if (choices[choiceIndex]) {
            e.preventDefault();
            choices[choiceIndex].click();
        }
    }
}

// Handle window resize
function handleWindowResize() {
    // Adjust layout for mobile devices
    const isMobile = window.innerWidth < 768;
    document.body.classList.toggle('mobile-layout', isMobile);
    
    // Adjust conversation interface
    const conversationContainer = document.querySelector('.conversation-container');
    if (conversationContainer) {
        conversationContainer.style.height = isMobile ? 
            `${window.innerHeight - 120}px` : 
            'auto';
    }
}

// Handle escape key
function handleEscapeKey() {
    // Close modals
    const openModal = document.querySelector('.modal[style*="display: flex"], .modal[style*="display: block"]');
    if (openModal) {
        openModal.style.display = 'none';
        return;
    }
    
    // Return to scenarios if in conversation
    if (appState.currentScenario) {
        if (confirm('Are you sure you want to exit this conversation and return to scenario selection?')) {
            ScenariosModule.showScenarioSelection();
        }
    }
}

// Show initial view
function showInitialView() {
    // Show the hero section by default
    showHeroSection();
    
    // Hide scenarios section initially
    const scenariosSection = document.querySelector('.scenarios-section');
    const conversationInterface = document.getElementById('conversationInterface');
    
    if (scenariosSection) {
        scenariosSection.style.display = 'none';
    }
    
    if (conversationInterface) {
        conversationInterface.style.display = 'none';
    }
    
    // Check URL parameters for direct scenario loading
    const urlParams = new URLSearchParams(window.location.search);
    const scenarioParam = urlParams.get('scenario');
    
    if (scenarioParam) {
        // Load scenarios first, then select specific scenario
        beginRehearsal().then(() => {
            if (appState.scenarios && appState.scenarios[scenarioParam]) {
                setTimeout(() => {
                    ScenariosModule.selectScenario(scenarioParam);
                }, 1000);
            }
        });
    }
    
    // Show welcome message for first-time users
    if (!localStorage.getItem('rehearsalFirstVisit')) {
        setTimeout(showWelcomeMessage, 2000);
        localStorage.setItem('rehearsalFirstVisit', 'true');
    }
}

// Show welcome message
function showWelcomeMessage() {
    const welcome = document.createElement('div');
    welcome.className = 'welcome-message';
    welcome.innerHTML = `
        <div class="welcome-content">
            <h2>🎭 Welcome to The Rehearsal AI</h2>
            <p>Practice difficult conversations in a safe environment.</p>
            <p>Get insights from Nathan Fielder-style analysis.</p>
            <p>Build confidence for real-world interactions.</p>
            <button onclick="this.parentElement.parentElement.remove()" class="welcome-btn">
                Let's Begin Rehearsing
            </button>
        </div>
    `;
    
    welcome.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.5s ease-out;
    `;
    
    document.body.appendChild(welcome);
}

// Show help
function showHelp() {
    const helpContent = `
🎭 THE REHEARSAL AI - HELP

KEYBOARD SHORTCUTS:
• Ctrl+H: Show this help
• Ctrl+S: Return to scenarios
• Ctrl+R: Retry current scenario
• Ctrl+E: Export user data (if logged in)
• 1-9: Select choice by number
• Escape: Close modals/exit conversation

HOW TO USE:
1. Select a conversation scenario
2. Read the setup and character info
3. Make choices to navigate the conversation
4. Watch your empathy, trust, and effectiveness scores
5. Learn from Nathan's analytical observations

FEATURES:
• Crisis detection and resources
• User progress tracking
• Export conversation data
• Nathan Fielder-style analytics
• Mobile-friendly interface

Need more help? Check the README.md file.
    `;
    
    alert(helpContent);
}

// Show error message
function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #dc3545;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 10000;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    }, 5000);
}

// Show hero section
function showHeroSection() {
    const heroSection = document.querySelector('.hero');
    const scenariosSection = document.querySelector('.scenarios-section');
    const conversationInterface = document.getElementById('conversationInterface');
    
    if (heroSection) {
        heroSection.style.display = 'flex';
    }
    
    if (scenariosSection) {
        scenariosSection.style.display = 'none';
    }
    
    if (conversationInterface) {
        conversationInterface.style.display = 'none';
    }
    
    // Update memory display
    updateMemoryDisplay();
}

// Begin rehearsal - load scenarios and show selection
async function beginRehearsal() {
    console.log('🎭 Beginning rehearsal...');
    
    // Check module availability
    console.log('Module availability check:');
    console.log('- ScenariosModule:', typeof ScenariosModule !== 'undefined' ? '✅ Available' : '❌ Missing');
    console.log('- AnalyticsModule:', typeof AnalyticsModule !== 'undefined' ? '✅ Available' : '❌ Missing');
    console.log('- ConversationModule:', typeof ConversationModule !== 'undefined' ? '✅ Available' : '❌ Missing');
    
    // Hide hero section
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        heroSection.style.display = 'none';
    }
    
    // Show scenarios section
    const scenariosSection = document.querySelector('.scenarios-section');
    if (scenariosSection) {
        scenariosSection.style.display = 'block';
        console.log('✅ Scenarios section made visible');
        // Scroll to scenarios section
        scenariosSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
        console.error('❌ Scenarios section not found!');
    }
    
    // Show loading indicator
    const loadingIndicator = document.getElementById('scenariosLoading');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'block';
        console.log('✅ Loading indicator shown');
    }
    
    // Load scenarios
    try {
        console.log('Loading scenarios...');
        
        // Check if ScenariosModule exists
        if (typeof ScenariosModule === 'undefined') {
            throw new Error('ScenariosModule not found! Make sure scenarios.js is loaded.');
        }
        
        const scenarios = await ScenariosModule.loadScenarios();
        console.log('Scenarios loaded:', scenarios);
        
        if (scenarios && Object.keys(scenarios).length > 0) {
            console.log('✅ Scenarios data valid, rendering...');
            ScenariosModule.renderScenarios(scenarios);
            console.log('✅ Scenarios rendered successfully');
        } else {
            throw new Error('No scenarios were loaded or scenarios object is empty');
        }
        
        // Track analytics (with improved error handling)
        try {
            if (typeof AnalyticsModule !== 'undefined' && AnalyticsModule && typeof AnalyticsModule.trackEvent === 'function') {
                console.log('📊 Tracking analytics event...');
                AnalyticsModule.trackEvent('rehearsal_started', {
                    timestamp: new Date().toISOString(),
                    session_id: appState.sessionId
                });
                console.log('✅ Analytics tracked successfully');
            } else {
                console.warn('⚠️ Analytics module not available - skipping tracking');
            }
        } catch (analyticsError) {
            console.warn('⚠️ Analytics error (non-critical):', analyticsError.message);
        }
        
        return true;
    } catch (error) {
        console.error('❌ Error beginning rehearsal:', error);
        
        // Hide loading indicator
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
        
        // Show error message to user
        const container = document.getElementById('scenarioSelection');
        if (container) {
            container.innerHTML = `
                <div class="error-message" style="text-align: center; padding: 2rem; color: var(--danger-red);">
                    <h3>⚠️ Error Loading Scenarios</h3>
                    <p><strong>Error:</strong> ${error.message}</p>
                    <p style="margin-top: 1rem; font-size: 0.9em; opacity: 0.8;">
                        Check the browser console for more details.
                    </p>
                    <button onclick="location.reload()" class="btn btn-primary" style="margin-top: 1rem;">
                        Reload Page
                    </button>
                </div>
            `;
        }
        
        return false;
    }
}

// Update memory display
function updateMemoryDisplay() {
    const memoryPercentage = document.getElementById('memoryPercentage');
    const memoryFill = document.getElementById('memoryFill');
    
    if (memoryPercentage) {
        memoryPercentage.textContent = appState.memoryPercentage + '%';
    }
    
    if (memoryFill) {
        memoryFill.style.width = appState.memoryPercentage + '%';
    }
}

// Show hero section
function showHeroSection() {
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        heroSection.style.display = 'block';
    }
}

// Global utility functions
window.showHelp = showHelp;
window.showCrisisResources = showCrisisResources;
window.beginRehearsal = beginRehearsal;
window.toggleUserMenu = toggleUserMenu;
window.showLoginModal = () => AuthModule.showLoginModal();
window.hideLoginModal = () => AuthModule.hideLoginModal();
window.handleLogin = (event) => AuthModule.handleLogin(event);
window.loginAsDemo = () => AuthModule.loginAsDemo();
window.closeCrisisBanner = closeCrisisBanner;

// Toggle user menu dropdown
function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

// Close user menu when clicking outside
document.addEventListener('click', function(event) {
    const userMenu = document.querySelector('.user-menu');
    const dropdown = document.getElementById('userDropdown');
    
    if (dropdown && userMenu && !userMenu.contains(event.target)) {
        dropdown.classList.remove('show');
    }
});

// Close crisis banner
function closeCrisisBanner() {
    const banner = document.getElementById('crisisBanner');
    if (banner) {
        banner.classList.remove('show');
    }
}

// Hide bottom crisis banner
function hideBottomCrisisBanner() {
    const banner = document.querySelector('.bottom-crisis-banner');
    if (banner) {
        banner.style.transform = 'translateY(100%)';
        banner.style.opacity = '0';
        setTimeout(() => {
            banner.style.display = 'none';
        }, 300);
    }
}

// Initialize Quick Tools functionality
function initializeQuickTools() {
    console.log('Initializing Quick Tools...');
    
    // Add click tracking for tool links
    const toolLinks = document.querySelectorAll('.tool-link');
    toolLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Don't prevent default - let the link work normally
            // e.preventDefault(); // REMOVED THIS LINE
            
            const toolName = this.closest('.tool-card').querySelector('h3').textContent;
            const url = this.href;
            
            console.log(`🔗 User clicked: ${toolName} -> ${url}`);
            
            // Track analytics if available
            if (typeof AnalyticsModule !== 'undefined' && AnalyticsModule.trackEvent) {
                AnalyticsModule.trackEvent('quick_tool_clicked', {
                    tool_name: toolName,
                    tool_url: url,
                    timestamp: new Date().toISOString()
                });
            }
            
            // Add visual feedback (non-blocking)
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
            
            // Show confirmation message
            setTimeout(() => {
                showToolLinkConfirmation(toolName);
            }, 100);
        });
    });
}

// Show confirmation when tool link is clicked
function showToolLinkConfirmation(toolName) {
    // Create temporary notification
    const notification = document.createElement('div');
    notification.className = 'tool-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">✅</span>
            <span class="notification-text">Opening ${toolName} in new tab...</span>
        </div>
    `;
    
    // Add notification styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--hbo-gradient);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        z-index: 10000;
        box-shadow: 0 4px 20px rgba(139, 92, 246, 0.3);
        animation: slideInFromRight 0.3s ease-out;
        font-weight: 600;
    `;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutToRight 0.3s ease-in forwards';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Handle page unload
window.addEventListener('beforeunload', (e) => {
    // Save any pending analytics data
    if (AnalyticsModule) {
        AnalyticsModule.endSessionTracking();
    }
    
    // No confirmation message for now
    // e.preventDefault();
    // e.returnValue = '';
});
