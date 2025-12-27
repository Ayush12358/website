#!/bin/bash
# OCI Remote Setup Script for Personal Website
# This script automates Node.js, Git, PM2, cloudflared installation, and guided .env setup.

# ssh -i "C:\Users\Ayush\Documents\ssh-key-2025-12-26.key" ubuntu@140.245.224.107
# mkdir -p website && cd website && curl -fsSL https://raw.githubusercontent.com/Ayush12358/website/main/scripts/remote_setup.sh -o remote_setup.sh && chmod +x remote_setup.sh && ./remote_setup.sh

set -e # Exit on error

# Ensure non-interactive mode for apt to avoid hangs on prompts
export DEBIAN_FRONTEND=noninteractive

echo "------------------------------------------------"
echo "Starting COMPLETE OCI Server Setup"
echo "------------------------------------------------"

# 1. Update System
echo "Updating system packages (this may take a few minutes)..."
sudo apt-get update
sudo apt-get -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" upgrade

# 2. Install Dependencies
echo "Installing Git and Python 3..."
sudo apt-get install -y git python3 python3-pip curl wget

# 3. Install Node.js v22
if ! command -v node &> /dev/null; then
    echo "Installing Node.js v22..."
    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "Node.js is already installed ($(node -v))"
fi

# 4. Install PM2 and Serve
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2 and Serve..."
    sudo npm install -g pm2 serve
else
    echo "PM2 is already installed"
fi

# 5. Install Cloudflared
if ! command -v cloudflared &> /dev/null; then
    echo "Installing Cloudflared..."
    curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
    sudo dpkg -i cloudflared.deb
    rm cloudflared.deb
else
    echo "Cloudflared is already installed"
fi

# 6. Repository Logic
if [ ! -d "backend" ]; then
    echo "Cloning repository (Shallow)..."
    git clone --depth 1 https://github.com/Ayush12358/website.git . || echo "Already in directory or cloning skipped"
fi

# 7. Guided .env Setup
if [ ! -f "backend/.env" ]; then
    echo "------------------------------------------------"
    echo "ATTENTION: GUIDED .ENV SETUP"
    echo "------------------------------------------------"
    echo "I will now create your backend/.env file."
    echo "PLEASE PASTE THE CONTENTS OF YOUR .ENV FILE BELOW."
    echo "THEN PRESS Ctrl+D TO CONTINUE."
    echo "------------------------------------------------"
    cat > backend/.env
    echo "backend/.env created!"
else
    echo "backend/.env already exists"
fi

# 8. Build Processes (Optimized for low RAM)
echo "Setting up Backend (Production Dependencies Only)..."
cd backend
npm install --omit=dev --no-audit --no-fund
npm cache clean --force
cd ..

echo "Building Frontend (this can be slow on small instances)..."
cd frontend
# Using --max-old-space-size to prevent OOM on 1GB RAM instances
export NODE_OPTIONS="--max-old-space-size=512"
npm install --no-audit --no-fund
npm run build
echo "Cleaning up Frontend build artifacts..."
npm cache clean --force
cd ..

# 9. Install PM2 Logrotate
echo "Installing PM2 Logrotate to manage disk space..."
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 5

# 10. PM2 Configuration
if [ -f "ecosystem.config.js" ]; then
    echo "Launching services with PM2..."
    pm2 stop all || true
    pm2 delete all || true
    pm2 start ecosystem.config.js
    pm2 save
    
    echo "------------------------------------------------"
    echo "Application started! To ensure it starts on reboot, run:"
    pm2 startup | grep "sudo env" || pm2 startup
    echo "------------------------------------------------"
else
    echo "Warning: ecosystem.config.js not found. Services not started."
fi

echo ""
echo "Setup Complete!"
echo "Next Steps:"
echo "1. Run the 'pm2 startup' command shown above."
echo "2. Setup your Cloudflare Tunnel (cloudflared tunnel login / run)."
echo "------------------------------------------------"
