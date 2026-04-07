import { Request, Response, NextFunction } from 'express';

/**
 * Custom API Error class with status code
 */
export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handler middleware
 * Catches all errors and sends formatted error responses
 */
export function errorHandler(
  err: ApiError | Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Default to 500 Internal Server Error
  const statusCode = (err as ApiError).statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log error for debugging
  console.error(`[${new Date().toISOString()}] Error:`, {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body
  });

  // Send error response
  res.status(statusCode).json({
    error: true,
    message: message,
    statusCode: statusCode,
    // Include stack trace only in development
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

/**
 * 404 Not Found handler for undefined routes
 */
export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const error = new ApiError(`Route not found: ${req.method} ${req.url}`, 404);
  next(error);
}
