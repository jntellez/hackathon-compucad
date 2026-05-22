import { Router } from 'express';

import {
  getCollaborator,
  getCollaboratorEnrollments,
  getCollaboratorHistory,
  listCollaborators
} from './collaborators.controller';

export const collaboratorsRouter = Router();

collaboratorsRouter.get('/collaborators', listCollaborators);
collaboratorsRouter.get('/collaborators/:id', getCollaborator);
collaboratorsRouter.get('/collaborators/:id/enrollments', getCollaboratorEnrollments);
collaboratorsRouter.get('/collaborators/:id/history', getCollaboratorHistory);
