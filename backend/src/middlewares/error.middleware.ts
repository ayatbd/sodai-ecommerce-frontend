import { Request, Response, NextFunction } from 'express';
import { ApiResponseView } from '../views/apiResponse.view.js';
import { logger } from '../utils/logger.js';

interface MongooseError extends Error {
  code?: number;
  keyValue?: Record<string, unknown>;
  name: string;
}

export function notFoundHandler(req: Request, res: Response): void {
  ApiResponseView.error(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
}

export function errorHandler(
  err: MongooseError | Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  logger.error(`Error on ${req.method} ${req.url}:`, err);

  // Mongoose Duplicate Key Error (E11000)
  if ('code' in err && err.code === 11000 && err.keyValue) {
    const duplicateField = Object.keys(err.keyValue)[0];
    ApiResponseView.error(
      res,
      `A resource with this ${duplicateField} already exists.`,
      409,
      { field: duplicateField, value: err.keyValue[duplicateField] }
    );
    return;
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    ApiResponseView.error(res, err.message, 422);
    return;
  }

  // Mongoose CastError (Invalid ObjectId)
  if (err.name === 'CastError') {
    ApiResponseView.error(res, 'Invalid resource identifier format.', 400);
    return;
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    ApiResponseView.error(res, 'Invalid token signature.', 401);
    return;
  }

  if (err.name === 'TokenExpiredError') {
    ApiResponseView.error(res, 'Authentication token expired.', 401);
    return;
  }

  // Default server error
  ApiResponseView.error(
    res,
    process.env.NODE_ENV === 'production'
      ? 'An internal server error occurred.'
      : err.message,
    500
  );
}
