// Scripts routes - Director's Studio Backend Integration
// "Every script is a performance blueprint. Document everything." - Nathan

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../middleware/error.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { 
  ApiResponse, 
  successResponse, 
  NATHAN_CONSTANTS
} from '../../types/index.js';
import { RehearsalError } from '../../utils/errors.js';
import { aiService } from '../../services/ai.js';
import prisma from '../../config/database.js';

const router = Router();

// Types for script system
interface ScriptData {
  id: string;
  title: string;
  originalScript: string;
  enhancedScript?: string;
  template: string;
  enhancements: string[];
  nathanLevel: number;
  productionNotes: string[];
  storyboardFrames: Array<{
    emoji: string;
    description: string;
  }>;
  draftNumber: number;
  createdAt: Date;
  updatedAt: Date;
}

interface ScriptAnalysis {
  awkwardnessScore: number;
  rehearsalCount: number;
  complexityRating: number;
  nathanObservation: string;
  improvementSuggestions: string[];
  optimalityScore: number;
}

// Validation schemas
const createScriptSchema = z.object({
  title: z.string().min(1, 'Script title required'),
  originalScript: z.string()
    .min(10, 'Script content too short - Nathan needs more material')
    .max(10000, 'Script content too long - Nathan can\'t handle this much material'),
  template: z.string().optional(),
  enhancements: z.array(z.string()).default([])
});

const updateScriptSchema = z.object({
  title: z.string().min(1).optional(),
  originalScript: z.string().min(10).max(10000).optional(),
  enhancedScript: z.string().optional(),
  enhancements: z.array(z.string()).optional(),
  productionNotes: z.array(z.string()).optional(),
  storyboardFrames: z.array(z.object({
    emoji: z.string(),
    description: z.string()
  })).optional()
});

const enhanceScriptSchema = z.object({
  enhancementType: z.enum(['awkwardness', 'overthinking', 'preparation', 'diagrams', 'statistics', 'replicas']),
  intensity: z.number().min(1).max(10).default(7),
  context: z.string().optional()
});

/**
 * POST /api/scripts
 * Create a new script in Director's Studio
 * Nathan: "Every script starts with an idea. Usually a terrible one."
 */
router.post('/', authenticateToken, asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const validationResult = createScriptSchema.safeParse(req.body);
  if (!validationResult.success) {
    throw new RehearsalError(
      'VALIDATION_ERROR',
      'Invalid script data',
      400,
      'Nathan needs proper script parameters to work with'
    );
  }

  const { title, originalScript, template, enhancements } = validationResult.data;
  const userId = req.user!.id;

  // Calculate initial Nathan level
  const initialNathanLevel = calculateNathanLevel(originalScript, enhancements);

  // Create script in database
  const script = await prisma.script.create({
    data: {
      userId,
      title,
      originalScript,
      template: template || 'custom',
      enhancements: JSON.stringify(enhancements),
      nathanLevel: initialNathanLevel,
      draftNumber: 1,
      productionNotes: JSON.stringify([]),
      storyboardFrames: JSON.stringify([]),
      status: 'DRAFT'
    }
  });

  // Generate initial analysis
  const analysis = await generateScriptAnalysis(originalScript, enhancements);

  const response: ApiResponse = successResponse(
    {
      script: {
        id: script.id,
        title: script.title,
        originalScript: script.originalScript,
        template: script.template,
        enhancements: JSON.parse(script.enhancements as string),
        nathanLevel: script.nathanLevel,
        draftNumber: script.draftNumber,
        createdAt: script.createdAt
      },
      analysis
    },
    `Script "${title}" created with ${initialNathanLevel}% Nathan Fielder authenticity.`
  );

  res.status(201).json(response);
}));

/**
 * GET /api/scripts
 * Get user's scripts with optional filtering
 * Nathan: "Organization is key. I have 1,247 scripts, all categorized."
 */
