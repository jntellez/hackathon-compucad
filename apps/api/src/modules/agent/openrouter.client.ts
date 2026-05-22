import { env } from '../../config/env';
import { AppError } from '../../shared/errors/app-error';

type OpenRouterUsage = {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
};

type OpenRouterResponse = {
  usage?: OpenRouterUsage;
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

export async function completeWithOpenRouter(input: { systemPrompt: string; userPrompt: string }) {
  if (!env.OPENROUTER_API_KEY) {
    throw new AppError('Missing OPENROUTER_API_KEY configuration.', 500, 'OpenRouterConfigError');
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: env.OPENROUTER_MODEL,
      temperature: 0,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: input.systemPrompt
        },
        {
          role: 'user',
          content: input.userPrompt
        }
      ]
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new AppError(`OpenRouter request failed: ${response.status} ${body}`, 502, 'OpenRouterRequestError');
  }

  const payload = (await response.json()) as OpenRouterResponse;
  const content = payload.choices?.[0]?.message?.content;

  if (!content) {
    throw new AppError('OpenRouter response did not include message content.', 502, 'OpenRouterResponseError');
  }

  return {
    model: env.OPENROUTER_MODEL,
    content,
    usage: {
      promptTokens: payload.usage?.prompt_tokens ?? 0,
      completionTokens: payload.usage?.completion_tokens ?? 0,
      totalTokens: payload.usage?.total_tokens ?? 0
    }
  };
}
