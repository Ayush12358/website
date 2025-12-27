# Ultimate Setup Guide

This guide covers everything you need to get the **Personal Website** project up and running from scratch, whether you're developing locally on Windows or deploying to the cloud on Oracle Cloud Infrastructure (OCI).

## 🗂️ Project Overview

The project is a full-stack application consisting of:
- **Backend**: Node.js / Express (Port 5001)
- **Frontend**: React (Port 8000)
- **Database**: SQLite (built-in)

---

## 💻 Local Development

For local development on a Linux or macOS machine:

### Prerequisites
- [Node.js v22+](https://nodejs.org/)
- [Git](https://git-scm.com/)

### Steps
1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/Ayush12358/website.git
    cd website
    ```
2.  **Environment Variables**:
    - Create a `.env` file in the `backend/` directory based on your requirements.
3.  **Install Dependencies**:
    - **Backend**:
      ```bash
      cd backend
      npm install
      ```
    - **Frontend**:
      ```bash
      cd ../frontend
      npm install
      ```
4.  **Run the App**:
    - Open two terminals and run `npm start` in both `backend/` and `frontend/`.

---

## ☁️ 2. Cloud Deployment (OCI)

We recommend using the **Automated Setup** for the fastest results on a fresh Ubuntu 24.04 instance.

### Automated Setup (Recommended)
Connect to your server and run this one-liner:
```bash
cd ~ && rm -rf website && mkdir website && cd website && curl -fsSL https://raw.githubusercontent.com/Ayush12358/website/main/scripts/remote_setup.sh -o remote_setup.sh && chmod +x remote_setup.sh && ./remote_setup.sh
```

### Manual Steps & Troubleshooting
For detailed manual instructions, server hardening, and performance optimizations, refer to the [OCI Setup Guide](deployment/OCI_SETUP.md).

---

## 🔄 3. Auto-Updates

The server can update itself whenever you push new code to GitHub.

1.  **Grant Permissions**:
    ```bash
    chmod +x /home/ubuntu/website/scripts/auto_update.sh
    ```
2.  **Schedule the Check**:
    ```bash
    (crontab -l 2>/dev/null; echo "0 * * * * /home/ubuntu/website/scripts/auto_update.sh >> /home/ubuntu/auto_update.log 2>&1") | crontab -
    ```

---

## 🌉 4. Public Access (Cloudflare)

To point your domain (e.g., `ayushmaurya.xyz`) to your OCI server:

1.  **Connect to Cloudflare**:
    ```bash
    cloudflared tunnel login
    cloudflared tunnel create website
    cloudflared tunnel route dns website <YOUR_DOMAIN>
    ```
2.  **Keep it Alive with PM2**:
    ```bash
    pm2 start "cloudflared tunnel run --url http://localhost:5001 website" --name website-tunnel
    pm2 save
    ```

---

## 🩺 5. Health Checks

Check if everything is running correctly:
```bash
pm2 status                  # Check process status
tail -f ~/auto_update.log   # Check update logs
pm2 logs website-backend    # Check application logs
```
