const Job = require('../../models/job.model');
const { getProcessedFilePath, createZipArchive } = require('../../services/storage.service');
const fs = require('fs');
const path = require('path');
const { CleansingError } = require('../middlewares/error.middleware');

const getJobStatus = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findOne({ jobId });

    if (!job) {
      throw new CleansingError('Job not found', 'JOB_NOT_FOUND', 404);
    }

    res.json({
      jobId: job.jobId,
      status: job.status,
      progress: job.progress,
      filesProcessed: job.filesProcessed,
      totalFiles: job.totalFiles,
      currentFile: job.currentFile,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      completedAt: job.completedAt,
    });
  } catch (error) {
    next(error);
  }
};

const getJobReport = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findOne({ jobId });

    if (!job) {
      throw new CleansingError('Job not found', 'JOB_NOT_FOUND', 404);
    }

    if (!job.report || Object.keys(job.report).length === 0) {
      throw new CleansingError('Report not available yet', 'REPORT_NOT_READY', 404);
    }

    res.json({
      jobId: job.jobId,
      status: job.status,
      report: job.report,
    });
  } catch (error) {
    next(error);
  }
};

const downloadFile = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findOne({ jobId });

    if (!job) {
      throw new CleansingError('Job not found', 'JOB_NOT_FOUND', 404);
    }

    if (job.status !== 'completed') {
      throw new CleansingError('Job not completed yet', 'JOB_NOT_COMPLETED', 400);
    }

    const processedFiles = job.files
      .filter((f) => f.status === 'completed' && f.processedPath)
      .map((f) => ({
        path: f.processedPath,
        originalName: f.originalName,
      }));

    if (processedFiles.length === 0) {
      throw new CleansingError('No processed files available', 'NO_FILES', 404);
    }

    // If single file, return it directly
    if (processedFiles.length === 1) {
      const filePath = processedFiles[0].path;
      if (!fs.existsSync(filePath)) {
        throw new CleansingError('File not found', 'FILE_NOT_FOUND', 404);
      }

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${processedFiles[0].originalName}"`);
      return res.sendFile(path.resolve(filePath));
    }

    // Multiple files - create ZIP
    const zipPath = path.join(process.env.PROCESSED_DIR || './processed', `${jobId}.zip`);
    await createZipArchive(processedFiles, zipPath);

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="cleaned_${jobId}.zip"`);
    res.sendFile(path.resolve(zipPath));

    // Clean up ZIP after sending (optional)
    setTimeout(() => {
      if (fs.existsSync(zipPath)) {
        fs.unlinkSync(zipPath);
      }
    }, 60000); // Delete after 1 minute
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getJobStatus,
  getJobReport,
  downloadFile,
};



