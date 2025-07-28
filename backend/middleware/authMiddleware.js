const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  // Try to get token from Authorization header first (for API compatibility)
  let token = null;
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    // Fallback to cookie if no Authorization header
    token = req.cookies.token;
  }
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided.' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token.' });
  }
}

module.exports = authMiddleware;
