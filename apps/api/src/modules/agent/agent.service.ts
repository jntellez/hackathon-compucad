import { AppError } from '../../shared/errors/app-error';
import { prisma } from '../../shared/db/prisma';
import { getAllCourses } from '../courses/courses.service';
import {
  getCollaboratorActiveEnrollments,
  getCollaboratorCompletedEnrollments
} from '../collaborators/collaborators.service';
import { cancelEnrollment, completeEnrollment, createEnrollment } from '../enrollments/enrollments.service';
import { getRecommendationsForCollaborator } from '../recommendations/recommendations.service';
import { intentExtractionSchema } from './agent.schemas';
import { completeWithOpenRouter } from './openrouter.client';
import { buildIntentClassificationPrompt } from './prompt-builder';
import type { AgentAction, AgentMessageData, AgentUsage, AgentIntent } from './agent.types';
import { env } from '../../config/env';

type AgentMessageInput = {
  collaboratorId: number;
  message: string;
};

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

function parseIntentPayloadFromModelOutput(content: string) {
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

async function findCourseIdByName(courseName: string) {
  const normalized = courseName.trim();
  const allCourses = await prisma.course.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true }
  });

  const exact = allCourses.find((course) => course.name.toLowerCase() === normalized.toLowerCase());
  if (exact) return exact;

  return allCourses.find((course) => course.name.toLowerCase().includes(normalized.toLowerCase()));
}

async function resolveEnrollmentId(collaboratorId: number, enrollmentId?: number, courseName?: string) {
  if (enrollmentId) return enrollmentId;
  if (!courseName) return undefined;

  const enrollments = await prisma.enrollment.findMany({
    where: {
      collaboratorId,
      status: 'ACTIVE'
    },
    orderBy: { enrolledAt: 'desc' },
    include: { course: true }
  });

  return enrollments.find((item) => item.course.name.toLowerCase().includes(courseName.toLowerCase()))?.id;
}

async function executeIntent(input: AgentMessageInput, intent: AgentIntent, parameters: { courseName?: string; enrollmentId?: number }) {
  const resultByIntent: Record<AgentIntent, () => Promise<{ action: AgentAction; message: string; result: unknown }>> = {
    list_courses: async () => {
      const courses = await getAllCourses({});
      return { action: 'list_courses', message: `Found ${courses.length} courses.`, result: courses };
    },
    get_active_enrollments: async () => {
      const enrollments = await getCollaboratorActiveEnrollments(input.collaboratorId);
      return {
        action: 'get_active_enrollments',
        message: `Found ${enrollments.length} active enrollments.`,
        result: enrollments
      };
    },
    get_completed_courses: async () => {
      const history = await getCollaboratorCompletedEnrollments(input.collaboratorId);
      return {
        action: 'get_completed_courses',
        message: `Found ${history.length} completed courses.`,
        result: history
      };
    },
    recommend_courses: async () => {
      const recommendations = await getRecommendationsForCollaborator(input.collaboratorId);
      return {
        action: 'recommend_courses',
        message: `Found ${recommendations.length} recommendation candidates.`,
        result: recommendations
      };
    },
    enroll_course: async () => {
      if (!parameters.courseName) {
        return {
          action: 'clarify_intent',
          message: 'Please tell me the course name to enroll.',
          result: null
        };
      }

      const course = await findCourseIdByName(parameters.courseName);
      if (!course) {
        return {
          action: 'clarify_intent',
          message: `I could not find a course matching "${parameters.courseName}". Please provide the exact course name.`,
          result: null
        };
      }

      const enrollment = await createEnrollment({ collaboratorId: input.collaboratorId, courseId: course.id });
      return {
        action: 'enroll_course',
        message: `Enrollment created for ${course.name}.`,
        result: enrollment
      };
    },
    cancel_enrollment: async () => {
      const resolvedId = await resolveEnrollmentId(
        input.collaboratorId,
        parameters.enrollmentId,
        parameters.courseName
      );
      if (!resolvedId) {
        return {
          action: 'clarify_intent',
          message: 'Please provide an enrollment ID or an active course name to cancel.',
          result: null
        };
      }

      const enrollment = await cancelEnrollment(resolvedId);
      return {
        action: 'cancel_enrollment',
        message: `Enrollment ${resolvedId} cancelled successfully.`,
        result: enrollment
      };
    },
    complete_enrollment: async () => {
      const resolvedId = await resolveEnrollmentId(
        input.collaboratorId,
        parameters.enrollmentId,
        parameters.courseName
      );
      if (!resolvedId) {
        return {
          action: 'clarify_intent',
          message: 'Please provide an enrollment ID or an active course name to complete.',
          result: null
        };
      }

      const enrollment = await completeEnrollment(resolvedId);
      return {
        action: 'complete_enrollment',
        message: `Enrollment ${resolvedId} completed successfully.`,
        result: enrollment
      };
    },
    unknown: async () => ({
      action: 'clarify_intent',
      message: 'I am not sure what you want to do. Please clarify your request.',
      result: null
    })
  };

  return resultByIntent[intent]();
}

async function saveInteraction(input: {
  collaboratorId: number;
  userMessage: string;
  detectedIntent?: string;
  model: string;
  usage: AgentUsage;
  response?: string;
  success: boolean;
  errorMessage?: string;
}) {
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
      response: 'Failed to parse model JSON output.',
      success: false,
      errorMessage: 'Model returned invalid JSON output.'
    });
    throw new AppError('Model returned invalid JSON output.', 502, 'AgentInvalidModelOutput');
  }

  if (intentPayload.intent === 'unknown' || intentPayload.confidence === 'low') {
    const clarification = intentPayload.clarificationQuestion?.trim() || 'Can you clarify what action you want?';
    const data: AgentMessageData = {
      message: clarification,
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
