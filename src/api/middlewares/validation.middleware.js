const Joi = require('joi');
const { CleansingError } = require('./error.middleware');

const uploadSchema = Joi.object({
  files: Joi.array().min(1).required(),
  config: Joi.object({
    missingData: Joi.object({
      strategy: Joi.string().valid('impute', 'remove', 'flag'),
      numericMethod: Joi.string().valid('mean', 'median'),
      categoricalMethod: Joi.string().valid('mode', 'unknown'),
      dropColumnThreshold: Joi.number().min(0).max(100),
    }).optional(),
    duplicates: Joi.object({
      strategy: Joi.string().valid('remove', 'flag'),
      keyColumns: Joi.array().items(Joi.string()),
      fuzzyMatch: Joi.boolean(),
      similarityThreshold: Joi.number().min(0).max(1),
    }).optional(),
    outliers: Joi.object({
      strategy: Joi.string().valid('remove', 'cap', 'flag'),
      method: Joi.string().valid('iqr', 'zscore'),
      threshold: Joi.number().min(0),
    }).optional(),
    validation: Joi.object({
      rules: Joi.object().pattern(
        Joi.string(),
        Joi.alternatives().try(
          Joi.string(),
          Joi.object({
            min: Joi.number(),
            max: Joi.number(),
            pattern: Joi.string(),
            allowed: Joi.array(),
          })
        )
      ),
    }).optional(),
    standardization: Joi.object({
      dates: Joi.string(),
      text: Joi.string().valid('lowercase', 'uppercase'),
      trimWhitespace: Joi.boolean(),
      removeSpecialChars: Joi.boolean(),
    }).optional(),
  }).optional(),
});

const validateUpload = (req, res, next) => {
  const { error } = uploadSchema.validate(req.body, { allowUnknown: true });
  
  if (error) {
    throw new CleansingError(
      'Validation failed',
      'VALIDATION_ERROR',
      400,
      error.details
    );
  }
  
  next();
};

module.exports = {
  validateUpload,
};


