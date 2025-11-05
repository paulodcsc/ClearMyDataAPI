const { v4: uuidv4 } = require('uuid');
const Job = require('../../models/job.model');
const getQueue = require('../../services/queue.service');
const { saveUploadedFile } = require('../../services/storage.service');
const defaultConfig = require('../../config/cleansing.config');
const { CleansingError } = require('../middlewares/error.middleware');
const logger = require('../../utils/logger');

const uploadFiles = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      throw new CleansingError('No files uploaded', 'NO_FILES', 400);
    }

    // Merge user config with default config
    let userConfig = {};
    if (req.body.config) {
      try {
        userConfig = typeof req.body.config === 'string' 
          ? JSON.parse(req.body.config) 
          : req.body.config;
      } catch (error) {
        throw new CleansingError('Invalid config JSON', 'INVALID_CONFIG', 400);
      }
    }
    const config = {
      missingData: { ...defaultConfig.missingData, ...userConfig.missingData },
      duplicates: { ...defaultConfig.duplicates, ...userConfig.duplicates },
      outliers: { ...defaultConfig.outliers, ...userConfig.outliers },
      validation: { ...defaultConfig.validation, ...userConfig.validation },
      standardization: { ...defaultConfig.standardization, ...userConfig.standardization },
    };

    // Create job
    const jobId = uuidv4();
    const files = req.files.map((file) => {
      const savedFile = saveUploadedFile(file);
      return {
        ...savedFile,
        status: 'pending',
      };
    });

    const job = new Job({
      jobId,
      status: 'pending',
      files,
      totalFiles: files.length,
      filesProcessed: 0,
      progress: 0,
    });

    await job.save();

    // Add files to queue
    const queue = getQueue();
    for (const file of files) {
      await queue.add('cleanse', {
        jobId,
        filePath: file.path,
        originalName: file.originalName,
        config,
      });
    }

    logger.info(`Job ${jobId} created with ${files.length} files`);

    res.status(202).json({
      success: true,
      jobId,
      filesUploaded: files.length,
      message: 'Files uploaded and queued for processing',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadFiles,
};

