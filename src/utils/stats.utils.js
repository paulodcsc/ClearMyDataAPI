const ss = require('simple-statistics');

/**
 * Calculate median
 */
const median = (values) => {
  if (values.length === 0) return 0;
  return ss.median(values);
};

/**
 * Calculate mean
 */
const mean = (values) => {
  if (values.length === 0) return 0;
  return ss.mean(values);
};

/**
 * Calculate standard deviation
 */
const standardDeviation = (values) => {
  if (values.length === 0) return 0;
  return ss.standardDeviation(values);
};

/**
 * Calculate quartiles
 */
const quartiles = (values) => {
  if (values.length === 0) return { q1: 0, q2: 0, q3: 0 };
  return {
    q1: ss.quantile(values, 0.25),
    q2: ss.quantile(values, 0.5),
    q3: ss.quantile(values, 0.75),
  };
};

/**
 * Calculate IQR (Interquartile Range)
 */
const iqr = (values) => {
  const q = quartiles(values);
  return q.q3 - q.q1;
};

/**
 * Calculate Z-score
 */
const zScore = (value, mean, stdDev) => {
  if (stdDev === 0) return 0;
  return (value - mean) / stdDev;
};

module.exports = {
  median,
  mean,
  standardDeviation,
  quartiles,
  iqr,
  zScore,
};


