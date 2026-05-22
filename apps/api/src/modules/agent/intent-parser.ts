import { intentExtractionSchema } from './agent.schemas';

function extractFirstJsonObject(raw: string): unknown | null {
  const input = raw.trim();

  try {
    return JSON.parse(input);
  } catch {
    // Fallback below for models that wrap JSON in extra text.
  }

  let depth = 0;
  let start = -1;
  let inString = false;
  let escaped = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === '\\') {
      escaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (char === '{') {
      if (depth === 0) start = index;
      depth += 1;
      continue;
    }

    if (char === '}') {
      if (depth === 0) continue;
      depth -= 1;

      if (depth === 0 && start >= 0) {
        const candidate = input.slice(start, index + 1);
        try {
          return JSON.parse(candidate);
        } catch {
          start = -1;
        }
      }
    }
  }

  return null;
}

export function parseIntentPayloadFromModelOutput(content: string) {
  const parsed = extractFirstJsonObject(content);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return null;
  }

  const validated = intentExtractionSchema.safeParse(parsed);
  if (!validated.success) {
    return null;
  }

  return validated.data;
}