router.get('/', authenticateToken, asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;
  
  const { 
    template, 
    minNathanLevel, 
    maxNathanLevel, 
    status,
    limit = 20,
    offset = 0 
  } = req.query;

  // Build filter conditions
  const whereConditions: any = { userId };
  
  if (template) whereConditions.template = template;
  if (status) whereConditions.status = status;
  if (minNathanLevel || maxNathanLevel) {
    whereConditions.nathanLevel = {};
    if (minNathanLevel) whereConditions.nathanLevel.gte = parseInt(minNathanLevel as string);
    if (maxNathanLevel) whereConditions.nathanLevel.lte = parseInt(maxNathanLevel as string);
  }

  const [scripts, totalCount] = await Promise.all([
    prisma.script.findMany({
      where: whereConditions,
      orderBy: { updatedAt: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    }),
    prisma.script.count({ where: whereConditions })
  ]);

  // Format scripts for response
  const formattedScripts = scripts.map(script => ({
    id: script.id,
    title: script.title,
    template: script.template,
    nathanLevel: script.nathanLevel,
    draftNumber: script.draftNumber,
    status: script.status,
    createdAt: script.createdAt,
    updatedAt: script.updatedAt,
    preview: script.originalScript.substring(0, 200) + '...'
  }));

  // Calculate user's overall stats
  const userStats = await calculateUserScriptStats(userId);

  const response: ApiResponse = successResponse(
    {
      scripts: formattedScripts,
      pagination: {
        total: totalCount,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        hasMore: (parseInt(offset as string) + parseInt(limit as string)) < totalCount
      },
      userStats
    },
    `Found ${scripts.length} scripts. Nathan would be proud of your productivity.`
  );

  res.json(response);
}));

/**
 * GET /api/scripts/:id
 * Get specific script with full details
 * Nathan: "Every script deserves careful examination"
 */
router.get('/:id', authenticateToken, asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.user!.id;

  const script = await prisma.script.findFirst({
    where: { id, userId }
  });

  if (!script) {
    throw new RehearsalError(
      'SCRIPT_NOT_FOUND',
      'Script not found',
      404,
      'Nathan couldn\'t locate this script in his meticulously organized filing system'
    );
  }

  // Parse JSON fields
  const enhancements = JSON.parse(script.enhancements as string) || [];
  const productionNotes = JSON.parse(script.productionNotes as string) || [];
  const storyboardFrames = JSON.parse(script.storyboardFrames as string) || [];

  // Generate fresh analysis
  const analysis = await generateScriptAnalysis(script.originalScript, enhancements);

  const response: ApiResponse = successResponse(
    {
      script: {
        id: script.id,
        title: script.title,
        originalScript: script.originalScript,
        enhancedScript: script.enhancedScript,
        template: script.template,
        enhancements,
        nathanLevel: script.nathanLevel,
        draftNumber: script.draftNumber,
        productionNotes,
        storyboardFrames,
        status: script.status,
        createdAt: script.createdAt,
        updatedAt: script.updatedAt
      },
      analysis
    },
    `Script analysis complete. Nathan has ${analysis.improvementSuggestions.length} suggestions.`
  );

  res.json(response);
}));

/**
 * PUT /api/scripts/:id
 * Update script content and metadata
 * Nathan: "Revision is the key to perfection. Draft #147 is usually decent."
 */
router.put('/:id', authenticateToken, asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.user!.id;
  
  const validationResult = updateScriptSchema.safeParse(req.body);
  if (!validationResult.success) {
    throw new RehearsalError(
      'VALIDATION_ERROR',
      'Invalid update data',
      400,
      'Nathan needs valid script parameters for revision'
    );
  }

  const updateData = validationResult.data;

  // Verify ownership
  const existingScript = await prisma.script.findFirst({
    where: { id, userId }
  });

  if (!existingScript) {
    throw new RehearsalError(
      'SCRIPT_NOT_FOUND',
      'Script not found or access denied',
      404,
      'Nathan can\'t find this script or you don\'t have permission'
    );
  }

  // Prepare update data
  const updates: any = {
    updatedAt: new Date()
  };

  if (updateData.title) updates.title = updateData.title;
  if (updateData.originalScript) updates.originalScript = updateData.originalScript;
  if (updateData.enhancedScript) updates.enhancedScript = updateData.enhancedScript;
  
  if (updateData.enhancements) {
    updates.enhancements = JSON.stringify(updateData.enhancements);
    // Recalculate Nathan level
    updates.nathanLevel = calculateNathanLevel(
      updateData.originalScript || existingScript.originalScript,
      updateData.enhancements
    );
  }

  if (updateData.productionNotes) {
    updates.productionNotes = JSON.stringify(updateData.productionNotes);
  }

  if (updateData.storyboardFrames) {
    updates.storyboardFrames = JSON.stringify(updateData.storyboardFrames);
  }

  // Increment draft number if content changed
  if (updateData.originalScript || updateData.enhancedScript) {
    updates.draftNumber = existingScript.draftNumber + 1;
  }

  // Update script
  const updatedScript = await prisma.script.update({
    where: { id },
    data: updates
  });

  const response: ApiResponse = successResponse(
    {
      script: {
        id: updatedScript.id,
        title: updatedScript.title,
        nathanLevel: updatedScript.nathanLevel,
        draftNumber: updatedScript.draftNumber,
        updatedAt: updatedScript.updatedAt
      }
    },
    `Script updated to draft #${updatedScript.draftNumber}. Nathan recommends at least 47 more revisions.`
  );

  res.json(response);
}));

