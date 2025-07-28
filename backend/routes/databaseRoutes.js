const express = require('express');
const fs = require('fs');
const path = require('path');
const { User } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');
const sequelize = require('../config/database');
const router = express.Router();

// Database stats and management for dev
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    // Check if user is dev
    const user = await User.findByPk(req.user);
    if (!user || user.email !== 'ayushmaurya2003@gmail.com') {
      return res.status(403).json({ message: 'Access denied.' });
    }

    // Get database statistics
    const [userStats] = await sequelize.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN createdAt >= datetime('now', '-1 day') THEN 1 END) as users_today,
        COUNT(CASE WHEN createdAt >= datetime('now', '-7 days') THEN 1 END) as users_week,
        COUNT(CASE WHEN createdAt >= datetime('now', '-1 month') THEN 1 END) as users_month
      FROM users
    `);

    // Get table information
    const [tableInfo] = await sequelize.query(`
      SELECT 
        name as table_name,
        sql as create_sql
      FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
      ORDER BY name
    `);

    // Get database file size
    const dbPath = path.join(__dirname, '../database.sqlite');
    let dbSize = 0;
    if (fs.existsSync(dbPath)) {
      const stats = fs.statSync(dbPath);
      dbSize = stats.size;
    }

    // Get recent activity from all tables with timestamps
    const recentActivity = [];
    
    try {
      const [userActivity] = await sequelize.query(`
        SELECT 'user' as type, name, email, createdAt 
        FROM users 
        ORDER BY createdAt DESC 
        LIMIT 5
      `);
      recentActivity.push(...userActivity.map(u => ({
        type: 'user_registration',
        details: `${u.name} (${u.email})`,
        timestamp: u.createdAt
      })));
    } catch (e) {
      console.log('Users table query failed:', e.message);
    }

    try {
      const [chatActivity] = await sequelize.query(`
        SELECT 'chat' as type, message, createdAt, isFromDev
        FROM chats 
        ORDER BY createdAt DESC 
        LIMIT 5
      `);
      recentActivity.push(...chatActivity.map(c => ({
        type: c.isFromDev ? 'dev_message' : 'user_message',
        details: c.message.substring(0, 50) + (c.message.length > 50 ? '...' : ''),
        timestamp: c.createdAt
      })));
    } catch (e) {
      console.log('Chat table query failed:', e.message);
    }

    // Sort recent activity by timestamp
    recentActivity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      overview: {
        totalUsers: userStats.total_users,
        usersToday: userStats.users_today,
        usersThisWeek: userStats.users_week,
        usersThisMonth: userStats.users_month,
        databaseSize: dbSize,
        databaseSizeFormatted: formatBytes(dbSize)
      },
      tables: tableInfo.map(t => ({
        name: t.table_name,
        sql: t.create_sql
      })),
      recentActivity: recentActivity.slice(0, 10),
      systemInfo: {
        sqliteVersion: await getSQLiteVersion(),
        sequelizeVersion: require('sequelize/package.json').version,
        nodeVersion: process.version,
        platform: process.platform
      }
    });
  } catch (error) {
    console.error('Database stats error:', error);
    res.status(500).json({ message: 'Failed to get database statistics' });
  }
});

// Export user data
router.get('/export/:userId', authMiddleware, async (req, res) => {
  try {
    // Check if user is dev or requesting own data
    const requestingUser = await User.findByPk(req.user);
    const targetUserId = parseInt(req.params.userId);
    
    if (!requestingUser || (requestingUser.id !== targetUserId && requestingUser.email !== 'ayushmaurya2003@gmail.com')) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    // Get user data
    const user = await User.findByPk(targetUserId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Get associated data
    const exportData = {
      user: user.toJSON(),
      exportedAt: new Date().toISOString(),
      exportedBy: requestingUser.email
    };

    // Add chat messages if they exist
    try {
      const [chatMessages] = await sequelize.query(`
        SELECT message, isFromDev, createdAt, readByUser, readByDev
        FROM chats 
        WHERE userId = ?
        ORDER BY createdAt ASC
      `, {
        replacements: [targetUserId]
      });
      exportData.chatMessages = chatMessages;
    } catch (e) {
      console.log('Chat export failed:', e.message);
    }

    // Add analytics data if it exists
    try {
      const [analyticsData] = await sequelize.query(`
        SELECT event, page, createdAt, metadata
        FROM analytics 
        WHERE userId = ?
        ORDER BY createdAt DESC
        LIMIT 100
      `, {
        replacements: [targetUserId]
      });
      exportData.analytics = analyticsData;
    } catch (e) {
      console.log('Analytics export failed:', e.message);
    }

    // Add content if it exists
    try {
      const [contentData] = await sequelize.query(`
        SELECT type, key, value, fileUrl, metadata, createdAt, updatedAt
        FROM content 
        WHERE userId = ? AND isActive = 1
        ORDER BY type, key
      `, {
        replacements: [targetUserId]
      });
      exportData.content = contentData;
    } catch (e) {
      console.log('Content export failed:', e.message);
    }

    // Add settings if they exist
    try {
      const [settingsData] = await sequelize.query(`
        SELECT theme, notifications, privacy, security, preferences, updatedAt
        FROM settings 
        WHERE userId = ?
      `, {
        replacements: [targetUserId]
      });
      if (settingsData.length > 0) {
        exportData.settings = settingsData[0];
      }
    } catch (e) {
      console.log('Settings export failed:', e.message);
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="user-data-${user.id}-${Date.now()}.json"`);
    res.json(exportData);
  } catch (error) {
    console.error('Data export error:', error);
    res.status(500).json({ message: 'Failed to export user data' });
  }
});

