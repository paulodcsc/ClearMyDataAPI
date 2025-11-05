const moment = require('moment');
const validator = require('validator');

class StandardizationStrategy {
  constructor() {
    this.name = 'Data Standardization';
  }

  async apply(data, config) {
    const changes = { 
      valuesCorrected: 0 
    };
    
    let cleanedData = [...data];
    if (cleanedData.length === 0) {
      return { data: cleanedData, changes };
    }

    const standardization = config.standardization || {};

    cleanedData = cleanedData.map((row) => {
      const newRow = { ...row };
      
      Object.keys(row).forEach((column) => {
        let value = row[column];
        if (value === null || value === undefined) return;

        // Trim whitespace
        if (standardization.trimWhitespace) {
          const originalValue = value;
          value = String(value).trim();
          if (originalValue !== value) {
            changes.valuesCorrected++;
          }
        }

        // Text case normalization
        if (standardization.text === 'lowercase') {
          value = String(value).toLowerCase();
          changes.valuesCorrected++;
        } else if (standardization.text === 'uppercase') {
          value = String(value).toUpperCase();
          changes.valuesCorrected++;
        }

        // Date standardization
        if (this.isDate(value) && standardization.dates) {
          const date = moment(value);
          if (date.isValid()) {
            if (standardization.dates === 'ISO8601') {
              value = date.toISOString();
            } else {
              value = date.format(standardization.dates);
            }
            changes.valuesCorrected++;
          }
        }

        // Remove special characters if specified
        if (standardization.removeSpecialChars) {
          value = String(value).replace(/[^a-zA-Z0-9\s]/g, '');
          changes.valuesCorrected++;
        }

        newRow[column] = value;
      });

      return newRow;
    });

    return { data: cleanedData, changes };
  }

  isDate(value) {
    if (!value) return false;
    const date = new Date(value);
    return !isNaN(date.getTime());
  }
}

module.exports = StandardizationStrategy;