/**
 * POST /api/scripts/:id/enhance
 * AI-enhance script with Nathan Fielder methodology
 * Nathan: "AI enhancement is just another form of meticulous preparation"
 */
router.post('/:id/enhance', authenticateToken, asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.user!.id;
  
  const validationResult = enhanceScriptSchema.safeParse(req.body);
  if (!validationResult.success) {
    throw new RehearsalError(
      'VALIDATION_ERROR',
      'Invalid enhancement parameters',
      400,
      'Nathan needs specific enhancement instructions'
    );
  }

  const { enhancementType, intensity, context } = validationResult.data;

  // Verify script ownership
  const script = await prisma.script.findFirst({
    where: { id, userId }
  });

  if (!script) {
    throw new RehearsalError(
      'SCRIPT_NOT_FOUND',
      'Script not found',
      404,
      'Nathan can\'t enhance a script that doesn\'t exist'
    );
  }

  // Generate AI enhancement
  const enhancedScript = await aiService.enhanceScript({
    originalScript: script.originalScript,
    enhancementType,
    intensity,
    context: context || `Mental health scenario with ${intensity}/10 Nathan Fielder awkwardness`,
    existingEnhancements: JSON.parse(script.enhancements as string) || []
  });

  // Update script with enhancement
  const updatedScript = await prisma.script.update({
    where: { id },
    data: {
      enhancedScript: enhancedScript.content,
      draftNumber: script.draftNumber + 1,
      nathanLevel: Math.min(100, script.nathanLevel + 5),
      updatedAt: new Date()
    }
  });

  // Log enhancement for analytics
  await prisma.scriptEnhancement.create({
    data: {
      scriptId: id,
      enhancementType,
      intensity,
      aiModel: enhancedScript.model,
      processingTime: enhancedScript.processingTime,
      nathanLevelBefore: script.nathanLevel,
      nathanLevelAfter: updatedScript.nathanLevel
    }
  });

  const response: ApiResponse = successResponse(
    {
      enhancedScript: enhancedScript.content,
      enhancement: {
        type: enhancementType,
        intensity,
        aiModel: enhancedScript.model,
        processingTime: enhancedScript.processingTime
      },
      script: {
        id: updatedScript.id,
        nathanLevel: updatedScript.nathanLevel,
        draftNumber: updatedScript.draftNumber
      }
    },
    `Script enhanced with ${enhancementType}. Nathan level increased to ${updatedScript.nathanLevel}%.`
  );

  res.json(response);
}));

/**
 * POST /api/scripts/:id/analyze
 * Get comprehensive script analysis
 * Nathan: "Analysis is everything. I once analyzed a 'hello' for 73 hours."
 */
router.post('/:id/analyze', authenticateToken, asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.user!.id;

  const script = await prisma.script.findFirst({
    where: { id, userId }
  });

  if (!script) {
    throw new RehearsalError(
      'SCRIPT_NOT_FOUND',
      'Script not found',
      404,
      'Nathan can\'t analyze a script that doesn\'t exist'
    );
  }

  // Generate comprehensive analysis
  const analysis = await aiService.analyzeScript({
    script: script.enhancedScript || script.originalScript,
    template: script.template,
    enhancements: JSON.parse(script.enhancements as string) || [],
    nathanLevel: script.nathanLevel
  });

  // Store analysis
  await prisma.scriptAnalysis.create({
    data: {
      scriptId: id,
      awkwardnessScore: analysis.awkwardnessScore,
      complexityRating: analysis.complexityRating,
      optimalityScore: analysis.optimalityScore,
      suggestions: JSON.stringify(analysis.improvementSuggestions),
      nathanObservation: analysis.nathanObservation,
      aiModel: analysis.model
    }
  });

  const response: ApiResponse = successResponse(
    {
      analysis: {
        awkwardnessScore: analysis.awkwardnessScore,
        complexityRating: analysis.complexityRating,
        optimalityScore: analysis.optimalityScore,
        rehearsalCount: calculateRehearsalCount(analysis.complexityRating),
        nathanObservation: analysis.nathanObservation,
        improvementSuggestions: analysis.improvementSuggestions,
        breakdown: analysis.breakdown
      }
    },
    analysis.nathanObservation
  );

  res.json(response);
}));