// Create database backup
router.post('/backup', authMiddleware, async (req, res) => {
  try {
    // Check if user is dev
    const user = await User.findByPk(req.user);
    if (!user || user.email !== 'ayushmaurya2003@gmail.com') {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const dbPath = path.join(__dirname, '../database.sqlite');
    const backupDir = path.join(__dirname, '../backups');
    
    // Create backups directory if it doesn't exist
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `database-backup-${timestamp}.sqlite`);

    // Copy database file
    fs.copyFileSync(dbPath, backupPath);

    const backupStats = fs.statSync(backupPath);

    res.json({
      message: 'Database backup created successfully',
      backup: {
        filename: path.basename(backupPath),
        path: backupPath,
        size: backupStats.size,
        sizeFormatted: formatBytes(backupStats.size),
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Database backup error:', error);
    res.status(500).json({ message: 'Failed to create database backup' });
  }
});

// List database backups
router.get('/backups', authMiddleware, async (req, res) => {
  try {
    // Check if user is dev
    const user = await User.findByPk(req.user);
    if (!user || user.email !== 'ayushmaurya2003@gmail.com') {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const backupDir = path.join(__dirname, '../backups');
    
    if (!fs.existsSync(backupDir)) {
      return res.json({ backups: [] });
    }

    const files = fs.readdirSync(backupDir)
      .filter(file => file.endsWith('.sqlite'))
      .map(file => {
        const filePath = path.join(backupDir, file);
        const stats = fs.statSync(filePath);
        return {
          filename: file,
          size: stats.size,
          sizeFormatted: formatBytes(stats.size),
          createdAt: stats.birthtime,
          modifiedAt: stats.mtime
        };
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ backups: files });
  } catch (error) {
    console.error('Backup list error:', error);
    res.status(500).json({ message: 'Failed to list backups' });
  }
});

// Vacuum database (optimize)
router.post('/vacuum', authMiddleware, async (req, res) => {
  try {
    // Check if user is dev
    const user = await User.findByPk(req.user);
    if (!user || user.email !== 'ayushmaurya2003@gmail.com') {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const sizeBefore = getDatabaseSize();
    
    await sequelize.query('VACUUM;');
    
    const sizeAfter = getDatabaseSize();
    const savedSpace = sizeBefore - sizeAfter;

    res.json({
      message: 'Database optimized successfully',
      optimization: {
        sizeBefore: formatBytes(sizeBefore),
        sizeAfter: formatBytes(sizeAfter),
        savedSpace: formatBytes(savedSpace),
        improvement: sizeBefore > 0 ? ((savedSpace / sizeBefore) * 100).toFixed(2) + '%' : '0%'
      }
    });
  } catch (error) {
    console.error('Database vacuum error:', error);
    res.status(500).json({ message: 'Failed to optimize database' });
  }
});

// Helper functions
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function getDatabaseSize() {
  const dbPath = path.join(__dirname, '../database.sqlite');
  if (fs.existsSync(dbPath)) {
    const stats = fs.statSync(dbPath);
    return stats.size;
  }
  return 0;
}

async function getSQLiteVersion() {
  try {
    const [result] = await sequelize.query('SELECT sqlite_version() as version');
    return result[0].version;
  } catch (error) {
    return 'Unknown';
  }
}

module.exports = router;
