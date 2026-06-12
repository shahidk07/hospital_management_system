import logger from '../utils/logger.js';

export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational
    ? err.message
    : 'Internal server error';

  // Log unexpected errors
  if (!err.isOperational || statusCode === 500) {
    logger.error('Unhandled Error:', err);
  } else {
    logger.warn(`Operational Error (${statusCode}): ${err.message}`, err.errors || '');
  }

  const response = {
    success: false,
    message,
    errors: err.errors || []
  };

  if (process.env.NODE_ENV !== 'production') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}
