import { AppError } from '../../shared/errors/app-error';
import { prisma } from '../../shared/db/prisma';
import { getEnrollmentPolicyBlockingReasons } from '../enrollments/enrollment-policy.service';

const LEVEL_ORDER: Record<string, number> = { JUNIOR: 0, MID: 1, SENIOR: 2 };

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

function tokenize(text: string) {
  return normalize(text)
    .split(/[^\p{L}\p{N}]+/u)
    .filter((token) => token.length >= 3);
}

function toSet(values: string[]) {
  return new Set(values);
}

function countMatches(source: Set<string>, target: Set<string>) {
  let matches = 0;
  for (const token of source) {
    if (target.has(token)) matches += 1;
  }
  return matches;
}

function levelValue(level: string) {
  return LEVEL_ORDER[level] ?? -1;
}

function scoreByPoints(pointsAwarded: number) {
  if (pointsAwarded >= 500) return 15;
  if (pointsAwarded >= 350) return 12;
  if (pointsAwarded >= 200) return 9;
  if (pointsAwarded >= 100) return 6;
  return 3;
}

function compactPositionText(position: {
  name: string;
  description: string;
  responsibilities: string;
  tools: string;
  keySkills: string;
}) {
  return [position.name, position.description, position.responsibilities, position.tools, position.keySkills]
    .join(' ')
    .trim();
}

export async function getRecommendationsForCollaborator(collaboratorId: number) {
  const collaborator = await prisma.collaborator.findUnique({
    where: { id: collaboratorId },
    include: {
      area: true,
      position: {
        include: {
          nextPosition: true
        }
      },
      enrollments: {
        include: {
          course: true
        }
      }
    }
  });

  if (!collaborator) {
    throw new AppError('Collaborator not found.', 404);
  }

  const activeCourses = await prisma.course.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { name: 'asc' }
  });

  const completedCourseIds = new Set(
    collaborator.enrollments.filter((enrollment) => enrollment.status === 'COMPLETED').map((enrollment) => enrollment.courseId)
  );
  const activeEnrollmentIds = new Set(
    collaborator.enrollments.filter((enrollment) => enrollment.status === 'ACTIVE').map((enrollment) => enrollment.courseId)
  );

  const candidateCourses = activeCourses.filter(
    (course) => !completedCourseIds.has(course.id) && !activeEnrollmentIds.has(course.id)
  );

  const activeEnrollmentCounts = await prisma.enrollment.groupBy({
    by: ['courseId'],
    where: { status: 'ACTIVE', courseId: { in: candidateCourses.map((course) => course.id) } },
    _count: { _all: true }
  });

  const courseActiveCounts = new Map(activeEnrollmentCounts.map((row) => [row.courseId, row._count._all]));
  const collaboratorActiveCount = collaborator.enrollments.filter((enrollment) => enrollment.status === 'ACTIVE').length;

  const interestTokens = toSet(tokenize(collaborator.interests));
  const areaTokens = toSet(tokenize(collaborator.area.name));
  const currentPositionTokens = toSet(tokenize(compactPositionText(collaborator.position)));
  const nextPositionTokens = collaborator.position.nextPosition
    ? toSet(tokenize(compactPositionText(collaborator.position.nextPosition)))
    : new Set<string>();

  return candidateCourses
    .map((course) => {
      const courseTokens = toSet(
        tokenize([
          course.name,
          course.category,
          course.provider,
          course.courseLevel,
          course.modality,
          course.minimumRequiredLevel
        ].join(' '))
      );

      const reasons: string[] = [];
      let score = 0;

      const interestMatches = countMatches(interestTokens, courseTokens);
      if (interestMatches > 0) {
        score += 30;
        reasons.push('Coincide con tus intereses');
      }

      const areaMatches = countMatches(areaTokens, courseTokens);
      if (areaMatches > 0) {
        score += 18;
        reasons.push('Está alineado con tu área');
      }

      const currentPositionMatches = countMatches(currentPositionTokens, courseTokens);
      if (currentPositionMatches > 0) {
        score += 20;
        reasons.push('Refuerza habilidades de tu puesto actual');
      }

      const nextPositionMatches = countMatches(nextPositionTokens, courseTokens);
      if (nextPositionMatches > 0) {
        score += 15;
        reasons.push('Aporta para tu próximo paso de carrera');
      }

      const currentLevel = collaborator.position.level;
      const courseLevel = course.minimumRequiredLevel;
      if (courseLevel === currentLevel) {
        score += 10;
        reasons.push('Tiene el nivel adecuado para tu perfil');
      } else if (levelValue(courseLevel) < levelValue(currentLevel)) {
        score += 5;
        reasons.push('Está dentro de tu rango de nivel');
      }

      const pointsScore = scoreByPoints(course.pointsAwarded);
      score += pointsScore;
      reasons.push(`Te otorga ${course.pointsAwarded} puntos de capacitación`);

      const blockingReasons = getEnrollmentPolicyBlockingReasons({
        collaborator,
        course,
        activeCollaboratorEnrollments: collaboratorActiveCount,
        activeCourseEnrollments: courseActiveCounts.get(course.id) ?? 0,
        hasActiveEnrollmentForCourse: false
      });

      return {
        course,
        score,
        eligible: blockingReasons.length === 0,
        reasons,
        blockingReasons,
        policyRestrictions: blockingReasons
      };
    })
    .sort((a, b) => {
      if (a.eligible !== b.eligible) return a.eligible ? -1 : 1;
      if (b.score !== a.score) return b.score - a.score;
      return a.course.name.localeCompare(b.course.name);
    });
}
