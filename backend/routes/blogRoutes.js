const express = require('express');
const router = express.Router();
const { Blog, User } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { Op } = require('sequelize');

// Generate slug from title
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim('-'); // Remove leading/trailing hyphens
};

// Validation helper function
const validateBlogData = (data) => {
  const errors = [];
  
  if (!data.title || data.title.trim().length === 0) {
    errors.push('Title is required');
  }
  
  if (data.title && data.title.length > 255) {
    errors.push('Title must be less than 255 characters');
  }
  
  if (!data.content || data.content.trim().length === 0) {
    errors.push('Content is required');
  }
  
  if (data.category && data.category.length > 100) {
    errors.push('Category must be less than 100 characters');
  }
  
  if (data.status && !['draft', 'published', 'archived'].includes(data.status)) {
    errors.push('Status must be draft, published, or archived');
  }
  
  if (data.metaDescription && data.metaDescription.length > 160) {
    errors.push('Meta description must be less than 160 characters');
  }
  
  return errors;
};

// Validation schemas (keeping for reference)
const blogValidation = {
  title: { required: true, minLength: 1, maxLength: 255 },
  content: { required: true, minLength: 1 },
  category: { maxLength: 100 },
  tags: { type: 'array' },
  status: { enum: ['draft', 'published', 'archived'] },
  metaDescription: { maxLength: 160 }
};

// GET /api/blog - Get all published blog posts (public)
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      tag,
      search,
      sort = 'publishedAt',
      order = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const where = { status: 'published' };

    // Add filters
    if (category) {
      where.category = category;
    }

    if (tag) {
      where.tags = {
        [Op.contains]: [tag]
      };
    }

    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { content: { [Op.like]: `%${search}%` } },
        { excerpt: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows: blogs } = await Blog.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [[sort, order.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset),
      attributes: { exclude: ['authorId'] }
    });

    res.json({
      blogs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalPosts: count,
        hasNext: offset + blogs.length < count,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({ message: 'Error fetching blog posts' });
  }
});

// GET /api/blog/admin - Get all blog posts (admin only)
router.get('/admin', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      category,
      search,
      sort = 'createdAt',
      order = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    // Add filters
    if (status) {
      where.status = status;
    }

    if (category) {
      where.category = category;
    }

    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { content: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows: blogs } = await Blog.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [[sort, order.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      blogs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalPosts: count,
        hasNext: offset + blogs.length < count,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({ message: 'Error fetching blog posts' });
  }
});

// GET /api/blog/categories - Get all categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Blog.findAll({
      attributes: ['category'],
      where: { status: 'published' },
      group: ['category'],
      raw: true
    });

    const categoryList = categories
      .map(c => c.category)
      .filter(c => c)
      .sort();

    res.json(categoryList);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Error fetching categories' });
  }
});

// GET /api/blog/tags - Get all tags
router.get('/tags', async (req, res) => {
  try {
    const blogs = await Blog.findAll({
      attributes: ['tags'],
      where: { status: 'published' },
      raw: true
    });

    const allTags = blogs
      .map(blog => blog.tags || [])
      .flat()
      .filter((tag, index, arr) => arr.indexOf(tag) === index)
      .sort();

    res.json(allTags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ message: 'Error fetching tags' });
  }
});

// GET /api/blog/:slug - Get single blog post by slug (public)
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const blog = await Blog.findOne({
      where: { 
        slug,
        status: 'published'
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email']
        }
      ],
      attributes: { exclude: ['authorId'] }
    });

    if (!blog) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    // Increment view count
    await blog.increment('viewCount');

    res.json(blog);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    res.status(500).json({ message: 'Error fetching blog post' });
  }
});

// POST /api/blog - Create new blog post (admin only)
router.post('/', 
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { title, content, excerpt, status, category, tags, featuredImage, metaDescription } = req.body;
      
      // Validate input data
      const validationErrors = validateBlogData(req.body);
      if (validationErrors.length > 0) {
        return res.status(400).json({ 
          message: 'Validation error', 
          errors: validationErrors 
        });
      }
      
      // Generate slug from title
      let slug = generateSlug(title);
      
      // Ensure slug is unique
      let counter = 1;
      let originalSlug = slug;
      while (await Blog.findOne({ where: { slug } })) {
        slug = `${originalSlug}-${counter}`;
        counter++;
      }

      const blog = await Blog.create({
        title,
        slug,
        content,
        excerpt,
        status: status || 'draft',
        category: category || 'general',
        tags: tags || [],
        featuredImage,
        metaDescription,
        authorId: req.user
      });

      const createdBlog = await Blog.findByPk(blog.id, {
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'name', 'email']
          }
        ]
      });

      res.status(201).json(createdBlog);
    } catch (error) {
      console.error('Error creating blog post:', error);
      res.status(500).json({ message: 'Error creating blog post' });
    }
  }
);

// PUT /api/blog/:id - Update blog post (admin only)
router.put('/:id',
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { title, content, excerpt, status, category, tags, featuredImage, metaDescription } = req.body;

      // Validate input data
      const validationErrors = validateBlogData(req.body);
      if (validationErrors.length > 0) {
        return res.status(400).json({ 
          message: 'Validation error', 
          errors: validationErrors 
        });
      }

      const blog = await Blog.findByPk(id);
      if (!blog) {
        return res.status(404).json({ message: 'Blog post not found' });
      }

      // If title changed, generate new slug
      let slug = blog.slug;
      if (title !== blog.title) {
        slug = generateSlug(title);
        
        // Ensure slug is unique (excluding current post)
        let counter = 1;
        let originalSlug = slug;
        while (await Blog.findOne({ where: { slug, id: { [Op.ne]: id } } })) {
          slug = `${originalSlug}-${counter}`;
          counter++;
        }
      }

      await blog.update({
        title,
        slug,
        content,
        excerpt,
        status,
        category: category || 'general',
        tags: tags || [],
        featuredImage,
        metaDescription
      });

      const updatedBlog = await Blog.findByPk(id, {
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'name', 'email']
          }
        ]
      });

      res.json(updatedBlog);
    } catch (error) {
      console.error('Error updating blog post:', error);
      res.status(500).json({ message: 'Error updating blog post' });
    }
  }
);

// DELETE /api/blog/:id - Delete blog post (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findByPk(id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    await blog.destroy();
    res.json({ message: 'Blog post deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    res.status(500).json({ message: 'Error deleting blog post' });
  }
});

// GET /api/blog/admin/:id - Get single blog post for editing (admin only)
router.get('/admin/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findByPk(id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!blog) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    res.json(blog);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    res.status(500).json({ message: 'Error fetching blog post' });
  }
});

module.exports = router;
