// Custom error classes for The Rehearsal AI
// "Errors are just poorly planned scenarios" - Nathan

/**
 * Custom error class for application-specific errors
 * Nathan would approve of the meticulous error categorization
 */
export class RehearsalError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly nathanMessage: string;
  public readonly details?: any;

  constructor(
    code: string,
    message: string,
    statusCode: number = 500,
    nathanMessage: string = message,
    details?: any
  ) {
    super(message);
    this.name = 'RehearsalError';
    this.code = code;
    this.statusCode = statusCode;
    this.nathanMessage = nathanMessage;
    this.details = details;

    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, RehearsalError.prototype);
  }

  /**
   * Convert error to JSON for API responses
   */
  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      nathanMessage: this.nathanMessage,
      statusCode: this.statusCode,
      details: this.details,
      stack: process.env.NODE_ENV === 'development' ? this.stack : undefined
    };
  }
}

/**
 * Validation error for input validation failures
 */
export class ValidationError extends RehearsalError {
  constructor(message: string, details?: any) {
    super(
      'VALIDATION_ERROR',
      message,
      400,
      `Nathan requires proper input validation: ${message}`,
      details
    );
    this.name = 'ValidationError';
  }
}

/**
 * Authentication error for auth failures
 */
export class AuthenticationError extends RehearsalError {
  constructor(message: string = 'Authentication failed') {
    super(
      'AUTHENTICATION_ERROR',
      message,
      401,
      `Nathan's security protocol detected unauthorized access: ${message}`
    );
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization error for permission failures
 */
export class AuthorizationError extends RehearsalError {
  constructor(message: string = 'Insufficient permissions') {
    super(
      'AUTHORIZATION_ERROR',
      message,
      403,
      `Nathan's access control system denied permission: ${message}`
    );
    this.name = 'AuthorizationError';
  }
}

/**
 * Not found error for missing resources
 */
export class NotFoundError extends RehearsalError {
  constructor(resource: string = 'Resource') {
    const message = `${resource} not found`;
    super(
      'NOT_FOUND',
      message,
      404,
      `Nathan's filing system couldn't locate: ${resource}`
    );
    this.name = 'NotFoundError';
  }
}

/**
 * Conflict error for resource conflicts
 */
export class ConflictError extends RehearsalError {
  constructor(message: string, details?: any) {
    super(
      'CONFLICT_ERROR',
      message,
      409,
      `Nathan detected a conflict in the system: ${message}`,
      details
    );
    this.name = 'ConflictError';
  }
}

/**
 * Rate limit error for too many requests
 */
export class RateLimitError extends RehearsalError {
  constructor(message: string = 'Rate limit exceeded') {
    super(
      'RATE_LIMIT_ERROR',
      message,
      429,
      `Nathan's rate limiting protocol activated: ${message}`
    );
    this.name = 'RateLimitError';
  }
}

/**
 * Database error for database operation failures
 */
export class DatabaseError extends RehearsalError {
  constructor(message: string, details?: any) {
    super(
      'DATABASE_ERROR',
      message,
      500,
      `Nathan's database filing system encountered an error: ${message}`,
      details
    );
    this.name = 'DatabaseError';
  }
}

/**
 * External service error for third-party API failures
 */
export class ExternalServiceError extends RehearsalError {
  constructor(service: string, message: string, details?: any) {
    super(
      'EXTERNAL_SERVICE_ERROR',
      `${service} service error: ${message}`,
      502,
      `Nathan's integration with ${service} failed: ${message}`,
      details
    );
    this.name = 'ExternalServiceError';
  }
}

/**
 * Configuration error for missing or invalid configuration
 */
export class ConfigurationError extends RehearsalError {
  constructor(message: string, details?: any) {
    super(
      'CONFIGURATION_ERROR',
      message,
      500,
      `Nathan's system configuration is incomplete: ${message}`,
      details
    );
    this.name = 'ConfigurationError';
  }
}

/**
 * AI service error for AI-related failures
 */
export class AIServiceError extends RehearsalError {
  constructor(message: string, details?: any) {
    super(
      'AI_SERVICE_ERROR',
      message,
      503,
      `Nathan's AI enhancement system encountered an error: ${message}`,
      details
    );
    this.name = 'AIServiceError';
  }
}

/**
 * Error factory for creating typed errors
 */
export const ErrorFactory = {
  validation: (message: string, details?: any) => new ValidationError(message, details),
  authentication: (message?: string) => new AuthenticationError(message),
  authorization: (message?: string) => new AuthorizationError(message),
  notFound: (resource?: string) => new NotFoundError(resource),
  conflict: (message: string, details?: any) => new ConflictError(message, details),
  rateLimit: (message?: string) => new RateLimitError(message),
  database: (message: string, details?: any) => new DatabaseError(message, details),
  externalService: (service: string, message: string, details?: any) => 
    new ExternalServiceError(service, message, details),
  configuration: (message: string, details?: any) => new ConfigurationError(message, details),
  aiService: (message: string, details?: any) => new AIServiceError(message, details),
  custom: (code: string, message: string, statusCode: number, nathanMessage?: string, details?: any) =>
    new RehearsalError(code, message, statusCode, nathanMessage || message, details)
};

/**
 * Error handler utility functions
 */
export const ErrorUtils = {
  /**
   * Check if error is a RehearsalError
   */
  isRehearsalError: (error: any): error is RehearsalError => {
    return error instanceof RehearsalError;
  },

  /**
   * Extract error message safely
   */
  getMessage: (error: any): string => {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    return 'Unknown error occurred';
  },

  /**
   * Extract Nathan-friendly error message
   */
  getNathanMessage: (error: any): string => {
    if (error instanceof RehearsalError) {
      return error.nathanMessage;
    }
    return `Nathan encountered an unexpected situation: ${ErrorUtils.getMessage(error)}`;
  },

  /**
   * Get HTTP status code from error
   */
  getStatusCode: (error: any): number => {
    if (error instanceof RehearsalError) {
      return error.statusCode;
    }
    return 500;
  },

  /**
   * Wrap unknown errors in RehearsalError
   */
  wrap: (error: any, code: string = 'UNKNOWN_ERROR'): RehearsalError => {
    if (error instanceof RehearsalError) {
      return error;
    }
    
    const message = ErrorUtils.getMessage(error);
    const nathanMessage = `Nathan encountered an unplanned scenario: ${message}`;
    
    return new RehearsalError(code, message, 500, nathanMessage, error);
  }
};
