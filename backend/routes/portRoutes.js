const express = require('express');
const { Port } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');
const validationMiddleware = require('../middleware/validationMiddleware');

const router = express.Router();

// Get all ports (public ports for regular users, all ports for developers)
router.get('/', authMiddleware, async (req, res) => {
  try {
    console.log('Port request from user ID:', req.user);
    
    // Get user details to check if they're a developer
    const { User } = require('../models');
    const user = await User.findByPk(req.user);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('User details:', { id: user.id, email: user.email });
    const isDev = user.email === 'ayushmaurya2003@gmail.com';
    console.log('Is developer:', isDev);
    
    let whereClause = {};
    if (!isDev) {
      // Regular users can only see public ports
      whereClause.isPublic = true;
    }
    
    const ports = await Port.findAll({
      where: whereClause,
      include: [{
        model: User,
        attributes: ['name', 'email']
      }],
      order: [['port', 'ASC']]
    });
    
    console.log('Found ports:', ports.length);
    res.json(ports);
  } catch (error) {
    console.error('Error fetching ports:', error);
    res.status(500).json({ error: 'Failed to fetch ports' });
  }
});

// Get user's custom ports
router.get('/my-ports', authMiddleware, async (req, res) => {
  try {
    console.log('My ports request from user ID:', req.user);
    
    const ports = await Port.findAll({
      where: { userId: req.user },
      order: [['port', 'ASC']]
    });
    
    console.log('Found user ports:', ports.length);
    res.json(ports);
  } catch (error) {
    console.error('Error fetching user ports:', error);
    res.status(500).json({ error: 'Failed to fetch user ports' });
  }
});

// Create a new port
router.post('/', authMiddleware, validationMiddleware.validatePort, async (req, res) => {
  try {
    console.log('Create port request from user ID:', req.user);
    console.log('Port data:', req.body);
    
    const { port, name, description, isPublic } = req.body;
    
    // Check if port already exists for this user
    const existingPort = await Port.findOne({
      where: { port, userId: req.user }
    });
    
    if (existingPort) {
      return res.status(400).json({ error: 'Port already exists' });
    }
    
    const newPort = await Port.create({
      port,
      name,
      description,
      isPublic: isPublic || false,
      isCustom: true,
      userId: req.user
    });
    
    console.log('Port created:', newPort.id);
    res.status(201).json(newPort);
  } catch (error) {
    console.error('Error creating port:', error);
    res.status(500).json({ error: 'Failed to create port' });
  }
});

// Update a port
router.put('/:id', authMiddleware, validationMiddleware.validatePort, async (req, res) => {
  try {
    const { id } = req.params;
    const { port, name, description, isPublic } = req.body;
    
    const existingPort = await Port.findOne({
      where: { id, userId: req.user }
    });
    
    if (!existingPort) {
      return res.status(404).json({ error: 'Port not found' });
    }
    
    await existingPort.update({
      port,
      name,
      description,
      isPublic: isPublic || false
    });
    
    res.json(existingPort);
  } catch (error) {
    console.error('Error updating port:', error);
    res.status(500).json({ error: 'Failed to update port' });
  }
});

// Delete a port
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    const port = await Port.findOne({
      where: { id, userId: req.user }
    });
    
    if (!port) {
      return res.status(404).json({ error: 'Port not found' });
    }
    
    await port.destroy();
    res.json({ message: 'Port deleted successfully' });
  } catch (error) {
    console.error('Error deleting port:', error);
    res.status(500).json({ error: 'Failed to delete port' });
  }
});

module.exports = router;
