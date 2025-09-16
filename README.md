# Warm Transfer Application with LiveKit and LLM Integration

A comprehensive warm transfer system that enables seamless call handoffs between agents with AI-powered context sharing using LiveKit, LLM integration, and optional Twilio support.

## 🚀 Features

- **Real-time Communication**: LiveKit-powered audio calls with low latency
- **Warm Transfer**: Seamless agent-to-agent handoffs with context preservation
- **AI-Powered Summaries**: LLM-generated call summaries for better context sharing
- **Interactive UI**: Modern Next.js interface for call management
- **Optional Twilio Integration**: Support for external phone number transfers
- **Multi-Agent Support**: Handle multiple concurrent calls and transfers

## 🏗️ Architecture

\`\`\`
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   LiveKit       │
│   (Next.js)     │◄──►│   (FastAPI)     │◄──►│   Server        │
│                 │    │                 │    │                 │
│ - Call Interface│    │ - Room Mgmt     │    │ - Audio Rooms   │
│ - Transfer UI   │    │ - Transfer Logic│    │ - Participants  │
│ - Status Display│    │ - LLM Integration│   │ - Token Auth    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   LLM Service   │
                    │ (OpenAI/Groq)   │
                    │                 │
                    │ - Call Summaries│
                    │ - Context Gen   │
                    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   Twilio API    │
                    │   (Optional)    │
                    │                 │
                    │ - Phone Calls   │
                    │ - SIP Support   │
                    └─────────────────┘
\`\`\`

## 🔄 Warm Transfer Flow

1. **Initial Call**: Customer connects to Agent A via LiveKit room
2. **Context Building**: Agent A gathers customer information and context
3. **Transfer Initiation**: Agent A decides to transfer and creates transfer room
4. **AI Summary**: LLM generates call summary from collected context
5. **Agent Briefing**: Agent A joins transfer room with Agent B and shares summary
6. **Transfer Completion**: Agent A leaves original room, Agent B takes over
7. **Optional Extension**: Transfer to external phone via Twilio

## 📋 Prerequisites

Before running the application, you need to obtain API keys from the following services:

### Required Services

1. **LiveKit** (Required)
   - Sign up at [livekit.io](https://livekit.io)
   - Create a project and get API Key & Secret
   - Note your WebSocket URL

2. **LLM Provider** (Choose one)
   - **Groq** (Recommended for speed): [console.groq.com](https://console.groq.com)
   - **OpenAI**: [platform.openai.com](https://platform.openai.com)

### Optional Services

3. **Twilio** (Optional - for phone integration)
   - Sign up at [twilio.com](https://twilio.com)
   - Get Account SID, Auth Token, and Phone Number

## 🛠️ Installation & Setup

### 1. Clone the Repository

\`\`\`bash
git clone <repository-url>
cd warm-transfer-app
\`\`\`

### 2. Backend Setup

\`\`\`bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file and configure
cp .env.example .env
# Edit .env with your API keys (see configuration section below)
\`\`\`

### 3. Frontend Setup

\`\`\`bash
cd frontend

# Install dependencies
npm install

# Copy environment file and configure
cp .env.local.example .env.local
# Edit .env.local with your configuration
\`\`\`

### 4. LiveKit Server Setup

You have two options for running LiveKit:

#### Option A: Docker (Recommended)
\`\`\`bash
docker run --rm \
  -p 7880:7880 \
  -p 7881:7881 \
  -p 7882:7882/udp \
  livekit/livekit-server \
  --dev
\`\`\`

#### Option B: Binary Installation
1. Download from [github.com/livekit/livekit/releases](https://github.com/livekit/livekit/releases)
2. Run: `./livekit-server --dev`

## ⚙️ Configuration

### Backend Configuration (.env)

\`\`\`env
# LiveKit Configuration (Required)
LIVEKIT_API_KEY=your_livekit_api_key_here
LIVEKIT_API_SECRET=your_livekit_api_secret_here
LIVEKIT_WS_URL=ws://localhost:7880

# LLM Configuration (Choose one or both)
# Groq API Key (Recommended for faster inference)
GROQ_API_KEY=your_groq_api_key_here

# OpenAI API Key
OPENAI_API_KEY=your_openai_api_key_here

# Twilio Configuration (Optional)
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=your_twilio_phone_number_here

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
FRONTEND_URL=http://localhost:3000
\`\`\`

### Frontend Configuration (.env.local)

\`\`\`env
# Frontend Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# LiveKit Configuration (for client-side)
NEXT_PUBLIC_LIVEKIT_WS_URL=ws://localhost:7880
\`\`\`

## 🚀 Running the Application

### 1. Start LiveKit Server
\`\`\`bash
# Using Docker
docker run --rm \
  -p 7880:7880 \
  -p 7881:7881 \
  -p 7882:7882/udp \
  livekit/livekit-server \
  --dev
\`\`\`

### 2. Start Backend Server
\`\`\`bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python main.py
\`\`\`
Backend will be available at: http://localhost:8000

### 3. Start Frontend Server
\`\`\`bash
cd frontend
npm run dev
\`\`\`
Frontend will be available at: http://localhost:3000

## 📱 Usage Instructions

### Basic Call Flow

1. **Start a Call**
   - Open http://localhost:3000
   - Enter your name as the caller
   - Click "Start Call" to connect with Agent A

2. **Simulate Agent A**
   - The system automatically creates Agent A
   - Audio connection is established via LiveKit

3. **Initiate Transfer**
   - In the Transfer Panel, enter "Agent B" name
   - Click "Initiate Transfer"
   - System creates transfer room and generates AI summary

4. **Complete Transfer**
   - Agent A and Agent B are now in transfer room
   - AI summary is shared for context
   - Click "Complete Transfer" to move Agent B to original room

### Optional Twilio Integration

1. **Configure Twilio**
   - Add Twilio credentials to backend .env
   - Ensure you have a verified phone number

2. **Transfer to Phone**
   - Enter phone number in "Transfer to Phone" section
   - Click "Transfer via Twilio"
   - System will call the number and share AI summary

## 🔧 API Endpoints

### Core Endpoints

- `POST /api/create-call` - Create new call session
- `POST /api/initiate-transfer` - Start warm transfer process
- `POST /api/complete-transfer` - Complete the transfer
- `POST /api/add-context` - Add context to call session
- `GET /api/call-status/{session_id}` - Get call status

### Optional Endpoints

- `POST /api/twilio-transfer` - Transfer to external phone

## 🧪 Testing

### Manual Testing

1. **Single Browser Testing**
   - Open multiple tabs to simulate different participants
   - Use different names for caller, Agent A, and Agent B

2. **Multi-Device Testing**
   - Use different devices/browsers for each participant
   - Test audio quality and transfer functionality

### API Testing

\`\`\`bash
# Test call creation
curl -X POST http://localhost:8000/api/create-call \
  -H "Content-Type: application/json" \
  -d '{"caller_id": "test_caller"}'

# Test adding context
curl -X POST http://localhost:8000/api/add-context \
  -H "Content-Type: application/json" \
  -d '{"session_id": "your_session_id", "message": "Customer needs help with billing"}'
\`\`\`

## 🐛 Troubleshooting

### Common Issues

1. **LiveKit Connection Failed**
   - Ensure LiveKit server is running on port 7880
   - Check WebSocket URL in configuration
   - Verify API keys are correct

2. **Audio Not Working**
   - Check browser permissions for microphone
   - Ensure HTTPS in production (required for WebRTC)
   - Test with different browsers

3. **LLM Integration Issues**
   - Verify API keys are valid and have credits
   - Check network connectivity
   - Review API rate limits

4. **Twilio Integration Problems**
   - Verify account SID and auth token
   - Ensure phone number is verified
   - Check Twilio account balance

### Debug Mode

Enable debug logging in backend:
\`\`\`python
import logging
logging.basicConfig(level=logging.DEBUG)
\`\`\`

## 🔒 Security Considerations

1. **API Keys**: Never commit API keys to version control
2. **HTTPS**: Use HTTPS in production for WebRTC
3. **Token Validation**: LiveKit tokens have expiration times
4. **CORS**: Configure CORS properly for production
5. **Rate Limiting**: Implement rate limiting for API endpoints

## 🚀 Deployment

### Backend Deployment

1. **Using Docker**
\`\`\`bash
cd backend
docker build -t warm-transfer-backend .
docker run -p 8000:8000 --env-file .env warm-transfer-backend
\`\`\`

2. **Using Heroku/Railway/Render**
   - Set environment variables in platform
   - Deploy using git or Docker

### Frontend Deployment

1. **Vercel (Recommended)**
\`\`\`bash
cd frontend
npm run build
vercel --prod
\`\`\`

2. **Netlify**
\`\`\`bash
cd frontend
npm run build
# Deploy dist folder to Netlify
\`\`\`

### LiveKit Production

For production, use LiveKit Cloud or deploy your own LiveKit server:
- [LiveKit Cloud](https://cloud.livekit.io)
- [Self-hosted deployment](https://docs.livekit.io/deploy/)

## 📊 Monitoring & Analytics

### Metrics to Track

1. **Call Metrics**
   - Total calls initiated
   - Successful transfers
   - Transfer completion rate
   - Average call duration

2. **Performance Metrics**
   - API response times
   - WebRTC connection quality
   - LLM response times

3. **Error Tracking**
   - Failed connections
   - Transfer failures
   - API errors

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
1. Check the troubleshooting section
2. Review LiveKit documentation: [docs.livekit.io](https://docs.livekit.io)
3. Open an issue on GitHub
4. Contact the development team

## 🔮 Future Enhancements

- [ ] Multi-language support
- [ ] Video calling support
- [ ] Call recording functionality
- [ ] Advanced analytics dashboard
- [ ] Mobile app support
- [ ] Integration with CRM systems
- [ ] Advanced AI features (sentiment analysis, etc.)
