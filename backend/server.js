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

// Trust proxy for Cloudflare tunnel
app.set('trust proxy', true);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: [
    'http://localhost:8000',
    'http://localhost:3000',
    process.env.WEBSITE_FRONTEND_URL,
    process.env.FRONTEND_URL,
    /\.trycloudflare\.com$/,
    /\.cloudflareaccess\.com$/
  ].filter(Boolean),
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

    // Start backup service
    backupService.startScheduledBackups();

    // Create daily backup if none exists for today (runs on dev start)
    if (process.env.NODE_ENV !== 'production') {
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

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api', (req, res) => {
  res.send('API is running');
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
    uptime: process.uptime()
  });
});

// Serve static files from frontend build (in production)
const frontendPath = path.join(__dirname, '../frontend/build');
if (fs.existsSync(frontendPath)) {
  app.use(express.static(frontendPath));

  // Handle React Router - send all non-API requests to index.html
  app.get(/.*/, (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(frontendPath, 'index.html'));
    }
  });
}

initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
