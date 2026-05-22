import { AppError } from '../../shared/errors/app-error';
import { intentExtractionSchema } from './agent.schemas';
import { completeWithOpenRouter } from './openrouter.client';
import { buildIntentClassificationPrompt } from './prompt-builder';
import type { AgentMessageData } from './agent.types';
import { env } from '../../config/env';
import { parseIntentPayloadFromModelOutput } from './intent-parser';
import { executeIntent } from './intent-executor';
import { saveInteraction } from './agent-interactions.repository';
import { UNKNOWN_INTENT_MESSAGE } from './agent-message-formatters';

type AgentMessageInput = {
  collaboratorId: number;
  message: string;
};


export async function processAgentMessage(input: AgentMessageInput): Promise<AgentMessageData> {
  const prompt = buildIntentClassificationPrompt(input);
  let completion: Awaited<ReturnType<typeof completeWithOpenRouter>>;
  try {
    completion = await completeWithOpenRouter(prompt);
  } catch (error) {
    await saveInteraction({
      collaboratorId: input.collaboratorId,
      userMessage: input.message,
      detectedIntent: undefined,
      model: env.OPENROUTER_MODEL,
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      response: undefined,
      success: false,
      errorMessage: error instanceof Error ? error.message : 'OpenRouter request failed.'
    });
    throw error;
  }

  let intentPayload: ReturnType<typeof intentExtractionSchema.parse>;
  try {
    const parsed = parseIntentPayloadFromModelOutput(completion.content);
    if (!parsed) throw new Error('invalid-model-output');
    intentPayload = parsed;
  } catch {
    if (env.NODE_ENV === 'development') {
      console.debug('[agent] Invalid model output for intent extraction', {
        model: completion.model,
        preview: completion.content.slice(0, 240)
      });
    }

    await saveInteraction({
      collaboratorId: input.collaboratorId,
      userMessage: input.message,
      detectedIntent: undefined,
      model: completion.model,
      usage: completion.usage,
      response: 'No pude procesar la salida JSON del modelo.',
      success: false,
      errorMessage: 'El modelo devolvió un JSON inválido.'
    });
    throw new AppError('No pude procesar tu solicitud. Intenta de nuevo o reformula tu mensaje.', 502, 'AgentInvalidModelOutput');
  }

  if (intentPayload.intent === 'unknown' || intentPayload.confidence === 'low') {
    const data: AgentMessageData = {
      message: UNKNOWN_INTENT_MESSAGE,
      intent: 'unknown',
      action: 'clarify_intent',
      result: null,
      usage: completion.usage
    };

    await saveInteraction({
      collaboratorId: input.collaboratorId,
      userMessage: input.message,
      detectedIntent: intentPayload.intent,
      model: completion.model,
      usage: completion.usage,
      response: data.message,
      success: true
    });

    return data;
  }

  let execution: Awaited<ReturnType<typeof executeIntent>>;
  try {
    execution = await executeIntent(input, intentPayload.intent, intentPayload.parameters);
  } catch (error) {
    await saveInteraction({
      collaboratorId: input.collaboratorId,
      userMessage: input.message,
      detectedIntent: intentPayload.intent,
      model: completion.model,
      usage: completion.usage,
      response: undefined,
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Failed executing action.'
    });
    throw error;
  }
  const data: AgentMessageData = {
    message: execution.message,
    intent: intentPayload.intent,
    action: execution.action,
    result: execution.result,
    usage: completion.usage
  };

  await saveInteraction({
    collaboratorId: input.collaboratorId,
    userMessage: input.message,
    detectedIntent: intentPayload.intent,
    model: completion.model,
    usage: completion.usage,
    response: execution.message,
    success: true
  });

  return data;
}
