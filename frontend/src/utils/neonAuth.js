import { createAuthClient } from '@neondatabase/neon-js/auth';

const neonAuthUrl = (import.meta.env.VITE_NEON_AUTH_URL || '').trim();

if (!neonAuthUrl) {
  console.warn('VITE_NEON_AUTH_URL is not configured. Neon Auth routes will not work until it is set.');
}

export const authClient = createAuthClient(neonAuthUrl);
