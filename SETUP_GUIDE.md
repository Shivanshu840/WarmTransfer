# Quick Setup Guide

## 🚀 Quick Start (5 minutes)

### 1. Get API Keys

**LiveKit** (Required):
1. Go to [livekit.io](https://livekit.io) → Sign up
2. Create project → Copy API Key & Secret
3. Note WebSocket URL (usually `wss://your-project.livekit.cloud`)

**Groq** (Recommended for LLM):
1. Go to [console.groq.com](https://console.groq.com) → Sign up
2. Create API key → Copy key

### 2. Setup Backend

\`\`\`bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
\`\`\`

Edit `backend/.env`:
\`\`\`env
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_secret
LIVEKIT_WS_URL=ws://localhost:7880
GROQ_API_KEY=your_groq_api_key
\`\`\`

### 3. Setup Frontend

\`\`\`bash
cd frontend
npm install
\`\`\`

Edit `frontend/.env.local`:
\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_LIVEKIT_WS_URL=ws://localhost:7880
\`\`\`

### 4. Run Everything

**Terminal 1 - LiveKit Server:**
\`\`\`bash
docker run --rm -p 7880:7880 -p 7881:7881 -p 7882:7882/udp livekit/livekit-server --dev
\`\`\`

**Terminal 2 - Backend:**
\`\`\`bash
cd backend
source venv/bin/activate
python main.py
\`\`\`

**Terminal 3 - Frontend:**
\`\`\`bash
cd frontend
npm run dev
\`\`\`

### 5. Test

1. Open http://localhost:3000
2. Enter name → Start Call
3. Try transfer functionality

## 🔧 Production Setup

For production deployment:

1. **Use LiveKit Cloud**: Replace `ws://localhost:7880` with your LiveKit Cloud URL
2. **Deploy Backend**: Use Heroku, Railway, or Docker
3. **Deploy Frontend**: Use Vercel, Netlify, or similar
4. **Environment Variables**: Set all required env vars in your deployment platform

## ❓ Need Help?

- Check `README.md` for detailed instructions
- Review troubleshooting section
- Open GitHub issue for support
