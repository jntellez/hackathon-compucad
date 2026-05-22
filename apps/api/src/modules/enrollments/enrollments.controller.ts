import type { Request, Response } from 'express';

import { cancelEnrollment, completeEnrollment, createEnrollment } from './enrollments.service';
import { createEnrollmentSchema } from './enrollments.schemas';
import { AppError } from '../../shared/errors/app-error';

export async function postEnrollment(request: Request, response: Response) {
  const parseResult = createEnrollmentSchema.safeParse(request.body);
  if (!parseResult.success) {
    throw new AppError(parseResult.error.issues[0].message, 400);
  }

  const enrollment = await createEnrollment(parseResult.data);
  return response.status(201).json({ data: enrollment });
}

export async function postCancelEnrollment(request: Request, response: Response) {
  const id = Number(request.params.id);
  const enrollment = await cancelEnrollment(id);
  return response.status(200).json({ data: enrollment });
}

export async function postCompleteEnrollment(request: Request, response: Response) {
  const id = Number(request.params.id);
  const enrollment = await completeEnrollment(id);
  return response.status(200).json({ data: enrollment });
}
