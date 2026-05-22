import {
  CourseModality,
  CourseStatus,
  EmployeeStatus,
  EnrollmentStatus,
  Level,
  WorkMode
} from '@prisma/client';
import path from 'node:path';

import { readFile, utils } from 'xlsx';

import { prisma } from '../src/shared/db/prisma';

type Row = Record<string, unknown>;

const workbookPath = path.resolve(process.cwd(), '../../data/Datos_Hackathon_Compucad.xlsx');

function readSheet(sheetName: string) {
  const workbook = readFile(workbookPath, { raw: false });
  const sheet = workbook.Sheets[sheetName];

  if (!sheet) {
    throw new Error(`Sheet not found: ${sheetName}`);
  }

  const rows = utils.sheet_to_json<(string | number | null)[]>(sheet, {
    header: 1,
    defval: null,
    raw: false
  });

  const headerRowIndex = rows.findIndex(
    (row) => String(row[0] ?? '').trim().toLowerCase() === 'id'
  );

  if (headerRowIndex === -1) {
    throw new Error(`Could not find header row in sheet: ${sheetName}`);
  }

  const header = rows[headerRowIndex]?.map((cell) => String(cell ?? '').trim()) ?? [];

  return rows
    .slice(headerRowIndex + 1)
    .filter((row) => row.some((cell) => cell !== null && cell !== ''))
    .map((row) =>
      Object.fromEntries(header.map((column, index) => [column, row[index] ?? null]))
    ) as Row[];
}

function toInt(value: unknown) {
  const normalized = String(value ?? '')
    .trim()
    .replace(/[$,\s]/g, '');

  return Number.parseInt(normalized, 10);
}

function toOptionalInt(value: unknown) {
  const normalized = String(value ?? '').trim();

  return normalized ? Number.parseInt(normalized, 10) : null;
}

function toDate(value: unknown) {
  return new Date(`${String(value ?? '').trim()}T00:00:00.000Z`);
}

function toOptionalFloat(value: unknown) {
  const normalized = String(value ?? '')
    .trim()
    .replace(/[$,\s]/g, '');

  return normalized ? Math.round(Number.parseFloat(normalized) * 100) / 100 : null;
}

function toEmployeeStatus(value: unknown) {
  const normalized = String(value ?? '').trim();

  if (normalized === 'Activo') return EmployeeStatus.ACTIVE;
  if (normalized === 'Inactivo') return EmployeeStatus.INACTIVE;

  throw new Error(`Unsupported employee status: ${normalized}`);
}

function toEnrollmentStatus(value: unknown) {
  const normalized = String(value ?? '').trim();

  if (normalized === 'Activa') return EnrollmentStatus.ACTIVE;
  if (normalized === 'Cancelada') return EnrollmentStatus.CANCELLED;
  if (normalized === 'Completada') return EnrollmentStatus.COMPLETED;

  throw new Error(`Unsupported enrollment status: ${normalized}`);
}

function toLevel(value: unknown) {
  const normalized = String(value ?? '').trim();

  if (normalized === 'Junior') return Level.JUNIOR;
  if (normalized === 'Mid') return Level.MID;
  if (normalized === 'Senior') return Level.SENIOR;

  throw new Error(`Unsupported level: ${normalized}`);
}

function toWorkMode(value: unknown) {
  const normalized = String(value ?? '').trim();

  if (normalized === 'Híbrido') return WorkMode.HYBRID;
  if (normalized === 'Presencial') return WorkMode.ONSITE;
  if (normalized === 'Remoto') return WorkMode.REMOTE;

  throw new Error(`Unsupported work mode: ${normalized}`);
}

function toCourseStatus(value: unknown) {
  const normalized = String(value ?? '').trim();

  if (normalized === 'Activo') return CourseStatus.ACTIVE;
  if (normalized === 'Archivado') return CourseStatus.ARCHIVED;

  throw new Error(`Unsupported course status: ${normalized}`);
}

function toCourseModality(value: unknown) {
  const normalized = String(value ?? '').trim();

  if (normalized === 'Híbrido') return CourseModality.HYBRID;
  if (normalized === 'Online') return CourseModality.ONLINE;
  if (normalized === 'Presencial') return CourseModality.ONSITE;

  throw new Error(`Unsupported course modality: ${normalized}`);
}

