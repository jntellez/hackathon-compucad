import { z } from 'zod';

import { SUPPORTED_INTENTS } from './agent.types';

export const postAgentMessageSchema = z.object({
  collaboratorId: z.number().int().positive(),
  message: z.string().trim().min(1, 'El mensaje es obligatorio.')
});

export type PostAgentMessageInput = z.infer<typeof postAgentMessageSchema>;

export const intentExtractionSchema = z.object({
  intent: z.enum(SUPPORTED_INTENTS),
  confidence: z.enum(['high', 'medium', 'low']),
  clarificationQuestion: z.string().trim().min(1).optional(),
  parameters: z
    .object({
      courseName: z.string().trim().min(1).optional(),
      enrollmentId: z.number().int().positive().optional()
    })
    .default({})
});
