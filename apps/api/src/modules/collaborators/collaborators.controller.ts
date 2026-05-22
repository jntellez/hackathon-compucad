import type { Request, Response } from 'express';

import {
  getAllCollaborators,
  getCollaboratorActiveEnrollments,
  getCollaboratorById,
  getCollaboratorCompletedEnrollments
} from './collaborators.service';

export async function listCollaborators(_request: Request, response: Response) {
  const collaborators = await getAllCollaborators();
  return response.status(200).json({ data: collaborators });
}

export async function getCollaborator(request: Request, response: Response) {
  const id = Number(request.params.id);
  const collaborator = await getCollaboratorById(id);
  return response.status(200).json({ data: collaborator });
}

export async function getCollaboratorEnrollments(request: Request, response: Response) {
  const id = Number(request.params.id);
  const enrollments = await getCollaboratorActiveEnrollments(id);
  return response.status(200).json({ data: enrollments });
}

export async function getCollaboratorHistory(request: Request, response: Response) {
  const id = Number(request.params.id);
  const enrollments = await getCollaboratorCompletedEnrollments(id);
  return response.status(200).json({ data: enrollments });
}
