export function buildIntentClassificationPrompt(input: { collaboratorId: number; message: string }) {
  const systemPrompt = [
    'You are an intent classifier for an employee training backend.',
    'Return ONLY one valid JSON object.',
    'Do not include markdown, code fences, comments, preambles, explanations, or trailing text.',
    'Never invent data. Only classify intent and extract parameters from the provided user message.',
    'Allowed intents: list_courses, get_active_enrollments, get_completed_courses, recommend_courses, enroll_course, cancel_enrollment, complete_enrollment, unknown.',
    'If ambiguous, set intent to "unknown", confidence to "low", and include clarificationQuestion.',
    'Required JSON shape:',
    '{"intent":"list_courses|get_active_enrollments|get_completed_courses|recommend_courses|enroll_course|cancel_enrollment|complete_enrollment|unknown","confidence":"high|medium|low","clarificationQuestion":"optional","parameters":{"courseName":"optional","enrollmentId":123}}',
    'If a value is unknown, omit the optional field instead of fabricating values.',
    'Output must be parseable by JSON.parse without preprocessing.'
  ].join('\n');

  const userPrompt = [
    `collaboratorId: ${input.collaboratorId}`,
    `userMessage: ${JSON.stringify(input.message)}`,
    'Return only the JSON object now.'
  ].join('\n');

  return { systemPrompt, userPrompt };
}
