// AI Service - Nathan Fielder Style Script Enhancement
// "AI is just another form of meticulous preparation" - Nathan

import OpenAI from 'openai';

interface ScriptEnhancementRequest {
  originalScript: string;
  enhancementType: 'awkwardness' | 'overthinking' | 'preparation' | 'diagrams' | 'statistics' | 'replicas';
  intensity: number; // 1-10
  context?: string;
  existingEnhancements: string[];
}

interface ScriptAnalysisRequest {
  script: string;
  template: string;
  enhancements: string[];
  nathanLevel: number;
}

interface EnhancementResult {
  content: string;
  model: string;
  processingTime: number;
  nathanLevelIncrease: number;
}

interface AnalysisResult {
  awkwardnessScore: number;
  complexityRating: number;
  optimalityScore: number;
  nathanObservation: string;
  improvementSuggestions: string[];
  breakdown: {
    dialogueQuality: number;
    preparationLevel: number;
    awkwardnessAuthenticity: number;
    statisticalCredibility: number;
  };
  model: string;
}

class AIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  /**
   * Enhance script with Nathan Fielder methodology
   */
  async enhanceScript(request: ScriptEnhancementRequest): Promise<EnhancementResult> {
    const startTime = Date.now();
    
    // Choose AI model based on enhancement type
    
    const enhancementPrompts = {
      awkwardness: this.getAwkwardnessPrompt(request),
      overthinking: this.getOverthinkingPrompt(request),
      preparation: this.getPreparationPrompt(request),
      diagrams: this.getDiagramsPrompt(request),
      statistics: this.getStatisticsPrompt(request),
      replicas: this.getReplicasPrompt(request)
    };

    const prompt = enhancementPrompts[request.enhancementType];
    
    let enhancedContent: string;
    let modelUsed: string;

    // Use OpenAI for all enhancements for now
    const completion = await this.openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are Nathan Fielder, the master of awkward preparation and meticulous planning. Enhance scripts with your signature style of over-preparation, statistical analysis, and beautiful awkwardness."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 2000
    });
    
    enhancedContent = completion.choices[0].message.content || '';
    modelUsed = 'gpt-4-turbo-preview';

    const processingTime = Date.now() - startTime;
    const nathanLevelIncrease = Math.floor(request.intensity * 1.5);

    return {
      content: enhancedContent,
      model: modelUsed,
      processingTime,
      nathanLevelIncrease
    };
  }

  /**
   * Analyze script with comprehensive Nathan methodology
   */
  async analyzeScript(request: ScriptAnalysisRequest): Promise<AnalysisResult> {
    const prompt = `
As Nathan Fielder, provide a comprehensive analysis of this mental health script. Your analysis should be meticulous, slightly obsessive, and include specific numerical scores.

SCRIPT TO ANALYZE:
${request.script}

CONTEXT:
- Template: ${request.template}
- Current Nathan Level: ${request.nathanLevel}%
- Enhancements: ${request.enhancements.join(', ') || 'None'}

Provide analysis in this exact format:

AWKWARDNESS_SCORE: [0-100] (How authentically awkward this feels)
COMPLEXITY_RATING: [0-100] (Level of preparation and detail)
OPTIMALITY_SCORE: [0-100] (How close to perfect Nathan methodology)

DIALOGUE_QUALITY: [0-100] (Realism of conversation)
PREPARATION_LEVEL: [0-100] (Evidence of over-preparation)
AWKWARDNESS_AUTHENTICITY: [0-100] (Natural vs forced awkwardness)
STATISTICAL_CREDIBILITY: [0-100] (Use of believable fake statistics)

NATHAN_OBSERVATION: [One paragraph of Nathan's commentary on this script, including specific observations and comparisons to his own work]

IMPROVEMENT_SUGGESTIONS: [Exactly 3-5 specific suggestions in Nathan's voice, each starting with a dash]

Remember: Be specific, analytical, and include references to actual preparation techniques Nathan would use.
`;

    const completion = await this.openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system", 
          content: "You are Nathan Fielder providing comprehensive script analysis. Be meticulous, analytical, and include specific numerical scores."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });

    const response = completion.choices[0].message.content || '';
    
    // Parse the structured response
    const analysis = this.parseAnalysisResponse(response);
    
    return {
      ...analysis,
      model: 'gpt-4-turbo'
    };
  }

  /**
   * Generate Nathan-style production notes
   */
  async generateProductionNotes(script: string, enhancementTypes: string[]): Promise<string[]> {
    const prompt = `
As Nathan Fielder, generate exactly 5 production notes for this mental health script. Each note should be absurdly detailed and preparation-focused.

SCRIPT:
${script}

ENHANCEMENT TYPES: ${enhancementTypes.join(', ')}

Format each note as a complete sentence starting with an action verb. Make them increasingly specific and Nathan-like.

Examples:
- Build exact replica of therapy office, including water stain on ceiling tile #47
- Hire 73 background actors to practice different reactions to the word "feelings"
- Create detailed spreadsheet tracking every micro-expression for 147 possible responses

Generate 5 notes in this style:
`;

    const completion = await this.openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are Nathan Fielder generating production notes. Be absurdly specific and preparation-focused."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.9,
      max_tokens: 800
    });

    const response = completion.choices[0].message.content || '';
    
    // Extract notes (assuming each starts with a dash)
    const notes = response
      .split('\n')
      .filter(line => line.trim().startsWith('-'))
      .map(line => line.replace(/^-\s*/, '').trim())
      .slice(0, 5);

    return notes.length > 0 ? notes : [
      "Build 1:1 scale replica of conversation location in controlled environment",
      "Hire professional actors to play all potential responses, including 47 variations of 'hmm'",
      "Create detailed timing charts for optimal pause lengths (3.7 seconds proven most effective)",
      "Install hidden cameras to document the documentation process",
      "Prepare 147 backup conversation starters in case of total social breakdown"
    ];
  }

  // Enhancement prompt generators

  private getAwkwardnessPrompt(request: ScriptEnhancementRequest): string {
    return `
Take this mental health script and enhance it with Nathan Fielder-level awkwardness (intensity ${request.intensity}/10).

ORIGINAL SCRIPT:
${request.originalScript}

Add elements like:
- Unnaturally long pauses with specific timing
- Over-explaining simple concepts
- Inappropriate statistical references
- Physical comedy through over-preparation
- Breaking the fourth wall with documentary-style observations

Make it ${request.intensity * 10}% more awkward while keeping the mental health message intact. Add [AWKWARD PAUSE - X.X seconds] notations and internal monologue sections.

Enhanced script:
`;
  }

  private getOverthinkingPrompt(request: ScriptEnhancementRequest): string {
    return `
Enhance this mental health script with Nathan Fielder's signature overthinking (intensity ${request.intensity}/10).

ORIGINAL SCRIPT:
${request.originalScript}

Add elements like:
- Internal monologue analyzing every word choice
- Preparing for 47 different conversation outcomes
- Second-guessing basic social interactions
- Meta-commentary on the conversation process
- Flowcharts and decision trees mentioned in dialogue

Show the character's mind working in overdrive, planning and re-planning every interaction.

Enhanced script:
`;
  }

  private getPreparationPrompt(request: ScriptEnhancementRequest): string {
    return `
Enhance this mental health script with Nathan's over-preparation methodology (intensity ${request.intensity}/10).

ORIGINAL SCRIPT:
${request.originalScript}

Add elements like:
- Multiple backup plans for every scenario
- Rehearsed responses to common questions
- Physical props and preparation materials
- References to extensive research and practice
- Time spent preparing vs. actual conversation time

Show the character has prepared for this conversation like a military operation.

Enhanced script:
`;
  }

  private getDiagramsPrompt(request: ScriptEnhancementRequest): string {
    return `
Enhance this mental health script with Nathan's love of visual aids and flowcharts (intensity ${request.intensity}/10).

ORIGINAL SCRIPT:
${request.originalScript}

Add elements like:
- Flowcharts for conversation paths
- Diagrams explaining emotional states
- Charts tracking success rates
- Visual aids for complex concepts
- References to laminated instruction cards

The character should have diagrams for everything, treating human interaction like a science.

Enhanced script:
`;
  }

  private getStatisticsPrompt(request: ScriptEnhancementRequest): string {
    return `
Enhance this mental health script with Nathan's use of fake but believable statistics (intensity ${request.intensity}/10).

ORIGINAL SCRIPT:
${request.originalScript}

Add elements like:
- Specific percentages (73.4%, 147 cases studied, etc.)
- References to "research" and "studies"
- Statistical analysis of conversation success rates
- Data-driven decision making
- Numerical backing for every claim

Make every statement sound scientifically backed with convincing fake statistics.

Enhanced script:
`;
  }

  private getReplicasPrompt(request: ScriptEnhancementRequest): string {
    return `
Enhance this mental health script with Nathan's tendency to build replicas and practice environments (intensity ${request.intensity}/10).

ORIGINAL SCRIPT:
${request.originalScript}

Add elements like:
- Building exact replicas of conversation locations
- Creating practice environments
- Scale models for planning purposes
- Hiring actors to practice scenarios
- References to construction and preparation time

The character should treat this like a major production requiring physical sets and rehearsal spaces.

Enhanced script:
`;
  }

  // Parse AI analysis response
  private parseAnalysisResponse(response: string): Omit<AnalysisResult, 'model'> {
    const defaultValues = {
      awkwardnessScore: 73,
      complexityRating: 67,
      optimalityScore: 81,
      nathanObservation: "This script shows promise but needs more statistical backing and at least 47 additional rehearsals.",
      improvementSuggestions: [
        "Add more specific timing for awkward pauses",
        "Include backup dialogue for when the first option fails",
        "Consider building a scale model of the location"
      ],
      breakdown: {
        dialogueQuality: 75,
        preparationLevel: 68,
        awkwardnessAuthenticity: 82,
        statisticalCredibility: 45
      }
    };

    try {
      // Extract numerical scores
      const awkwardnessMatch = response.match(/AWKWARDNESS_SCORE:\s*(\d+)/);
      const complexityMatch = response.match(/COMPLEXITY_RATING:\s*(\d+)/);
      const optimalityMatch = response.match(/OPTIMALITY_SCORE:\s*(\d+)/);
      
      const dialogueMatch = response.match(/DIALOGUE_QUALITY:\s*(\d+)/);
      const preparationMatch = response.match(/PREPARATION_LEVEL:\s*(\d+)/);
      const awkwardnessAuthMatch = response.match(/AWKWARDNESS_AUTHENTICITY:\s*(\d+)/);
      const statisticalMatch = response.match(/STATISTICAL_CREDIBILITY:\s*(\d+)/);

      // Extract observation
      const observationMatch = response.match(/NATHAN_OBSERVATION:\s*(.*?)(?=\n\n|\nIMPROVEMENT_SUGGESTIONS|$)/);
      
      // Extract suggestions
      const suggestionsMatch = response.match(/IMPROVEMENT_SUGGESTIONS:\s*((?:\n?-.*)+)/);
      const suggestions = suggestionsMatch 
        ? suggestionsMatch[1].split('\n').filter(line => line.trim().startsWith('-')).map(line => line.replace(/^-\s*/, '').trim())
        : defaultValues.improvementSuggestions;

      return {
        awkwardnessScore: awkwardnessMatch ? parseInt(awkwardnessMatch[1]) : defaultValues.awkwardnessScore,
        complexityRating: complexityMatch ? parseInt(complexityMatch[1]) : defaultValues.complexityRating,
        optimalityScore: optimalityMatch ? parseInt(optimalityMatch[1]) : defaultValues.optimalityScore,
        nathanObservation: observationMatch ? observationMatch[1].trim() : defaultValues.nathanObservation,
        improvementSuggestions: suggestions.slice(0, 5),
        breakdown: {
          dialogueQuality: dialogueMatch ? parseInt(dialogueMatch[1]) : defaultValues.breakdown.dialogueQuality,
          preparationLevel: preparationMatch ? parseInt(preparationMatch[1]) : defaultValues.breakdown.preparationLevel,
          awkwardnessAuthenticity: awkwardnessAuthMatch ? parseInt(awkwardnessAuthMatch[1]) : defaultValues.breakdown.awkwardnessAuthenticity,
          statisticalCredibility: statisticalMatch ? parseInt(statisticalMatch[1]) : defaultValues.breakdown.statisticalCredibility
        }
      };
    } catch (error) {
      console.warn('Failed to parse AI analysis response, using defaults:', error);
      return defaultValues;
    }
  }
}

export const aiService = new AIService();
