const Bull = require('bull');
const logger = require('../utils/logger');

let csvQueue = null;

const getQueue = () => {
  if (!csvQueue) {
    csvQueue = new Bull('csv-processing', {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
      },
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: {
          age: 3600, // Keep completed jobs for 1 hour
          count: 100, // Keep max 100 completed jobs
        },
        removeOnFail: {
          age: 86400, // Keep failed jobs for 24 hours
        },
      },
    });

    csvQueue.on('completed', (job) => {
      logger.info(`Job ${job.id} completed successfully`);
    });

    csvQueue.on('failed', (job, err) => {
      logger.error(`Job ${job.id} failed:`, err);
    });

    csvQueue.on('stalled', (job) => {
      logger.warn(`Job ${job.id} stalled`);
    });
  }

  return csvQueue;
};

module.exports = getQueue;

