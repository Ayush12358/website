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
if ! git reset --hard origin/$BRANCH; then
    echo "ERROR: Git pull failed!" >&2
    exit 1
fi

# 2. Rebuild Backend if needed
echo "Updating Backend..."
cd $REPO_PATH/backend
if ! npm install --omit=dev --no-audit --no-fund; then
    echo "ERROR: Backend npm install failed!" >&2
    exit 1
fi
npm cache clean --force

# 3. Rebuild Frontend (with RAM protection)
echo "Updating Frontend (this may take a few minutes)..."
cd $REPO_PATH/frontend
export NODE_OPTIONS="--max-old-space-size=2048"
if ! npm install --no-audit --no-fund; then
    echo "ERROR: Frontend npm install failed!" >&2
    exit 1
fi

if ! npm run build; then
    echo "ERROR: Frontend build failed!" >&2
    exit 1
fi

# Verify the build resulted in a valid index.html
if [ ! -f "$REPO_PATH/frontend/build/index.html" ]; then
    echo "ERROR: Build completed but index.html is missing!" >&2
    exit 1
fi

npm cache clean --force

# 4. Restart services
echo "Restarting services..."
cd $REPO_PATH
# Use reload if running, otherwise start
if pm2 describe website-backend > /dev/null 2>&1; then
    pm2 reload ecosystem.config.js
else
    pm2 start ecosystem.config.js
fi

echo "Update complete and verified!"
else
    echo "No changes found. Current version: $LOCAL_HASH"
fi
