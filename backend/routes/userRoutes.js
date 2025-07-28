const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');
const { validateForgotPassword, validateResetPassword } = require('../middleware/validationMiddleware');
const { loginLimiter, passwordResetLimiter } = require('../middleware/rateLimitMiddleware');
const { sendPasswordResetEmail } = require('../services/emailService');
const router = express.Router();

// Registration Route
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists.' });
    }
    const user = await User.create({ name, email, password });
    res.status(201).json({ message: 'User registered successfully.' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Login Route with rate limiting
router.post('/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    // Set secure httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true, // Prevents XSS attacks
      secure: (process.env.WEBSITE_NODE_ENV || process.env.NODE_ENV) === 'production', // HTTPS only in production
      sameSite: 'strict', // CSRF protection
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    });
    
    res.json({ 
      message: 'Login successful',
      token // Still send token for backward compatibility
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Logout Route
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  res.json({ message: 'Logged out successfully' });
});

// Get User Profile (Protected Route)
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user, {
      attributes: { exclude: ['password'] }
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json(user);
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Update User Profile (Protected Route)
router.put('/profile', authMiddleware, async (req, res) => {
  const { name, email } = req.body;
  try {
    const user = await User.findByPk(req.user);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already taken.' });
      }
    }
    
    await user.update({ 
      name: name || user.name, 
      email: email || user.email 
    });
    
    const updatedUser = await User.findByPk(req.user, {
      attributes: { exclude: ['password'] }
    });
    
    res.json({ message: 'Profile updated successfully.', user: updatedUser });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Request Password Reset with rate limiting
router.post('/forgot-password', passwordResetLimiter, validateForgotPassword, async (req, res) => {
  const { email } = req.body;
  
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({ message: 'If the email exists, a reset link has been sent.' });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour from now
    
    // Save reset token to user
    await user.update({
      resetPasswordToken: resetToken,
      resetPasswordExpires: resetPasswordExpires
    });
    
    // Send reset email
    const emailResult = await sendPasswordResetEmail(user.email, resetToken, user.name);
    
    if (emailResult.success) {
      res.json({ message: 'If the email exists, a reset link has been sent.' });
    } else {
      console.error('Failed to send reset email:', emailResult.message);
      res.status(500).json({ message: 'Failed to send reset email. Please try again.' });
    }
  } catch (err) {
    console.error('Password reset request error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Reset Password
router.post('/reset-password', validateResetPassword, async (req, res) => {
  const { token, newPassword } = req.body;
  
  try {
    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          [require('sequelize').Op.gt]: new Date()
        }
      }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }
    
    // Update password and clear reset token
    await user.update({
      password: newPassword, // This will be hashed by the beforeUpdate hook
      resetPasswordToken: null,
      resetPasswordExpires: null
    });
    
    res.json({ message: 'Password reset successfully.' });
  } catch (err) {
    console.error('Password reset error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
