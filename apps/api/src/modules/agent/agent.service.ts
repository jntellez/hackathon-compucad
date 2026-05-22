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

type EnrollmentWithCourse = {
  id: number;
  enrolledAt: Date;
  course: {
    name: string;
    category?: string | null;
    modality?: string | null;
    minimumRequiredLevel?: string | null;
  };
};

type RecommendationResult = {
  courseId?: number;
  course: {
    name: string;
    category?: string | null;
    modality?: string | null;
    minimumRequiredLevel?: string | null;
  };
  reasons: string[];
  eligible: boolean;
  blockingReasons: string[];
  policyRestrictions?: string[];
};

function joinReasons(reasons: string[]) {
  return reasons.map((reason) => `- ${reason}`).join('\n');
}

function formatRecommendationMessage(recommendations: RecommendationResult[]) {
  if (recommendations.length === 0) {
    return 'No encontré cursos recomendados por ahora. Si quieres, puedo mostrarte los cursos activos disponibles.';
  }

  const eligible = recommendations.filter((item) => item.eligible);
  const blocked = recommendations.filter((item) => !item.eligible);

  const actionablePreview = eligible.slice(0, 5).map((item, index) => {
    const details = [item.course.category, item.course.modality, item.course.minimumRequiredLevel]
      .filter(Boolean)
      .join(' · ');
    const reason = item.reasons[0] ?? 'Buena opción para tu perfil actual';
    return `${index + 1}. ${item.course.name}${details ? ` (${details})` : ''} — ${reason}.`;
  });

  const blockedPreview = blocked.slice(0, 5).map((item, index) => {
    const details = [item.course.category, item.course.modality, item.course.minimumRequiredLevel]
      .filter(Boolean)
      .join(' · ');
    const restrictions = item.policyRestrictions ?? item.blockingReasons;
    const reason = restrictions[0] ?? 'No cumple condiciones de política en este momento';
    return `${index + 1}. ${item.course.name}${details ? ` (${details})` : ''} — ${reason}.`;
  });

  const commonRestrictions = blocked.length > 0
    ? blocked
      .map((item) => new Set((item.policyRestrictions ?? item.blockingReasons).filter(Boolean)))
      .reduce<string[]>((common, restrictionSet, index) => {
      if (index === 0) return Array.from(restrictionSet);
      return common.filter((reason) => restrictionSet.has(reason));
    }, [])
    : [];

  if (eligible.length === 0) {
    const generalBlockMessage = commonRestrictions.length > 0
      ? `No, por ahora no puedes inscribirte a ningún curso porque hay restricciones de política:\n${joinReasons(commonRestrictions)}`
      : 'No, por ahora no puedes inscribirte a ningún curso porque todas las opciones relevantes están bloqueadas por restricciones de política.';

    const blockedSection = blockedPreview.length > 0
      ? `\n\nCursos recomendados bloqueados por restricciones de política:\n${blockedPreview.join('\n')}`
      : '';

    return `${generalBlockMessage}${blockedSection}`;
  }

  const actionableSection = `Encontré cursos recomendados para tu perfil:\n${actionablePreview.join('\n')}`;
  const blockedSection = blockedPreview.length > 0
    ? `\n\nCursos recomendados bloqueados por restricciones de política:\n${blockedPreview.join('\n')}`
    : '';

  return `${actionableSection}${blockedSection}\n\nSiguiente paso: escribe "Inscríbeme al curso <nombre del curso>" y validaré las restricciones de política antes de confirmar.`;
}

function formatActiveEnrollmentsMessage(enrollments: EnrollmentWithCourse[]) {
  if (enrollments.length === 0) {
    return 'Estas son tus inscripciones activas: no tienes inscripciones activas en este momento.';
  }

  const preview = enrollments.slice(0, 5).map((item, index) => `${index + 1}. ${item.course.name}`).join('\n');
  const suffix = enrollments.length > 5 ? `\nY ${enrollments.length - 5} más.` : '';
  return `Estas son tus inscripciones activas:\n${preview}${suffix}`;
}

