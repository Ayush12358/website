#!/bin/bash
# OCI Remote Setup Script for Personal Website
# This script automates Node.js, Git, PM2 installation, build processes, and process management.

set -e # Exit on error

echo "------------------------------------------------"
echo "🚀 Starting Automated OCI Server Setup"
echo "------------------------------------------------"

# 1. Update System
echo "🔄 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# 2. Install Dependencies
echo "📦 Installing Git and Python 3..."
sudo apt install -y git python3 python3-pip

# 3. Install Node.js v22
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js v22..."
    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
    sudo apt install -y nodejs
else
    echo "✅ Node.js is already installed ($(node -v))"
fi

# 4. Install PM2
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    sudo npm install -g pm2
else
    echo "✅ PM2 is already installed"
fi

# 5. Build Processes
REPO_ROOT=$(pwd)
echo "📂 Working directory: $REPO_ROOT"

# Backend
if [ -d "backend" ]; then
    echo "🏗️ Setting up Backend..."
    cd backend
    npm install
    cd ..
else
    echo "❌ Error: backend directory not found!"
    exit 1
fi

# Frontend
if [ -d "frontend" ]; then
    echo "🏗️ Building Frontend..."
    cd frontend
    npm install
    npm run build
    cd ..
else
    echo "❌ Error: frontend directory not found!"
    exit 1
fi

# 6. PM2 Configuration
if [ -f "ecosystem.config.js" ]; then
    echo "⚙️ Launching services with PM2..."
    pm2 start ecosystem.config.js
    pm2 save
    
    # Generate startup script and execute it
    # Note: We use a simplified approach for the user to copy-paste the result
    echo "------------------------------------------------"
    echo "✅ Application started! To ensure it starts on reboot, run:"
    pm2 startup | grep "sudo env"
    echo "------------------------------------------------"
else
    echo "⚠️ Warning: ecosystem.config.js not found. Services not started."
fi

echo ""
echo "✨ Setup Complete!"
echo "🔗 Next Steps:"
echo "1. Run the 'pm2 startup' command shown above."
echo "2. Setup your Cloudflare Tunnel (see OCI_SETUP.md Section 6)."
echo "3. Update your backend/.env with your secrets."
echo "------------------------------------------------"
