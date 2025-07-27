// Authentication middleware for The Rehearsal AI
// "Security is just another form of preparation" - Nathan

import { Request, Response, NextFunction } from 'express';
import { sign, verify, JsonWebTokenError, TokenExpiredError, SignOptions } from 'jsonwebtoken';
import { RehearsalError } from '../../utils/errors.js';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export interface JWTPayload {
  id: string;
  email: string;
  name: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * JWT Authentication middleware
 * Verifies JWT tokens and attaches user info to request
 */
export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    throw new RehearsalError(
      'UNAUTHORIZED',
      'Access token required',
      401,
      'Nathan requires proper authentication credentials'
    );
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new RehearsalError(
        'CONFIG_ERROR',
        'JWT secret not configured',
        500,
        'Nathan\'s security system is not properly configured'
      );
    }

    const decoded = verify(token, secret) as JWTPayload;
    
    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role
    };

    next();
  } catch (error) {
    if (error instanceof JsonWebTokenError) {
      throw new RehearsalError(
        'INVALID_TOKEN',
        'Invalid access token',
        401,
        'Nathan detected fraudulent credentials'
      );
    } else if (error instanceof TokenExpiredError) {
      throw new RehearsalError(
        'TOKEN_EXPIRED',
        'Access token expired',
        401,
        'Nathan\'s security protocol has expired - please re-authenticate'
      );
    } else {
      throw error;
    }
  }
}

/**
 * Role-based authorization middleware
 */
export function requireRole(role: string) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new RehearsalError(
        'UNAUTHORIZED',
        'Authentication required',
        401,
        'Nathan requires authentication before role verification'
      );
    }

    if (req.user.role !== role && req.user.role !== 'admin') {
      throw new RehearsalError(
        'FORBIDDEN',
        'Insufficient permissions',
        403,
        `Nathan requires ${role} privileges for this operation`
      );
    }

    next();
  };
}

/**
 * Admin-only middleware
 */
export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  return requireRole('admin')(req, res, next);
}

/**
 * Optional authentication middleware
 * Attaches user info if token is present, but doesn't require it
 */
export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return next();
    }

    const decoded = verify(token, secret) as JWTPayload;
    
    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role
    };

    next();
  } catch (error) {
    // For optional auth, we ignore token errors and continue without user info
    next();
  }
}

/**
 * Generate JWT token for user
 */
export function generateToken(user: { id: string; email: string; name: string; role: string }): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new RehearsalError(
      'CONFIG_ERROR',
      'JWT secret not configured',
      500,
      'Nathan\'s security system configuration is incomplete'
    );
  }

  const payload: JWTPayload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  };

  const options: SignOptions = {
    expiresIn: '24h',
    issuer: 'the-rehearsal-ai',
    audience: 'rehearsal-users'
  };

  return sign(payload, secret as string, options);
}

/**
 * Verify and decode JWT token without throwing errors
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return null;
    }

    return verify(token, secret) as JWTPayload;
  } catch (error) {
    return null;
  }
}
