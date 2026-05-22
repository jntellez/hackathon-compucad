import { prisma } from '../../shared/db/prisma';

export async function findAllCollaborators() {
  return prisma.collaborator.findMany({
    include: {
      position: { select: { id: true, name: true, level: true } },
      area: { select: { id: true, name: true } }
    },
    orderBy: { name: 'asc' }
  });
}

export async function findCollaboratorById(id: number) {
  return prisma.collaborator.findUnique({
    where: { id },
    include: {
      position: { select: { id: true, name: true, level: true } },
      area: { select: { id: true, name: true } }
    }
  });
}

export async function findActiveEnrollmentsByCollaborator(id: number) {
  return prisma.enrollment.findMany({
    where: {
      collaboratorId: id,
      status: 'ACTIVE'
    },
    include: {
      course: true
    },
    orderBy: { enrolledAt: 'desc' }
  });
}

export async function findCompletedEnrollmentsByCollaborator(id: number) {
  return prisma.enrollment.findMany({
    where: {
      collaboratorId: id,
      status: 'COMPLETED'
    },
    include: {
      course: true
    },
    orderBy: { enrolledAt: 'desc' }
  });
}
