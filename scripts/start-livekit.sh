#!/bin/bash

# Start LiveKit server using Docker
echo "Starting LiveKit server..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Docker is not running. Please start Docker first."
    exit 1
fi

# Stop any existing LiveKit container
docker stop livekit-server 2>/dev/null || true
docker rm livekit-server 2>/dev/null || true

# Start LiveKit server
docker run --name livekit-server --rm -d \
  -p 7880:7880 \
  -p 7881:7881 \
  -p 7882:7882/udp \
  -e LIVEKIT_KEYS="devkey: secret" \
  livekit/livekit-server:latest

echo "LiveKit server started on:"
echo "  WebSocket: ws://localhost:7880"
echo "  HTTP: http://localhost:7881"
echo ""
echo "Waiting for server to be ready..."
sleep 5

# Test if server is responding
if curl -s http://localhost:7881/health > /dev/null; then
    echo "✅ LiveKit server is ready!"
else
    echo "❌ LiveKit server failed to start"
    exit 1
fi
