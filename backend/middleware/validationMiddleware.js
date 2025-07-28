const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password && password.length >= 6;
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
  validateForgotPassword,
  validateResetPassword
};
