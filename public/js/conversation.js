// Conversation engine module
const ConversationModule = {
    
    // Start a conversation with the selected scenario
    startConversation(scenario) {
        console.log('Starting conversation:', scenario.title);
        
        // Update UI with scenario info
        this.updateScenarioInfo(scenario);
        
        // Find and display the first scene
        const firstScene = scenario.scenes.find(scene => scene.id === 'intro') || scenario.scenes[0];
        
        if (firstScene) {
            this.displayScene(firstScene);
        } else {
            console.error('No intro scene found for scenario');
            alert('Error: No starting scene found for this scenario.');
        }
        
        // Update stats display
        this.updateStats();
    },
    
    // Update scenario information in the UI
    updateScenarioInfo(scenario) {
        const titleElement = document.getElementById('currentScenarioTitle');
        const descElement = document.getElementById('currentScenarioDesc');
        
        if (titleElement) titleElement.textContent = scenario.title;
        if (descElement) descElement.textContent = scenario.description;
    },
    
    // Display a scene
    displayScene(scene) {
        console.log('Displaying scene:', scene.id);
        
        const scenario = appState.scenarios[appState.currentScenario];
        
        // Clear previous choices
        this.clearChoices();
        
        // Update story text with typing effect
        this.typeText(scene.text, 'storyText');
        
        // Update character dialogue if present
        if (scene.dialogue) {
            setTimeout(() => {
                this.showCharacterDialogue(scenario.character, scene);
            }, 1500);
        }
        
        // Display choices after dialogue
        if (scene.choices && scene.choices.length > 0) {
            setTimeout(() => {
                this.displayChoices(scene.choices);
            }, CONFIG.CHOICE_DELAY);
        }
        
        // Check for breakthrough moment
        if (scene.isBreakthrough) {
            this.recordBreakthrough(scene);
        }
        
        // Check for end of conversation
        if (scene.isEnd) {
            setTimeout(() => {
                this.endConversation(scene.outcome === 'success');
            }, 2000);
        }
        
        this.updateStats();
    },
    
    // Type text with animation effect
    typeText(text, elementId) {
        const element = document.getElementById(elementId);
        
        if (!element) {
            console.error('Element not found:', elementId);
            return;
        }
        
        // Clean the text to prevent corruption
        const cleanText = String(text).trim();
        
        // Clear any existing intervals to prevent duplication
        if (element.typeInterval) {
            clearInterval(element.typeInterval);
        }
        
        element.textContent = '';
        element.classList.add('typing');
        
        let index = 0;
        element.typeInterval = setInterval(() => {
            if (index < cleanText.length) {
                element.textContent += cleanText.charAt(index);
                index++;
            } else {
                clearInterval(element.typeInterval);
                element.typeInterval = null;
                element.classList.remove('typing');
            }
        }, CONFIG.TYPE_SPEED);
    },
    
    // Show character dialogue
    showCharacterDialogue(character, scene) {
        const dialogueContainer = document.getElementById('characterDialogue');
        const avatarElement = document.getElementById('characterAvatar');
        const nameElement = document.getElementById('characterName');
        const moodElement = document.getElementById('characterMood');
        
        if (dialogueContainer) {
            dialogueContainer.classList.add('active');
        }
        
        if (avatarElement) avatarElement.textContent = character.avatar || '🎭';
        if (nameElement) nameElement.textContent = character.name || 'Character';
        if (moodElement) moodElement.textContent = scene.mood || 'neutral';
        
        this.typeText(scene.dialogue, 'dialogueText');
    },
    
    // Display choice buttons
    displayChoices(choices) {
        const container = document.getElementById('choices');
        
        if (!container) {
            console.error('Choices container not found');
            return;
        }
        
        container.innerHTML = '';
        
        choices.forEach((choice, index) => {
            const button = document.createElement('button');
            button.className = 'choice-button';
            button.setAttribute('tabindex', '0');
            
            button.innerHTML = `
                <div class="choice-header">${choice.text}</div>
                ${choice.description ? `<div class="choice-description">${choice.description}</div>` : ''}
                ${choice.impact ? `<div class="choice-impact">${this.getImpactDescription(choice.impact)}</div>` : ''}
            `;
            
            // Add click event
            button.addEventListener('click', () => {
                this.makeChoice(choice);
            });
            
            // Add keyboard support
            button.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.makeChoice(choice);
                }
            });
            
            container.appendChild(button);
        });
    },
    
    // Make a choice and progress conversation
    makeChoice(choice) {
        console.log('Choice made:', choice.text);
        
        // Record the choice
        appState.conversationHistory.push({
            scene: appState.currentScene,
            choice: choice.text,
            impact: choice.impact,
            timestamp: new Date()
        });
        
        // Apply stat changes
        if (choice.impact) {
            Object.entries(choice.impact).forEach(([stat, value]) => {
                appState.playerStats[stat] = Math.max(0, Math.min(10, appState.playerStats[stat] + value));
            });
        }
        
        // Clear current display
        this.clearChoices();
        this.hideCharacterDialogue();
        
        // Move to next scene
        const scenario = appState.scenarios[appState.currentScenario];
        const nextScene = scenario.scenes.find(s => s.id === choice.next);
        
        if (nextScene) {
            appState.currentScene = nextScene.id;
            setTimeout(() => this.displayScene(nextScene), CONFIG.SCENE_TRANSITION);
        } else if (choice.next === 'success' || choice.isEnd) {
            setTimeout(() => {
                this.endConversation(true);
            }, CONFIG.SCENE_TRANSITION);
        } else {
            console.error(`Scene not found: ${choice.next}`);
            setTimeout(() => {
                this.endConversation(false);
            }, CONFIG.SCENE_TRANSITION);
        }
        
        this.updateStats();
        this.updateNathanAnalysis();
    },
    
    // Clear choice buttons
    clearChoices() {
        const container = document.getElementById('choices');
        if (container) {
            container.innerHTML = '';
        }
    },
    
    // Hide character dialogue
    hideCharacterDialogue() {
        const dialogueContainer = document.getElementById('characterDialogue');
        if (dialogueContainer) {
            dialogueContainer.classList.remove('active');
        }
    },
    
    // Update stats display
    updateStats() {
        ['empathy', 'trust', 'effectiveness'].forEach(stat => {
            const value = appState.playerStats[stat];
            const valueElement = document.getElementById(`${stat}Value`);
            const barElement = document.getElementById(`${stat}Bar`);
            
            if (valueElement) valueElement.textContent = value;
            if (barElement) barElement.style.width = `${(value / 10) * 100}%`;
        });
    },
    
    // Update Nathan's analysis
    updateNathanAnalysis() {
        const analysisElement = document.getElementById('rehearsalAnalysis');
        if (!analysisElement) return;
        
        const choiceCount = appState.conversationHistory.length;
        const attempts = appState.rehearsalAttempts[appState.currentScenario] || 1;
        
        const observations = [
            `Choice ${choiceCount} of attempt ${attempts}. Each decision creates a new timeline.`,
            `You've discovered ${choiceCount} of approximately 1,024 possible conversation nodes.`,
            `Interesting choice. In my experience, that works ${Math.floor(Math.random() * 30) + 70}% of the time.`,
            `Notice how their body language changed? (If this were real, I mean.)`,
            `This path reminds me of rehearsal attempt #${Math.floor(Math.random() * 100) + 1} from the show.`,
            `Statistical analysis shows this approach has a ${Math.floor(Math.random() * 30) + 70}% success rate.`
        ];
        
        analysisElement.textContent = observations[Math.floor(Math.random() * observations.length)];
    },
    
    // Record a breakthrough moment
    recordBreakthrough(scene) {
        const breakthrough = {
            scenario: appState.currentScenario,
            scene: scene.id,
            timestamp: new Date(),
            description: `Breakthrough moment in ${appState.scenarios[appState.currentScenario].title}`
        };
        
        appState.breakthroughs.push(breakthrough);
        console.log('🎉 Breakthrough recorded:', breakthrough);
        
        // Show visual feedback
        document.body.style.animation = 'none';
        setTimeout(() => {
            document.body.style.animation = 'fadeIn 0.5s ease-out';
        }, 10);
    },
    
    // End conversation with analysis
    endConversation(isSuccess = false) {
        const totalScore = appState.playerStats.empathy + appState.playerStats.trust + appState.playerStats.effectiveness;
        const attempts = appState.rehearsalAttempts[appState.currentScenario] || 1;
        const scenario = appState.scenarios[appState.currentScenario];
        
        // Generate Nathan-style analysis
        let analysis = `REHEARSAL ${isSuccess ? 'SUCCESSFUL' : 'COMPLETE'} - DETAILED ANALYSIS\n\n`;
        analysis += `Scenario: ${scenario.title}\n`;
        analysis += `Attempt Number: ${attempts}\n`;
        analysis += `Total Score: ${totalScore}/30\n`;
        analysis += `Empathy: ${appState.playerStats.empathy}/10\n`;
        analysis += `Trust: ${appState.playerStats.trust}/10\n`;
        analysis += `Effectiveness: ${appState.playerStats.effectiveness}/10\n`;
        analysis += `Conversations Completed: ${appState.conversationHistory.length}\n`;
        analysis += `Breakthroughs Achieved: ${appState.breakthroughs.length}\n\n`;
        
        analysis += "STATISTICAL ANALYSIS:\n";
        analysis += `Memory Accuracy: ${appState.memoryPercentage}%\n`;
        analysis += `Rehearsal Confidence Level: ${Math.min(attempts * 15, 95)}%\n\n`;
        
        analysis += "NATHAN'S NOTES:\n";
        analysis += appState.nathanNotes[Math.floor(Math.random() * appState.nathanNotes.length)];
        
        this.showCompletionAnalysis(analysis, isSuccess);
    },
    
    // Show completion analysis modal
    showCompletionAnalysis(analysis, isSuccess) {
        const conversationContainer = document.querySelector('.story-container');
        
        if (conversationContainer) {
            conversationContainer.innerHTML = `
                <div class="completion-analysis ${isSuccess ? 'success' : 'complete'}">
                    <h2>🎭 Rehearsal Complete!</h2>
                    <div class="analysis-content">
                        <pre>${analysis}</pre>
                    </div>
                    <div class="completion-buttons">
                        <button class="choice-button primary" id="tryAgainBtn">
                            🔄 Try This Scenario Again
                        </button>
                        <button class="choice-button secondary" id="returnToScenariosBtn">
                            📋 Choose Different Scenario
                        </button>
                    </div>
                </div>
            `;
            
            // Add event listeners
            document.getElementById('tryAgainBtn').addEventListener('click', this.tryAgain.bind(this));
            document.getElementById('returnToScenariosBtn').addEventListener('click', this.returnToScenarios.bind(this));
        }
    },
    
    // Try the same scenario again
    tryAgain() {
        if (appState.currentScenario) {
            ScenariosModule.selectScenario(appState.currentScenario);
        }
    },
    
    // Return to scenario selection
    returnToScenarios() {
        ScenariosModule.showScenarioSelection();
    },
    
    // Get impact description for choice
    getImpactDescription(impact) {
        const descriptions = [];
        
        Object.entries(impact).forEach(([stat, value]) => {
            if (value > 0) {
                descriptions.push(`+${value} ${stat}`);
            } else if (value < 0) {
                descriptions.push(`${value} ${stat}`);
            }
        });
        
        return descriptions.join(', ');
    }
};

// Make globally accessible
window.ConversationModule = ConversationModule;
window.tryAgain = () => ConversationModule.tryAgain();
window.showFlowchart = () => {
    const history = appState.conversationHistory;
    const flowchartData = `Conversation Flowchart Analysis:\n\nTotal Paths Explored: ${history.length}\nCurrent Branch Depth: ${appState.currentScene}\nUnique Decisions Made: ${new Set(history.map(h => h.choice)).size}\n\nNathan's Note: "I once mapped 247 possible conversation branches for a single 'Hello'. You're doing great."`;
    alert(flowchartData);
};
