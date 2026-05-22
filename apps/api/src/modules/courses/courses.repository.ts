import type { CourseStatus, CourseModality } from '@prisma/client';

import { prisma } from '../../shared/db/prisma';

export async function findAllCourses(filters: {
  status?: CourseStatus;
  category?: string;
  modality?: CourseModality;
}) {
  return prisma.course.findMany({
    where: {
      ...(filters.status && { status: filters.status }),
      ...(filters.category && { category: filters.category }),
      ...(filters.modality && { modality: filters.modality })
    },
    orderBy: { name: 'asc' }
  });
}

export async function findCourseById(id: number) {
  return prisma.course.findUnique({
    where: { id }
  });
}