/**
 * DELETE /api/scripts/:id
 * Delete a script
 * Nathan: "Sometimes you need to start over. I've deleted 1,247 scripts."
 */
router.delete('/:id', authenticateToken, asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.user!.id;

  const script = await prisma.script.findFirst({
    where: { id, userId }
  });

  if (!script) {
    throw new RehearsalError(
      'SCRIPT_NOT_FOUND',
      'Script not found',
      404,
      'Nathan can\'t delete a script that doesn\'t exist'
    );
  }

  // Delete script and related data
  await prisma.$transaction([
    prisma.scriptEnhancement.deleteMany({ where: { scriptId: id } }),
    prisma.scriptAnalysis.deleteMany({ where: { scriptId: id } }),
    prisma.script.delete({ where: { id } })
  ]);

  const response: ApiResponse = successResponse(
    { deletedScriptId: id },
    `Script "${script.title}" deleted. Nathan believes in fresh starts.`
  );

  res.json(response);
}));

/**
 * GET /api/scripts/templates
 * Get available script templates
 * Nathan: "Templates are starting points. I have 1,247 variations."
 */
router.get('/templates', authenticateToken, asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const templates = {
    'mental-health': [
      {
        id: 'therapy-first-time',
        title: 'First Therapy Session',
        description: 'Overthinking every word',
        nathanLevel: 65,
        category: 'Mental Health Scenarios'
      },
      {
        id: 'medication-stigma',
        title: 'Taking Medication',
        description: 'Secret pill organization',
        nathanLevel: 78,
        category: 'Mental Health Scenarios'
      },
      {
        id: 'family-dinner-anxiety',
        title: 'Family Dinner Anxiety',
        description: 'Rehearsing small talk',
        nathanLevel: 71,
        category: 'Mental Health Scenarios'
      }
    ],
    'social-situations': [
      {
        id: 'party-exit-strategy',
        title: 'Party Exit Planning',
        description: '47 escape routes',
        nathanLevel: 82,
        category: 'Social Situations'
      },
      {
        id: 'coffee-order-practice',
        title: 'Coffee Shop Rehearsal',
        description: 'Ordering without panic',
        nathanLevel: 68,
        category: 'Social Situations'
      },
      {
        id: 'phone-call-prep',
        title: 'Phone Call Preparation',
        description: 'Script for pizza delivery',
        nathanLevel: 75,
        category: 'Social Situations'
      }
    ],
    'difficult-conversations': [
      {
        id: 'addiction-intervention',
        title: 'Addiction Conversation',
        description: '147 ways to show you care',
        nathanLevel: 89,
        category: 'Difficult Conversations'
      },
      {
        id: 'substance-concern',
        title: 'Expressing Concern',
        description: 'Without judgment flowchart',
        nathanLevel: 91,
        category: 'Difficult Conversations'
      },
      {
        id: 'recovery-support',
        title: 'Supporting Recovery',
        description: 'Being helpful vs enabling',
        nathanLevel: 94,
        category: 'Difficult Conversations'
      }
    ]
  };

  const response: ApiResponse = successResponse(
    { templates },
    'All templates loaded. Nathan has personally tested each one 147 times.'
  );

  res.json(response);
}));

// Helper functions

/**
 * Calculate Nathan Fielder authenticity level
 */
