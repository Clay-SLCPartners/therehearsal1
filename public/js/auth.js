/**
 * The Rehearsal AI - No Authentication System
 * All features available to all users including Actors Guild
 */

// Simple system with no authentication - all features enabled
const authSystem = {
    init() {
        this.updateUI();
    },

    updateUI() {
        console.log('🔧 Updating UI - no authentication required');
        
        // Update user display to show guest mode
        const guestUser = document.querySelector('.user-name');
        const userProgress = document.querySelector('.user-progress');
        const loginButton = document.getElementById('loginButton');
        const logoutButton = document.getElementById('logoutButton');

        if (guestUser) {
            guestUser.textContent = 'Guest User';
            console.log('✅ Updated user name to Guest User');
        }
        
        if (userProgress) {
            userProgress.textContent = 'All features available';
            console.log('✅ Updated user progress message');
        }

        // Hide all auth buttons
        if (loginButton) {
            loginButton.style.display = 'none';
            console.log('✅ Hidden login button');
        }
        if (logoutButton) {
            logoutButton.style.display = 'none';
            console.log('✅ Hidden logout button');
        }

        // Enable all special features
        this.enableAllFeatures();
    },

    enableAllFeatures() {
        const featureLinks = document.querySelectorAll('a[href*="director-studio"], a[href*="actors_guild"]');
        
        featureLinks.forEach(link => {
            // Ensure full access - remove any restrictions
            link.style.opacity = '1';
            link.style.pointerEvents = 'auto';
            link.style.cursor = 'pointer';
            link.onclick = null;
            link.removeAttribute('title');
            link.removeAttribute('disabled');
            
            // Remove any CSS classes that might disable the link
            link.classList.remove('disabled', 'auth-required', 'login-required');
            
            console.log('✅ Feature link enabled:', link.href);
        });
        
        // Also enable any buttons related to special features
        const featureButtons = document.querySelectorAll('button[onclick*="director"], button[onclick*="actors"], .director-studio-btn, .actors-guild-btn');
        featureButtons.forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.style.pointerEvents = 'auto';
        });
    },

    // Placeholder methods for compatibility
    isLoggedIn() { return false; },
    getCurrentUser() { return null; },
    completePractice() { /* No-op */ },
    createScript() { /* No-op */ }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎭 Initializing no-auth system...');
    authSystem.init();
    
    // Force enable all features after a brief delay to ensure DOM is ready
    setTimeout(() => {
        authSystem.enableAllFeatures();
        console.log('🎬 All features forcibly enabled');
    }, 100);
});

// Also run immediately in case DOMContentLoaded already fired
if (document.readyState === 'loading') {
    // DOM is still loading, wait for DOMContentLoaded
} else {
    // DOM is already loaded
    console.log('🎭 DOM already loaded, initializing immediately...');
    authSystem.init();
    authSystem.enableAllFeatures();
}

// Global functions for compatibility (no-op)
function showLoginModal() { /* No login needed */ }
function closeAuthModal() { /* No-op */ }
function handleLogin() { /* No-op */ }
function handleRegister() { /* No-op */ }
function handleLogout() { /* No-op */ }
function toggleUserMenu() { 
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    }
}

// Close user menu when clicking outside
document.addEventListener('click', (e) => {
    const userMenu = document.getElementById('userMenu');
    const dropdown = document.getElementById('userDropdown');
    if (dropdown && userMenu && !userMenu.contains(e.target)) {
        dropdown.style.display = 'none';
    }
});

// Export for compatibility
if (typeof window !== 'undefined') {
    window.authSystem = authSystem;
}