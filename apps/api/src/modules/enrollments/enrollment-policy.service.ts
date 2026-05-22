import { prisma } from '../../shared/db/prisma';
import { AppError } from '../../shared/errors/app-error';

const LEVEL_ORDER: Record<string, number> = { JUNIOR: 0, MID: 1, SENIOR: 2 };

function levelValue(level: string): number {
  return LEVEL_ORDER[level] ?? -1;
}

type EnrollmentPolicyContext = {
  collaborator: {
    status: string;
    hireDate: Date;
    position: { level: string };
  };
  course: {
    status: string;
    minimumRequiredLevel: string;
    maxCapacity: number;
  };
  activeCollaboratorEnrollments: number;
  activeCourseEnrollments: number;
  hasActiveEnrollmentForCourse: boolean;
};

export function getEnrollmentPolicyBlockingReasons(
  context: EnrollmentPolicyContext
): string[] {
  const blockingReasons: string[] = [];

  if (context.collaborator.status !== 'ACTIVE') {
    blockingReasons.push('Collaborator is inactive.');
  }

  const now = new Date();
  const hireDate = new Date(context.collaborator.hireDate);
  const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  if (hireDate > oneMonthAgo) {
    blockingReasons.push('Collaborator does not meet the minimum seniority requirement (1 month).');
  }

  if (context.course.status !== 'ACTIVE') {
    blockingReasons.push('Course is archived.');
  }

  if (levelValue(context.collaborator.position.level) < levelValue(context.course.minimumRequiredLevel)) {
    blockingReasons.push('Collaborator level is lower than the course minimum required level.');
  }

  if (context.activeCollaboratorEnrollments >= 3) {
    blockingReasons.push('Collaborator already has 3 active enrollments.');
  }

  if (context.activeCourseEnrollments >= context.course.maxCapacity) {
    blockingReasons.push('Course has no available capacity.');
  }

  if (context.hasActiveEnrollmentForCourse) {
    blockingReasons.push('Collaborator already has an active enrollment for this course.');
  }

  return blockingReasons;
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

  const activeEnrollments = await prisma.enrollment.count({
    where: {
      collaboratorId,
      status: 'ACTIVE'
    }
  });

  const activeCourseEnrollments = await prisma.enrollment.count({
    where: {
      courseId,
      status: 'ACTIVE'
    }
  });

  const existingEnrollment = await prisma.enrollment.findFirst({
    where: {
      collaboratorId,
      courseId,
      status: 'ACTIVE'
    }
  });

  const blockingReasons = getEnrollmentPolicyBlockingReasons({
    collaborator,
    course,
    activeCollaboratorEnrollments: activeEnrollments,
    activeCourseEnrollments,
    hasActiveEnrollmentForCourse: !!existingEnrollment
  });

  if (blockingReasons.length > 0) {
    throw new AppError(blockingReasons[0], 400, 'POLICY_REJECTION');
  }
}
