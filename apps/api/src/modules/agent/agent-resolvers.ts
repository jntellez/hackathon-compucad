import { prisma } from '../../shared/db/prisma';

export async function findCourseIdByName(courseName: string) {
  const normalized = courseName.trim();
  const allCourses = await prisma.course.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true }
  });

  const exact = allCourses.find((course) => course.name.toLowerCase() === normalized.toLowerCase());
  if (exact) return exact;

  return allCourses.find((course) => course.name.toLowerCase().includes(normalized.toLowerCase()));
}

export async function resolveEnrollmentId(collaboratorId: number, enrollmentId?: number, courseName?: string) {
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
