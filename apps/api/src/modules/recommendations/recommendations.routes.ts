import { Router } from 'express';

import { listRecommendations } from './recommendations.controller';

export const recommendationsRouter = Router();

recommendationsRouter.get('/collaborators/:id/recommendations', listRecommendations);
