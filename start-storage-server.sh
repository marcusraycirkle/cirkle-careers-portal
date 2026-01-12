#!/bin/bash

# Employer Suite Storage Server Start Script
# This script helps you start the storage server with proper configuration

echo "🚀 Starting Employer Suite Storage Server..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16 or higher is required. Current: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if storage-server.env exists
if [ ! -f "storage-server.env" ]; then
    echo "❌ storage-server.env file not found!"
    echo ""
    echo "Creating storage-server.env from example..."
    cp storage-server.env.example storage-server.env
    echo ""
    echo "📝 Please edit storage-server.env and add your configuration:"
    echo "   - API_KEY: Generate with 'openssl rand -hex 32'"
    echo "   - STORAGE_PATH: Path to store files (default: /var/employersuit/storage)"
    echo "   - PORT: Server port (default: 3100)"
    echo ""
    echo "After editing, run this script again."
    exit 1
fi

# Check if API_KEY is configured
if grep -q "your-generated-api-key-here" storage-server.env; then
    echo "❌ API_KEY not configured in storage-server.env!"
    echo ""
    echo "Generate a secure API key:"
    echo "  openssl rand -hex 32"
    echo ""
    echo "Then update storage-server.env with the generated key."
    exit 1
fi

# Load environment variables
export $(grep -v '^#' storage-server.env | xargs)

echo "✅ Configuration loaded from storage-server.env"

# Check if storage directory exists
if [ ! -d "$STORAGE_PATH" ]; then
    echo "⚠️  Storage directory does not exist: $STORAGE_PATH"
    echo "Creating directory..."
    mkdir -p "$STORAGE_PATH" 2>/dev/null || {
        echo "❌ Failed to create directory. You may need sudo:"
        echo "   sudo mkdir -p $STORAGE_PATH"
        echo "   sudo chown -R $USER:$USER $STORAGE_PATH"
        exit 1
    }
    chmod 755 "$STORAGE_PATH"
    echo "✅ Storage directory created"
fi

# Check if required npm packages are installed
if [ ! -d "node_modules" ]; then
    echo "⚠️  Dependencies not installed. Installing..."
    npm install express multer cors helmet rate-limiter-flexible morgan
fi

echo "✅ Dependencies ready"

# Check if port is available
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "❌ Port $PORT is already in use!"
    echo "   Kill the process or change PORT in storage-server.env"
    exit 1
fi

echo "✅ Port $PORT is available"

# Start the server
echo ""
echo "🎉 Starting storage server on port $PORT..."
echo "📁 Storage path: $STORAGE_PATH"
echo "🔐 API authentication enabled"
echo ""
echo "Press Ctrl+C to stop the server"
echo "================================"
echo ""

node storage-server.js
