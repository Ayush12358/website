const { User } = require('../models');

/**
 * Middleware to check if the authenticated user is an admin
 * Must be used after authMiddleware
 */
async function adminMiddleware(req, res, next) {
  try {
    // req.user should be set by authMiddleware
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const user = await User.findByPk(req.user);
    
    if (!user || user.email !== 'ayushmaurya2003@gmail.com') {
      return res.status(403).json({ 
        message: 'Access denied. Admin privileges required.' 
      });
    }

    next();
  } catch (error) {
    console.error('Admin check error:', error);
    return res.status(500).json({ 
      message: 'Error verifying admin privileges.' 
    });
  }
}

module.exports = adminMiddleware;
