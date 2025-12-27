# Oracle Cloud Infrastructure (OCI) Deployment Guide

This guide describes how to host this website on an OCI "Always Free" instance.

## 1. Instance Creation

1.  **OCI Console**: Go to **Compute** -> **Instances** -> **Create Instance**.
2.  **OS**: Choose **Ubuntu 22.04 LTS** (Canonical).
3.  **Shape**:
    *   **Ampere (Arm-based)**: `VM.Standard.A1.Flex` (Up to 4 OCPUs and 24GB RAM for free). **Recommended.**
    *   **AMD**: `VM.Standard.E2.1.Micro`.
4.  **SSH Key**: Dowload the Private Key or paste your public key. **Crucial for access.**
5.  **Static IP**: (Optional if using Cloudflare Tunnel) Create a Reserved Public IP for the instance.

## 2. Ingress Rules (Networking)

Go to **Virtual Cloud Network** -> **Security Lists** -> **Default Security List**:
*   Add Ingress Rule: Stateless=No, Source=0.0.0.0/0, IP Protocol=TCP, Port Range=22 (SSH).
*   Add Ingress Rule: Stateless=No, Source=0.0.0.0/0, IP Protocol=TCP, Port Range=80, 443 (HTTP/S) - *Optional if using Tunnels*.

## 3. Server Setup (Choose ONE)

### Option A: Automated Setup (Fastest)

Connect to your server and run this one-liner:

```bash
mkdir -p website && cd website && curl -fsSL https://raw.githubusercontent.com/Ayush12358/website/main/scripts/remote_setup.sh -o remote_setup.sh && chmod +x remote_setup.sh && ./remote_setup.sh
```

### Option B: Manual Setup

1.  **Connect to your server**:
```bash
ssh -i <your-key>.key ubuntu@<public-ip>
```

2.  **Update and Install Dependencies**:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git python3-pip python3-venv

# Install Node.js v22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2
```

## 4. Repository Setup

```bash
git clone https://github.com/Ayush12358/website.git
cd website

# Setup Environment Variables
# Copy your .env contents or use the setup script
nano backend/.env # Paste your variables here
```

### Install Backend Dependencies
```bash
cd backend
npm install
cd ..
```

### Build Frontend
```bash
cd frontend
npm install
npm run build
cd ..
```

## 5. Process Management (PM2)

Start all services using the provided ecosystem config:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup # Follow the instructions to enable auto-boot
```

## 6. Cloudflare Tunnel Setup

1.  **Install cloudflared**:
    ```bash
    curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
    sudo dpkg -i cloudflared.deb
    ```
2.  **Authenticate**:
    ```bash
    cloudflared tunnel login
    ```
3.  **Run your tunnel**:
    ```bash
    cloudflared tunnel run <your-tunnel-name>
    ```

> [!TIP]
> Use PM2 to keep the tunnel running: `pm2 start "cloudflared tunnel run <name>"`
