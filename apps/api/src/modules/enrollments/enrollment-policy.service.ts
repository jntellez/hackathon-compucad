import { prisma } from '../../shared/db/prisma';
import { AppError } from '../../shared/errors/app-error';

const LEVEL_ORDER: Record<string, number> = { JUNIOR: 0, MID: 1, SENIOR: 2 };

function levelValue(level: string): number {
  return LEVEL_ORDER[level] ?? -1;
}

export async function validateEnrollmentPolicy(
  collaboratorId: number,
  courseId: number
): Promise<void> {
  // 1. Collaborator must exist
  const collaborator = await prisma.collaborator.findUnique({
    where: { id: collaboratorId },
    include: { position: true }
  });
  if (!collaborator) {
    throw new AppError('Collaborator not found.', 400, 'POLICY_REJECTION');
  }

  // 2. Course must exist
  const course = await prisma.course.findUnique({
    where: { id: courseId }
  });
  if (!course) {
    throw new AppError('Course not found.', 400, 'POLICY_REJECTION');
  }

  // 3. Collaborator status must be ACTIVE
  if (collaborator.status !== 'ACTIVE') {
    throw new AppError('Collaborator is inactive.', 400, 'POLICY_REJECTION');
  }

  // 4. Collaborator must have at least 1 month of seniority
  const now = new Date();
  const hireDate = new Date(collaborator.hireDate);
  const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  if (hireDate > oneMonthAgo) {
    throw new AppError(
      'Collaborator does not meet the minimum seniority requirement (1 month).',
      400,
      'POLICY_REJECTION'
    );
  }

  // 5. Course status must be ACTIVE
  if (course.status !== 'ACTIVE') {
    throw new AppError('Course is archived.', 400, 'POLICY_REJECTION');
  }

  // 6. Collaborator level >= course minimum required level
  if (levelValue(collaborator.position.level) < levelValue(course.minimumRequiredLevel)) {
    throw new AppError(
      'Collaborator level is lower than the course minimum required level.',
      400,
      'POLICY_REJECTION'
    );
  }

  // 7. Collaborator cannot have more than 3 active enrollments
  const activeEnrollments = await prisma.enrollment.count({
    where: {
      collaboratorId,
      status: 'ACTIVE'
    }
  });
  if (activeEnrollments >= 3) {
    throw new AppError('Collaborator already has 3 active enrollments.', 400, 'POLICY_REJECTION');
  }

  // 8. Course must have available capacity
  const activeCourseEnrollments = await prisma.enrollment.count({
    where: {
      courseId,
      status: 'ACTIVE'
    }
  });
  if (activeCourseEnrollments >= course.maxCapacity) {
    throw new AppError('Course has no available capacity.', 400, 'POLICY_REJECTION');
  }

  // 9. No duplicate active enrollment for same collaborator + course
  const existingEnrollment = await prisma.enrollment.findFirst({
    where: {
      collaboratorId,
      courseId,
      status: 'ACTIVE'
    }
  });
  if (existingEnrollment) {
    throw new AppError(
      'Collaborator already has an active enrollment for this course.',
      400,
      'POLICY_REJECTION'
    );
  }
}
