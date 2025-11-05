module.exports = {
  missingData: {
    strategy: 'impute',
    numericMethod: 'median',
    categoricalMethod: 'mode',
    dropColumnThreshold: parseFloat(process.env.DROP_COLUMN_THRESHOLD) || 50,
  },
  duplicates: {
    strategy: 'remove',
    keyColumns: [],
    fuzzyMatch: false,
    similarityThreshold: parseFloat(process.env.SIMILARITY_THRESHOLD) || 0.85,
  },
  outliers: {
    strategy: 'flag',
    method: 'iqr',
    threshold: parseFloat(process.env.OUTLIER_THRESHOLD) || 1.5,
  },
  validation: {
    rules: {},
  },
  standardization: {
    dates: 'ISO8601',
    text: 'lowercase',
    trimWhitespace: true,
  },
};


