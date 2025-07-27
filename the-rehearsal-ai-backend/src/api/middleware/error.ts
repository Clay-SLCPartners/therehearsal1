// Error handling middleware for The Rehearsal AI
// "Errors are just unplanned rehearsals" - Nathan

import { Request, Response, NextFunction } from 'express';
import { RehearsalError } from '../../utils/errors.js';
import { ApiResponse } from '../../types/index.js';

export interface AsyncHandler {
  (req: Request, res: Response, next: NextFunction): Promise<void>;
}

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export function asyncHandler(fn: AsyncHandler) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Global error handling middleware
 */
export function errorHandler(
  err: Error | RehearsalError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('Error:', err);

  // Handle known RehearsalError instances
  if (err instanceof RehearsalError) {
    const response: ApiResponse = {
      success: false,
      message: err.nathanMessage || err.message,
      error: {
        code: err.code,
        message: err.message,
        details: err.details
      },
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string || 'unknown',
        nathanNote: err.nathanMessage
      }
    };

    res.status(err.statusCode).json(response);
    return;
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    const response: ApiResponse = {
      success: false,
      message: 'Validation failed - Nathan requires proper input',
      error: {
        code: 'VALIDATION_ERROR',
        message: err.message,
        details: err
      },
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string || 'unknown',
        nathanNote: 'Even Nathan makes mistakes, but he documents them properly'
      }
    };

    res.status(400).json(response);
    return;
  }

  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const response: ApiResponse = {
      success: false,
      message: 'Database error - Nathan\'s filing system is temporarily confused',
      error: {
        code: 'DATABASE_ERROR',
        message: 'A database operation failed',
        details: process.env.NODE_ENV === 'development' ? err : undefined
      },
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string || 'unknown',
        nathanNote: 'The database needs more rehearsal time'
      }
    };

    res.status(500).json(response);
    return;
  }

  // Handle unknown errors
  const response: ApiResponse = {
    success: false,
    message: 'Internal server error - Nathan encountered an unplanned scenario',
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    },
    metadata: {
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] as string || 'unknown',
      nathanNote: 'This error was not in any of Nathan\'s 1,247 contingency plans'
    }
  };

  res.status(500).json(response);
}

/**
 * 404 handler for unknown routes
 */
export function notFoundHandler(req: Request, res: Response): void {
  const response: ApiResponse = {
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
    error: {
      code: 'NOT_FOUND',
      message: 'The requested endpoint does not exist',
      details: {
        method: req.method,
        path: req.path,
        availableRoutes: [
          'GET /api/health',
          'POST /api/auth/login',
          'POST /api/auth/register',
          'GET /api/scripts',
          'POST /api/scripts'
        ]
      }
    },
    metadata: {
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] as string || 'unknown',
      nathanNote: 'Nathan mapped every possible route. This one doesn\'t exist.'
    }
  };

  res.status(404).json(response);
}
