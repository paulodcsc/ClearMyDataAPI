const profiler = require('../profiler.service');
const { median, mean } = require('../../../utils/stats.utils');

class MissingDataStrategy {
  constructor() {
    this.name = 'Missing Data Handler';
  }

  async apply(data, config) {
    const changes = { 
      valuesCorrected: 0, 
      rowsRemoved: 0, 
      columnsRemoved: 0 
    };
    
    let cleanedData = [...data];
    if (cleanedData.length === 0) {
      return { data: cleanedData, changes };
    }

    const profile = profiler.profile(cleanedData);
    const columnsToRemove = [];

    for (const [column, info] of Object.entries(profile.columns)) {
      if (info.missingPercentage > config.missingData.dropColumnThreshold) {
        columnsToRemove.push(column);
        changes.columnsRemoved++;
      } else if (info.missingPercentage > 0) {
        // Impute based on type
        if (info.type === 'numeric') {
          const nonMissingValues = cleanedData
            .map((r) => r[column])
            .filter((v) => v !== null && v !== '' && v !== undefined && !isNaN(Number(v)))
            .map(Number);

          if (nonMissingValues.length > 0) {
            let fillValue;
            if (config.missingData.numericMethod === 'median') {
              fillValue = median(nonMissingValues);
            } else if (config.missingData.numericMethod === 'mean') {
              fillValue = mean(nonMissingValues);
            } else {
              fillValue = median(nonMissingValues);
            }

            cleanedData = cleanedData.map((row) => {
              const isMissing = !row[column] || row[column] === '' || row[column] === null || row[column] === undefined;
              return {
                ...row,
                [column]: isMissing ? fillValue : row[column],
              };
            });
            
            changes.valuesCorrected += info.missingCount;
          }
        } else {
          // Categorical/String
          const nonMissingValues = cleanedData
            .map((r) => r[column])
            .filter((v) => v !== null && v !== '' && v !== undefined);

          if (nonMissingValues.length > 0) {
            let fillValue;
            if (config.missingData.categoricalMethod === 'mode') {
              // Find most frequent value
              const frequency = {};
              nonMissingValues.forEach((v) => {
                frequency[v] = (frequency[v] || 0) + 1;
              });
              fillValue = Object.keys(frequency).reduce((a, b) => 
                frequency[a] > frequency[b] ? a : b
              );
            } else {
              fillValue = 'Unknown';
            }

            cleanedData = cleanedData.map((row) => {
              const isMissing = !row[column] || row[column] === '' || row[column] === null || row[column] === undefined;
              return {
                ...row,
                [column]: isMissing ? fillValue : row[column],
              };
            });
            
            changes.valuesCorrected += info.missingCount;
          }
        }
      }
    }

    // Remove columns
    if (columnsToRemove.length > 0) {
      cleanedData = cleanedData.map((row) => {
        const newRow = { ...row };
        columnsToRemove.forEach((col) => delete newRow[col]);
        return newRow;
      });
    }

    return { data: cleanedData, changes };
  }
}

module.exports = MissingDataStrategy;


