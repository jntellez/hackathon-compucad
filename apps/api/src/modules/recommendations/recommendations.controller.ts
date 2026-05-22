import type { Request, Response } from 'express';

import { getRecommendationsForCollaborator } from './recommendations.service';

export async function listRecommendations(request: Request, response: Response) {
  const collaboratorId = Number(request.params.id);
  const recommendations = await getRecommendationsForCollaborator(collaboratorId);
  return response.status(200).json({ data: recommendations });
}
