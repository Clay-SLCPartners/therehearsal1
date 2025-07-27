// TypeScript type definitions for The Rehearsal AI
// "Type safety is just another form of preparation" - Nathan

/**
 * Standard API Response format
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata: {
    timestamp: string;
    requestId?: string;
    nathanNote?: string;
    version?: string;
  };
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

/**
 * User interface
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'premium' | 'admin';
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  lastLogin?: Date;
  preferences: UserPreferences;
  stats: UserStats;
}

export interface UserPreferences {
  nathanLevel: number;
  defaultEnhancements: string[];
  notificationSettings: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacySettings: {
    shareStats: boolean;
    shareScripts: boolean;
  };
}

export interface UserStats {
  totalScripts: number;
  averageNathanLevel: number;
  totalDrafts: number;
  totalRehearsals: number;
  favoriteEnhancements: string[];
  scriptingRank: string;
  joinedAt: Date;
  lastActive: Date;
}

/**
 * Script-related interfaces
 */
export interface Script {
  id: string;
  userId: string;
  title: string;
  originalScript: string;
  enhancedScript?: string;
  template: string;
  enhancements: string[];
  nathanLevel: number;
  draftNumber: number;
  status: 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';
  productionNotes: string[];
  storyboardFrames: StoryboardFrame[];
  metadata: ScriptMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoryboardFrame {
  id: string;
  frameNumber: number;
  emoji: string;
  description: string;
  notes?: string;
}

export interface ScriptMetadata {
  wordCount: number;
  characterCount: number;
  estimatedReadingTime: number;
  complexity: number;
  tags: string[];
  category: string;
  isPublic: boolean;
}

/**
 * Script enhancement interfaces
 */
export interface ScriptEnhancement {
  id: string;
  scriptId: string;
  enhancementType: EnhancementType;
  intensity: number;
  aiModel: string;
  processingTime: number;
  nathanLevelBefore: number;
  nathanLevelAfter: number;
  createdAt: Date;
}

export type EnhancementType = 
  | 'awkwardness'
  | 'overthinking'
  | 'preparation'
  | 'diagrams'
  | 'statistics'
  | 'replicas';

/**
 * Script analysis interfaces
 */
export interface ScriptAnalysis {
  id: string;
  scriptId: string;
  awkwardnessScore: number;
  complexityRating: number;
  optimalityScore: number;
  rehearsalCount: number;
  suggestions: string[];
  nathanObservation: string;
  aiModel: string;
  breakdown: AnalysisBreakdown;
  createdAt: Date;
}

export interface AnalysisBreakdown {
  structure: {
    scenes: number;
    characters: number;
    dialogueRatio: number;
    stageDirectionRatio: number;
  };
  content: {
    awkwardnessTriggers: string[];
    preparationElements: string[];
    statisticalReferences: number;
    nathanisms: string[];
  };
  improvement: {
    strengthAreas: string[];
    improvementAreas: string[];
    enhancementSuggestions: string[];
  };
}

/**
 * Conversation and scenario interfaces
 */
export interface Conversation {
  id: string;
  userId: string;
  scenarioId: string;
  currentScene: number;
  choices: ConversationChoice[];
  outcome: ConversationOutcome;
  stats: ConversationStats;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationChoice {
  sceneId: string;
  choiceId: string;
  choiceText: string;
  impact: {
    empathy: number;
    trust: number;
    effectiveness: number;
  };
  timestamp: Date;
}

export interface ConversationOutcome {
  result: 'success' | 'partial' | 'failure';
  finalStats: {
    empathy: number;
    trust: number;
    effectiveness: number;
  };
  achievements: string[];
  nathanFeedback: string;
}

export interface ConversationStats {
  totalTime: number;
  averageResponseTime: number;
  retries: number;
  hintsUsed: number;
}

/**
 * Scenario interfaces
 */
export interface Scenario {
  id: string;
  title: string;
  description: string;
  category: ScenarioCategory;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'nathan-level';
  character: ScenarioCharacter;
  scenes: Scene[];
  metadata: ScenarioMetadata;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScenarioCharacter {
  name: string;
  avatar: string;
  initialMood: string;
  background: string;
  triggers: string[];
  preferences: string[];
}

export interface Scene {
  id: string;
  sceneNumber: number;
  text: string;
  dialogue: string;
  mood: string;
  choices: SceneChoice[];
  isBreakthrough?: boolean;
  isEnd?: boolean;
  outcome?: string;
}

export interface SceneChoice {
  id: string;
  text: string;
  impact: {
    empathy: number;
    trust: number;
    effectiveness: number;
  };
  next: string;
  difficulty: number;
  successRate: number;
}

export type ScenarioCategory = 
  | 'friend-support'
  | 'therapy-suggestion'
  | 'social-anxiety'
  | 'crisis-response'
  | 'workplace-mental-health'
  | 'addiction-support'
  | 'family-dynamics';

export interface ScenarioMetadata {
  averageCompletionTime: number;
  successRate: number;
  completionCount: number;
  rating: number;
  tags: string[];
  learningObjectives: string[];
}

/**
 * Analytics interfaces
 */
export interface UserAnalytics {
  userId: string;
  scriptMetrics: ScriptMetrics;
  conversationMetrics: ConversationMetrics;
  learningProgress: LearningProgress;
  streaks: UserStreaks;
  achievements: Achievement[];
  generatedAt: Date;
}

export interface ScriptMetrics {
  totalScripts: number;
  averageNathanLevel: number;
  totalDrafts: number;
  mostUsedEnhancements: Array<{ type: string; count: number }>;
  averageWordsPerScript: number;
  categoryBreakdown: Array<{ category: string; count: number }>;
}

export interface ConversationMetrics {
  totalConversations: number;
  averageScore: number;
  successRate: number;
  averageTime: number;
  mostDifficultScenarios: Array<{ scenario: string; attempts: number }>;
  improvementAreas: string[];
}

export interface LearningProgress {
  level: number;
  experience: number;
  nextLevelExperience: number;
  skillPoints: {
    empathy: number;
    communication: number;
    resilience: number;
    preparation: number;
  };
  competencies: Array<{
    name: string;
    level: number;
    progress: number;
  }>;
}

export interface UserStreaks {
  current: number;
  longest: number;
  scriptingStreak: number;
  conversationStreak: number;
  lastActivity: Date;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  unlockedAt: Date;
  progress?: {
    current: number;
    target: number;
  };
}

/**
 * Nathan Fielder constants and configurations
 */
export const NATHAN_CONSTANTS = {
  DEFAULT_REHEARSAL_COUNT: 147,
  MINIMUM_REHEARSAL_COUNT: 47,
  MAXIMUM_REHEARSAL_COUNT: 1247,
  DEFAULT_NATHAN_LEVEL: 73,
  PERFECT_NATHAN_LEVEL: 100,
  AWKWARDNESS_THRESHOLD: 80,
  PREPARATION_MULTIPLIER: 1.47,
  STATISTICS_ACCURACY: 73.4,
  OPTIMAL_PAUSE_DURATION: 3.7,
  BACKUP_PLAN_COUNT: 12,
  FLOWCHART_COMPLEXITY: 23,
  REPLICA_SCALE: 1.0,
  DOCUMENTATION_LEVELS: 7
} as const;

/**
 * API Configuration
 */
export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  version: string;
  rateLimit: {
    requests: number;
    window: number;
  };
}

/**
 * Health check interface
 */
export interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  services: {
    database: ServiceStatus;
    ai: ServiceStatus;
    storage: ServiceStatus;
  };
  nathanNote: string;
}

export interface ServiceStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime?: number;
  lastCheck: string;
  message?: string;
}

/**
 * Response helper functions
 */
export function successResponse<T>(
  data: T, 
  message: string = 'Operation successful',
  metadata: Partial<ApiResponse['metadata']> = {}
): ApiResponse<T> {
  return {
    success: true,
    message,
    data,
    metadata: {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      ...metadata
    }
  };
}

export function errorResponse(
  code: string,
  message: string,
  statusCode: number = 500,
  details?: any,
  nathanNote?: string
): ApiResponse {
  return {
    success: false,
    message,
    error: {
      code,
      message,
      details
    },
    metadata: {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      nathanNote: nathanNote || 'Nathan encountered an unplanned scenario'
    }
  };
}

/**
 * Validation schemas (to be used with zod)
 */
export const ValidationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  nathanLevel: /^(100|[1-9]?[0-9])$/,
  scriptTitle: /^[a-zA-Z0-9\s\-_'".!?]{1,100}$/,
  enhancementType: /^(awkwardness|overthinking|preparation|diagrams|statistics|replicas)$/
} as const;
