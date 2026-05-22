import type { CourseStatus, CourseModality } from '@prisma/client';

import { AppError } from '../../shared/errors/app-error';
import { findAllCourses, findCourseById } from './courses.repository';

export async function getAllCourses(filters: {
  status?: CourseStatus;
  category?: string;
  modality?: CourseModality;
}) {
  return findAllCourses(filters);
}

export async function getCourseById(id: number) {
  const course = await findCourseById(id);
  if (!course) {
    throw new AppError('Course not found.', 404);
  }
  return course;
}
