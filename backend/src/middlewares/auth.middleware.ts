import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JwtUserPayload } from '../utils/jwt.js';
import { ApiResponseView } from '../views/apiResponse.view.js';

declare global {
  namespace Express {
    interface Request {
      user?: JwtUserPayload;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    ApiResponseView.error(res, 'Authentication required. Missing or malformed Bearer token.', 401);
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (error) {
    ApiResponseView.error(res, 'Invalid, expired, or corrupted token. Please sign in again.', 401);
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    ApiResponseView.error(res, 'Authentication required.', 401);
    return;
  }

  if (req.user.role !== 'admin') {
    ApiResponseView.error(res, 'Access denied. Administrator privileges required.', 403);
    return;
  }

  next();
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      req.user = verifyAccessToken(token);
    } catch {
      // Token expired or invalid; proceed anonymously
    }
  }

  next();
}
