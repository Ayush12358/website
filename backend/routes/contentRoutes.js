const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { User } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Content model for managing website content
const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const Content = sequelize.define('Content', {
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
    }
  },
  type: {
    type: DataTypes.ENUM('resume', 'contact', 'bio', 'projects', 'skills', 'theme'),
    allowNull: false
  },
  key: {
    type: DataTypes.STRING,
    allowNull: false
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  fileUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'content',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'type', 'key']
    }
  ]
});

// Associate with User
Content.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Content, { foreignKey: 'userId' });

// Sync the model
Content.sync({ alter: true });

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only certain file types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Get all content for authenticated user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const content = await Content.findAll({
      where: { 
        userId: req.user,
        isActive: true 
      },
      order: [['type', 'ASC'], ['key', 'ASC']]
    });

    // Group by type for easier frontend handling
    const groupedContent = content.reduce((acc, item) => {
      if (!acc[item.type]) {
        acc[item.type] = {};
      }
      acc[item.type][item.key] = {
        value: item.value,
        fileUrl: item.fileUrl,
        metadata: item.metadata,
        updatedAt: item.updatedAt
      };
      return acc;
    }, {});

    res.json(groupedContent);
  } catch (error) {
    console.error('Content fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch content' });
  }
});

// Update text content
router.put('/:type/:key', authMiddleware, async (req, res) => {
  try {
    const { type, key } = req.params;
    const { value, metadata = {} } = req.body;

    const [content, created] = await Content.findOrCreate({
      where: { userId: req.user, type, key },
      defaults: { userId: req.user, type, key, value, metadata }
    });

    if (!created) {
      await content.update({ value, metadata });
    }

    res.json({
      message: 'Content updated successfully',
      content: {
        type,
        key,
        value: content.value,
        metadata: content.metadata,
        updatedAt: content.updatedAt
      }
    });
  } catch (error) {
    console.error('Content update error:', error);
    res.status(500).json({ message: 'Failed to update content' });
  }
});

// Upload file content (resume, profile picture, etc.)
router.post('/upload/:type/:key', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    const { type, key } = req.params;
    const { metadata = {} } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const fileMetadata = {
      ...JSON.parse(metadata || '{}'),
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    };

    const [content, created] = await Content.findOrCreate({
      where: { userId: req.user, type, key },
      defaults: { 
        userId: req.user, 
        type, 
        key, 
        fileUrl, 
        metadata: fileMetadata 
      }
    });

    if (!created) {
      // Delete old file if it exists
      if (content.fileUrl) {
        const oldFilePath = path.join(__dirname, '../../', content.fileUrl);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      await content.update({ fileUrl, metadata: fileMetadata });
    }

    res.json({
      message: 'File uploaded successfully',
      content: {
        type,
        key,
        fileUrl: content.fileUrl,
        metadata: content.metadata,
        updatedAt: content.updatedAt
      }
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ message: 'Failed to upload file' });
  }
});

// Get contact information
router.get('/contact', async (req, res) => {
  try {
    // Get contact info for the developer (public endpoint)
    const devUser = await User.findOne({ 
      where: { email: 'ayushmaurya2003@gmail.com' } 
    });
    
    if (!devUser) {
      return res.status(404).json({ message: 'Developer not found' });
    }

    const contactContent = await Content.findAll({
      where: { 
        userId: devUser.id,
        type: 'contact',
        isActive: true 
      }
    });

    const contact = contactContent.reduce((acc, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {});

    res.json(contact);
  } catch (error) {
    console.error('Contact fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch contact info' });
  }
});

// Bulk update contact information
router.put('/contact', authMiddleware, async (req, res) => {
  try {
    const contactData = req.body;
    const updates = [];

    for (const [key, value] of Object.entries(contactData)) {
      updates.push(
        Content.findOrCreate({
          where: { userId: req.user, type: 'contact', key },
          defaults: { userId: req.user, type: 'contact', key, value }
        }).then(([content, created]) => {
          if (!created) {
            return content.update({ value });
          }
          return content;
        })
      );
    }

    await Promise.all(updates);

    res.json({ message: 'Contact information updated successfully' });
  } catch (error) {
    console.error('Contact update error:', error);
    res.status(500).json({ message: 'Failed to update contact information' });
  }
});

// Delete content
router.delete('/:type/:key', authMiddleware, async (req, res) => {
  try {
    const { type, key } = req.params;

    const content = await Content.findOne({
      where: { userId: req.user, type, key }
    });

    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    // Delete associated file if it exists
    if (content.fileUrl) {
      const filePath = path.join(__dirname, '../../', content.fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await content.destroy();

    res.json({ message: 'Content deleted successfully' });
  } catch (error) {
    console.error('Content delete error:', error);
    res.status(500).json({ message: 'Failed to delete content' });
  }
});

module.exports = router;
