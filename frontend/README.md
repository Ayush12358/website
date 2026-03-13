# Frontend (Vite + React)

This frontend now runs on Vite and uses Bun for package management and scripts.

## Commands

- `bun install` - install dependencies
- `bun run dev` - start local dev server on port 8000
- `bun run start` - alias of `bun run dev`
- `bun run build` - production build to `dist/`
- `bun run preview` - preview production build on port 8000
- `bun run lint` - run ESLint

## Environment Variables

Use Vite-prefixed variables:

- `VITE_API_BASE_URL` - API base URL (for example `/api` in production)

Examples:

- `.env.development`: `VITE_API_BASE_URL=http://localhost:5001/api`
- `.env.production`: `VITE_API_BASE_URL=/api`

## Deployment

For Vercel frontend project:

- Root directory: `frontend`
- Build command: `bun run build`
- Output directory: `dist`
