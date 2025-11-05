const validator = require('validator');

class ValidationStrategy {
  constructor() {
    this.name = 'Data Validation & Type Conversion';
  }

  async apply(data, config) {
    const changes = { 
      valuesCorrected: 0,
      rowsRemoved: 0 
    };
    
    let cleanedData = [...data];
    if (cleanedData.length === 0) {
      return { data: cleanedData, changes };
    }

    const validationRules = config.validation.rules || {};

    // Apply validation rules
    for (const [column, rule] of Object.entries(validationRules)) {
      if (typeof rule === 'string') {
        // Standard validators (email, url, etc.)
        cleanedData = this.applyStandardValidator(cleanedData, column, rule, changes);
      } else if (typeof rule === 'object') {
        // Custom rules (min, max, pattern, etc.)
        cleanedData = this.applyCustomValidator(cleanedData, column, rule, changes);
      }
    }

    return { data: cleanedData, changes };
  }

  applyStandardValidator(data, column, rule, changes) {
    return data.map((row) => {
      const value = row[column];
      if (!value) return row;

      let isValid = true;
      let correctedValue = value;

      switch (rule.toLowerCase()) {
        case 'email':
          if (!validator.isEmail(String(value))) {
            isValid = false;
          }
          break;
        case 'url':
          if (!validator.isURL(String(value))) {
            isValid = false;
          }
          break;
        case 'numeric':
          if (isNaN(Number(value))) {
            isValid = false;
          } else {
            correctedValue = Number(value);
          }
          break;
        default:
          break;
      }

      if (!isValid) {
        changes.valuesCorrected++;
        return { ...row, [column]: null };
      }

      return { ...row, [column]: correctedValue };
    }).filter((row) => row[column] !== null);
  }

  applyCustomValidator(data, column, rule, changes) {
    return data.map((row) => {
      const value = row[column];
      if (value === null || value === undefined || value === '') return row;

      let isValid = true;
      let correctedValue = value;

      // Min/Max validation
      if (rule.min !== undefined || rule.max !== undefined) {
        const numValue = Number(value);
        if (!isNaN(numValue)) {
          if (rule.min !== undefined && numValue < rule.min) {
            isValid = false;
          }
          if (rule.max !== undefined && numValue > rule.max) {
            isValid = false;
          }
        } else {
          isValid = false;
        }
      }

      // Pattern validation
      if (rule.pattern && isValid) {
        const regex = new RegExp(rule.pattern);
        if (!regex.test(String(value))) {
          isValid = false;
        }
      }

      // Allowed values
      if (rule.allowed && isValid) {
        if (!rule.allowed.includes(value)) {
          isValid = false;
        }
      }

      if (!isValid) {
        changes.valuesCorrected++;
        return { ...row, [column]: null };
      }

      return { ...row, [column]: correctedValue };
    }).filter((row) => row[column] !== null);
  }
}

module.exports = ValidationStrategy;



