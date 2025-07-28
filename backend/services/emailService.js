const nodemailer = require('nodemailer');

// Create transporter (using Gmail as example - you can change this)
const createTransporter = () => {
  // For development, you might want to use a service like Ethereal Email for testing
  // or configure with your actual email service
  
  const nodeEnv = process.env.WEBSITE_NODE_ENV || process.env.NODE_ENV || 'development';
  
  if (nodeEnv === 'development') {
    // For testing purposes, you can use Ethereal Email or log to console
    return nodemailer.createTransporter({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: process.env.WEBSITE_EMAIL_USER || process.env.EMAIL_USER || 'ethereal.user@ethereal.email',
        pass: process.env.WEBSITE_EMAIL_PASS || process.env.EMAIL_PASS || 'ethereal.password'
      }
    });
  }
  
  // For production, configure with your actual email service
  return nodemailer.createTransporter({
    service: 'gmail', // or your preferred service
    auth: {
      user: process.env.WEBSITE_EMAIL_USER || process.env.EMAIL_USER,
      pass: process.env.WEBSITE_EMAIL_PASS || process.env.EMAIL_PASS
    }
  });
};

const sendPasswordResetEmail = async (email, resetToken, userName) => {
  try {
    const transporter = createTransporter();
    
    const nodeEnv = process.env.WEBSITE_NODE_ENV || process.env.NODE_ENV || 'development';
    const frontendUrl = process.env.WEBSITE_FRONTEND_URL || process.env.FRONTEND_URL || 'http://localhost:8000';
    
    // For development, we'll log the reset link instead of sending email
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
    
    if (nodeEnv === 'development') {
      console.log('\n=== PASSWORD RESET EMAIL ===');
      console.log(`To: ${email}`);
      console.log(`Reset URL: ${resetUrl}`);
      console.log('============================\n');
      return { success: true, message: 'Reset link logged to console (development mode)' };
    }
    
    const mailOptions = {
      from: process.env.WEBSITE_EMAIL_FROM || process.env.EMAIL_FROM || 'noreply@ayushmaurya.dev',
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>Hello ${userName},</p>
          <p>You requested a password reset for your account. Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
          </div>
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          <p><strong>This link will expire in 1 hour.</strong></p>
          <p>If you didn't request this password reset, please ignore this email.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">This is an automated message, please do not reply.</p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    return { success: true, message: 'Password reset email sent successfully' };
    
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, message: 'Failed to send password reset email' };
  }
};

module.exports = {
  sendPasswordResetEmail
};
