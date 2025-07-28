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

// Also serve main.html when accessed directly
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
  },
  'workplace-mental-health': {
    title: 'Workplace Mental Health',
    description: "A colleague seems to be struggling and their work performance has changed. Navigate this sensitive conversation with appropriate professional boundaries.",
    difficulty: 'intermediate',
    initialMessage: "You notice a colleague has seemed overwhelmed and stressed lately...",
    aiPersona: "You are a coworker dealing with burnout and stress but trying to maintain professionalism. You're worried about job security.",
    responses: {
      initial: "I'm fine, just a lot on my plate right now. I can handle it.",
      patterns: {
        workload: ["The deadlines have been really intense lately.", "I'm trying to keep up but there's just so much to do."],
        support: ["I appreciate you asking... I guess I have been struggling to keep up.", "It's nice to know someone noticed. I've been trying to hide it."],
        boundaries: ["I don't want to burden you with work problems.", "I'm not sure if I should be talking about this at work."]
      }
    }
  },
  'family-conversation': {
    title: 'Family Discussion',
    description: "You want to talk to a family member about mental health, but there are generational differences and potential stigma to navigate.",
    difficulty: 'intermediate',
    initialMessage: "You're visiting family and want to check in with a relative who seems to be struggling...",
    aiPersona: "You are an older family member who believes in 'toughing things out' and sees therapy as a sign of weakness.",
    responses: {
      initial: "Mental health? We didn't have that when I was growing up. We just dealt with our problems.",
      patterns: {
        generational: ["In my day, we didn't talk about feelings all the time.", "People are too soft nowadays. We just pushed through."],
        concern: ["Maybe you're right... I have been feeling different lately.", "I suppose things were harder to talk about back then."],
        resistance: ["I don't need a stranger telling me what's wrong with my life.", "I've made it this far without help, haven't I?"]
      }
    }
  },
  'crisis-response': {
    title: 'Crisis Response',
    description: "Someone has just expressed thoughts of suicide. This is a practice scenario for learning appropriate crisis intervention techniques.",
    difficulty: 'advanced',
    initialMessage: "During a conversation, someone you care about mentions they've been having thoughts of ending their life...",
    aiPersona: "You are someone in emotional crisis who has been having suicidal thoughts. You're scared but also feel hopeless.",
    responses: {
      initial: "I've been thinking... maybe everyone would be better off if I wasn't here anymore.",
      patterns: {
        direct: ["Yes... I have been thinking about ending my life.", "It scares me to say it out loud, but yes, I've been having those thoughts."],
        support: ["Thank you for asking directly. It helps to know someone cares.", "I'm scared but I don't know what else to do."],
        hopeless: ["I just don't see a way out of this pain.", "Everything feels impossible right now."]
      }
    }
  },
  'self-advocacy': {
    title: 'Self-Advocacy',
    description: "Practice asking for help and communicating your own mental health needs to friends, family, or healthcare providers.",
    difficulty: 'beginner',
    initialMessage: "You've decided it's time to reach out for support with your mental health...",
    aiPersona: "You are a supportive friend who wants to help but isn't sure how.",
    responses: {
      initial: "Of course I want to help! What's going on? What can I do?",
      patterns: {
        specific: ["That helps me understand. What kind of support would be most helpful?", "I appreciate you being specific about what you need."],
        listening: ["I'm here to listen. Take your time.", "You don't have to explain everything at once."],
        overwhelmed: ["This sounds like a lot to handle. I'm glad you reached out.", "I may not have all the answers, but I care about you."]
      }
    }
  },
  'going-to-doctor': {
    title: 'Going to the Doctor',
    description: "Practice advocating for your mental health with a healthcare provider who might not take your concerns seriously.",
    difficulty: 'intermediate',
    initialMessage: "You're sitting in the doctor's office, waiting to discuss your mental health concerns...",
    aiPersona: "You are a busy doctor who sometimes dismisses mental health concerns or rushes through appointments. You need patients to be clear and persistent about their needs.",
    responses: {
      initial: "So what brings you in today? I see this is listed as a mental health consultation.",
      patterns: {
        specific: ["Those are significant symptoms. How long have you been experiencing this?", "I can see this is affecting your quality of life. Let's discuss treatment options."],
        vague: ["Can you be more specific about what you're experiencing?", "I need more details to understand how to help you."],
        persistent: ["I appreciate you advocating for yourself. Let me refer you to a specialist.", "You're right to follow up on this. Mental health is important."]
      }
    }
  },
  'tough-work-conversation': {
    title: 'Tough Conversation at Work',
    description: "Navigate a difficult workplace discussion about requesting mental health accommodations with your manager.",
    difficulty: 'intermediate',
    initialMessage: "You've scheduled a meeting with your manager to discuss mental health accommodations...",
    aiPersona: "You are a manager who cares about employee wellbeing but also needs to balance business needs. You appreciate clear communication and specific requests.",
    responses: {
      initial: "Thanks for scheduling this meeting. What did you want to discuss?",
      patterns: {
        professional: ["I appreciate you being upfront about this. What accommodations would be helpful?", "Mental health is important. Let's work together on this."],
        specific: ["Those sound like reasonable requests. Let me talk to HR about formalizing this.", "I can see how that would help. What's the timeline for implementing this?"],
        vague: ["I want to support you, but I need more specifics about what you need.", "Help me understand what changes would make the biggest difference."]
      }
    }
  },
  'asking-someone-out': {
    title: 'Asking Someone Out',
    description: "Practice handling vulnerability and potential rejection while asking someone you're interested in on a date.",
    difficulty: 'beginner',
    initialMessage: "You've been getting coffee with Alex from your book club for weeks. Today you want to ask them out...",
    aiPersona: "You are someone who enjoys spending time with the person but hasn't considered dating them yet. You appreciate honesty and directness.",
    responses: {
      initial: "I always enjoy our conversations! What's on your mind?",
      patterns: {
        direct: ["Oh! I wasn't expecting that, but I'm flattered. Let me think about it.", "I appreciate you being honest about how you feel."],
        respectful: ["I really value our friendship too. Thank you for being considerate about that.", "It means a lot that you'd put our friendship first."],
        casual: ["That sounds fun! Are you thinking of this as a date, or just hanging out?", "I'd love to spend more time together. What did you have in mind?"]
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

// Start a new conversation
app.post('/api/conversations/start', (req, res) => {
  const { scenarioId } = req.body;
  
  if (!scenarios[scenarioId]) {
    return res.status(400).json({ error: 'Invalid scenario ID' });
  }
  
  const conversationId = uuidv4();
  const conversation = {
    id: conversationId,
    scenarioId,
    scenario: scenarios[scenarioId],
    messages: [],
    startTime: new Date(),
    state: 'active'
  };
  
  conversations.set(conversationId, conversation);
  
  res.json({
    conversationId,
    scenario: {
      title: scenarios[scenarioId].title,
      description: scenarios[scenarioId].description,
      initialMessage: scenarios[scenarioId].initialMessage
    },
    initialResponse: scenarios[scenarioId].responses.initial
  });
});

// Send a message in a conversation
app.post('/api/conversations/:id/messages', (req, res) => {
  const { id } = req.params;
  const { message } = req.body;
  
  const conversation = conversations.get(id);
  if (!conversation) {
    return res.status(404).json({ error: 'Conversation not found' });
  }
  
  if (!message || message.trim().length === 0) {
    return res.status(400).json({ error: 'Message cannot be empty' });
  }
  
  // Add user message to conversation
  const userMessage = {
    id: uuidv4(),
    role: 'user',
    content: message.trim(),
    timestamp: new Date()
  };
  conversation.messages.push(userMessage);
  
  // Check for crisis content
  const isCrisis = detectCrisis(message);
  if (isCrisis) {
    const crisisResponse = {
      id: uuidv4(),
      role: 'system',
      content: 'I notice you mentioned something concerning. Your safety is the most important thing right now. Please consider reaching out to crisis resources.',
      timestamp: new Date(),
      isCrisis: true
    };
    conversation.messages.push(crisisResponse);
    
    return res.json({
      response: crisisResponse,
      isCrisis: true,
      crisisResources: {
        national: '988',
        crisis: '741741',
        trevor: '1-866-488-7386'
      }
    });
  }
  
  // Generate AI response
  const aiResponse = generateAIResponse(conversation, message);
  const aiMessage = {
    id: uuidv4(),
    role: 'ai',
    content: aiResponse,
    timestamp: new Date()
  };
  conversation.messages.push(aiMessage);
  
  res.json({
    response: aiMessage,
    isCrisis: false
  });
});

// Get conversation history
app.get('/api/conversations/:id', (req, res) => {
  const { id } = req.params;
  const conversation = conversations.get(id);
  
  if (!conversation) {
    return res.status(404).json({ error: 'Conversation not found' });
  }
  
  res.json(conversation);
});

// End conversation and get feedback
app.post('/api/conversations/:id/end', (req, res) => {
  const { id } = req.params;
  const conversation = conversations.get(id);
  
  if (!conversation) {
    return res.status(404).json({ error: 'Conversation not found' });
  }
  
  conversation.state = 'completed';
  conversation.endTime = new Date();
  
  const feedback = generateFeedback(conversation);
  
  res.json({
    feedback,
    conversationSummary: {
      duration: conversation.endTime - conversation.startTime,
      messageCount: conversation.messages.length,
      scenario: conversation.scenario.title
    }
  });
});

// Helper functions

function detectCrisis(message) {
  const lowerMessage = message.toLowerCase();
  return crisisKeywords.some(keyword => lowerMessage.includes(keyword));
}

function generateAIResponse(conversation, userMessage) {
  const scenario = conversation.scenario;
  const messageHistory = conversation.messages;
  const lowerMessage = userMessage.toLowerCase();
  
  // Analyze the user's message for patterns
  let responseCategory = 'general';
  
  if (lowerMessage.includes('sorry') || lowerMessage.includes('understand') || lowerMessage.includes('feel')) {
    responseCategory = 'empathy';
  } else if (lowerMessage.includes('?')) {
    responseCategory = 'questions';
  } else if (lowerMessage.includes('should') || lowerMessage.includes('try') || lowerMessage.includes('maybe')) {
    responseCategory = 'solutions';
  }
  
  // Get appropriate responses based on scenario and message pattern
  const responses = scenario.responses.patterns;
  let possibleResponses = [];
  
  if (responses[responseCategory]) {
    possibleResponses = responses[responseCategory];
  } else {
    // Fallback to general responses
    possibleResponses = [
      "I appreciate you saying that.",
      "That's helpful to hear.",
      "Can you tell me more about that?",
      "I'm glad we're talking about this."
    ];
  }
  
  // Select a random response
  return possibleResponses[Math.floor(Math.random() * possibleResponses.length)];
}

function generateFeedback(conversation) {
  const userMessages = conversation.messages.filter(msg => msg.role === 'user');
  
  if (userMessages.length === 0) {
    return {
      overall: 5,
      empathy: 5,
      questions: 5,
      areas: ['Try to engage more in the conversation']
    };
  }
  
  // Calculate empathy score
  const empathyWords = ['sorry', 'understand', 'feel', 'sounds difficult', 'here for you', 'care'];
  let empathyScore = 5;
  
  userMessages.forEach(msg => {
    empathyWords.forEach(word => {
      if (msg.content.toLowerCase().includes(word)) {
        empathyScore += 0.5;
      }
    });
  });
  empathyScore = Math.min(10, Math.round(empathyScore));
  
  // Calculate question quality score
  const questionCount = userMessages.filter(msg => msg.content.includes('?')).length;
  const questionScore = Math.min(10, 5 + (questionCount * 1.5));
  
  const overallScore = Math.round((empathyScore + questionScore) / 2);
  
  const strengths = [];
  const improvements = [];
  
  if (empathyScore >= 7) {
    strengths.push('Excellent use of empathetic language');
  } else {
    improvements.push('Try to use more validating and empathetic phrases');
  }
  
  if (questionScore >= 7) {
    strengths.push('Great use of open-ended questions');
  } else {
    improvements.push('Ask more open-ended questions to encourage sharing');
  }
  
  if (userMessages.length >= 5) {
    strengths.push('Good engagement and conversation length');
  }
  
  return {
    overall: overallScore,
    empathy: empathyScore,
    questions: Math.round(questionScore),
    strengths,
    improvements,
    messageCount: userMessages.length,
    conversationLength: conversation.endTime - conversation.startTime
  };
}

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

// Start the server - serving main.html
app.listen(PORT, () => {
  console.log(`🚀 The Rehearsal AI server is running on port ${PORT}`);
  console.log(`📱 Visit http://localhost:${PORT} to access the application`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 Running in development mode');
  }
});

module.exports = app;