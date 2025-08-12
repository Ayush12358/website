const express = require('express');
const router = express.Router();
const { Linktree } = require('../models');
const auth = require('../middleware/authMiddleware');

// GET /api/linktree - Get user's linktree
router.get('/', auth, async (req, res) => {
  try {
    let linktree = await Linktree.findOne({
      where: { userId: req.user }
    });

    if (!linktree) {
      // Create empty linktree if none exists
      linktree = await Linktree.create({
        userId: req.user,
        treeData: []
      });
    }

    res.json({
      success: true,
      data: linktree.treeData
    });
  } catch (error) {
    console.error('Error fetching linktree:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching linktree'
    });
  }
});

// PUT /api/linktree - Update user's linktree
router.put('/', auth, async (req, res) => {
  try {
    const { treeData } = req.body;

    if (!treeData || !Array.isArray(treeData)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid tree data format'
      });
    }

    let linktree = await Linktree.findOne({
      where: { userId: req.user }
    });

    if (linktree) {
      linktree.treeData = treeData;
      await linktree.save();
    } else {
      linktree = await Linktree.create({
        userId: req.user,
        treeData
      });
    }

    res.json({
      success: true,
      data: linktree.treeData,
      message: 'Linktree updated successfully'
    });
  } catch (error) {
    console.error('Error updating linktree:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating linktree'
    });
  }
});

module.exports = router;
