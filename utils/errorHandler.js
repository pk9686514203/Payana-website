/**
 * Error Handling Utility
 */

export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handler middleware
 */
export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', {
      message: err.message,
      statusCode: err.statusCode,
      stack: err.stack,
    });
  } else {
    console.error(`Error ${err.statusCode}: ${err.message}`);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    const message = `A user with this ${field} already exists`;
    return res.status(400).json({ message });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors)
      .map((err) => err.message);
    return res.status(400).json({ message: messages[0] });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(403).json({ message: 'Invalid token' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(403).json({ message: 'Token expired' });
  }

  // Operational errors (custom)
  if (err.isOperational) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  // Programming or unknown errors - don't leak details
  const isDevelopment = process.env.NODE_ENV === 'development';
  const message = isDevelopment ? err.message : 'An unexpected error occurred';

  res.status(err.statusCode).json({
    message,
    ...(isDevelopment && { error: err.message }),
  });
};

/**
 * Async error wrapper for express routes
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Success response helper
 */
export const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Error response helper
 */
export const sendError = (res, message = 'Error', statusCode = 500, details = null) => {
  const response = {
    success: false,
    message,
  };

  if (details && process.env.NODE_ENV === 'development') {
    response.details = details;
  }

  res.status(statusCode).json(response);
};
