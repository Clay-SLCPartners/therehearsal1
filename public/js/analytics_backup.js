// Analytics and tracking module - Clean version
const AnalyticsModule = {
    
    // Initialize analytics
    init() {
        console.log('✅ Analytics module initialized');
        this.initializeNathanAnalysis();
        this.startSessionTracking();
    },
    
    // Initialize Nathan's analysis system
    initializeNathanAnalysis() {
        if (!appState.nathanAnalysis) {
            appState.nathanAnalysis = {
                observationCount: 0,
                behaviorPatterns: [],
                conversationFlow: [],
                statisticalInsights: [],
                rehearsalEffectiveness: 0,
                currentObservations: []
            };
        }
        
        // Start periodic analysis updates (with error handling)
        this.nathanAnalysisInterval = setInterval(() => {
            try {
                this.updateNathanAnalysis();
            } catch (error) {
                console.warn('Nathan analysis update failed:', error.message);
            }
        }, 5000);
    },
    
    // Start session tracking
    startSessionTracking() {
        if (!appState.sessionData) {
            appState.sessionData = {
                startTime: new Date(),
                pageViews: 1,
                interactions: 0,
                scenariosAttempted: [],
                totalTimeSpent: 0
            };
        }
    },
    
    // Track events (with error handling)
    trackEvent(eventType, data) {
        try {
            if (!appState.analytics) {
                appState.analytics = [];
            }
            
            const event = {
                type: eventType,
                data: data,
                timestamp: new Date().toISOString()
            };
            
            appState.analytics.push(event);
            console.log('Event tracked:', eventType);
            
            // Trigger analysis if we have enough data
            if (appState.analytics.length > 3) {
                this.analyzeUserBehavior(event);
            }
        } catch (error) {
            console.warn('Error tracking event:', error.message);
        }
    },
    
    // Analyze user behavior (simplified)
    analyzeUserBehavior(event) {
        try {
            if (!appState.nathanAnalysis) return;
            
            // Simple pattern tracking
            const analysis = appState.nathanAnalysis;
            analysis.observationCount++;
            
            // Generate some basic insights
            if (analysis.observationCount % 5 === 0) {
                this.generateNathanInsights();
            }
        } catch (error) {
            console.warn('Error analyzing behavior:', error.message);
        }
    },
    
    // Generate Nathan-style insights (simplified)
    generateNathanInsights() {
        try {
            if (!appState.nathanAnalysis) return;
            
            const observations = [];
            
            // Add some default observations
            observations.push("Interesting behavioral pattern detected.");
            observations.push("Your conversation choices follow a predictable pattern.");
            observations.push("Statistical analysis suggests room for improvement.");
            observations.push("I've documented " + (appState.conversationHistory?.length || 0) + " conversation turns so far.");
            
            // Store observations
            appState.nathanAnalysis.currentObservations = observations;
            
            // Update UI
            this.updateNathanDisplay();
        } catch (error) {
            console.warn('Error generating insights:', error.message);
        }
    },
    
    // Update Nathan display (with proper error handling)
    updateNathanDisplay() {
        try {
            const analysisElement = document.getElementById('rehearsalAnalysis');
            if (!analysisElement) return;
            
            // Ensure nathanAnalysis exists
            if (!appState.nathanAnalysis) return;
            
            const observations = appState.nathanAnalysis.currentObservations;
            if (observations && observations.length > 0) {
                const randomObservation = observations[Math.floor(Math.random() * observations.length)];
                analysisElement.textContent = randomObservation;
            } else {
                // Fallback to default Nathan quotes
                const defaultQuotes = appState.nathanNotes || (typeof NATHAN_CONSTANTS !== 'undefined' ? NATHAN_CONSTANTS.QUOTES : null) || [
                    "Preparing detailed analysis...",
                    "Analyzing conversation patterns...", 
                    "Statistical confidence building...",
                    "I once practiced saying 'How are you?' 247 times until it sounded natural.",
                    "The key to a good rehearsal is repetition. Try this scenario at least 3 times."
                ];
                
                if (defaultQuotes.length > 0) {
                    analysisElement.textContent = defaultQuotes[Math.floor(Math.random() * defaultQuotes.length)];
                } else {
                    analysisElement.textContent = "Preparing analysis...";
                }
            }
        } catch (error) {
            console.warn('Error updating Nathan display:', error.message);
        }
    },
    
    // Update Nathan analysis (periodic)
    updateNathanAnalysis() {
        try {
            if (appState.currentScenario && appState.analytics && appState.analytics.length > 0) {
                this.generateNathanInsights();
            }
        } catch (error) {
            console.warn('Error in Nathan analysis update:', error.message);
        }
    },
    
    // End session tracking
    endSessionTracking() {
        try {
            if (this.nathanAnalysisInterval) {
                clearInterval(this.nathanAnalysisInterval);
            }
            console.log('Session tracking ended');
        } catch (error) {
            console.warn('Error ending session tracking:', error.message);
        }
    }
};

// Make globally accessible
window.AnalyticsModule = AnalyticsModule;
