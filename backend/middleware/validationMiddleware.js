const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password && password.length >= 6;
};

const validatePort = (req, res, next) => {
  const { port, name } = req.body;
  
  if (!port) {
    return res.status(400).json({ message: 'Port number is required.' });
  }
  
  if (!name) {
    return res.status(400).json({ message: 'Port name is required.' });
  }
  
  const portNumber = parseInt(port);
  if (isNaN(portNumber) || portNumber < 1 || portNumber > 65535) {
    return res.status(400).json({ message: 'Port number must be between 1 and 65535.' });
  }
  
  next();
};

const validateForgotPassword = (req, res, next) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }
  
  if (!validateEmail(email)) {
    return res.status(400).json({ message: 'Please provide a valid email address.' });
  }
  
  next();
};

const validateResetPassword = (req, res, next) => {
  const { token, newPassword } = req.body;
  
  if (!token) {
    return res.status(400).json({ message: 'Reset token is required.' });
  }
  
  if (!newPassword) {
    return res.status(400).json({ message: 'New password is required.' });
  }
  
  if (!validatePassword(newPassword)) {
    return res.status(400).json({ 
      message: 'Password must be at least 6 characters long.' 
    });
  }
  
  next();
};

module.exports = {
  validatePort,
  validateForgotPassword,
  validateResetPassword
};
