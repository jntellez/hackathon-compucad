import { Router } from 'express';

import { healthRouter } from './health/health.routes';
import { coursesRouter } from './courses/courses.routes';
import { collaboratorsRouter } from './collaborators/collaborators.routes';
import { enrollmentsRouter } from './enrollments/enrollments.routes';
import { recommendationsRouter } from './recommendations/recommendations.routes';
import { agentRouter } from './agent/agent.routes';

export const modulesRouter = Router();

modulesRouter.use(healthRouter);
modulesRouter.use(coursesRouter);
modulesRouter.use(collaboratorsRouter);
modulesRouter.use(enrollmentsRouter);
modulesRouter.use(recommendationsRouter);
modulesRouter.use(agentRouter);
