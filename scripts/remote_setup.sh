#!/bin/bash
# OCI Remote Setup Script for Personal Website
# This script automates Node.js, Git, PM2, cloudflared installation, and guided .env setup.
# Includes automatic swap management for low-RAM instances.

set -e # Exit on error

# Ensure non-interactive mode for apt to avoid hangs on prompts
export DEBIAN_FRONTEND=noninteractive

echo "------------------------------------------------"
echo "Starting COMPLETE OCI Server Setup"
echo "------------------------------------------------"

# 0. Check and Create Swap (Crucial for 1GB RAM instances)
TOTAL_RAM=$(free -m | awk '/^Mem:/{print $2}')
if [ "$TOTAL_RAM" -lt 2000 ]; then
    echo "Low memory detected (${TOTAL_RAM}MB). Setting up a 2GB swap file..."
    if [ ! -f /swapfile ]; then
        sudo fallocate -l 2G /swapfile
        sudo chmod 600 /swapfile
        sudo mkswap /swapfile
        sudo swapon /swapfile
        echo "Swap file created and enabled."
    else
        echo "Swap file already exists."
    fi
else
    echo "Sufficient memory detected (${TOTAL_RAM}MB). Skipping swap creation."
fi

# 1. Update System
echo "Updating system packages (this may take a few minutes)..."
sudo apt-get update
sudo apt-get -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" upgrade

# 2. Install Dependencies
echo "Installing Git and Python 3..."
sudo apt-get install -y git python3 python3-pip curl wget nano

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
    echo "Checking directory for code..."
    if [ -f "remote_setup.sh" ] && [ ! -d ".git" ]; then
        echo "Directory not empty, bootstrapping repository..."
        git init
        git remote add origin https://github.com/Ayush12358/website.git
        git fetch --depth 1 origin main
        git reset --hard origin/main
    else
        echo "Cloning repository..."
        git clone --depth 1 https://github.com/Ayush12358/website.git . || echo "Skipping clone"
    fi
fi

# 7. Guided .env Setup
mkdir -p backend
if [ ! -f "backend/.env" ]; then
    echo "------------------------------------------------"
    echo "ACTION REQUIRED: SETUP SECRETS"
    echo "------------------------------------------------"
    echo "I will now open an editor for 'backend/.env'."
    echo "1. Paste your .env contents into the editor."
    echo "2. Press Ctrl+O then Enter to Save."
    echo "3. Press Ctrl+X to Exit and continue the setup."
    echo "------------------------------------------------"
    read -p "Press Enter to open the editor..." 
    
    nano backend/.env || vi backend/.env
    
    echo "backend/.env saved!"
else
    echo "backend/.env already exists"
fi

# 8. Build Processes
echo "Setting up Backend (Production Dependencies Only)..."
cd backend
npm install --omit=dev --no-audit --no-fund
npm cache clean --force
cd ..

echo "Building Frontend (this CAN take up to 10 minutes on small instances)..."
cd frontend
# Increase memory limit for Node.js if needed
export NODE_OPTIONS="--max-old-space-size=2048"
npm install --no-audit --no-fund
npm run build
# Cleanup to save space
npm cache clean --force
cd ..

# 9. Install PM2 Logrotate
echo "Installing PM2 Logrotate..."
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
