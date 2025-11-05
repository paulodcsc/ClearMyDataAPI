const fs = require('fs');
const Papa = require('papaparse');

/**
 * Parse CSV file to JSON
 */
const parseCSV = async (filePath) => {
  return new Promise((resolve, reject) => {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    
    Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        resolve(results.data);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};

/**
 * Write JSON data to CSV file
 */
const writeCSV = async (data, outputPath) => {
  return new Promise((resolve, reject) => {
    if (!data || data.length === 0) {
      reject(new Error('No data to write'));
      return;
    }

    const csv = Papa.unparse(data, {
      header: true,
    });

    fs.writeFileSync(outputPath, csv, 'utf-8');
    resolve(outputPath);
  });
};

/**
 * Get CSV file stats
 */
const getFileStats = (filePath) => {
  const stats = fs.statSync(filePath);
  return {
    size: stats.size,
    created: stats.birthtime,
    modified: stats.mtime,
  };
};

module.exports = {
  parseCSV,
  writeCSV,
  getFileStats,
};


