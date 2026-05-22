import { prisma } from '../../shared/db/prisma';

export async function findEnrollmentById(id: number) {
  return prisma.enrollment.findUnique({
    where: { id },
    include: {
      collaborator: true,
      course: true
    }
  });
}

export async function countActiveEnrollmentsByCollaborator(collaboratorId: number) {
  return prisma.enrollment.count({
    where: {
      collaboratorId,
      status: 'ACTIVE'
    }
  });
}

export async function countActiveEnrollmentsByCourse(courseId: number) {
  return prisma.enrollment.count({
    where: {
      courseId,
      status: 'ACTIVE'
    }
  });
}

export async function hasActiveEnrollmentForCourse(collaboratorId: number, courseId: number) {
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      collaboratorId,
      courseId,
      status: 'ACTIVE'
    }
  });
  return !!enrollment;
}

export async function createActiveEnrollment(collaboratorId: number, courseId: number) {
  return prisma.enrollment.create({
    data: {
      collaboratorId,
      courseId,
      status: 'ACTIVE',
      enrolledAt: new Date()
    },
    include: {
      collaborator: true,
      course: true
    }
  });
}

export async function updateEnrollmentStatus(
  id: number,
  status: 'CANCELLED' | 'COMPLETED'
) {
  return prisma.enrollment.update({
    where: { id },
    data: { status },
    include: {
      collaborator: true,
      course: true
    }
  });
}

export async function completeEnrollmentAndAwardPoints(
  enrollmentId: number,
  collaboratorId: number,
  points: number
) {
  return prisma.$transaction(async (tx) => {
    const enrollment = await tx.enrollment.update({
      where: { id: enrollmentId },
      data: { status: 'COMPLETED' },
      include: {
        collaborator: true,
        course: true
      }
    });

    await tx.collaborator.update({
      where: { id: collaboratorId },
      data: {
        score: { increment: points }
      }
    });

    return enrollment;
  });
}
