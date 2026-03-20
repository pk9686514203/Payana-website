// Custom Error Handler for API responses
export const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    success: false,
    status,
    message,
    ...(process.env.NODE_ENV === 'development' && { error: err }),
  });
};

// Utility function to send error responses
export const sendError = (res, statusCode, message) => {
  res.status(statusCode).json({
    success: false,
    message,
  });
};

// Utility function to send success responses
export const sendSuccess = (res, statusCode, message, data = null) => {
  res.status(statusCode).json({
    success: true,
    message,
    ...(data && { data }),
  });
};

export default errorHandler;
