import { Router } from 'express';

import { getCourse, listCourses } from './courses.controller';

export const coursesRouter = Router();

coursesRouter.get('/courses', listCourses);
coursesRouter.get('/courses/:id', getCourse);
