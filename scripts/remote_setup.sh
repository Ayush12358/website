#!/bin/bash
# OCI Remote Setup Script for Personal Website
# This script automates Node.js, Git, PM2, cloudflared installation, and guided .env setup.

# ssh -i "C:\Users\Ayush\Documents\ssh-key-2025-12-26.key" ubuntu@140.245.224.107
# mkdir -p website && cd website && curl -fsSL https://raw.githubusercontent.com/Ayush12358/website/main/scripts/remote_setup.sh -o remote_setup.sh && chmod +x remote_setup.sh && ./remote_setup.sh


set -e # Exit on error

echo "------------------------------------------------"
echo "🚀 Starting COMPLETE OCI Server Setup"
echo "------------------------------------------------"

# 1. Update System
echo "🔄 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# 2. Install Dependencies
echo "📦 Installing Git and Python 3..."
sudo apt install -y git python3 python3-pip curl wget

# 3. Install Node.js v22
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js v22..."
    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
    sudo apt install -y nodejs
else
    echo "✅ Node.js is already installed ($(node -v))"
fi

# 4. Install PM2 and Serve
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2 and Serve..."
    sudo npm install -g pm2 serve
else
    echo "✅ PM2 is already installed"
fi

# 5. Install Cloudflared
if ! command -v cloudflared &> /dev/null; then
    echo "📦 Installing Cloudflared..."
    curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
    sudo dpkg -i cloudflared.deb
    rm cloudflared.deb
else
    echo "✅ Cloudflared is already installed"
fi

# 6. Repository Logic
if [ ! -d "backend" ]; then
    echo "📂 Cloning repository..."
    git clone https://github.com/Ayush12358/website.git . || echo "⚠️ Already in directory or cloning skipped"
fi

# 7. Guided .env Setup
if [ ! -f "backend/.env" ]; then
    echo "------------------------------------------------"
    echo "🔐 GUIDED .ENV SETUP"
    echo "------------------------------------------------"
    echo "I will now create your backend/.env file."
    echo "Please paste the contents of your .env file below."
    echo "Press Ctrl+D when finished."
    echo "------------------------------------------------"
    cat > backend/.env
    echo "✅ backend/.env created!"
else
    echo "✅ backend/.env already exists"
fi

# 8. Build Processes
echo "🏗️ Setting up Backend..."
cd backend
npm install
cd ..

echo "🏗️ Building Frontend..."
cd frontend
npm install
npm run build
cd ..

# 9. PM2 Configuration
if [ -f "ecosystem.config.js" ]; then
    echo "⚙️ Launching services with PM2..."
    pm2 stop all || true
    pm2 delete all || true
    pm2 start ecosystem.config.js
    pm2 save
    
    echo "------------------------------------------------"
    echo "✅ Application started! To ensure it starts on reboot, run:"
    pm2 startup | grep "sudo env" || pm2 startup
    echo "------------------------------------------------"
else
    echo "⚠️ Warning: ecosystem.config.js not found. Services not started."
fi

echo ""
echo "✨ Setup Complete!"
echo "🔗 Next Steps:"
echo "1. Run the 'pm2 startup' command shown above."
echo "2. Setup your Cloudflare Tunnel (cloudflared tunnel login / run)."
echo "------------------------------------------------"
