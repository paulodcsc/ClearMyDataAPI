const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/csv-cleansing';
    await mongoose.connect(mongoURI);
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error('MongoDB connection error:', error.message);
    console.error('\n❌ MongoDB connection failed!');
    console.error('\n📋 To fix this:');
    console.error('   1. Install MongoDB: brew install mongodb-community');
    console.error('   2. Start MongoDB: brew services start mongodb-community');
    console.error('   OR run: mongod --config /usr/local/etc/mongod.conf');
    console.error('\n   See SETUP.md for detailed installation instructions.\n');
    process.exit(1);
  }
};

module.exports = connectDB;

