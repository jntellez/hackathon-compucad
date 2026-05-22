import { Router } from 'express';

import {
  postCancelEnrollment,
  postCompleteEnrollment,
  postEnrollment
} from './enrollments.controller';

export const enrollmentsRouter = Router();

enrollmentsRouter.post('/enrollments', postEnrollment);
enrollmentsRouter.post('/enrollments/:id/cancel', postCancelEnrollment);
enrollmentsRouter.post('/enrollments/:id/complete', postCompleteEnrollment);
