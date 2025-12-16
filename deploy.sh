#!/bin/bash

# Marliz Security - Deployment Script
# Usage: ./deploy.sh

# Stop on errors
set -e

echo "🚀 Starting Deployment..."

# 1. Pull latest code
echo "⬇️ Pulling latest changes..."
git pull origin main

# 2. Backend Setup
echo "🐍 Updating Backend..."
cd backend

# Fix for "externally-managed-environment" error
# We MUST use a virtual environment
if [ ! -d "venv" ]; then
    echo "⚠️  No virtual environment found. Creating 'venv'..."
    # Try to install venv tool if missing
    sudo apt-get install -y python3-venv || echo "Skipping apt install (might strictly need root)"
    python3 -m venv venv
fi

# Activate and Install
source venv/bin/activate
pip install -r requirements.txt

# 3. Frontend Build
echo "✨ Building Frontend..."
cd ../frontend
npm install
npm run build

echo "---------------------------------------------------"
echo "✅ Deployment Files Updated Successfully!"
echo "---------------------------------------------------"
echo "👉 FINAL STEP: Restart your service."
echo "   Example: sudo systemctl restart marliz-service"
echo "---------------------------------------------------"
