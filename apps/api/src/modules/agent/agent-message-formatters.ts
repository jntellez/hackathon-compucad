type EnrollmentWithCourse = {
  id: number;
  enrolledAt: Date;
  course: {
    name: string;
    category?: string | null;
    modality?: string | null;
    minimumRequiredLevel?: string | null;
  };
};

type RecommendationResult = {
  courseId?: number;
  course: {
    name: string;
    category?: string | null;
    modality?: string | null;
    minimumRequiredLevel?: string | null;
  };
  reasons: string[];
  eligible: boolean;
  blockingReasons: string[];
  policyRestrictions?: string[];
};

export const UNKNOWN_INTENT_MESSAGE =
  'Puedes preguntarme cosas como: "¿Qué cursos me recomiendas?", "¿A qué cursos estoy inscrito?" o "Inscríbeme al curso React fundamentos".';

function joinReasons(reasons: string[]) {
  return reasons.map((reason) => `- ${reason}`).join('\n');
}

export function formatRecommendationMessage(recommendations: RecommendationResult[]) {
  if (recommendations.length === 0) {
    return 'No encontré cursos recomendados por ahora. Si quieres, puedo mostrarte los cursos activos disponibles.';
  }

  const eligible = recommendations.filter((item) => item.eligible);
  const blocked = recommendations.filter((item) => !item.eligible);

  const actionablePreview = eligible.slice(0, 5).map((item, index) => {
    const details = [item.course.category, item.course.modality, item.course.minimumRequiredLevel]
      .filter(Boolean)
      .join(' · ');
    const reason = item.reasons[0] ?? 'Buena opción para tu perfil actual';
    return `${index + 1}. ${item.course.name}${details ? ` (${details})` : ''} — ${reason}.`;
  });

  const blockedPreview = blocked.slice(0, 5).map((item, index) => {
    const details = [item.course.category, item.course.modality, item.course.minimumRequiredLevel]
      .filter(Boolean)
      .join(' · ');
    const restrictions = item.policyRestrictions ?? item.blockingReasons;
    const reason = restrictions[0] ?? 'No cumple condiciones de política en este momento';
    return `${index + 1}. ${item.course.name}${details ? ` (${details})` : ''} — ${reason}.`;
  });

  const commonRestrictions = blocked.length > 0
    ? blocked
      .map((item) => new Set((item.policyRestrictions ?? item.blockingReasons).filter(Boolean)))
      .reduce<string[]>((common, restrictionSet, index) => {
      if (index === 0) return Array.from(restrictionSet);
      return common.filter((reason) => restrictionSet.has(reason));
    }, [])
    : [];

  if (eligible.length === 0) {
    const generalBlockMessage = commonRestrictions.length > 0
      ? `No, por ahora no puedes inscribirte a ningún curso porque hay restricciones de política:\n${joinReasons(commonRestrictions)}`
      : 'No, por ahora no puedes inscribirte a ningún curso porque todas las opciones relevantes están bloqueadas por restricciones de política.';

    const blockedSection = blockedPreview.length > 0
      ? `\n\nCursos recomendados bloqueados por restricciones de política:\n${blockedPreview.join('\n')}`
      : '';

    return `${generalBlockMessage}${blockedSection}`;
  }

  const actionableSection = `Encontré cursos recomendados para tu perfil:\n${actionablePreview.join('\n')}`;
  const blockedSection = blockedPreview.length > 0
    ? `\n\nCursos recomendados bloqueados por restricciones de política:\n${blockedPreview.join('\n')}`
    : '';

  return `${actionableSection}${blockedSection}\n\nSiguiente paso: escribe "Inscríbeme al curso <nombre del curso>" y validaré las restricciones de política antes de confirmar.`;
}

export function formatActiveEnrollmentsMessage(enrollments: EnrollmentWithCourse[]) {
  if (enrollments.length === 0) {
    return 'Estas son tus inscripciones activas: no tienes inscripciones activas en este momento.';
  }

  const preview = enrollments.slice(0, 5).map((item, index) => `${index + 1}. ${item.course.name}`).join('\n');
  const suffix = enrollments.length > 5 ? `\nY ${enrollments.length - 5} más.` : '';
  return `Estas son tus inscripciones activas:\n${preview}${suffix}`;
}

export function formatCompletedCoursesMessage(enrollments: EnrollmentWithCourse[]) {
  if (enrollments.length === 0) {
    return 'Estos son los cursos que ya completaste: todavía no has completado cursos.';
  }

  const preview = enrollments.slice(0, 5).map((item, index) => `${index + 1}. ${item.course.name}`).join('\n');
  const suffix = enrollments.length > 5 ? `\nY ${enrollments.length - 5} cursos completados más.` : '';
  return `Estos son los cursos que ya completaste:\n${preview}${suffix}`;
}
