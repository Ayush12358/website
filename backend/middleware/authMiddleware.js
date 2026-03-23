const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { jwtVerify, createRemoteJWKSet } = require('jose');
const { User } = require('../models');

const authProvider = (process.env.AUTH_PROVIDER || 'legacy').toLowerCase();
let neonJwks;

const getTokenFromRequest = (req) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }

  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }

  return null;
};

const getNeonJwks = () => {
  if (neonJwks) {
    return neonJwks;
  }

  const jwksUrl = process.env.NEON_AUTH_JWKS_URL;
  if (!jwksUrl) {
    throw new Error('NEON_AUTH_JWKS_URL is required when AUTH_PROVIDER=neon');
  }

  neonJwks = createRemoteJWKSet(new URL(jwksUrl));
  return neonJwks;
};

const verifyNeonToken = async (token) => {
  const verifyOptions = {};
  if (process.env.NEON_AUTH_ISSUER) {
    verifyOptions.issuer = process.env.NEON_AUTH_ISSUER;
  }
  if (process.env.NEON_AUTH_AUDIENCE) {
    verifyOptions.audience = process.env.NEON_AUTH_AUDIENCE;
  }

  const { payload } = await jwtVerify(token, getNeonJwks(), verifyOptions);
  return payload;
};

const getOrCreateUserFromNeonPayload = async (payload) => {
  const tokenEmail = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : '';
  const tokenName = typeof payload.name === 'string' ? payload.name.trim() : '';
  const tokenSub = typeof payload.sub === 'string' ? payload.sub.trim() : '';

  const email = tokenEmail || (tokenSub ? `${tokenSub}@neon.local` : 'unknown@neon.local');
  const name = tokenName || email.split('@')[0] || 'Neon User';

  let user = await User.findOne({ where: { email } });
  if (!user) {
    user = await User.create({
      name,
      email,
      // Keep a local placeholder password so existing model constraints continue to pass.
      password: `neon-${crypto.randomUUID()}`
    });
  }

  return user;
};

async function authMiddleware(req, res, next) {
  const token = getTokenFromRequest(req);
  if (!token) {
    return res.status(401).json({ message: 'No token provided.' });
  }

  if (authProvider === 'neon') {
    try {
      const payload = await verifyNeonToken(token);
      const user = await getOrCreateUserFromNeonPayload(payload);
      req.user = user.id;
      req.authUser = {
        sub: payload.sub,
        email: payload.email,
        name: payload.name
      };
      return next();
    } catch (error) {
      console.error('Neon auth verification failed:', error.message);
      return res.status(401).json({ message: 'Invalid Neon auth token.' });
    }
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.id;
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token.' });
  }
}

module.exports = authMiddleware;
