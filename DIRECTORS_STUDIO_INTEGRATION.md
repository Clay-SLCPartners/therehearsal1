# Director's Studio Backend Integration Guide

## Overview
This guide shows how to integrate the Director's Studio with your existing Rehearsal backend now that `the-rehearsal-ai-backend` is moved inside the main `therehearsal` project folder.

## Current Project Structure
```
therehearsal/
├── index.html                    # Main rehearsal app
├── director-studio.html          # Director's Studio (updated with backend integration)
├── server.js                     # Simple Express server
├── the-rehearsal-ai-backend/     # Moved backend (was previously separate)
│   ├── src/
│   │   ├── api/routes/
│   │   │   ├── conversations.ts  # Existing conversation routes
│   │   │   └── scripts.ts        # NEW: Director's Studio routes
│   │   ├── services/
│   │   │   └── ai.ts             # NEW: AI script enhancement service
│   │   └── middleware/
│   └── prisma/
└── DIRECTORS_STUDIO_INTEGRATION.md
```

## Files Created/Modified

### 1. New Backend Route: `scripts.ts`
Location: `therehearsal/the-rehearsal-ai-backend/src/api/routes/scripts.ts`
- ✅ Uses correct import paths matching your existing `conversations.ts`
- ✅ Handles CRUD operations for scripts
- ✅ AI enhancement endpoints
- ✅ Script analysis with Nathan methodology  
- ✅ Template management

### 2. AI Service: `ai.ts`
Location: `therehearsal/the-rehearsal-ai-backend/src/services/ai.ts`
- ✅ OpenAI integration (simplified to avoid Anthropic dependency issues)
- ✅ Nathan Fielder-style script enhancement
- ✅ Comprehensive script analysis
- ✅ Production notes generation
- ✅ Compatible with your existing backend structure

### 3. Database Schema Extensions
Location: `therehearsal/the-rehearsal-ai-backend/prisma/schema-extensions.prisma`
- Script model for storing user scripts
- ScriptEnhancement tracking
- ScriptAnalysis for AI insights
- ScriptStatus enum

### 4. Frontend Integration
Location: `therehearsal/director-studio.html`
- ✅ Backend API integration
- ✅ Authentication support
- ✅ Real-time script saving
- ✅ AI-powered enhancements

## Integration Steps

### Step 1: Add Scripts Route to Your Backend
In your main backend router (likely `the-rehearsal-ai-backend/src/api/index.ts`), add:

```typescript
import scriptsRouter from './routes/scripts.js';

// Add to your existing router setup
app.use('/api/scripts', scriptsRouter);
```

### Step 2: Install OpenAI Dependency
```bash
cd the-rehearsal-ai-backend
npm install openai
```

### Step 3: Environment Variables
Add to your `.env` file in the backend:
```
OPENAI_API_KEY=your_openai_key
```

### Step 4: Database Migration
Add the schema extensions to your main Prisma schema and run:
```bash
cd the-rehearsal-ai-backend
npx prisma db push
```

### Step 5: Fix Conversation Flow Issues (if needed)
Based on your code, there might be missing scene connections. The `makeChoice` function should find all referenced scenes. Check for:
- Missing scene IDs that are referenced in `next:` properties
- Incomplete scenario definitions
- Scene connection validation

## Fixed Import Paths ✅

The files I created now use the correct import structure that matches your existing `conversations.ts`:

```typescript
// ✅ Correct imports matching your existing backend
import { asyncHandler } from '../middleware/error.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { 
  ApiResponse, 
  successResponse, 
  NATHAN_CONSTANTS
} from '../../types/index.js';
import { RehearsalError } from '../../utils/errors.js';
import { aiService } from '../../services/ai.js';
```

## API Endpoints

### Scripts
- `POST /api/scripts` - Create new script
- `GET /api/scripts` - List user scripts  
- `GET /api/scripts/:id` - Get specific script
- `PUT /api/scripts/:id` - Update script
- `DELETE /api/scripts/:id` - Delete script

### AI Features
- `POST /api/scripts/:id/enhance` - AI enhance script
- `POST /api/scripts/:id/analyze` - Analyze script
- `GET /api/scripts/templates` - Get templates

## Troubleshooting

### If Conversations End Early
1. Check browser console for "Scene not found" errors
2. Verify all `next:` references have corresponding scene `id:` definitions
3. Ensure all scenarios have complete scene chains leading to `success`

### If Director's Studio Can't Save
1. Verify backend is running and accessible
2. Check authentication token in localStorage ('rehearsal_token')
3. Confirm OpenAI API key is set in backend environment

### If AI Enhancement Fails
1. Verify OpenAI API key is valid and has credits
2. Check backend logs for API errors
3. Ensure proper authentication for AI endpoints

## Next Steps

1. **Test the Integration:**
   - Start your backend server
   - Open Director's Studio  
   - Create and save a script
   - Try AI enhancements

2. **Fix Any Missing Scenes:**
   - If conversations end early, check console errors
   - Add missing scene definitions
   - Verify scene connection paths

3. **Enhance with More Features:**
   - Add script sharing between users
   - Integrate with main conversation system
   - Add more AI enhancement types

The Director's Studio is now properly integrated with your moved backend structure! 🎬
