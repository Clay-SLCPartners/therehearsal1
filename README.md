# The Rehearsal AI - Backend Server

A Node.js/Express backend server for The Rehearsal AI mental health conversation practice platform.

## Setup Instructions

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Setup:**
   - Copy `.env` file and update the variables as needed
   - The server will run on port 3000 by default
   - OpenAI API key is optional (for enhanced AI responses in future versions)

3. **Start the server:**
   
   **Development mode (with auto-restart):**
   ```bash
   npm run dev
   ```
   
   **Production mode:**
   ```bash
   npm start
   ```

4. **Access the application:**
   - Open your browser to: `http://localhost:3000`
   - API health check: `http://localhost:3000/api/health`

## API Endpoints

### Core Endpoints

- `GET /` - Serves the main HTML application
- `GET /api/health` - Health check endpoint
- `GET /api/scenarios` - Get list of available conversation scenarios

### Conversation Management

- `POST /api/conversations/start` - Start a new conversation
  ```json
  {
    "scenarioId": "friend-checkin"
  }
  ```

- `POST /api/conversations/:id/messages` - Send a message in a conversation
  ```json
  {
    "message": "Hey, how are you doing?"
  }
  ```

- `GET /api/conversations/:id` - Get conversation history

- `POST /api/conversations/:id/end` - End conversation and get feedback

## Features

### 🎭 Conversation Scenarios
- **Friend Check-in** - Practice reaching out to someone who seems withdrawn
- **Therapy Suggestion** - Navigate suggesting professional help
- **Workplace Mental Health** - Handle mental health conversations at work
- **Family Discussion** - Bridge generational gaps in mental health understanding
- **Crisis Response** - Learn appropriate crisis intervention techniques
- **Self-Advocacy** - Practice asking for help and communicating your needs

### 🔒 Security Features
- Helmet.js for security headers
- CORS protection
- Input validation and sanitization
- Crisis content detection and appropriate response

### 🚨 Crisis Detection
The server automatically detects crisis-related keywords and provides appropriate resources:
- National Suicide Prevention Lifeline: 988
- Crisis Text Line: 741741
- Trevor Project: 1-866-488-7386

### 📊 Conversation Feedback
Automated feedback system that evaluates:
- Empathy and validation skills
- Quality of questions asked
- Overall conversation effectiveness
- Specific areas for improvement

## Project Structure

```
therehearsal/
├── server.js           # Main Express server
├── package.json        # Node.js dependencies and scripts
├── .env               # Environment variables
├── index.html         # Frontend application
└── README.md          # This file
```

## Development

### Adding New Scenarios
Scenarios are defined in the `scenarios` object in `server.js`. Each scenario includes:
- Metadata (title, description, difficulty)
- AI persona definition
- Response patterns for different conversation types
- Initial messages and responses

### Database Integration
Currently uses in-memory storage. For production, consider:
- MongoDB for conversation storage
- Redis for session management
- PostgreSQL for user data and analytics

### Enhanced AI Integration
The server is prepared for OpenAI integration:
- Set `OPENAI_API_KEY` in environment variables
- Modify `generateAIResponse()` function to use OpenAI API
- Implement more sophisticated conversation analysis

## Environment Variables

```bash
NODE_ENV=development          # Environment mode
PORT=3000                    # Server port
OPENAI_API_KEY=your_key      # Optional: OpenAI API key
SESSION_SECRET=your_secret   # Session management secret
CORS_ORIGINS=http://localhost:3000  # Allowed CORS origins
```

## Mental Health Resources

This application provides crisis resources:
- **National Suicide Prevention Lifeline:** 988
- **Crisis Text Line:** Text HOME to 741741
- **Trevor Project:** 1-866-488-7386 (LGBTQ+ youth)

## Disclaimer

This is an educational tool for practicing mental health conversations. It is not a replacement for professional mental health services, therapy, or crisis intervention. Always encourage users experiencing mental health crises to seek professional help immediately.

## License

MIT License - This project is created for educational purposes to address America's mental health crisis.

## Contributing

This project welcomes contributions that improve mental health awareness and conversation skills. Please ensure all contributions maintain the educational and supportive nature of the platform.
