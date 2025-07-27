// Configuration and constants
const CONFIG = {
    API_BASE_URL: window.location.origin,
    SCENARIOS_API: '/api/scenarios',
    CONVERSATION_API: '/api/conversations',
    SCENARIOS_DATA_URL: 'public/data/scenarios.json',
    
    // Animation timings
    TYPE_SPEED: 30,
    CHOICE_DELAY: 3000,
    SCENE_TRANSITION: 1000,
    
    // Crisis keywords for detection
    CRISIS_KEYWORDS: [
        'suicide', 'kill myself', 'end it all', 'not worth living',
        'better off dead', 'hurt myself', 'self harm', 'cutting',
        'overdose', 'end my life', 'no point in living', 'worthless',
        'hopeless', 'give up', 'can\'t go on', 'want to die'
    ],
    
    // Crisis resources
    CRISIS_RESOURCES: {
        national: '988',
        crisis: '741741',
        trevor: '1-866-488-7386',
        international: 'https://findahelpline.com'
    }
};

// Nathan Fielder style constants and quotes
const NATHAN_CONSTANTS = {
    REHEARSAL_ATTEMPTS_TARGET: 247,
    CONVERSATION_ACCURACY_THRESHOLD: 87.3,
    STATISTICAL_CONFIDENCE_LEVEL: 94.7,
    
    QUOTES: [
        "The key to a good rehearsal is repetition. Try this scenario at least 3 times.",
        "I once practiced saying 'How are you?' 247 times until it sounded natural.",
        "Notice how their mood changes based on your approach. I documented 14 different mood variations.",
        "In the show, we built an entire replica apartment. Here, we've built replica conversations.",
        "Sometimes the most awkward choice leads to the most genuine connection.",
        "I've calculated there are over 16,000 possible conversation paths. You've found one.",
        "The beauty of rehearsal is that failure doesn't matter. Only the final performance counts.",
        "Document everything. Even the pauses between words matter."
    ]
};

// Global app state
const appState = {
    currentScenario: null,
    currentScene: 0,
    playerStats: { empathy: 0, trust: 0, effectiveness: 0 },
    conversationHistory: [],
    memoryPercentage: 87.3,
    breakthroughs: [],
    rehearsalAttempts: {},
    flowchartData: {},
    scenarios: {},
    user: null,
    isLoggedIn: false,
    nathanNotes: [...NATHAN_CONSTANTS.QUOTES]
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, NATHAN_CONSTANTS, appState };
}
