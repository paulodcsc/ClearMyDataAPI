const redis = require('redis');
const logger = require('../utils/logger');

let redisClient = null;

const getRedisClient = async () => {
  if (!redisClient) {
    const redisUrl = process.env.REDIS_URL || 
      `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`;
    
    redisClient = redis.createClient({
      url: redisUrl,
    });

    redisClient.on('error', (err) => {
      logger.error('Redis Client Error:', err.message);
      if (err.code === 'ECONNREFUSED') {
        console.error('\n❌ Redis connection failed!');
        console.error('\n📋 To fix this:');
        console.error('   1. Install Redis: brew install redis');
        console.error('   2. Start Redis: brew services start redis');
        console.error('   OR run: redis-server');
        console.error('\n   See SETUP.md for detailed installation instructions.\n');
      }
    });

    redisClient.on('connect', () => {
      logger.info('Redis connected successfully');
    });

    try {
      if (!redisClient.isOpen) {
        await redisClient.connect();
      }
    } catch (error) {
      logger.error('Failed to connect to Redis:', error.message);
      throw error;
    }
  }

  return redisClient;
};

module.exports = getRedisClient;

