// Scenarios management module
const ScenariosModule = {
    
    // Load scenarios from JSON file
    async loadScenarios() {
        try {
            console.log('Loading scenarios from JSON...');
            const response = await fetch(CONFIG.SCENARIOS_DATA_URL);
            
            if (!response.ok) {
                throw new Error(`Failed to load scenarios: ${response.status}`);
            }
            
            const data = await response.json();
            appState.scenarios = data;
            
            console.log('Scenarios loaded successfully:', Object.keys(data).length);
            return data;
        } catch (error) {
            console.error('Error loading scenarios:', error);
            
            // Fallback: try to load from API
            try {
                const apiResponse = await fetch(CONFIG.SCENARIOS_API);
                if (apiResponse.ok) {
                    const apiData = await apiResponse.json();
                    appState.scenarios = apiData;
                    return apiData;
                }
            } catch (apiError) {
                console.error('API fallback also failed:', apiError);
            }
            
            // Ultimate fallback: show error message
            this.showScenariosError('Failed to load scenarios. Please refresh the page.');
            return {};
        }
    },
    
    // Render scenarios grid
    renderScenarios(scenarios) {
        const container = document.getElementById('scenarioSelection');
        const loadingIndicator = document.getElementById('scenariosLoading');
        
        if (!container) {
            console.error('Scenarios container not found');
            return;
        }
        
        // Hide loading indicator
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
        
        // Clear existing content
        container.innerHTML = '';
        
        // Create scenario cards
        Object.entries(scenarios).forEach(([id, scenario]) => {
            const card = this.createScenarioCard(id, scenario);
            container.appendChild(card);
        });
        
        console.log('Scenarios rendered:', Object.keys(scenarios).length);
    },
    
    // Create individual scenario card
    createScenarioCard(id, scenario) {
        const card = document.createElement('div');
        card.className = 'scenario-card';
        card.dataset.scenario = id;
        
        // Determine difficulty class
        const difficultyClass = scenario.difficulty || 'intermediate';
        
        // Map scenario IDs to appropriate icons if avatar not available
        const iconMap = {
            'friend-checkin': '🫂',
            'therapy-suggestion': '💭',
            'crisis-response': '🚨',
            'asking-for-help': '🆘',
            'self-advocacy-doctor': '⚕️',
            'family-conversation': '👨‍👩‍👧‍👦',
            'workplace-stress': '💼',
            'breakup-conversation': '💔'
        };
        
        const icon = scenario.character?.avatar || iconMap[id] || '🎭';
        
        card.innerHTML = `
            <div class="scenario-icon">${icon}</div>
            <h3>${scenario.title}</h3>
            <p>${scenario.description}</p>
            <span class="difficulty-level ${difficultyClass}">${this.capitalizeDifficulty(scenario.difficulty)}</span>
        `;
        
        // Add click event listener
        card.addEventListener('click', () => {
            this.selectScenario(id);
        });
        
        // Add keyboard support
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.selectScenario(id);
            }
        });
        
        // Make focusable
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `Practice scenario: ${scenario.title}. Difficulty: ${this.capitalizeDifficulty(scenario.difficulty)}`);
        
        return card;
    },
    
    // Select and start a scenario
    selectScenario(scenarioId) {
        console.log('Selecting scenario:', scenarioId);
        
        const scenario = appState.scenarios[scenarioId];
        if (!scenario) {
            console.error('Scenario not found:', scenarioId);
            alert('Scenario not found: ' + scenarioId);
            return;
        }
        
        // Update app state
        appState.currentScenario = scenarioId;
        appState.currentScene = 'intro';
        appState.playerStats = { empathy: 0, trust: 0, effectiveness: 0 };
        appState.conversationHistory = [];
        appState.breakthroughs = [];
        
        // Record rehearsal attempt
        if (!appState.rehearsalAttempts[scenarioId]) {
            appState.rehearsalAttempts[scenarioId] = 0;
        }
        appState.rehearsalAttempts[scenarioId]++;
        
        // Update UI
        this.showConversationInterface();
        
        // Start the conversation
        ConversationModule.startConversation(scenario);
        
        console.log('Scenario started successfully');
    },
    
    // Show conversation interface, hide scenario selection
    showConversationInterface() {
        const scenarioSelection = document.getElementById('scenarioSelection')?.parentElement;
        const conversationInterface = document.getElementById('conversationInterface');
        
        if (scenarioSelection) {
            scenarioSelection.style.display = 'none';
        }
        
        if (conversationInterface) {
            conversationInterface.style.display = 'block';
            conversationInterface.classList.add('active');
            conversationInterface.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    },
    
    // Show scenario selection, hide conversation interface
    showScenarioSelection() {
        const scenarioSelection = document.getElementById('scenarioSelection')?.parentElement;
        const conversationInterface = document.getElementById('conversationInterface');
        
        if (conversationInterface) {
            conversationInterface.style.display = 'none';
            conversationInterface.classList.remove('active');
        }
        
        if (scenarioSelection) {
            scenarioSelection.style.display = 'block';
            scenarioSelection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        
        // Reset app state
        appState.currentScenario = null;
        appState.currentScene = 0;
        appState.conversationHistory = [];
        
        // Clear selected cards
        document.querySelectorAll('.scenario-card').forEach(card => {
            card.classList.remove('selected');
        });
    },
    
    // Show error message
    showScenariosError(message) {
        const container = document.getElementById('scenarioSelection');
        const loadingIndicator = document.getElementById('scenariosLoading');
        
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
        
        if (container) {
            container.innerHTML = `
                <div class="error-message">
                    <h3>⚠️ Error Loading Scenarios</h3>
                    <p>${message}</p>
                    <button onclick="location.reload()" class="btn btn-primary">
                        Reload Page
                    </button>
                </div>
            `;
        }
    },
    
    // Helper: capitalize difficulty
    capitalizeDifficulty(difficulty) {
        if (!difficulty) return 'Intermediate';
        return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
    },
    
    // Initialize scenarios module
    init() {
        console.log('✅ Scenarios module initialized (ready for loading)');
        // Don't auto-load scenarios on init - wait for user action
        return true;
    }
};

// Make globally accessible
window.ScenariosModule = ScenariosModule;
window.selectScenario = (id) => ScenariosModule.selectScenario(id);
window.returnToScenarios = () => ScenariosModule.showScenarioSelection();
