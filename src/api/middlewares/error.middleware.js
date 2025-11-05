const logger = require('../../utils/logger');

class CleansingError extends Error {
  constructor(message, code, statusCode = 500, details = null) {
    super(message);
    this.name = 'CleansingError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

const errorHandler = (err, req, res, next) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    code: err.code,
    details: err.details,
    url: req.url,
    method: req.method,
  });

  const statusCode = err.statusCode || 500;
  const response = {
    error: {
      message: err.message || 'Internal Server Error',
      code: err.code || 'INTERNAL_ERROR',
    },
  };

  if (process.env.NODE_ENV === 'development' && err.stack) {
    response.error.stack = err.stack;
  }

  if (err.details) {
    response.error.details = err.details;
  }

  res.status(statusCode).json(response);
};

module.exports = {
  CleansingError,
  errorHandler,
};