async function syncSequence(tableName: string) {
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('"${tableName}"', 'id'), COALESCE(MAX(id), 1), true) FROM "${tableName}";`
  );
}

async function main() {
  const areas = readSheet('Áreas').map((row) => ({
    id: toInt(row.id),
    name: String(row.nombre ?? '').trim()
  }));

  const positions = readSheet('Puestos').map((row) => ({
    id: toInt(row.id),
    name: String(row.nombre ?? '').trim(),
    level: toLevel(row.nivel),
    areaId: toInt(row.area_id),
    description: String(row.descripcion ?? '').trim(),
    responsibilities: String(row.responsabilidades ?? '').trim(),
    tools: String(row.herramientas ?? '').trim(),
    keySkills: String(row.competencias_clave ?? '').trim(),
    nextPositionId: toOptionalInt(row.ruta_siguiente_id)
  }));

  const collaborators = readSheet('Colaboradores').map((row) => ({
    id: toInt(row.id),
    name: String(row.nombre ?? '').trim(),
    email: String(row.email ?? '').trim().toLowerCase(),
    positionId: toInt(row.puesto_id),
    areaId: toInt(row.area_id),
    hireDate: toDate(row.fecha_ingreso),
    status: toEmployeeStatus(row.estatus),
    score: toInt(row.puntaje),
    yearsExperience: toInt(row.anios_experiencia),
    englishLevel: String(row.idioma_ingles ?? '').trim(),
    city: String(row.ciudad ?? '').trim(),
    workMode: toWorkMode(row.modalidad_trabajo),
    interests: String(row.intereses ?? '').trim()
  }));

  const courses = readSheet('Cursos').map((row) => ({
    id: toInt(row.id),
    name: String(row.nombre ?? '').trim(),
    category: String(row.categoria ?? '').trim(),
    provider: String(row.proveedor ?? '').trim(),
    modality: toCourseModality(row.modalidad),
    courseLevel: String(row.nivel_curso ?? '').trim(),
    durationHours: toInt(row.duracion_horas),
    maxCapacity: toInt(row.cupo_max),
    status: toCourseStatus(row.estatus),
    minimumRequiredLevel: toLevel(row.nivel_minimo_requerido),
    cost: toInt(row.costo),
    pointsAwarded: toInt(row.puntos_otorgados)
  }));

  const enrollments = readSheet('Inscripciones').map((row) => ({
    id: toInt(row.id),
    collaboratorId: toInt(row.colaborador_id),
    courseId: toInt(row.curso_id),
    enrolledAt: toDate(row.fecha_inscripcion),
    status: toEnrollmentStatus(row.estatus),
    grade: toOptionalFloat(row.calificacion)
  }));

  await prisma.$transaction([
    prisma.agentInteraction.deleteMany(),
    prisma.enrollment.deleteMany(),
    prisma.collaborator.deleteMany(),
    prisma.position.deleteMany(),
    prisma.course.deleteMany(),
    prisma.area.deleteMany()
  ]);

  await prisma.area.createMany({ data: areas });

  await prisma.position.createMany({
    data: positions.map(({ nextPositionId: _nextPositionId, ...position }) => position)
  });

  await prisma.$transaction(
    positions
      .filter((position) => position.nextPositionId !== null)
      .map((position) =>
        prisma.position.update({
          where: { id: position.id },
          data: { nextPositionId: position.nextPositionId }
        })
      )
  );

  await prisma.course.createMany({ data: courses });
  await prisma.collaborator.createMany({ data: collaborators });
  await prisma.enrollment.createMany({ data: enrollments });

  await Promise.all([
    syncSequence('areas'),
    syncSequence('positions'),
    syncSequence('courses'),
    syncSequence('collaborators'),
    syncSequence('enrollments')
  ]);

  console.log(
    `Seeded ${areas.length} areas, ${positions.length} positions, ${collaborators.length} collaborators, ${courses.length} courses, and ${enrollments.length} enrollments.`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
