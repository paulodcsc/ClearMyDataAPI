require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const connectDB = require('./config/database');
const getRedisClient = require('./config/redis');
const logger = require('./utils/logger');
const { errorHandler } = require('./api/middlewares/error.middleware');

// Import routes
const uploadRoutes = require('./api/routes/upload.routes');
const jobsRoutes = require('./api/routes/jobs.routes');

// Import queue processor
require('./services/queue.processor');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/jobs', jobsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root
app.get('/', (req, res) => {
  res.json({
    message: 'CSV Cleansing Server',
    version: '1.0.0',
    endpoints: {
      upload: 'POST /api/v1/upload',
      jobStatus: 'GET /api/v1/jobs/:jobId',
      jobReport: 'GET /api/v1/jobs/:jobId/report',
      download: 'GET /api/v1/jobs/:jobId/download',
    },
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Connect to Redis (connection handled in getRedisClient)
    try {
      const getRedisClient = require('./config/redis');
      await getRedisClient();
    } catch (error) {
      logger.error('Failed to connect to Redis:', error.message);
      console.error('\n❌ Redis connection failed!');
      console.error('\n📋 To fix this:');
      console.error('   1. Install Redis: brew install redis');
      console.error('   2. Start Redis: brew services start redis');
      console.error('   OR run: redis-server');
      console.error('\n   See SETUP.md for detailed installation instructions.\n');
      process.exit(1);
    }

    // Start Express server
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`\n✅ Server is ready!`);
      console.log(`   API available at: http://localhost:${PORT}`);
      console.log(`   Health check: http://localhost:${PORT}/health\n`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

module.exports = app;

