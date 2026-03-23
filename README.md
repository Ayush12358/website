# Ayush Maurya's Personal Ecosystem

A sophisticated, full-stack personal ecosystem featuring a portfolio website, management dashboard, and AI-powered services.

## Quick Links

- [Getting Started](#-getting-started)
- [Frontend Commands](#frontend-commands)
- [Vercel Deployment](#vercel-deployment-single-root-project)

- **Architecture**: A full-stack solution featuring a secure Node.js backend and a dynamic React frontend.
## 🚀 Getting Started

### Quick Start (Server)
1. Install dependencies: `bun install` in both `backend` and `frontend`.
2. Configure your `.env` in `backend/`.
3. Start the app: `pm2 start ecosystem.config.js`

## Frontend Commands

- `bun install` - install dependencies
- `bun run dev` - start local dev server on port `8000`
- `bun run start` - alias for `bun run dev`
- `bun run build` - production build to `frontend/dist`
- `bun run preview` - preview production build on port `8000`

## Vercel Deployment (Single Root Project)

This repository is now configured for one Vercel project that points to the repository root.

How this works:

- `api/[...all].js` is the single serverless entrypoint.
- It loads `backend/server.js`, which serves both:
	- API routes under `/api/*`
	- Built frontend from `frontend/dist`

### 1. Create one Vercel project

1. Import this repository in Vercel.
2. Set the project root directory to repository root (`.`).
3. Keep root `vercel.json` in place.
4. Attach your custom domain (for example, `ayushmaurya.xyz`) to this single project.

### 2. Set environment variables

Add the required backend and frontend variables in this same Vercel project.

- Backend essentials:
	- `NODE_ENV=production`
	- `WEBSITE_NODE_ENV=production`
	- `WEBSITE_FRONTEND_URL=https://ayushmaurya.xyz`
	- `FRONTEND_URL=https://ayushmaurya.xyz`
	- `CORS_ORIGINS=https://ayushmaurya.xyz`

- Database/Auth migration essentials:
	- `DB_DIALECT=postgres`
	- `DATABASE_URL` (or `NEON_DATABASE_URL`)
	- `AUTH_PROVIDER=neon`
	- `NEON_AUTH_JWKS_URL=...`
	- Optional: `NEON_AUTH_ISSUER`, `NEON_AUTH_AUDIENCE`

- Frontend essentials:
	- `VITE_API_BASE_URL=/api`
	- `VITE_NEON_AUTH_URL=...`

### 3. Verify

1. Open `https://ayushmaurya.xyz` and test deep-link refreshes.
2. Open `https://ayushmaurya.xyz/api/health` and confirm a healthy JSON response.
3. Complete auth flow at `/auth/login` and confirm protected API calls succeed.

### 4. Important notes

- Serverless filesystem storage is ephemeral. Keep uploads and backups in managed storage in production.
- Scheduled backups should remain disabled in serverless Postgres deployments.

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.
