#!/bin/bash

echo "🔍 Checking system requirements..."

# Check Docker
if command -v docker &> /dev/null; then
    echo "✅ Docker is installed"
    if docker info &> /dev/null; then
        echo "✅ Docker is running"
    else
        echo "❌ Docker is not running. Please start Docker."
        exit 1
    fi
else
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js is installed: $NODE_VERSION"
else
    echo "❌ Node.js is not installed. Please install Node.js 18+."
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "✅ npm is installed: $NPM_VERSION"
else
    echo "❌ npm is not installed."
    exit 1
fi

# Check if .env.local exists
if [ -f ".env.local" ]; then
    echo "✅ .env.local file exists"
    
    # Check for required variables
    if grep -q "LIVEKIT_API_KEY" .env.local; then
        echo "✅ LIVEKIT_API_KEY is configured"
    else
        echo "⚠️  LIVEKIT_API_KEY not found in .env.local"
    fi
    
    if grep -q "OPENAI_API_KEY" .env.local; then
        echo "✅ OPENAI_API_KEY is configured"
    else
        echo "⚠️  OPENAI_API_KEY not found in .env.local (LLM features will not work)"
    fi
else
    echo "⚠️  .env.local file not found. Please create it with required variables."
fi

echo ""
echo "🚀 Ready to start! Run: npm run dev:full"
