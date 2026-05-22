import type { NextFunction, Request, Response } from 'express';

import { AppError } from './app-error';

export function errorHandler(error: unknown, _request: Request, response: Response, _next: NextFunction) {
  if (error instanceof AppError) {
    const body = error.code
      ? { error: { code: error.code, message: error.message } }
      : { error: error.name, message: error.message };
    return response.status(error.statusCode).json(body);
  }

  if (error instanceof Error) {
    console.error(`[API Error] ${error.message}`, error.stack ?? '');
  } else {
    console.error('[API Error] Unknown error:', error);
  }

  return response.status(500).json({
    error: 'InternalServerError',
    message: 'An unexpected error occurred.'
  });
}
