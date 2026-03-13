# Vercel Deployment Guide (Two Projects)

This guide describes the production setup for this repository on Vercel:

- Frontend project: <https://ayushmaurya.xyz>
- Backend project: <https://api.ayushmaurya.xyz>

## 1. Prerequisites

1. Vercel account connected to GitHub.
2. Domain ayushmaurya.xyz managed in DNS.
3. Repository pushed to GitHub main branch.

## 2. Create Frontend Project

1. Import the repository in Vercel.
2. Set Root Directory to frontend.
3. Build settings:
   - Build Command: bun run build
   - Output Directory: dist
4. Add environment variable:
   - VITE_API_BASE_URL=/api
5. Deploy.

## 3. Create Backend Project

1. Create a second Vercel project from the same repository.
2. Set Root Directory to backend.
3. Keep default Node build, this project uses backend/vercel.json and backend/api/index.js.
4. Create a **Blob store** in Vercel Storage dashboard and link it to this project (this auto-sets `BLOB_READ_WRITE_TOKEN`).
5. Add remaining environment variables from backend/.env.production.
6. Deploy.

## 4. Environment Variables

Use these local files as source of truth:

- Frontend: frontend/.env.production
- Backend: backend/.env.production

Backend minimum required values:

```env
NODE_ENV=production
WEBSITE_NODE_ENV=production
JWT_SECRET=replace-with-a-long-random-secret
DB_ENCRYPTION_KEY=replace-with-a-long-random-key
WEBSITE_FRONTEND_URL=https://ayushmaurya.xyz
FRONTEND_URL=https://ayushmaurya.xyz
CORS_ORIGINS=https://ayushmaurya.xyz
BACKEND_URL=https://api.ayushmaurya.xyz
SQLITE_STORAGE_PATH=/tmp/database.sqlite
UPLOADS_DIR=/tmp/uploads
BACKUPS_DIR=/tmp/backups
BLOB_READ_WRITE_TOKEN=replace-with-token-from-vercel-storage-dashboard
ENABLE_SCHEDULED_BACKUPS=false
```

## 5. Custom Domains

1. Attach ayushmaurya.xyz to the frontend project.
2. Attach api.ayushmaurya.xyz to the backend project.
3. Update DNS according to Vercel instructions for both records.
4. Wait until both domains are issued valid SSL certificates.

## 6. Routing Behavior

The frontend project handles both SPA routes and API proxying:

1. `/api/*` on ayushmaurya.xyz is rewritten to <https://api.ayushmaurya.xyz/api/*>.
2. All other routes are rewritten to /index.html for React Router.

This is configured in frontend/vercel.json.

## 7. Verification

Run these checks after deployment:

1. Open <https://ayushmaurya.xyz> and refresh deep routes like `/dashboard`.
2. Open <https://api.ayushmaurya.xyz/api/health> and confirm JSON response.
3. Log in from frontend and verify authenticated API requests succeed.

## 8. Important Runtime Notes

1. Backend currently uses SQLite and file-based backups.
2. Vercel serverless runtime has ephemeral filesystem behavior.
3. ENABLE_SCHEDULED_BACKUPS should remain false on Vercel.
4. For long-term reliability, migrate to managed DB + object storage.
