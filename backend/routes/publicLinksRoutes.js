const express = require('express');
const router = express.Router();
const { PublicLinks, User } = require('../models');
const auth = require('../middleware/authMiddleware');

// Helper function to check if user is admin
const isAdmin = async (userId) => {
  const user = await User.findByPk(userId);
  return user && user.email === 'ayushmaurya2003@gmail.com';
};

// GET /api/public-links - Get public links (accessible to all users)
router.get('/', async (req, res) => {
  try {
    let publicLinks = await PublicLinks.findOne({
      order: [['updatedAt', 'DESC']]
    });

    if (!publicLinks) {
      // Return empty tree if no public links exist
      return res.json({
        success: true,
        data: []
      });
    }

    res.json({
      success: true,
      data: publicLinks.treeData
    });
  } catch (error) {
    console.error('Error fetching public links:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching public links'
    });
  }
});

// PUT /api/public-links - Update public links (admin only)
router.put('/', auth, async (req, res) => {
  try {
    const { treeData } = req.body;

    // Check if user is admin
    if (!(await isAdmin(req.user))) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    if (!treeData || !Array.isArray(treeData)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid tree data format'
      });
    }

    let publicLinks = await PublicLinks.findOne();

    if (publicLinks) {
      publicLinks.treeData = treeData;
      publicLinks.lastUpdatedBy = req.user;
      await publicLinks.save();
    } else {
      publicLinks = await PublicLinks.create({
        treeData,
        createdBy: req.user,
        lastUpdatedBy: req.user
      });
    }

    res.json({
      success: true,
      data: publicLinks.treeData,
      message: 'Public links updated successfully'
    });
  } catch (error) {
    console.error('Error updating public links:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating public links'
    });
  }
});

module.exports = router;