function formatCompletedCoursesMessage(enrollments: EnrollmentWithCourse[]) {
  if (enrollments.length === 0) {
    return 'Estos son los cursos que ya completaste: todavía no has completado cursos.';
  }

  const preview = enrollments.slice(0, 5).map((item, index) => `${index + 1}. ${item.course.name}`).join('\n');
  const suffix = enrollments.length > 5 ? `\nY ${enrollments.length - 5} cursos completados más.` : '';
  return `Estos son los cursos que ya completaste:\n${preview}${suffix}`;
}

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
      return { action: 'list_courses', message: `Encontré ${courses.length} cursos disponibles.`, result: courses };
    },
    get_active_enrollments: async () => {
      const enrollments = await getCollaboratorActiveEnrollments(input.collaboratorId);
      return {
        action: 'get_active_enrollments',
        message: formatActiveEnrollmentsMessage(enrollments),
        result: enrollments
      };
    },
    get_completed_courses: async () => {
      const history = await getCollaboratorCompletedEnrollments(input.collaboratorId);
      return {
        action: 'get_completed_courses',
        message: formatCompletedCoursesMessage(history),
        result: history
      };
    },
    recommend_courses: async () => {
      const recommendations = await getRecommendationsForCollaborator(input.collaboratorId);
      return {
        action: 'recommend_courses',
        message: formatRecommendationMessage(recommendations),
        result: recommendations
      };
    },
    enroll_course: async () => {
      if (!parameters.courseName) {
        return {
          action: 'clarify_intent',
          message: 'Claro. ¿A qué curso te gustaría inscribirte?',
          result: null
        };
      }

      const course = await findCourseIdByName(parameters.courseName);
      if (!course) {
        return {
          action: 'clarify_intent',
          message: `No encontré un curso que coincida con "${parameters.courseName}". Por favor, comparte el nombre exacto del curso.`,
          result: null
        };
      }

      try {
        const enrollment = await createEnrollment({ collaboratorId: input.collaboratorId, courseId: course.id });
        return {
          action: 'enroll_course',
          message: `Inscripción creada correctamente: te inscribiste en ${course.name}.`,
          result: enrollment
        };
      } catch (error) {
        if (error instanceof AppError) {
          if (error.code === 'POLICY_REJECTION') {
            const latestRecommendations = await getRecommendationsForCollaborator(input.collaboratorId);
            const currentCourseState = latestRecommendations.find(
              (item) => item.course.name.toLowerCase() === course.name.toLowerCase()
            );

            if (currentCourseState && !currentCourseState.eligible) {
              const restrictions = currentCourseState.policyRestrictions ?? currentCourseState.blockingReasons;
              return {
                action: 'enroll_course',
                message: `No puedo inscribirte en ${course.name} porque cambió su estado de elegibilidad desde la recomendación. Restricción actual: ${restrictions[0] ?? error.message}`,
                result: null
              };
            }
          }

          return {
            action: 'enroll_course',
            message: `No puedo inscribirte en ${course.name} porque ${error.message}.`,
            result: null
          };
        }

        throw error;
      }
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
          message: 'Por favor, indica un ID de inscripción o el nombre de un curso activo para cancelar la inscripción.',
          result: null
        };
      }

      const enrollment = await cancelEnrollment(resolvedId);
      return {
        action: 'cancel_enrollment',
        message: `Inscripción cancelada correctamente (ID ${resolvedId}).`,
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
          message: 'Por favor, indica un ID de inscripción o el nombre de un curso activo para marcarlo como completado.',
          result: null
        };
      }

      const enrollment = await completeEnrollment(resolvedId);
      return {
        action: 'complete_enrollment',
        message: `Inscripción completada correctamente (ID ${resolvedId}).`,
        result: enrollment
      };
    },
    unknown: async () => ({
      action: 'clarify_intent',
      message:
        'Puedes preguntarme cosas como: "¿Qué cursos me recomiendas?", "¿A qué cursos estoy inscrito?" o "Inscríbeme al curso React fundamentos".',
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
      response: 'No pude procesar la salida JSON del modelo.',
      success: false,
      errorMessage: 'El modelo devolvió un JSON inválido.'
    });
    throw new AppError('No pude procesar tu solicitud. Intenta de nuevo o reformula tu mensaje.', 502, 'AgentInvalidModelOutput');
  }

  if (intentPayload.intent === 'unknown' || intentPayload.confidence === 'low') {
    const data: AgentMessageData = {
      message:
        'Puedes preguntarme cosas como: "¿Qué cursos me recomiendas?", "¿A qué cursos estoy inscrito?" o "Inscríbeme al curso React fundamentos".',
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
