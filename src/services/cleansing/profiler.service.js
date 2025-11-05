const { median, mean, standardDeviation, quartiles } = require('../../utils/stats.utils');
const validator = require('validator');

class DataProfiler {
  profile(data) {
    if (!data || data.length === 0) {
      return { rowCount: 0, columns: {} };
    }

    const profile = {
      rowCount: data.length,
      columns: {},
    };

    const columns = Object.keys(data[0]);

    columns.forEach((col) => {
      const values = data.map((row) => row[col]).filter((v) => v !== undefined);
      
      profile.columns[col] = {
        type: this.detectType(values),
        missingCount: this.countMissing(data.map((row) => row[col])),
        missingPercentage: (this.countMissing(data.map((row) => row[col])) / data.length) * 100,
        uniqueCount: new Set(values.filter((v) => v !== null && v !== '' && v !== undefined)).size,
        duplicateCount: values.length - new Set(values.filter((v) => v !== null && v !== '' && v !== undefined)).size,
        ...this.getStatistics(values),
      };
    });

    return profile;
  }

  detectType(values) {
    const sample = values
      .filter((v) => v !== null && v !== '' && v !== undefined)
      .slice(0, 100);
    
    if (sample.length === 0) return 'string';

    // Check if all are numeric
    const numericCount = sample.filter((v) => {
      const num = Number(v);
      return !isNaN(num) && isFinite(num);
    }).length;

    if (numericCount === sample.length) return 'numeric';

    // Check if all are dates
    const dateCount = sample.filter((v) => this.isDate(v)).length;
    if (dateCount === sample.length) return 'date';

    // Check if all are booleans
    const boolCount = sample.filter((v) => this.isBoolean(v)).length;
    if (boolCount === sample.length) return 'boolean';

    // Check if all are emails
    const emailCount = sample.filter((v) => validator.isEmail(String(v))).length;
    if (emailCount === sample.length) return 'email';

    return 'string';
  }

  countMissing(values) {
    return values.filter((v) => 
      v === null || v === undefined || v === '' || String(v).toLowerCase() === 'null' || String(v).toLowerCase() === 'na' || String(v).toLowerCase() === 'n/a'
    ).length;
  }

  getStatistics(values) {
    const numeric = values
      .map((v) => {
        const num = Number(v);
        return isNaN(num) || !isFinite(num) ? null : num;
      })
      .filter((v) => v !== null);
    
    if (numeric.length === 0) return {};

    const sorted = [...numeric].sort((a, b) => a - b);
    const q = quartiles(sorted);

    return {
      min: Math.min(...numeric),
      max: Math.max(...numeric),
      mean: mean(numeric),
      median: median(numeric),
      stdDev: standardDeviation(numeric),
      q1: q.q1,
      q2: q.q2,
      q3: q.q3,
    };
  }

  isDate(value) {
    if (!value) return false;
    const date = new Date(value);
    return !isNaN(date.getTime());
  }

  isBoolean(value) {
    if (typeof value === 'boolean') return true;
    const str = String(value).toLowerCase();
    return str === 'true' || str === 'false' || str === '1' || str === '0' || str === 'yes' || str === 'no';
  }
}

module.exports = new DataProfiler();


