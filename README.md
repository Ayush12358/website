# Ayush Maurya's Personal Ecosystem

A sophisticated, full-stack personal ecosystem featuring a portfolio website, management dashboard, and AI-powered services.

## Quick Links

- [Installation & Setup](file:///c:/masti/website/docs/README.md)
- [OCI Hosting Guide](file:///c:/masti/website/docs/deployment/OCI_SETUP.md)
- [Backup System](file:///c:/masti/website/docs/README.md#backup-system)
- [Frontend Application](frontend/README.md)
- [TODO List](docs/todo.md)

- **Architecture**: A full-stack solution featuring a secure Node.js backend and a dynamic React frontend.
- **Infrastructure**: Cloudflare Tunnels for secure local-to-web exposure.

## 🚀 Getting Started

For a complete guide on setting up the project from scratch (both locally and on the cloud), see the **[Ultimate Setup Guide](docs/SETUP_GUIDE.md)**.

### Quick Start (Server)
1. Install dependencies: `npm install` in both `backend` and `frontend`.
2. Configure your `.env` in `backend/`.
3. Start the app: `pm2 start ecosystem.config.js`

## Deploy Frontend on Vercel (Free Plan)

This repository is best deployed as:

- Frontend on Vercel (free plan)
- Backend on your existing server/VM (OCI, VPS, etc.)

The backend in this project is a long-running Express app with SQLite and scheduled backups, so deploying it as-is on Vercel serverless is not recommended.

### 1. Prepare backend for public frontend access

1. Host backend on a public HTTPS domain, for example `https://api.yourdomain.com`.
2. In `backend/.env`, set at least one of these to your frontend URL:
	- `WEBSITE_FRONTEND_URL=https://your-project.vercel.app`
	- `FRONTEND_URL=https://your-project.vercel.app`
3. Optional: if you have multiple domains, set `CORS_ORIGINS` as a comma-separated list:
	- `CORS_ORIGINS=https://your-project.vercel.app,https://www.yourdomain.com`
4. Restart backend after env changes.

### 2. Configure frontend to use backend URL

1. In Vercel project settings, add environment variable:
	- `REACT_APP_API_BASE_URL=https://api.yourdomain.com/api`
2. Redeploy frontend after saving env vars.

Note: frontend API logic now prioritizes `REACT_APP_API_BASE_URL` when present.

### 3. Create Vercel project

1. Import this GitHub repository into Vercel.
2. Set **Root Directory** to `frontend`.
3. Confirm build settings:
	- Build Command: `npm run build`
	- Output Directory: `build`
4. Deploy.

### 4. SPA routing support

`frontend/vercel.json` is included so React Router routes (for example `/blog` or `/dashboard`) resolve to `index.html` on refresh.

### 5. Verify after deploy

1. Open your Vercel URL and load a few routes directly in browser.
2. Confirm API health from browser/devtools points to your backend domain:
	- `https://api.yourdomain.com/api/health`
3. Log in and test authenticated requests.

### 6. Common issues

- CORS error: ensure frontend domain is present in `WEBSITE_FRONTEND_URL`, `FRONTEND_URL`, or `CORS_ORIGINS` and restart backend.
- 404 on refresh: ensure deployment uses `frontend/vercel.json`.
- Network error in frontend: verify `REACT_APP_API_BASE_URL` is set in Vercel and redeploy.

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.
