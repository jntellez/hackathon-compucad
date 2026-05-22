-- CreateEnum
CREATE TYPE "EmployeeStatus" AS ENUM ('Activo', 'Inactivo');

-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('Activa', 'Cancelada', 'Completada');

-- CreateEnum
CREATE TYPE "Level" AS ENUM ('Junior', 'Mid', 'Senior');

-- CreateEnum
CREATE TYPE "WorkMode" AS ENUM ('Híbrido', 'Presencial', 'Remoto');

-- CreateEnum
CREATE TYPE "CourseStatus" AS ENUM ('Activo', 'Archivado');

-- CreateEnum
CREATE TYPE "CourseModality" AS ENUM ('Híbrido', 'Online', 'Presencial');

-- CreateTable
CREATE TABLE "Area" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Area_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Position" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "level" "Level" NOT NULL,
    "areaId" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "responsibilities" TEXT NOT NULL,
    "tools" TEXT NOT NULL,
    "keySkills" TEXT NOT NULL,
    "nextPositionId" INTEGER,

    CONSTRAINT "Position_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Collaborator" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "positionId" INTEGER NOT NULL,
    "areaId" INTEGER NOT NULL,
    "hireDate" DATE NOT NULL,
    "status" "EmployeeStatus" NOT NULL,
    "score" INTEGER NOT NULL,
    "yearsExperience" INTEGER NOT NULL,
    "englishLevel" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "workMode" "WorkMode" NOT NULL,
    "interests" TEXT NOT NULL,

    CONSTRAINT "Collaborator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "modality" "CourseModality" NOT NULL,
    "courseLevel" TEXT NOT NULL,
    "durationHours" INTEGER NOT NULL,
    "maxCapacity" INTEGER NOT NULL,
    "status" "CourseStatus" NOT NULL,
    "minimumRequiredLevel" "Level" NOT NULL,
    "cost" INTEGER NOT NULL,
    "pointsAwarded" INTEGER NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Enrollment" (
    "id" SERIAL NOT NULL,
    "collaboratorId" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,
    "enrolledAt" DATE NOT NULL,
    "status" "EnrollmentStatus" NOT NULL,
    "grade" DOUBLE PRECISION,

    CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentInteraction" (
    "id" TEXT NOT NULL,
    "collaboratorId" INTEGER,
    "userMessage" TEXT NOT NULL,
    "detectedIntent" TEXT,
    "assistantResponse" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Area_name_key" ON "Area"("name");

-- CreateIndex
CREATE INDEX "Position_areaId_idx" ON "Position"("areaId");

-- CreateIndex
CREATE UNIQUE INDEX "Collaborator_email_key" ON "Collaborator"("email");

-- CreateIndex
CREATE INDEX "Collaborator_status_idx" ON "Collaborator"("status");

-- CreateIndex
CREATE INDEX "Collaborator_positionId_idx" ON "Collaborator"("positionId");

-- CreateIndex
CREATE INDEX "Collaborator_areaId_idx" ON "Collaborator"("areaId");

-- CreateIndex
CREATE INDEX "Course_status_idx" ON "Course"("status");

-- CreateIndex
CREATE INDEX "Enrollment_collaboratorId_idx" ON "Enrollment"("collaboratorId");

-- CreateIndex
CREATE INDEX "Enrollment_courseId_idx" ON "Enrollment"("courseId");

-- CreateIndex
CREATE INDEX "Enrollment_status_idx" ON "Enrollment"("status");

-- CreateIndex
CREATE INDEX "AgentInteraction_collaboratorId_idx" ON "AgentInteraction"("collaboratorId");

-- CreateIndex
CREATE INDEX "AgentInteraction_createdAt_idx" ON "AgentInteraction"("createdAt");

-- AddForeignKey
ALTER TABLE "Position" ADD CONSTRAINT "Position_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Position" ADD CONSTRAINT "Position_nextPositionId_fkey" FOREIGN KEY ("nextPositionId") REFERENCES "Position"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collaborator" ADD CONSTRAINT "Collaborator_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collaborator" ADD CONSTRAINT "Collaborator_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_collaboratorId_fkey" FOREIGN KEY ("collaboratorId") REFERENCES "Collaborator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentInteraction" ADD CONSTRAINT "AgentInteraction_collaboratorId_fkey" FOREIGN KEY ("collaboratorId") REFERENCES "Collaborator"("id") ON DELETE SET NULL ON UPDATE CASCADE;
