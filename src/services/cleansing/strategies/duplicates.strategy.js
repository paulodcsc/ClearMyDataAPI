const stringSimilarity = require('string-similarity');

class DuplicatesStrategy {
  constructor() {
    this.name = 'Duplicate Detection & Removal';
  }

  async apply(data, config) {
    const changes = { 
      rowsRemoved: 0,
      duplicatesFound: 0 
    };
    
    let cleanedData = [...data];
    if (cleanedData.length === 0) {
      return { data: cleanedData, changes };
    }

    const keyColumns = config.duplicates.keyColumns || [];
    
    if (keyColumns.length === 0) {
      // Use all columns if no key columns specified
      keyColumns.push(...Object.keys(cleanedData[0]));
    }

    if (config.duplicates.strategy === 'remove') {
      if (config.duplicates.fuzzyMatch) {
        // Fuzzy matching
        cleanedData = this.removeFuzzyDuplicates(
          cleanedData, 
          keyColumns, 
          config.duplicates.similarityThreshold,
          changes
        );
      } else {
        // Exact matching
        cleanedData = this.removeExactDuplicates(
          cleanedData, 
          keyColumns, 
          changes
        );
      }
    }

    return { data: cleanedData, changes };
  }

  removeExactDuplicates(data, keyColumns, changes) {
    const seen = new Set();
    const unique = [];

    data.forEach((row) => {
      const key = keyColumns.map((col) => String(row[col] || '')).join('|');
      
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(row);
      } else {
        changes.duplicatesFound++;
        changes.rowsRemoved++;
      }
    });

    return unique;
  }

  removeFuzzyDuplicates(data, keyColumns, threshold, changes) {
    const unique = [];
    const processed = new Set();

    data.forEach((row, index) => {
      if (processed.has(index)) return;

      const rowKey = keyColumns.map((col) => String(row[col] || '')).join(' ');
      unique.push(row);
      processed.add(index);

      // Check against remaining rows
      for (let i = index + 1; i < data.length; i++) {
        if (processed.has(i)) continue;

        const compareKey = keyColumns.map((col) => String(data[i][col] || '')).join(' ');
        const similarity = stringSimilarity.compareTwoStrings(rowKey.toLowerCase(), compareKey.toLowerCase());

        if (similarity >= threshold) {
          processed.add(i);
          changes.duplicatesFound++;
          changes.rowsRemoved++;
        }
      }
    });

    return unique;
  }
}

module.exports = DuplicatesStrategy;