function calculateNathanLevel(script: string, enhancements: string[]): number {
  let level = 20; // Base level
  
  // Content analysis
  const wordCount = script.split(/\s+/).length;
  const awkwardPhrases = ['um', 'uh', 'so...', 'actually', 'interesting'];
  const preparationWords = ['plan', 'strategy', 'calculated', 'rehearse', 'practice'];
  const statisticsWords = ['percent', '%', 'study', 'research', 'data'];
  
  // Word count bonus
  level += Math.min(20, Math.floor(wordCount / 50));
  
  // Content analysis bonus
  awkwardPhrases.forEach(phrase => {
    const count = (script.toLowerCase().match(new RegExp(phrase, 'g')) || []).length;
    level += count * 2;
  });
  
  preparationWords.forEach(word => {
    const count = (script.toLowerCase().match(new RegExp(word, 'g')) || []).length;
    level += count * 3;
  });
  
  statisticsWords.forEach(word => {
    const count = (script.toLowerCase().match(new RegExp(word, 'g')) || []).length;
    level += count * 4;
  });
  
  // Enhancement bonus
  level += enhancements.length * 5;
  
  // Special bonuses
  if (script.includes('flowchart') || script.includes('diagram')) level += 10;
  if (script.includes('replica') || script.includes('build')) level += 12;
  if (script.includes('147') || script.includes('73')) level += 8;
  
  return Math.min(100, level);
}

/**
 * Generate script analysis using AI
 */
async function generateScriptAnalysis(script: string, enhancements: string[]): Promise<ScriptAnalysis> {
  const baseAwkwardness = 47;
  const enhancementMultiplier = enhancements.length * 13;
  const randomFactor = Math.floor(Math.random() * 20);
  
  const awkwardnessScore = Math.min(100, baseAwkwardness + enhancementMultiplier + randomFactor);
  const complexityRating = Math.floor(script.length / 100 + enhancements.length * 5 + Math.random() * 15);
  const rehearsalCount = 73 + complexityRating * 2 + Math.floor(Math.random() * 50);
  
  // Generate Nathan observation
  const observations = [
    "This script captures the precise awkwardness of human interaction.",
    "I see potential for at least 47 different blocking variations.",
    "The dialogue authenticity is 73.4% - within acceptable parameters.",
    "Consider adding more statistical references for credibility.",
    "This reminds me of rehearsal attempt #147 from season 2.",
    "The preparation level shows proper Nathan methodology."
  ];
  
  const suggestions = [
    "Add more specific timing for awkward pauses",
    "Include backup dialogue for when the first option fails",
    "Consider building a scale model of the location",
    "Research actual statistics to make fake ones more believable",
    "Plan for 12 different emotional reactions from other person",
    "Document the documentation process"
  ];
  
  return {
    awkwardnessScore,
    rehearsalCount,
    complexityRating,
    nathanObservation: observations[Math.floor(Math.random() * observations.length)],
    improvementSuggestions: suggestions.slice(0, 3 + Math.floor(Math.random() * 3)),
    optimalityScore: Math.max(0, 100 - Math.abs(rehearsalCount - 147))
  };
}

/**
 * Calculate user's overall script statistics
 */
async function calculateUserScriptStats(userId: string) {
  const [totalScripts, avgNathanLevel, totalDrafts] = await Promise.all([
    prisma.script.count({ where: { userId } }),
    prisma.script.aggregate({
      where: { userId },
      _avg: { nathanLevel: true }
    }),
    prisma.script.aggregate({
      where: { userId },
      _sum: { draftNumber: true }
    })
  ]);

  return {
    totalScripts,
    averageNathanLevel: Math.round(avgNathanLevel._avg.nathanLevel || 0),
    totalDrafts: totalDrafts._sum.draftNumber || 0,
    scriptingRank: calculateScriptingRank(totalScripts, avgNathanLevel._avg.nathanLevel || 0)
  };
}

/**
 * Calculate scripting rank based on Nathan methodology
 */
function calculateScriptingRank(scriptCount: number, avgNathanLevel: number): string {
  const score = scriptCount * 10 + avgNathanLevel;
  
  if (score < 100) return 'Aspiring Rehearser';
  if (score < 300) return 'Dedicated Practicer';
  if (score < 600) return 'Script Methodologist';
  if (score < 1000) return 'Nathan Apprentice';
  if (score < 1500) return 'Master Rehearser';
  return 'Nathan Fielder Level';
}

/**
 * Calculate recommended rehearsal count
 */
function calculateRehearsalCount(complexityRating: number): number {
  return Math.max(47, 73 + complexityRating * 2 + Math.floor(Math.random() * 50));
}

export default router;
