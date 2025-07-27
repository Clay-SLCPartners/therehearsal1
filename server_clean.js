const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      scriptSrcAttr: ["'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Serve the main HTML file first (before static files)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'main.html'));
});

// Also serve main.html at /main.html
app.get('/main.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'main.html'));
});

// Serve the Director's Studio page
app.get('/director-studio.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'director-studio.html'));
});

// Serve static files (but exclude index.html)
app.use(express.static(path.join(__dirname, 'public'), {
  index: false // Don't serve index.html from public folder
}));

// In-memory storage for conversations (in production, use a database)
const conversations = new Map();
const sessions = new Map();

// Scenario data (matches your frontend scenarios)
const scenarios = {
  'friend-checkin': {
    title: 'Checking on a Friend',
    description: "You've noticed your friend Alex has been quieter lately, missing social gatherings, and seems withdrawn. Practice reaching out with empathy and active listening.",
    difficulty: 'beginner',
    initialMessage: "You decide to text Alex, who you haven't heard from in a few weeks...",
    aiPersona: "You are Alex, someone who has been struggling with depression but hasn't talked to anyone about it. You're hesitant to open up but gradually open up if the person shows real empathy and doesn't try to 'fix' everything immediately.",
    responses: {
      initial: "Hey... I'm okay I guess. Just been really busy with work lately.",
      patterns: {
        empathy: ["Thanks for asking... it means a lot that you noticed.", "I appreciate you checking in. I have been struggling a bit."],
        questions: ["I've been feeling pretty overwhelmed lately, to be honest.", "It's hard to explain... just feeling really down."],
        solutions: ["I know you want to help, but I'm not ready for advice right now.", "Maybe... I just need someone to listen for now."]
      }
    }
  },
  'therapy-suggestion': {
    title: 'Suggesting Therapy',
    description: "Your friend has been sharing their struggles with anxiety and depression. You think therapy could help, but they've been resistant to the idea.",
    difficulty: 'intermediate',
    initialMessage: "During a coffee chat, your friend mentions they've been having a really hard time lately...",
    aiPersona: "You are someone dealing with anxiety and depression who is resistant to therapy due to cost concerns, stigma, and doubt about its effectiveness.",
    responses: {
      initial: "I don't know... I've been thinking about therapy but it seems so expensive. And what if they just think I'm being dramatic?",
      patterns: {
        cost: ["Yeah, the cost is really what's holding me back. I can barely afford rent as it is.", "I looked into it but even with insurance it's still expensive."],
        stigma: ["I grew up thinking therapy was for 'crazy' people. It's hard to shake that feeling.", "What if people find out? I'm worried about being judged."],
        effectiveness: ["How do I know it will even work? What if I'm just wasting money?", "I've heard mixed things about therapy. Some people say it helped, others say it didn't."]
      }
    }
  }
};

// Crisis keywords for detection
const crisisKeywords = [
  'suicide', 'kill myself', 'end it all', 'not worth living',
  'better off dead', 'hurt myself', 'self harm', 'cutting',
  'overdose', 'end my life', 'no point in living', 'worthless',
  'hopeless', 'give up', 'can\'t go on', 'want to die'
];

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Get available scenarios
app.get('/api/scenarios', (req, res) => {
  const scenarioList = Object.keys(scenarios).map(key => ({
    id: key,
    title: scenarios[key].title,
    description: scenarios[key].description,
    difficulty: scenarios[key].difficulty
  }));
  res.json(scenarioList);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 The Rehearsal AI server is running on port ${PORT}`);
  console.log(`📱 Visit http://localhost:${PORT} to access the application`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 Running in development mode');
  }
});

module.exports = app;
