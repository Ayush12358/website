// Entry point for backend server
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const sequelize = require('./config/database');
const BackupService = require('./services/backupService');

// Import models to ensure they are loaded before sync
require('./models');

const app = express();
const backupService = new BackupService();
const isVercelRuntime = process.env.VERCEL === '1' || process.env.VERCEL === 'true';
const uploadsDir = process.env.UPLOADS_DIR
  || (isVercelRuntime ? '/tmp/uploads' : path.join(__dirname, 'uploads'));

app.set('trust proxy', true);

// Security middleware
const neonAuthUrl = process.env.VITE_NEON_AUTH_URL || 'https://ep-rough-dust-an6dybh2.neonauth.c-6.us-east-1.aws.neon.tech';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", neonAuthUrl],
      frameSrc: [neonAuthUrl],
    },
  },
  crossOriginEmbedderPolicy: false
}));

app.use(express.json());
app.use(cookieParser());

const configuredOrigins = [
  'http://localhost:8000',
  'http://localhost:3000',
  process.env.WEBSITE_FRONTEND_URL,
  process.env.FRONTEND_URL,
  ...(process.env.CORS_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
];

const nonProdRegexOrigins = [
  /\.trycloudflare\.com$/,
  /\.cloudflareaccess\.com$/,
  /\.vercel\.app$/
];

const corsOrigin = (origin, callback) => {
  // Allow server-to-server calls and tools that do not send Origin.
  if (!origin) {
    return callback(null, true);
  }

  const matchesConfigured = configuredOrigins.includes(origin);
  const allowRegexOrigins = process.env.NODE_ENV !== 'production';
  const matchesNonProdRegex = allowRegexOrigins
    && nonProdRegexOrigins.some((pattern) => pattern.test(origin));

  if (matchesConfigured || matchesNonProdRegex) {
    return callback(null, true);
  }

  return callback(new Error(`CORS blocked for origin: ${origin}`));
};

app.use(cors({
  origin: corsOrigin,
  credentials: true // Allow cookies to be sent
}));

const PORT = process.env.WEBSITE_PORT || process.env.PORT || 5001;

// Initialize database
const initDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('SQLite database connected successfully');

    // Sync all models (don't force reset in development)
    await sequelize.sync({ force: false });
    console.log('Database synchronized');

    // Start backup service only when explicitly enabled.
    const enableScheduledBackups = process.env.ENABLE_SCHEDULED_BACKUPS === 'true';
    if (enableScheduledBackups) {
      backupService.startScheduledBackups();
    }

    // Create daily backup if none exists for today (runs on dev start)
    if (!isVercelRuntime && process.env.NODE_ENV !== 'production') {
      console.log('🔍 Checking for today\'s backup...');
      try {
        await backupService.createDailyBackup();
      } catch (error) {
        console.warn('Could not create daily backup:', error.message);
      }
    }

    // Check developer account status
    await checkDevAccountStatus();
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
};

const checkDevAccountStatus = async () => {
  try {
    const { User } = require('./models');
    const devEmail = 'ayushmaurya2003@gmail.com';

    const existingDev = await User.findOne({ where: { email: devEmail } });
    if (!existingDev) {
      console.log(`Developer account with email ${devEmail} not found in database.`);
      console.log('Please create the developer account manually or through the registration process.');
    } else {
      console.log(`Developer account found: ${existingDev.name} (${existingDev.email})`);
    }
  } catch (error) {
    console.error('Error checking developer account:', error);
  }
};

let databaseInitPromise;

const ensureDatabaseInitialized = async () => {
  if (!databaseInitPromise) {
    databaseInitPromise = initDatabase();
  }
  return databaseInitPromise;
};


const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const contentRoutes = require('./routes/contentRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const databaseRoutes = require('./routes/databaseRoutes');
const backupRoutes = require('./routes/backupRoutes');
const blogRoutes = require('./routes/blogRoutes');
const portRoutes = require('./routes/portRoutes');
const linktreeRoutes = require('./routes/linktreeRoutes');
const publicLinksRoutes = require('./routes/publicLinksRoutes');

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
    uptime: process.uptime()
  });
});

app.get('/api/ready', async (req, res) => {
  try {
    await ensureDatabaseInitialized();
    return res.json({
      status: 'ready',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(503).json({
      status: 'not_ready',
      message: 'Database is not ready',
      timestamp: new Date().toISOString()
    });
  }
});

// Gate all API requests on DB readiness (critical for serverless cold starts).
app.use('/api', async (req, res, next) => {
  try {
    await ensureDatabaseInitialized();
    return next();
  } catch (error) {
    console.error('API request blocked: database not initialized', error);
    return res.status(503).json({ message: 'Service temporarily unavailable' });
  }
});

// API routes
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/database', databaseRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/ports', portRoutes);
app.use('/api/linktree', linktreeRoutes);
app.use('/api/public-links', publicLinksRoutes);

// Serve uploaded files from local runtime storage.
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

app.get('/api', (req, res) => {
  res.send('API is running');
});

// Serve static files from Vite output.
const frontendPath = path.join(__dirname, '../frontend/dist');

if (fs.existsSync(frontendPath)) {
  app.use(express.static(frontendPath));

  // Handle React Router - send all non-API requests to index.html
  app.get(/.*/, (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(frontendPath, 'index.html'));
    }
  });
}

if (isVercelRuntime) {
  // In serverless mode we export the app and initialize once per warm runtime.
  ensureDatabaseInitialized().catch((error) => {
    console.error('Database initialization error in Vercel runtime:', error);
  });
} else {
  ensureDatabaseInitialized().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  });
}

module.exports = app;
