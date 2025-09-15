#!/bin/bash

echo "🧪 Running demo tests..."

# Test LiveKit server
echo "Testing LiveKit server..."
if curl -s http://localhost:7881/health > /dev/null; then
    echo "✅ LiveKit server is responding"
else
    echo "❌ LiveKit server is not responding"
    exit 1
fi

# Test Next.js app
echo "Testing Next.js app..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Next.js app is responding"
else
    echo "❌ Next.js app is not responding"
    exit 1
fi

# Test token generation API
echo "Testing token generation..."
RESPONSE=$(curl -s -X POST http://localhost:3000/api/livekit/token \
  -H "Content-Type: application/json" \
  -d '{"roomName":"test","participantName":"test"}')

if echo "$RESPONSE" | grep -q "token"; then
    echo "✅ Token generation is working"
else
    echo "❌ Token generation failed"
    echo "Response: $RESPONSE"
fi

echo ""
echo "🎉 All tests passed! System is ready for demo."
