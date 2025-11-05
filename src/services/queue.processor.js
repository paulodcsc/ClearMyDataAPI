const getQueue = require('./queue.service');
const cleansingService = require('./cleansing.service');
const Job = require('../models/job.model');
const logger = require('../utils/logger');

const queue = getQueue();

// Process queue jobs with concurrency of 3
queue.process('cleanse', 3, async (job) => {
  const { jobId, filePath, originalName, config } = job.data;

  try {
    logger.info(`Processing file ${originalName} for job ${jobId}`);

    // Update job status
    const jobDoc = await Job.findOne({ jobId });
    if (!jobDoc) {
      throw new Error(`Job ${jobId} not found`);
    }

    // Update file status to processing
    const fileIndex = jobDoc.files.findIndex((f) => f.path === filePath);
    if (fileIndex !== -1) {
      jobDoc.files[fileIndex].status = 'processing';
      jobDoc.currentFile = originalName;
      jobDoc.status = 'processing';
      await jobDoc.save();
    }

    // Process the file
    const result = await cleansingService.processFile(filePath, config, jobId);

    // Update job with results
    if (fileIndex !== -1) {
      jobDoc.files[fileIndex].status = 'completed';
      jobDoc.files[fileIndex].processedPath = result.processedFile.path;
      jobDoc.filesProcessed += 1;
      jobDoc.progress = Math.round((jobDoc.filesProcessed / jobDoc.totalFiles) * 100);

      // Merge reports
      if (!jobDoc.report || !jobDoc.report.files) {
        jobDoc.report = { files: [] };
      }
      jobDoc.report.files.push({
        filename: originalName,
        original: result.report.original,
        cleaned: result.report.final,
        issues: {
          missingValues: result.report.steps
            .find((s) => s.name === 'Missing Data Handler')?.changes.valuesCorrected || 0,
          duplicates: result.report.steps
            .find((s) => s.name === 'Duplicate Detection & Removal')?.changes.duplicatesFound || 0,
          outliers: result.report.steps
            .find((s) => s.name === 'Outlier Detection & Treatment')?.changes.outliersFound || 0,
        },
        corrections: {
          missingImputed: result.report.steps
            .find((s) => s.name === 'Missing Data Handler')?.changes.valuesCorrected || 0,
          duplicatesRemoved: result.report.steps
            .find((s) => s.name === 'Duplicate Detection & Removal')?.changes.rowsRemoved || 0,
          outliersHandled: result.report.steps
            .find((s) => s.name === 'Outlier Detection & Treatment')?.changes.outliersRemoved || 0,
        },
      });

      // Check if all files are processed
      if (jobDoc.filesProcessed === jobDoc.totalFiles) {
        jobDoc.status = 'completed';
        jobDoc.completedAt = new Date();
        jobDoc.currentFile = null;
      }

      await jobDoc.save();
    }

    logger.info(`File ${originalName} processed successfully for job ${jobId}`);
    return result;
  } catch (error) {
    logger.error(`Error processing file ${originalName} for job ${jobId}:`, error);

    // Update job with error
    const jobDoc = await Job.findOne({ jobId });
    if (jobDoc) {
      const fileIndex = jobDoc.files.findIndex((f) => f.path === filePath);
      if (fileIndex !== -1) {
        jobDoc.files[fileIndex].status = 'failed';
        jobDoc.status = 'failed';
        jobDoc.error = error.message;
        await jobDoc.save();
      }
    }

    throw error;
  }
});

logger.info('Queue processor initialized');



