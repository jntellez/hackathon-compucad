import type { Request, Response } from 'express';

import { AppError } from '../../shared/errors/app-error';
import { postAgentMessageSchema } from './agent.schemas';
import { processAgentMessage } from './agent.service';

export async function postAgentMessage(request: Request, response: Response) {
  const parseResult = postAgentMessageSchema.safeParse(request.body);
  if (!parseResult.success) {
    throw new AppError(parseResult.error.issues[0].message, 400);
  }

  const result = await processAgentMessage(parseResult.data);
  return response.status(200).json({ data: result });
}
