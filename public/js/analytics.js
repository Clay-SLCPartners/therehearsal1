// Analytics and tracking module
const AnalyticsModule = {
    
    // Initialize analytics
    init() {
        this.setupEventTracking();
        this.initializeNathanAnalysis();
        this.startSessionTracking();
    },
    
    // Setup event tracking
    setupEventTracking() {
        // Track scenario selections
        document.addEventListener('scenarioSelected', (e) => {
            this.trackEvent('scenario_selected', {
                scenario: e.detail.scenario,
                difficulty: e.detail.difficulty,
                timestamp: new Date().toISOString()
            });
        });
        
        // Track conversation choices
        document.addEventListener('choiceMade', (e) => {
            this.trackEvent('choice_made', {
                scenario: appState.currentScenario,
                scene: appState.currentScene,
                choice: e.detail.choice,
                impact: e.detail.impact,
                timestamp: new Date().toISOString()
            });
        });
        
        // Track breakthroughs
        document.addEventListener('breakthrough', (e) => {
            this.trackEvent('breakthrough_achieved', {
                scenario: e.detail.scenario,
                scene: e.detail.scene,
                timestamp: new Date().toISOString()
            });
        });
        
        // Track session completion
        document.addEventListener('sessionComplete', (e) => {
            this.trackEvent('session_complete', {
                scenario: e.detail.scenario,
                success: e.detail.success,
                stats: e.detail.stats,
                duration: e.detail.duration,
                timestamp: new Date().toISOString()
            });
        });
    },
    
    // Initialize Nathan's analysis system
    initializeNathanAnalysis() {
        appState.nathanAnalysis = {
            observationCount: 0,
            behaviorPatterns: [],
            conversationFlow: [],
            statisticalInsights: [],
            rehearsalEffectiveness: 0
        };
        
        // Start periodic analysis updates
        this.nathanAnalysisInterval = setInterval(() => {
            this.updateNathanAnalysis();
        }, CONFIG.NATHAN_UPDATE_INTERVAL);
    },
    
    // Start session tracking
    startSessionTracking() {
        appState.sessionData = {
            startTime: new Date(),
            pageViews: 1,
            interactions: 0,
            scenariosAttempted: [],
            totalTimeSpent: 0
        };
        
        // Track page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseSessionTracking();
            } else {
                this.resumeSessionTracking();
            }
        });
        
        // Track before page unload
        window.addEventListener('beforeunload', () => {
            this.endSessionTracking();
        });
    },
    
    // Track events
    trackEvent(eventType, data) {
        const event = {
            type: eventType,
            data: data,
            timestamp: new Date().toISOString(),
            sessionId: appState.sessionId,
            userId: appState.user ? appState.user.id : 'guest'
        };
        
        // Store in session analytics
        if (!appState.analytics) {
            appState.analytics = [];
        }
        appState.analytics.push(event);
        
        // Update interaction count
        appState.sessionData.interactions++;
        
        // Trigger Nathan's analysis update
        this.analyzeUserBehavior(event);
        
        console.log('📊 Event tracked:', eventType, data);
    },
    
    // Analyze user behavior patterns
    analyzeUserBehavior(event) {
        const analysis = appState.nathanAnalysis;
        
        switch (event.type) {
            case 'scenario_selected':
                this.analyzeScenarioChoice(event.data);
                break;
            case 'choice_made':
                this.analyzeConversationChoice(event.data);
                break;
            case 'breakthrough_achieved':
                this.analyzeBreakthrough(event.data);
                break;
            case 'session_complete':
                this.analyzeSessionCompletion(event.data);
                break;
        }
        
        analysis.observationCount++;
        this.generateNathanInsights();
    },
    
    // Analyze scenario choice patterns
    analyzeScenarioChoice(data) {
        const patterns = appState.nathanAnalysis.behaviorPatterns;
        
        // Track scenario preferences
        const scenarioPattern = patterns.find(p => p.type === 'scenario_preference');
        if (scenarioPattern) {
            scenarioPattern.data.push(data.scenario);
        } else {
            patterns.push({
                type: 'scenario_preference',
                data: [data.scenario],
                confidence: 0.1
            });
        }
        
        // Analyze difficulty progression
        const difficultyPattern = patterns.find(p => p.type === 'difficulty_progression');
        if (difficultyPattern) {
            difficultyPattern.data.push(data.difficulty);
        } else {
            patterns.push({
                type: 'difficulty_progression',
                data: [data.difficulty],
                confidence: 0.1
            });
        }
    },
    
    // Analyze conversation choice patterns
    analyzeConversationChoice(data) {
        const flow = appState.nathanAnalysis.conversationFlow;
        
        flow.push({
            scenario: data.scenario,
            scene: data.scene,
            choice: data.choice,
            impact: data.impact,
            timestamp: data.timestamp
        });
        
        // Analyze empathy patterns
        if (data.impact && data.impact.empathy) {
            this.updateStatPattern('empathy', data.impact.empathy);
        }
        
        // Analyze trust patterns
        if (data.impact && data.impact.trust) {
            this.updateStatPattern('trust', data.impact.trust);
        }
        
        // Analyze effectiveness patterns
        if (data.impact && data.impact.effectiveness) {
            this.updateStatPattern('effectiveness', data.impact.effectiveness);
        }
    },
    
    // Update statistical patterns
    updateStatPattern(statType, value) {
        const patterns = appState.nathanAnalysis.behaviorPatterns;
        const statPattern = patterns.find(p => p.type === `${statType}_tendency`);
        
        if (statPattern) {
            statPattern.data.push(value);
            statPattern.average = statPattern.data.reduce((a, b) => a + b, 0) / statPattern.data.length;
            statPattern.confidence = Math.min(1.0, statPattern.data.length * 0.1);
        } else {
            patterns.push({
                type: `${statType}_tendency`,
                data: [value],
                average: value,
                confidence: 0.1
            });
        }
    },
    
    // Analyze breakthrough moments
    analyzeBreakthrough(data) {
        const insights = appState.nathanAnalysis.statisticalInsights;
        
        insights.push({
            type: 'breakthrough_analysis',
            scenario: data.scenario,
            scene: data.scene,
            context: this.getBreakthroughContext(data),
            timestamp: data.timestamp
        });
        
        // Update rehearsal effectiveness
        appState.nathanAnalysis.rehearsalEffectiveness += 0.1;
    },
    
    // Get breakthrough context
    getBreakthroughContext(data) {
        const recentChoices = appState.nathanAnalysis.conversationFlow.slice(-3);
        return {
            leadingChoices: recentChoices.length,
            avgEmpathyImpact: this.calculateAverageImpact(recentChoices, 'empathy'),
            avgTrustImpact: this.calculateAverageImpact(recentChoices, 'trust'),
            choiceVelocity: recentChoices.length > 1 ? this.calculateChoiceVelocity(recentChoices) : 0
        };
    },
    
    // Calculate average impact
    calculateAverageImpact(choices, statType) {
        const impacts = choices
            .filter(c => c.impact && c.impact[statType])
            .map(c => c.impact[statType]);
        
        return impacts.length > 0 ? impacts.reduce((a, b) => a + b, 0) / impacts.length : 0;
    },
    
    // Calculate choice velocity (choices per minute)
    calculateChoiceVelocity(choices) {
        if (choices.length < 2) return 0;
        
        const first = new Date(choices[0].timestamp);
        const last = new Date(choices[choices.length - 1].timestamp);
        const minutes = (last - first) / (1000 * 60);
        
        return minutes > 0 ? choices.length / minutes : 0;
    },
    
    // Generate Nathan's insights
    generateNathanInsights() {
        const analysis = appState.nathanAnalysis;
        const observations = [];
        
        // Analyze scenario preferences
        const scenarioPattern = analysis.behaviorPatterns.find(p => p.type === 'scenario_preference');
        if (scenarioPattern && scenarioPattern.data.length > 2) {
            const most = this.getMostFrequent(scenarioPattern.data);
            observations.push(`You've selected "${most}" ${this.countOccurrences(scenarioPattern.data, most)} times. Interesting pattern.`);
        }
        
        // Analyze stat tendencies
        const empathyPattern = analysis.behaviorPatterns.find(p => p.type === 'empathy_tendency');
        if (empathyPattern && empathyPattern.confidence > 0.3) {
            const trend = empathyPattern.average > 0 ? 'empathetic' : 'analytical';
            observations.push(`Your choices lean ${empathyPattern.average > 0 ? 'toward empathy' : 'toward analysis'}. Average impact: ${empathyPattern.average.toFixed(2)}.`);
        }
        
        // Analyze conversation flow
        if (analysis.conversationFlow.length > 5) {
            const velocity = this.calculateChoiceVelocity(analysis.conversationFlow.slice(-5));
            observations.push(`Current choice velocity: ${velocity.toFixed(2)} decisions per minute. ${velocity > 2 ? 'You work quickly.' : 'You\'re taking time to consider.'}`);
        }
        
        // Store observations
        analysis.currentObservations = observations;
        
        // Update UI
        this.updateNathanDisplay();
    },
    
    // Update Nathan's display
    updateNathanDisplay() {
        const analysisElement = document.getElementById('rehearsalAnalysis');
        if (!analysisElement) return;
        
        const observations = appState.nathanAnalysis.currentObservations;
        if (observations && observations.length > 0) {
            const randomObservation = observations[Math.floor(Math.random() * observations.length)];
            analysisElement.textContent = randomObservation;
        } else {
            // Fallback to default Nathan quotes
            const defaultQuotes = NATHAN_CONSTANTS.quotes;
            analysisElement.textContent = defaultQuotes[Math.floor(Math.random() * defaultQuotes.length)];
        }
    },
    
    // Update Nathan analysis (periodic)
    updateNathanAnalysis() {
        if (appState.currentScenario && appState.analytics && appState.analytics.length > 0) {
            this.generateNathanInsights();
        }
    },
    
    // Get most frequent item
    getMostFrequent(array) {
        const frequency = {};
        let maxCount = 0;
        let mostFrequent = array[0];
        
        array.forEach(item => {
            frequency[item] = (frequency[item] || 0) + 1;
            if (frequency[item] > maxCount) {
                maxCount = frequency[item];
                mostFrequent = item;
            }
        });
        
        return mostFrequent;
    },
    
    // Count occurrences
    countOccurrences(array, item) {
        return array.filter(x => x === item).length;
    },
    
    // Pause session tracking
    pauseSessionTracking() {
        if (appState.sessionData.startTime) {
            const currentTime = new Date();
            appState.sessionData.totalTimeSpent += currentTime - appState.sessionData.lastActiveTime;
        }
    },
    
    // Resume session tracking
    resumeSessionTracking() {
        appState.sessionData.lastActiveTime = new Date();
    },
    
    // End session tracking
    endSessionTracking() {
        this.pauseSessionTracking();
        
        const sessionSummary = {
            duration: appState.sessionData.totalTimeSpent,
            interactions: appState.sessionData.interactions,
            scenariosAttempted: appState.sessionData.scenariosAttempted.length,
            analyticsCount: appState.analytics ? appState.analytics.length : 0
        };
        
        console.log('📊 Session ended:', sessionSummary);
        
        // Save session data if user is logged in
        if (AuthModule.isLoggedIn()) {
            AuthModule.updateUserProgress({
                sessionData: sessionSummary
            });
        }
    },
    
    // Get analytics summary
    getAnalyticsSummary() {
        const analysis = appState.nathanAnalysis;
        const sessions = appState.analytics ? appState.analytics.filter(e => e.type === 'session_complete') : [];
        
        return {
            totalObservations: analysis.observationCount,
            totalSessions: sessions.length,
            behaviorPatterns: analysis.behaviorPatterns.length,
            rehearsalEffectiveness: analysis.rehearsalEffectiveness,
            averageSessionDuration: sessions.length > 0 
                ? sessions.reduce((sum, s) => sum + (s.data.duration || 0), 0) / sessions.length 
                : 0,
            mostAttemptedScenario: this.getMostAttemptedScenario(),
            currentInsights: analysis.currentObservations || []
        };
    },
    
    // Get most attempted scenario
    getMostAttemptedScenario() {
        const scenarioEvents = appState.analytics ? 
            appState.analytics.filter(e => e.type === 'scenario_selected') : [];
        
        if (scenarioEvents.length === 0) return 'None';
        
        const scenarios = scenarioEvents.map(e => e.data.scenario);
        return this.getMostFrequent(scenarios);
    },
    
    // Export analytics data
    exportAnalytics() {
        const summary = this.getAnalyticsSummary();
        const exportData = {
            summary: summary,
            rawAnalytics: appState.analytics || [],
            nathanAnalysis: appState.nathanAnalysis,
            sessionData: appState.sessionData,
            exportDate: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `rehearsal-analytics-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('📊 Analytics exported successfully');
    }
};

// Make globally accessible
window.AnalyticsModule = AnalyticsModule;
window.exportAnalytics = () => AnalyticsModule.exportAnalytics();
window.getAnalyticsSummary = () => AnalyticsModule.getAnalyticsSummary();
