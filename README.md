# LiveKit Warm Transfer System

A comprehensive warm transfer implementation using LiveKit, LLMs, and optional Twilio integration for seamless agent handoffs with AI-generated call summaries.

## 🚀 Features

### Core Functionality
- **Real-time Communication**: LiveKit-powered audio/video calls
- **Warm Transfer Flow**: Seamless agent-to-agent handoffs
- **AI Call Analysis**: LLM-powered call summaries and context generation
- **Interactive UI**: Next.js dashboard for agents and call management
- **Transfer Progress Tracking**: Real-time status updates and flow visualization

### Advanced Features
- **Sentiment Analysis**: Real-time emotion detection during calls
- **Response Suggestions**: AI-powered agent assistance
- **Call Analytics**: Comprehensive conversation insights
- **Twilio Integration**: Connect to real phone numbers and SIP devices
- **Multi-Agent Support**: Scalable agent management system

## 🏗️ Architecture

\`\`\`
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend UI   │    │   LiveKit API   │    │   LLM Service   │
│   (Next.js)     │◄──►│   (Rooms/Auth)  │    │   (OpenAI)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Transfer Logic  │    │ Room Management │    │ Call Analysis   │
│ (State Machine) │    │ (Participants)  │    │ (Transcripts)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │
         ▼
┌─────────────────┐
│ Twilio Bridge   │
│ (Optional)      │
└─────────────────┘
\`\`\`

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ and npm/yarn
- LiveKit server (local or cloud)
- OpenAI API key
- Twilio account (optional, for phone integration)

### 1. Clone and Install
\`\`\`bash
git clone <repository-url>
cd livekit-warm-transfer
npm install
\`\`\`

### 2. Environment Configuration
Create a `.env.local` file:

\`\`\`env
# LiveKit Configuration
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
NEXT_PUBLIC_LIVEKIT_WS_URL=ws://localhost:7880

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Twilio Configuration (Optional)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Application Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
\`\`\`

### 3. Start LiveKit Server
\`\`\`bash
# Using Docker
docker run --rm -p 7880:7880 -p 7881:7881 -p 7882:7882/udp \
  -e LIVEKIT_KEYS="devkey: secret" \
  livekit/livekit-server:latest

# Or download binary from https://github.com/livekit/livekit/releases
\`\`\`

### 4. Run the Application
\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000` to access the agent dashboard.

## 📋 Warm Transfer Workflow

### Step 1: Initial Call Setup
1. Customer connects to Agent A via LiveKit room
2. Real-time transcript recording begins
3. AI sentiment analysis tracks conversation mood
4. Call analytics generate insights and suggestions

### Step 2: Transfer Initiation
1. Agent A clicks "Transfer Call" button
2. System analyzes call transcript using LLM
3. AI generates comprehensive call summary
4. Transfer briefing created for receiving agent

### Step 3: Agent Handoff
1. New LiveKit room created for Agent A + Agent B
2. Agent B joins the handoff room
3. Agent A delivers AI-generated transfer explanation
4. Context and call summary shared with Agent B

### Step 4: Transfer Completion
1. Agent A leaves original call room
2. Agent B joins original room with customer
3. Seamless continuation of customer conversation
4. Transfer session marked as completed

### Optional: Twilio Integration
- Transfer calls to real phone numbers
- SIP device integration for enterprise systems
- AI-generated explanations delivered to human agents
- Conference calling for complex transfers

## 🎯 API Endpoints

### LiveKit Integration
- `POST /api/livekit/token` - Generate access tokens
- `GET /api/livekit/rooms` - List active rooms

### Transfer Management
- `POST /api/transfer/initiate-v2` - Start warm transfer
- `POST /api/transfer/complete-v2` - Complete transfer
- `GET /api/transfer/status/[id]` - Get transfer status
- `POST /api/transfer/cancel/[id]` - Cancel transfer

### LLM Services
- `POST /api/llm/analyze-call` - Generate call analysis
- `POST /api/llm/sentiment` - Analyze message sentiment
- `POST /api/llm/suggestions` - Get response suggestions

### Twilio Integration (Optional)
- `POST /api/twilio/call` - Make outbound call
- `POST /api/twilio/transfer` - Transfer to phone/SIP
- `GET /api/twilio/twiml/*` - TwiML generation

## 🧪 Demo Scenarios

### Scenario 1: Basic Warm Transfer
1. Join as "Agent Alice" from dashboard
2. Simulate customer conversation using transcript
3. Click "Transfer Call" to initiate handoff
4. Review AI-generated call summary
5. Complete transfer to "Agent Bob"

### Scenario 2: Phone Integration
1. Configure Twilio credentials
2. Make outbound call to real phone number
3. Connect phone caller to LiveKit room
4. Transfer call with AI context to another phone

### Scenario 3: Analytics Demo
1. Start call with multiple conversation turns
2. Watch real-time sentiment analysis
3. View AI-generated response suggestions
4. Analyze call insights and action items

## 🔧 Configuration Options

### LiveKit Settings
\`\`\`typescript
// lib/livekit.ts
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY || "devkey"
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET || "secret"
const LIVEKIT_WS_URL = process.env.NEXT_PUBLIC_LIVEKIT_WS_URL || "ws://localhost:7880"
\`\`\`

### LLM Configuration
\`\`\`typescript
// lib/llm.ts
const model = openai("gpt-4o-mini") // or "gpt-4o" for better quality
\`\`\`

### Agent Management
\`\`\`typescript
// lib/transfer-manager.ts
// Add custom agents with specific capabilities
activeAgents.set("custom-agent", {
  id: "custom-agent",
  name: "Custom Agent",
  type: "human", // or "ai"
  status: "available",
  capabilities: ["billing", "technical", "escalation"]
})
\`\`\`

## 🚨 Troubleshooting

### Common Issues

**LiveKit Connection Failed**
- Verify LiveKit server is running on correct port
- Check WebSocket URL in environment variables
- Ensure firewall allows WebRTC traffic

**LLM API Errors**
- Confirm OpenAI API key is valid and has credits
- Check API rate limits and quotas
- Verify network connectivity to OpenAI servers

**Twilio Integration Issues**
- Validate Twilio credentials in console
- Ensure phone number is verified for trial accounts
- Check webhook URLs are publicly accessible

**Transfer Failures**
- Verify both agents are available and connected
- Check room permissions and token validity
- Monitor browser console for WebRTC errors

### Debug Mode
Enable detailed logging:
\`\`\`typescript
// Add to any component
console.log("[v0] Debug info:", data)
\`\`\`

## 📊 Performance Considerations

### Scalability
- LiveKit supports 1000+ participants per room
- Transfer sessions stored in memory (use database for production)
- LLM calls cached to reduce API costs
- WebRTC optimized for low latency

### Production Deployment
- Use Redis for session storage
- Implement proper error handling and retries
- Set up monitoring and alerting
- Configure CDN for static assets
- Use environment-specific configurations

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [LiveKit](https://livekit.io) for real-time communication infrastructure
- [OpenAI](https://openai.com) for LLM capabilities
- [Twilio](https://twilio.com) for telephony integration
- [Vercel](https://vercel.com) for deployment platform
- [Next.js](https://nextjs.org) for the React framework
