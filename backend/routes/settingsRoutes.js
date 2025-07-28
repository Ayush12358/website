const express = require('express');
const { User } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Settings model for user preferences
const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const Settings = sequelize.define('Settings', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    },
    unique: true
  },
  theme: {
    type: DataTypes.STRING,
    defaultValue: 'light'
  },
  notifications: {
    type: DataTypes.JSON,
    defaultValue: {
      email: true,
      push: false,
      sms: false,
      marketing: false
    }
  },
  privacy: {
    type: DataTypes.JSON,
    defaultValue: {
      profileVisible: true,
      showEmail: false,
      allowIndexing: true
    }
  },
  security: {
    type: DataTypes.JSON,
    defaultValue: {
      twoFactorEnabled: false,
      loginNotifications: true,
      sessionTimeout: 7 // days
    }
  },
  preferences: {
    type: DataTypes.JSON,
    defaultValue: {
      language: 'en',
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY'
    }
  }
}, {
  tableName: 'settings',
  timestamps: true
});

// Associate with User
Settings.belongsTo(User, { foreignKey: 'userId' });
User.hasOne(Settings, { foreignKey: 'userId' });

// Sync the model
Settings.sync({ alter: true });

// Get user settings
router.get('/', authMiddleware, async (req, res) => {
  try {
    let settings = await Settings.findOne({
      where: { userId: req.user }
    });

    if (!settings) {
      // Create default settings if they don't exist
      settings = await Settings.create({ userId: req.user });
    }

    res.json({
      theme: settings.theme,
      notifications: settings.notifications,
      privacy: settings.privacy,
      security: settings.security,
      preferences: settings.preferences,
      updatedAt: settings.updatedAt
    });
  } catch (error) {
    console.error('Settings fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch settings' });
  }
});

// Update user settings
router.put('/', authMiddleware, async (req, res) => {
  try {
    const { theme, notifications, privacy, security, preferences } = req.body;

    let settings = await Settings.findOne({
      where: { userId: req.user }
    });

    const updateData = {};
    if (theme !== undefined) updateData.theme = theme;
    if (notifications !== undefined) updateData.notifications = notifications;
    if (privacy !== undefined) updateData.privacy = privacy;
    if (security !== undefined) updateData.security = security;
    if (preferences !== undefined) updateData.preferences = preferences;

    if (!settings) {
      settings = await Settings.create({
        userId: req.user,
        ...updateData
      });
    } else {
      await settings.update(updateData);
    }

    res.json({
      message: 'Settings updated successfully',
      settings: {
        theme: settings.theme,
        notifications: settings.notifications,
        privacy: settings.privacy,
        security: settings.security,
        preferences: settings.preferences,
        updatedAt: settings.updatedAt
      }
    });
  } catch (error) {
    console.error('Settings update error:', error);
    res.status(500).json({ message: 'Failed to update settings' });
  }
});

// Update specific setting category
router.put('/:category', authMiddleware, async (req, res) => {
  try {
    const { category } = req.params;
    const validCategories = ['theme', 'notifications', 'privacy', 'security', 'preferences'];
    
    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: 'Invalid settings category' });
    }

    let settings = await Settings.findOne({
      where: { userId: req.user }
    });

    if (!settings) {
      settings = await Settings.create({ userId: req.user });
    }

    const updateData = {};
    updateData[category] = req.body;

    await settings.update(updateData);

    res.json({
      message: `${category} settings updated successfully`,
      [category]: settings[category],
      updatedAt: settings.updatedAt
    });
  } catch (error) {
    console.error(`${req.params.category} settings update error:`, error);
    res.status(500).json({ message: `Failed to update ${req.params.category} settings` });
  }
});

// Get system settings (dev only)
router.get('/system', authMiddleware, async (req, res) => {
  try {
    // Check if user is dev
    const user = await User.findByPk(req.user);
    if (!user || user.email !== 'ayushmaurya2003@gmail.com') {
      return res.status(403).json({ message: 'Access denied.' });
    }

    // Get system-wide settings and statistics
    const totalUsers = await User.count();
    const totalSettings = await Settings.count();
    const themeStats = await Settings.findAll({
      attributes: [
        'theme',
        [sequelize.fn('COUNT', sequelize.col('theme')), 'count']
      ],
      group: ['theme']
    });

    const systemSettings = {
      totalUsers,
      totalSettings,
      themeDistribution: themeStats.map(t => ({
        theme: t.theme,
        count: parseInt(t.dataValues.count)
      })),
      systemInfo: {
        nodeVersion: process.version,
        platform: process.platform,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage()
      }
    };

    res.json(systemSettings);
  } catch (error) {
    console.error('System settings error:', error);
    res.status(500).json({ message: 'Failed to get system settings' });
  }
});

// Reset settings to default
router.post('/reset', authMiddleware, async (req, res) => {
  try {
    const settings = await Settings.findOne({
      where: { userId: req.user }
    });

    if (settings) {
      await settings.update({
        theme: 'light',
        notifications: {
          email: true,
          push: false,
          sms: false,
          marketing: false
        },
        privacy: {
          profileVisible: true,
          showEmail: false,
          allowIndexing: true
        },
        security: {
          twoFactorEnabled: false,
          loginNotifications: true,
          sessionTimeout: 7
        },
        preferences: {
          language: 'en',
          timezone: 'UTC',
          dateFormat: 'MM/DD/YYYY'
        }
      });
    }

    res.json({ message: 'Settings reset to defaults successfully' });
  } catch (error) {
    console.error('Settings reset error:', error);
    res.status(500).json({ message: 'Failed to reset settings' });
  }
});

module.exports = router;
