import type { Request, Response } from 'express';

export function getHealth(_request: Request, response: Response) {
  return response.status(200).json({
    status: 'ok',
    service: 'api',
    timestamp: new Date().toISOString()
  });
}
