import { prisma } from '../../shared/db/prisma';
import type { AgentUsage } from './agent.types';

type SaveInteractionInput = {
  collaboratorId: number;
  userMessage: string;
  detectedIntent?: string;
  model: string;
  usage: AgentUsage;
  response?: string;
  success: boolean;
  errorMessage?: string;
};

export async function saveInteraction(input: SaveInteractionInput) {
  await prisma.agentInteraction.create({
    data: {
      collaboratorId: input.collaboratorId,
      userMessage: input.userMessage,
      detectedIntent: input.detectedIntent,
      assistantResponse: input.response,
      model: input.model,
      promptTokens: input.usage.promptTokens,
      completionTokens: input.usage.completionTokens,
      totalTokens: input.usage.totalTokens,
      success: input.success,
      errorMessage: input.errorMessage
    }
  });
}
