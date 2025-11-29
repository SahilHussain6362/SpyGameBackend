const logger = require('../../config/logger');

const errorMiddleware = (err, req, res, next) => {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Don't leak error details in production
  const errorResponse = {
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  res.status(statusCode).json(errorResponse);
};

module.exports = errorMiddleware;

