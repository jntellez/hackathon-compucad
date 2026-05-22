import { Router } from 'express';

import { healthRouter } from './health/health.routes';
import { coursesRouter } from './courses/courses.routes';
import { collaboratorsRouter } from './collaborators/collaborators.routes';
import { enrollmentsRouter } from './enrollments/enrollments.routes';

export const modulesRouter = Router();

modulesRouter.use(healthRouter);
modulesRouter.use(coursesRouter);
modulesRouter.use(collaboratorsRouter);
modulesRouter.use(enrollmentsRouter);
