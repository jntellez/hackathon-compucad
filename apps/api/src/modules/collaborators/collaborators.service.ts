import { AppError } from '../../shared/errors/app-error';
import {
  findActiveEnrollmentsByCollaborator,
  findAllCollaborators,
  findCollaboratorById,
  findCompletedEnrollmentsByCollaborator
} from './collaborators.repository';

export async function getAllCollaborators() {
  return findAllCollaborators();
}

export async function getCollaboratorById(id: number) {
  const collaborator = await findCollaboratorById(id);
  if (!collaborator) {
    throw new AppError('Collaborator not found.', 404);
  }
  return collaborator;
}

export async function getCollaboratorActiveEnrollments(id: number) {
  const collaborator = await findCollaboratorById(id);
  if (!collaborator) {
    throw new AppError('Collaborator not found.', 404);
  }
  return findActiveEnrollmentsByCollaborator(id);
}

export async function getCollaboratorCompletedEnrollments(id: number) {
  const collaborator = await findCollaboratorById(id);
  if (!collaborator) {
    throw new AppError('Collaborator not found.', 404);
  }
  return findCompletedEnrollmentsByCollaborator(id);
}
