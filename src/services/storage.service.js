const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const archiver = require('archiver');

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const PROCESSED_DIR = process.env.PROCESSED_DIR || './processed';
const REPORTS_DIR = process.env.REPORTS_DIR || './reports';

// Ensure directories exist
[UPLOAD_DIR, PROCESSED_DIR, REPORTS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * Save uploaded file
 */
const saveUploadedFile = (file) => {
  const filename = `${uuidv4()}_${file.originalname}`;
  const filepath = path.join(UPLOAD_DIR, filename);
  
  fs.renameSync(file.path, filepath);
  
  return {
    originalName: file.originalname,
    filename,
    path: filepath,
    size: file.size,
  };
};

/**
 * Save processed file
 */
const saveProcessedFile = (data, originalName) => {
  const filename = `cleaned_${uuidv4()}_${originalName}`;
  const filepath = path.join(PROCESSED_DIR, filename);
  
  const { writeCSV } = require('../utils/csv.utils');
  writeCSV(data, filepath);
  
  return {
    filename,
    path: filepath,
  };
};

/**
 * Save cleansing report
 */
const saveReport = (jobId, report) => {
  const reportPath = path.join(REPORTS_DIR, `${jobId}_report.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  return reportPath;
};

/**
 * Get processed file path
 */
const getProcessedFilePath = (filename) => {
  return path.join(PROCESSED_DIR, filename);
};

/**
 * Create ZIP archive of processed files
 */
const createZipArchive = (files, outputPath) => {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      resolve(outputPath);
    });

    archive.on('error', (err) => {
      reject(err);
    });

    archive.pipe(output);

    files.forEach((file) => {
      if (fs.existsSync(file.path)) {
        archive.file(file.path, { name: file.originalName });
      }
    });

    archive.finalize();
  });
};

/**
 * Delete file
 */
const deleteFile = (filepath) => {
  if (fs.existsSync(filepath)) {
    fs.unlinkSync(filepath);
  }
};

module.exports = {
  saveUploadedFile,
  saveProcessedFile,
  saveReport,
  getProcessedFilePath,
  createZipArchive,
  deleteFile,
};



