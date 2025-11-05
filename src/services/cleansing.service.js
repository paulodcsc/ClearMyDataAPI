const CleansingPipeline = require('./cleansing/pipeline.service');
const { parseCSV, writeCSV } = require('../utils/csv.utils');
const { saveProcessedFile, saveReport } = require('./storage.service');
const logger = require('../utils/logger');

class CleansingService {
  async processFile(filePath, config, jobId) {
    try {
      logger.info(`Starting processing for file: ${filePath}`);

      // Parse CSV
      const data = await parseCSV(filePath);
      logger.info(`Parsed ${data.length} rows from CSV`);

      // Create and execute pipeline
      const pipeline = CleansingPipeline.createDefaultPipeline(config);
      const result = await pipeline.execute(data);

      // Save processed file
      const originalName = require('path').basename(filePath);
      const processedFile = saveProcessedFile(result.data, originalName);

      // Save report
      const reportPath = saveReport(jobId, result.report);

      logger.info(`Processing completed for file: ${filePath}`);

      return {
        success: true,
        processedFile,
        report: result.report,
        reportPath,
      };
    } catch (error) {
      logger.error(`Error processing file ${filePath}:`, error);
      throw error;
    }
  }
}

module.exports = new CleansingService();


