const express = require('express');
const router = express.Router();
const BackupService = require('../services/backupService');
const authMiddleware = require('../middleware/authMiddleware');

const backupService = new BackupService();

// Create manual backup (admin only)
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const backupPath = await backupService.createBackup();
    res.json({ 
      success: true, 
      message: 'Backup created successfully',
      backupPath: backupPath ? require('path').basename(backupPath) : null
    });
  } catch (error) {
    console.error('Backup creation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create backup',
      error: error.message 
    });
  }
});

// List all backups (admin only)
router.get('/list', authMiddleware, async (req, res) => {
  try {
    const backups = await backupService.listBackups();
    res.json({ 
      success: true, 
      backups,
      count: backups.length
    });
  } catch (error) {
    console.error('Error listing backups:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to list backups',
      error: error.message 
    });
  }
});

// Restore from backup (admin only)
router.post('/restore/:filename', authMiddleware, async (req, res) => {
  try {
    const { filename } = req.params;
    
    if (!filename || !filename.endsWith('.sqlite')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid backup filename'
      });
    }

    await backupService.restoreBackup(filename);
    res.json({ 
      success: true, 
      message: `Database restored from ${filename}`,
      warning: 'Server restart recommended after restore'
    });
  } catch (error) {
    console.error('Backup restore error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to restore backup',
      error: error.message 
    });
  }
});

// Verify backup integrity (admin only)
router.post('/verify/:filename', authMiddleware, async (req, res) => {
  try {
    const { filename } = req.params;
    const path = require('path');
    const backupPath = path.join(__dirname, '../backups', filename);
    
    const isValid = await backupService.verifyBackup(backupPath);
    res.json({ 
      success: true, 
      valid: isValid,
      message: isValid ? 'Backup integrity verified' : 'Backup integrity check failed'
    });
  } catch (error) {
    console.error('Backup verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to verify backup',
      error: error.message 
    });
  }
});

// Get backup status and info
router.get('/status', authMiddleware, async (req, res) => {
  try {
    const fs = require('fs-extra');
    const path = require('path');
    
    const dbPath = path.join(__dirname, '../database.sqlite');
    const backupDir = path.join(__dirname, '../backups');
    
    let dbSize = 0;
    let dbExists = false;
    
    if (await fs.pathExists(dbPath)) {
      const stats = await fs.stat(dbPath);
      dbSize = stats.size;
      dbExists = true;
    }
    
    const backups = await backupService.listBackups();
    
    res.json({
      success: true,
      database: {
        exists: dbExists,
        size: dbSize,
        path: dbExists ? path.basename(dbPath) : null
      },
      backups: {
        count: backups.length,
        directory: path.basename(backupDir),
        maxBackups: backupService.maxBackups
      },
      schedule: {
        enabled: true,
        frequency: 'Daily at 2:00 AM',
        timezone: 'America/New_York'
      }
    });
  } catch (error) {
    console.error('Error getting backup status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get backup status',
      error: error.message 
    });
  }
});

module.exports = router;
