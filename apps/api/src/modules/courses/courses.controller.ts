import type { Request, Response } from 'express';

import { getAllCourses, getCourseById } from './courses.service';

export async function listCourses(request: Request, response: Response) {
  const { status, category, modality } = request.query;

  const courses = await getAllCourses({
    status: status as any,
    category: category as string | undefined,
    modality: modality as any
  });

  return response.status(200).json({ data: courses });
}

export async function getCourse(request: Request, response: Response) {
  const id = Number(request.params.id);
  const course = await getCourseById(id);
  return response.status(200).json({ data: course });
}
