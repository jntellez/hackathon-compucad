import type { NextFunction, Request, Response } from 'express';

import { AppError } from './app-error';

export function errorHandler(error: unknown, _request: Request, response: Response, _next: NextFunction) {
  if (error instanceof AppError) {
    return response.status(error.statusCode).json({
      error: error.name,
      message: error.message
    });
  }

  console.error(error);

  return response.status(500).json({
    error: 'InternalServerError',
    message: 'An unexpected error occurred.'
  });
}
