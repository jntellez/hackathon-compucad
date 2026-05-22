import { z } from 'zod';

export const createEnrollmentSchema = z.object({
  collaboratorId: z.number().int().positive(),
  courseId: z.number().int().positive()
});

export type CreateEnrollmentInput = z.infer<typeof createEnrollmentSchema>;
