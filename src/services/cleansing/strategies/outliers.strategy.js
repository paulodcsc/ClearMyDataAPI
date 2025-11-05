const profiler = require('../profiler.service');
const { quartiles, iqr, zScore, mean, standardDeviation } = require('../../../utils/stats.utils');

class OutliersStrategy {
  constructor() {
    this.name = 'Outlier Detection & Treatment';
  }

  async apply(data, config) {
    const changes = { 
      outliersFound: 0,
      outliersRemoved: 0,
      outliersCapped: 0 
    };
    
    let cleanedData = [...data];
    if (cleanedData.length === 0) {
      return { data: cleanedData, changes };
    }

    const profile = profiler.profile(cleanedData);

    for (const [column, info] of Object.entries(profile.columns)) {
      if (info.type === 'numeric' && info.missingPercentage < 50) {
        const numericValuesWithIndex = cleanedData
          .map((row, index) => {
            const num = Number(row[column]);
            return isNaN(num) || !isFinite(num) ? null : { value: num, index };
          })
          .filter((v) => v !== null);

        if (numericValuesWithIndex.length === 0) continue;

        const values = numericValuesWithIndex.map((v) => v.value);
        const outliers = this.detectOutliers(values, config);

        if (outliers.length > 0) {
          changes.outliersFound += outliers.length;

          if (config.outliers.strategy === 'remove') {
            // Create a set of outlier values for quick lookup
            const outlierSet = new Set(outliers);
            const outlierIndices = new Set(
              numericValuesWithIndex
                .filter((v) => outlierSet.has(v.value))
                .map((v) => v.index)
            );
            
            cleanedData = cleanedData.filter((_, index) => !outlierIndices.has(index));
            changes.outliersRemoved += outliers.length;
          } else if (config.outliers.strategy === 'cap') {
            const { lowerBound, upperBound } = this.getBounds(values, config);
            
            cleanedData = cleanedData.map((row) => {
              const num = Number(row[column]);
              if (isNaN(num) || !isFinite(num)) return row;
              
              let newValue = num;
              if (num < lowerBound) {
                newValue = lowerBound;
                changes.outliersCapped++;
              } else if (num > upperBound) {
                newValue = upperBound;
                changes.outliersCapped++;
              }
              
              return { ...row, [column]: newValue };
            });
          } else if (config.outliers.strategy === 'flag') {
            // Add a flag column
            const flagColumn = `${column}_outlier`;
            const outlierSet = new Set(outliers);
            
            cleanedData = cleanedData.map((row) => {
              const num = Number(row[column]);
              const isOutlier = !isNaN(num) && outlierSet.has(num);
              return { ...row, [flagColumn]: isOutlier };
            });
          }
        }
      }
    }

    return { data: cleanedData, changes };
  }

  detectOutliers(values, config) {
    const outliers = [];
    
    if (config.outliers.method === 'iqr') {
      const q = quartiles(values);
      const iqrValue = iqr(values);
      const lowerBound = q.q1 - config.outliers.threshold * iqrValue;
      const upperBound = q.q3 + config.outliers.threshold * iqrValue;
      
      values.forEach((value) => {
        if (value < lowerBound || value > upperBound) {
          outliers.push(value);
        }
      });
    } else if (config.outliers.method === 'zscore') {
      const meanValue = mean(values);
      const stdDev = standardDeviation(values);
      
      values.forEach((value) => {
        const z = zScore(value, meanValue, stdDev);
        if (Math.abs(z) > 3) {
          outliers.push(value);
        }
      });
    }

    return outliers;
  }

  getBounds(values, config) {
    if (config.outliers.method === 'iqr') {
      const q = quartiles(values);
      const iqrValue = iqr(values);
      return {
        lowerBound: q.q1 - config.outliers.threshold * iqrValue,
        upperBound: q.q3 + config.outliers.threshold * iqrValue,
      };
    } else {
      // Use percentiles
      const sorted = [...values].sort((a, b) => a - b);
      return {
        lowerBound: sorted[Math.floor(sorted.length * 0.05)],
        upperBound: sorted[Math.floor(sorted.length * 0.95)],
      };
    }
  }
}

module.exports = OutliersStrategy;

