const { Sequelize } = require('sequelize');
const path = require('path');

// Ensure we have the database encryption key
const DB_ENCRYPTION_KEY = process.env.DB_ENCRYPTION_KEY || 'default-key-change-in-production';

if (DB_ENCRYPTION_KEY === 'default-key-change-in-production') {
  console.warn('WARNING: Using default database encryption key. Please set DB_ENCRYPTION_KEY in your environment variables for production.');
}

// Initialize SQLite database with connection pooling and WAL mode for better performance
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../database.sqlite'),
  dialectOptions: {
    // Enable Write-Ahead Logging for better concurrency
    options: [
      'PRAGMA journal_mode = WAL;',
      'PRAGMA synchronous = NORMAL;',
      'PRAGMA cache_size = 1000000;',
      'PRAGMA foreign_keys = ON;',
      'PRAGMA temp_store = MEMORY;'
    ]
  },
  logging: false, // Set to console.log to see SQL queries
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    // Add automatic createdAt and updatedAt timestamps
    timestamps: true,
    // Use camelCase for automatically added attributes
    underscored: false
  }
});

module.exports = sequelize;
