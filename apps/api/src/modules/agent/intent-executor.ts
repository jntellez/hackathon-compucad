import { AppError } from '../../shared/errors/app-error';
import { getAllCourses } from '../courses/courses.service';
import {
  getCollaboratorActiveEnrollments,
  getCollaboratorCompletedEnrollments
} from '../collaborators/collaborators.service';
import { cancelEnrollment, completeEnrollment, createEnrollment } from '../enrollments/enrollments.service';
import { getRecommendationsForCollaborator } from '../recommendations/recommendations.service';
import {
  formatActiveEnrollmentsMessage,
  formatCompletedCoursesMessage,
  formatRecommendationMessage,
  UNKNOWN_INTENT_MESSAGE
} from './agent-message-formatters';
import { findCourseIdByName, resolveEnrollmentId } from './agent-resolvers';
import type { AgentAction, AgentIntent } from './agent.types';

type AgentMessageInput = {
  collaboratorId: number;
  message: string;
};

export async function executeIntent(
  input: AgentMessageInput,
  intent: AgentIntent,
  parameters: { courseName?: string; enrollmentId?: number }
) {
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
      message: UNKNOWN_INTENT_MESSAGE,
      result: null
    })
  };

  return resultByIntent[intent]();
}
