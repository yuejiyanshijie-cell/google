#!/bin/bash
# Deployment script for PURE app
# This script builds and deploys the application using Docker

set -e  # Exit on error

echo "🚀 Starting deployment process..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Build the application
echo "📦 Building the application..."
npm run build

# Build Docker image
echo "🐳 Building Docker image..."
docker-compose build --no-cache

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down || true

# Start new containers
echo "✨ Starting new containers..."
docker-compose up -d

# Wait for health check
echo "⏳ Waiting for application to be healthy..."
sleep 10

# Check container status
if docker-compose ps | grep -q "Up"; then
    echo "✅ Deployment successful!"
    echo "🌐 Application is running at: http://localhost"
else
    echo "❌ Deployment failed. Check logs with: docker-compose logs"
    exit 1
fi
