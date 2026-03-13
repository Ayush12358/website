# Ayush Maurya's Personal Ecosystem

A sophisticated, full-stack personal ecosystem featuring a portfolio website, management dashboard, and AI-powered services.

## Quick Links

- [Installation & Setup](docs/README.md)
- [Vercel Hosting Guide](docs/deployment/OCI_SETUP.md)
- [Backup System](docs/README.md#backup-system)
- [Frontend Application](frontend/README.md)
- [TODO List](docs/todo.md)

- **Architecture**: A full-stack solution featuring a secure Node.js backend and a dynamic React frontend.
- **Infrastructure**: Cloudflare Tunnels for secure local-to-web exposure.

## 🚀 Getting Started

For a complete guide on setting up the project from scratch (both locally and on the cloud), see the **[Ultimate Setup Guide](docs/SETUP_GUIDE.md)**.

### Quick Start (Server)
1. Install dependencies: `bun install` in both `backend` and `frontend`.
2. Configure your `.env` in `backend/`.
3. Start the app: `pm2 start ecosystem.config.js`

## Vercel Deployment (Two Projects, One Domain)

This repository is configured for this setup:

- Frontend project on `https://ayushmaurya.xyz`
- Backend project on `https://api.ayushmaurya.xyz`

The frontend project rewrites `/api/*` requests to `https://api.ayushmaurya.xyz/api/*`, so browser calls stay on `/api` from the frontend side.

### 1. Frontend project (Vercel)

1. Create/import a Vercel project with root directory `frontend`.
2. Attach custom domain `ayushmaurya.xyz` to this project.
3. Keep `frontend/vercel.json` in place (it handles both `/api` proxy and SPA fallback).
4. Add frontend environment variables:
	- In Vercel env: `REACT_APP_API_BASE_URL=/api`
	- Or use the file `frontend/.env.production`.

### 2. Backend project (Vercel)

1. Create/import a second Vercel project with root directory `backend`.
2. Attach custom domain `api.ayushmaurya.xyz` to this project.
3. Ensure this project uses `backend/vercel.json` and `backend/api/index.js` (already added).
4. Add backend environment variables in Vercel (copy from `backend/.env.production`):
	- `NODE_ENV=production`
	- `WEBSITE_NODE_ENV=production`
	- `JWT_SECRET=...`
	- `DB_ENCRYPTION_KEY=...`
	- `WEBSITE_FRONTEND_URL=https://ayushmaurya.xyz`
	- `FRONTEND_URL=https://ayushmaurya.xyz`
	- `CORS_ORIGINS=https://ayushmaurya.xyz`
	- `BACKEND_URL=https://api.ayushmaurya.xyz`
	- `ENABLE_SCHEDULED_BACKUPS=false`

### 3. DNS mapping

1. Point apex/root `ayushmaurya.xyz` to frontend Vercel project.
2. Point `api.ayushmaurya.xyz` to backend Vercel project.
3. Wait for SSL issuance on both domains.

### 4. Verify

1. Open `https://ayushmaurya.xyz` and test navigation/refresh on deep routes.
2. Open `https://api.ayushmaurya.xyz/api/health` and confirm JSON response.
3. Log in from frontend and verify API requests hit `/api/*` successfully.

### 5. Important notes

- This backend can run on Vercel with the serverless adapter in this repo, but local SQLite storage and file-based backup behavior are limited in serverless environments.
- For production reliability, a managed database and object storage are strongly recommended in a future migration.

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.
