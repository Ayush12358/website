const express = require('express');
const { Op } = require('sequelize');
const { User } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Analytics model for storing page views, user activity, etc.
const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const Analytics = sequelize.define('Analytics', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: User,
      key: 'id'
    }
  },
  event: {
    type: DataTypes.STRING,
    allowNull: false
  },
  page: {
    type: DataTypes.STRING,
    allowNull: true
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true
  },
  sessionId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'analytics',
  timestamps: true
});

// Sync the model
Analytics.sync({ alter: true });

// Track page view
router.post('/track', async (req, res) => {
  try {
    const { event, page, metadata = {} } = req.body;
    const userAgent = req.get('User-Agent');
    const ipAddress = req.ip || req.connection.remoteAddress;
    
    // Get session ID from cookies or generate one
    let sessionId = req.cookies.sessionId;
    if (!sessionId) {
      sessionId = require('crypto').randomUUID();
      res.cookie('sessionId', sessionId, { 
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        httpOnly: true 
      });
    }

    await Analytics.create({
      userId: req.user || null,
      event: event || 'page_view',
      page,
      userAgent,
      ipAddress,
      sessionId,
      metadata
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Analytics tracking error:', error);
    res.status(500).json({ message: 'Failed to track event' });
  }
});

// Get visitor stats (dev only)
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    // Check if user is dev
    const user = await User.findByPk(req.user);
    if (!user || user.email !== 'ayushmaurya2003@gmail.com') {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    // Get basic stats
    const [
      totalViews,
      todayViews,
      yesterdayViews,
      weekViews,
      monthViews,
      uniqueVisitors,
      totalUsers
    ] = await Promise.all([
      Analytics.count(),
      Analytics.count({ where: { createdAt: { [Op.gte]: today.setHours(0,0,0,0) } } }),
      Analytics.count({ 
        where: { 
          createdAt: { 
            [Op.gte]: yesterday.setHours(0,0,0,0),
            [Op.lt]: today.setHours(0,0,0,0)
          } 
        } 
      }),
      Analytics.count({ where: { createdAt: { [Op.gte]: lastWeek } } }),
      Analytics.count({ where: { createdAt: { [Op.gte]: lastMonth } } }),
      Analytics.count({ 
        distinct: true, 
        col: 'sessionId',
        where: { createdAt: { [Op.gte]: lastMonth } }
      }),
      User.count()
    ]);

    // Get popular pages
    const popularPages = await Analytics.findAll({
      attributes: [
        'page',
        [sequelize.fn('COUNT', sequelize.col('page')), 'views']
      ],
      where: { 
        page: { [Op.not]: null },
        createdAt: { [Op.gte]: lastMonth }
      },
      group: ['page'],
      order: [[sequelize.literal('views'), 'DESC']],
      limit: 10
    });

    // Get device types (simplified)
    const deviceStats = await Analytics.findAll({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.literal(`
          CASE 
            WHEN userAgent LIKE '%Mobile%' OR userAgent LIKE '%Android%' OR userAgent LIKE '%iPhone%' THEN 'Mobile'
            WHEN userAgent LIKE '%Tablet%' OR userAgent LIKE '%iPad%' THEN 'Tablet'
            ELSE 'Desktop'
          END
        `), 'deviceType']
      ],
      where: { 
        userAgent: { [Op.not]: null },
        createdAt: { [Op.gte]: lastMonth }
      },
      group: [sequelize.literal('deviceType')],
      order: [[sequelize.literal('count'), 'DESC']]
    });

    // Get daily views for the last 30 days
    const dailyViews = await Analytics.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'views']
      ],
      where: { createdAt: { [Op.gte]: lastMonth } },
      group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
      order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']]
    });

    res.json({
      overview: {
        totalViews,
        todayViews,
        yesterdayViews,
        weekViews,
        monthViews,
        uniqueVisitors,
        totalUsers
      },
      popularPages: popularPages.map(p => ({
        page: p.page,
        views: parseInt(p.dataValues.views)
      })),
      deviceStats: deviceStats.map(d => ({
        type: d.dataValues.deviceType,
        count: parseInt(d.dataValues.count)
      })),
      dailyViews: dailyViews.map(d => ({
        date: d.dataValues.date,
        views: parseInt(d.dataValues.views)
      }))
    });
  } catch (error) {
    console.error('Analytics stats error:', error);
    res.status(500).json({ message: 'Failed to get analytics' });
  }
});

// Get real-time visitors
router.get('/realtime', authMiddleware, async (req, res) => {
  try {
    // Check if user is dev
    const user = await User.findByPk(req.user);
    if (!user || user.email !== 'ayushmaurya2003@gmail.com') {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const activeVisitors = await Analytics.count({
      distinct: true,
      col: 'sessionId',
      where: { createdAt: { [Op.gte]: fiveMinutesAgo } }
    });

    const recentActivity = await Analytics.findAll({
      where: { createdAt: { [Op.gte]: fiveMinutesAgo } },
      order: [['createdAt', 'DESC']],
      limit: 10,
      attributes: ['event', 'page', 'createdAt', 'metadata']
    });

    res.json({
      activeVisitors,
      recentActivity
    });
  } catch (error) {
    console.error('Real-time analytics error:', error);
    res.status(500).json({ message: 'Failed to get real-time data' });
  }
});

module.exports = router;
