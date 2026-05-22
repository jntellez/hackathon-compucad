import { AppError } from '../../shared/errors/app-error';
import {
  completeEnrollmentAndAwardPoints,
  createActiveEnrollment,
  findEnrollmentById,
  updateEnrollmentStatus
} from './enrollments.repository';
import { validateEnrollmentPolicy } from './enrollment-policy.service';
import type { CreateEnrollmentInput } from './enrollments.schemas';

export async function createEnrollment(input: CreateEnrollmentInput) {
  await validateEnrollmentPolicy(input.collaboratorId, input.courseId);

  const enrollment = await createActiveEnrollment(input.collaboratorId, input.courseId);
  return enrollment;
}

export async function cancelEnrollment(id: number) {
  const enrollment = await findEnrollmentById(id);
  if (!enrollment) {
    throw new AppError('No se encontró la inscripción.', 404);
  }
  if (enrollment.status !== 'ACTIVE') {
    throw new AppError('Solo se pueden cancelar inscripciones activas.', 400);
  }

  return updateEnrollmentStatus(id, 'CANCELLED');
}

export async function completeEnrollment(id: number) {
  const enrollment = await findEnrollmentById(id);
  if (!enrollment) {
    throw new AppError('No se encontró la inscripción.', 404);
  }
  if (enrollment.status !== 'ACTIVE') {
    throw new AppError('Solo se pueden completar inscripciones activas.', 400);
  }

  return completeEnrollmentAndAwardPoints(
    id,
    enrollment.collaboratorId,
    enrollment.course.pointsAwarded
  );
}
