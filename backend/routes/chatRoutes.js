const express = require('express');
const rateLimit = require('express-rate-limit');
const { Op, fn, col, literal } = require('sequelize');
const { Chat, User } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Rate limiting for chat messages
const chatRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 10 messages per minute per user
  message: { message: 'Too many messages sent. Please wait before sending another message.' },
  standardHeaders: true,
  legacyHeaders: false,
  // Use user ID for rate limiting instead of IP
  keyGenerator: (req) => {
    return req.user ? req.user.toString() : req.ip;
  }
});

// Message validation function
const validateMessage = (message) => {
  if (!message || typeof message !== 'string') return { valid: false, error: 'Message must be a string.' };
  if (message.trim().length === 0) return { valid: false, error: 'Message cannot be empty.' };
  if (message.length > 1000) return { valid: false, error: 'Message is too long (maximum 1000 characters).' };
  
  // Check for potentially dangerous patterns
  const dangerousPatterns = [
    /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe[\s\S]*?>/gi,
    /<object[\s\S]*?>/gi,
    /<embed[\s\S]*?>/gi
  ];
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(message)) {
      return { valid: false, error: 'Message contains potentially harmful content.' };
    }
  }
  
  return { valid: true };
};

// Sanitize message content
const sanitizeMessage = (message) => {
  return message
    .trim()
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Get chat messages for current user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const messages = await Chat.findAll({
      where: { userId: req.user },
      include: [{
        model: User,
        attributes: ['id', 'name', 'email']
      }],
      order: [['createdAt', 'ASC']]
    });

    // Mark messages as read by user
    await Chat.update(
      { readByUser: true },
      { 
        where: { 
          userId: req.user,
          isFromDev: true,
          readByUser: false
        }
      }
    );

    res.json(messages);
  } catch (err) {
    console.error('Chat fetch error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Send a message
router.post('/', authMiddleware, chatRateLimit, async (req, res) => {
  const { message } = req.body;
  
  // Validate message
  const validation = validateMessage(message);
  if (!validation.valid) {
    return res.status(400).json({ message: validation.error });
  }

  try {
    // Sanitize the message before storing
    const sanitizedMessage = sanitizeMessage(message);
    
    const newMessage = await Chat.create({
      userId: req.user,
      message: sanitizedMessage,
      isFromDev: false,
      readByUser: true,
      readByDev: false
    });

    const messageWithUser = await Chat.findByPk(newMessage.id, {
      include: [{
        model: User,
        attributes: ['id', 'name', 'email']
      }]
    });

    res.status(201).json(messageWithUser);
  } catch (err) {
    console.error('Message send error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get all chat conversations for dev (only accessible by dev)
router.get('/admin/conversations', authMiddleware, async (req, res) => {
  try {
    console.log('Admin conversations request from user ID:', req.user);
    
    // Check if user is dev
    const user = await User.findByPk(req.user);
    console.log('User found:', user ? `${user.name} (${user.email})` : 'No user found');
    
    if (!user || user.email !== 'ayushmaurya2003@gmail.com') {
      console.log('Access denied for user:', user?.email);
      return res.status(403).json({ message: 'Access denied.' });
    }

    console.log('Dev access granted, fetching conversations...');

    // Get all unique user IDs who have sent messages
    const userIds = await Chat.findAll({
      attributes: ['userId'],
      group: ['userId'],
      raw: true
    });

    console.log('Found user IDs with messages:', userIds);

    const conversations = [];
    
    for (const { userId } of userIds) {
      // Get user info
      const chatUser = await User.findByPk(userId, {
        attributes: ['id', 'name', 'email']
      });
      
      if (chatUser) {
        // Get last message time
        const lastMessage = await Chat.findOne({
          where: { userId },
          order: [['createdAt', 'DESC']],
          attributes: ['createdAt']
        });
        
        // Get unread count
        const unreadCount = await Chat.count({
          where: {
            userId,
            isFromDev: false,
            readByDev: false
          }
        });
        
        conversations.push({
          userId,
          User: chatUser,
          lastMessageTime: lastMessage ? lastMessage.createdAt : null,
          unreadCount
        });
      }
    }
    
    // Sort by last message time
    conversations.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));

    console.log('Returning conversations:', conversations.length);
    res.json(conversations);
  } catch (err) {
    console.error('Admin conversations fetch error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get messages for a specific user (dev only)
router.get('/admin/:userId', authMiddleware, async (req, res) => {
  try {
    // Check if user is dev
    const user = await User.findByPk(req.user);
    if (!user || user.email !== 'ayushmaurya2003@gmail.com') {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const { userId } = req.params;
    const messages = await Chat.findAll({
      where: { userId: parseInt(userId) },
      include: [{
        model: User,
        attributes: ['id', 'name', 'email']
      }],
      order: [['createdAt', 'ASC']]
    });

    // Mark messages as read by dev
    await Chat.update(
      { readByDev: true },
      { 
        where: { 
          userId: parseInt(userId),
          isFromDev: false,
          readByDev: false
        }
      }
    );

    res.json(messages);
  } catch (err) {
    console.error('Admin chat fetch error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Send message as dev to a user
router.post('/admin/:userId', authMiddleware, chatRateLimit, async (req, res) => {
  const { message } = req.body;
  const { userId } = req.params;
  
  // Validate message
  const validation = validateMessage(message);
  if (!validation.valid) {
    return res.status(400).json({ message: validation.error });
  }

  try {
    // Check if user is dev
    const user = await User.findByPk(req.user);
    if (!user || user.email !== 'ayushmaurya2003@gmail.com') {
      return res.status(403).json({ message: 'Access denied.' });
    }

    // Sanitize the message before storing
    const sanitizedMessage = sanitizeMessage(message);

    const newMessage = await Chat.create({
      userId: parseInt(userId),
      message: sanitizedMessage,
      isFromDev: true,
      readByUser: false,
      readByDev: true
    });

    const messageWithUser = await Chat.findByPk(newMessage.id, {
      include: [{
        model: User,
        attributes: ['id', 'name', 'email']
      }]
    });

    res.status(201).json(messageWithUser);
  } catch (err) {
    console.error('Admin message send error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
