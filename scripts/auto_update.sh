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

# 3. Frontend Update (Handled by GitHub Actions)
echo "Skipping Frontend build (handled by GitHub Actions)..."
# The build directory is updated via SCP before this script runs.

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
