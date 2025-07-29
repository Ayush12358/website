const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { marked } = require('marked');

// Configure marked for security
marked.setOptions({
  sanitize: false, // We'll handle sanitization separately if needed
  gfm: true, // GitHub Flavored Markdown
  breaks: true, // Convert \n to <br>
  smartLists: true,
  smartypants: true // Use smart quotes
});

const Blog = sequelize.define('Blog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 255]
    }
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [1, 255],
      is: /^[a-z0-9-]+$/i // Only alphanumeric and hyphens
    }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    },
    comment: 'Markdown content'
  },
  contentHtml: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Rendered HTML from markdown content'
  },
  excerpt: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Markdown excerpt'
  },
  excerptHtml: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Rendered HTML from markdown excerpt'
  },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'archived'),
    defaultValue: 'draft',
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'general'
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  featuredImage: {
    type: DataTypes.STRING,
    allowNull: true
  },
  metaDescription: {
    type: DataTypes.STRING(160),
    allowNull: true
  },
  readTime: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Estimated read time in minutes'
  },
  viewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  publishedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  authorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  }
}, {
  tableName: 'blogs',
  timestamps: true,
  indexes: [
    {
      fields: ['slug']
    },
    {
      fields: ['status']
    },
    {
      fields: ['category']
    },
    {
      fields: ['publishedAt']
    }
  ],
  hooks: {
    beforeCreate: (blog) => {
      if (blog.status === 'published' && !blog.publishedAt) {
        blog.publishedAt = new Date();
      }
      
      // Convert markdown to HTML
      if (blog.content) {
        blog.contentHtml = marked(blog.content);
        
        // Calculate read time based on content length
        const wordsPerMinute = 200;
        const wordCount = blog.content.split(/\s+/).length;
        blog.readTime = Math.ceil(wordCount / wordsPerMinute);
      }
      
      // Convert excerpt markdown to HTML
      if (blog.excerpt) {
        blog.excerptHtml = marked(blog.excerpt);
      }
    },
    beforeUpdate: (blog) => {
      if (blog.changed('status') && blog.status === 'published' && !blog.publishedAt) {
        blog.publishedAt = new Date();
      }
      
      // Recalculate read time and convert markdown if content changed
      if (blog.changed('content') && blog.content) {
        blog.contentHtml = marked(blog.content);
        
        const wordsPerMinute = 200;
        const wordCount = blog.content.split(/\s+/).length;
        blog.readTime = Math.ceil(wordCount / wordsPerMinute);
      }
      
      // Convert excerpt markdown to HTML if changed
      if (blog.changed('excerpt') && blog.excerpt) {
        blog.excerptHtml = marked(blog.excerpt);
      }
    }
  }
});

module.exports = Blog;
