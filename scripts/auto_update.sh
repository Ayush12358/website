#!/bin/bash
# OCI Auto-Update Script for Personal Website
# This script checks for changes in GitHub, pulls them, and rebuilds the app if needed.

set -e

# Configuration
REPO_PATH="/home/ubuntu/website"
BRANCH="main"

cd $REPO_PATH

echo "Checking for updates..."

# Fetch the latest changes from GitHub
git fetch origin $BRANCH

# Compare local hash with remote hash
LOCAL_HASH=$(git rev-parse HEAD)
REMOTE_HASH=$(git rev-parse origin/$BRANCH)

if [ "$LOCAL_HASH" != "$REMOTE_HASH" ]; then
    echo "Changes detected! Updating from $LOCAL_HASH to $REMOTE_HASH..."
    
    # 1. Pull the latest changes
    git reset --hard origin/$BRANCH
    
    # 2. Rebuild Backend if needed
    echo "Updating Backend..."
    cd $REPO_PATH/backend
    npm install --omit=dev --no-audit --no-fund
    npm cache clean --force
    
    # 3. Rebuild Frontend (with RAM protection)
    echo "Updating Frontend (this may take a few minutes)..."
    cd $REPO_PATH/frontend
    export NODE_OPTIONS="--max-old-space-size=2048"
    npm install --no-audit --no-fund
    npm run build
    npm cache clean --force
    
    # 4. Restart services
    echo "Restarting services..."
    cd $REPO_PATH
    pm2 reload ecosystem.config.js
    
    echo "Update complete!"
else
    echo "No changes found. Current version: $LOCAL_HASH"
fi
