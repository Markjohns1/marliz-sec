#!/bin/bash
set -e

echo "🚀 Starting Force Deployment..."

# 1. Force Git Sync (Discard local changes on server to ensure 100% match)
echo "📥 Fetching latest code..."
git fetch origin main
git reset --hard origin/main

# 2. Stop Containers
echo "🛑 Stopping containers..."
docker-compose down --remove-orphans

# 3. Build Fresh (No Cache)
echo "🏗️  Rebuilding containers (forcing code update)..."
docker-compose build --no-cache

# 4. Start
echo "✅ Starting services..."
docker-compose up -d

echo "📜 Checking logs for 10 seconds..."
sleep 2
docker-compose logs --tail=20 web

echo "🎉 Deployment Complete!"
