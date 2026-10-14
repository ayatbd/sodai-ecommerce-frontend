import { Response } from 'express';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export class ApiResponseView {
  static success<T>(
    res: Response,
    data: T,
    message: string = 'Operation successful',
    statusCode: number = 200,
    meta?: Record<string, unknown>
  ): Response {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      ...(meta ? { meta } : {}),
      timestamp: new Date().toISOString(),
    });
  }

  static paginated<T>(
    res: Response,
    items: T[],
    pagination: PaginationMeta,
    message: string = 'Items retrieved successfully'
  ): Response {
    return res.status(200).json({
      success: true,
      message,
      data: items,
      pagination,
      timestamp: new Date().toISOString(),
    });
  }

  static error(
    res: Response,
    message: string = 'An unexpected error occurred',
    statusCode: number = 500,
    errors?: unknown
  ): Response {
    return res.status(statusCode).json({
      success: false,
      message,
      ...(errors !== undefined ? { errors } : {}),
      timestamp: new Date().toISOString(),
    });
  }

  static created<T>(
    res: Response,
    data: T,
    message: string = 'Resource created successfully'
  ): Response {
    return this.success(res, data, message, 201);
  }

  static noContent(res: Response): Response {
    return res.status(204).send();
  }
}
