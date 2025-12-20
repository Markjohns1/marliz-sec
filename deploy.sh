#!/bin/bash

# 1. Pull latest code
echo "🚀 Pulling latest code..."
git pull origin main

# 2. Rebuild and restart containers (Fast mode - uses cache where possible)
echo "🔄 Rebuilding and restarting..."
sudo docker compose up -d --build --remove-orphans

echo "✅ Deployment complete! System is live on Nginx."
