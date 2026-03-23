const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

const isVercelRuntime = process.env.VERCEL === '1' || process.env.VERCEL === 'true';
const configuredDialect = (process.env.DB_DIALECT || (process.env.DATABASE_URL ? 'postgres' : 'sqlite')).toLowerCase();
const isPostgresDialect = configuredDialect === 'postgres' || configuredDialect === 'postgresql';

// Resolve SQLite path more robustly for Windows
let sqliteStoragePath;
if (process.env.SQLITE_STORAGE_PATH) {
  sqliteStoragePath = process.env.SQLITE_STORAGE_PATH;
} else if (isVercelRuntime) {
  sqliteStoragePath = '/tmp/database.sqlite';
} else {
  // Use absolute path based on parent directory
  // __dirname is backend/config, so go up 2 levels to project root
  const projectRoot = path.resolve(__dirname, '../../');
  sqliteStoragePath = path.join(projectRoot, 'database.sqlite');
}

// Ensure we have the database encryption key
const DEFAULT_DB_ENCRYPTION_KEY = 'default-key-change-in-production';
const DB_ENCRYPTION_KEY = process.env.DB_ENCRYPTION_KEY || DEFAULT_DB_ENCRYPTION_KEY;

const resolveSqliteDialectModule = () => {
  try {
    return require('sqlite3');
  } catch (sqliteErr) {
    try {
      console.warn('sqlite3 bindings unavailable, attempting @journeyapps/sqlcipher fallback.');
      return require('@journeyapps/sqlcipher');
    } catch (sqlcipherErr) {
      const combinedError = new Error(
        `No compatible SQLite native module found (sqlite3/sqlcipher). sqlite3: ${sqliteErr.message}; sqlcipher: ${sqlcipherErr.message}`
      );
      combinedError.code = 'SQLITE_NATIVE_BINDING_MISSING';
      throw combinedError;
    }
  }
};

if (DB_ENCRYPTION_KEY === DEFAULT_DB_ENCRYPTION_KEY) {
  if (process.env.NODE_ENV === 'production') {
    const missingKeyError = new Error('DB_ENCRYPTION_KEY must be set in production. Refusing to start with default key.');
    missingKeyError.code = 'MISSING_DB_ENCRYPTION_KEY';
    throw missingKeyError;
  }
  console.warn('WARNING: Using default database encryption key outside production. Set DB_ENCRYPTION_KEY for real deployments.');
}

let sequelize;

if (isPostgresDialect) {
  const databaseUrl = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL (or NEON_DATABASE_URL) is required when DB_DIALECT=postgres');
  }

  const useSsl = process.env.PG_SSL === 'true'
    || process.env.NODE_ENV === 'production'
    || databaseUrl.includes('neon.tech');

  sequelize = new Sequelize(databaseUrl, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: useSsl
      ? {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
      : {},
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: false
    }
  });
} else {
  const dialectModule = resolveSqliteDialectModule();

  // Initialize SQLite database with connection pooling and WAL mode for better performance
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: sqliteStoragePath,
    dialectModule,
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
}

module.exports = sequelize;
