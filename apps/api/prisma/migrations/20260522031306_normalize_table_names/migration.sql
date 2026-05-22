/*
  Warnings:

  - You are about to drop the `AgentInteraction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Area` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Collaborator` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Course` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Enrollment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Position` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AgentInteraction" DROP CONSTRAINT "AgentInteraction_collaboratorId_fkey";

-- DropForeignKey
ALTER TABLE "Collaborator" DROP CONSTRAINT "Collaborator_areaId_fkey";

-- DropForeignKey
ALTER TABLE "Collaborator" DROP CONSTRAINT "Collaborator_positionId_fkey";

-- DropForeignKey
ALTER TABLE "Enrollment" DROP CONSTRAINT "Enrollment_collaboratorId_fkey";

-- DropForeignKey
ALTER TABLE "Enrollment" DROP CONSTRAINT "Enrollment_courseId_fkey";

-- DropForeignKey
ALTER TABLE "Position" DROP CONSTRAINT "Position_areaId_fkey";

-- DropForeignKey
ALTER TABLE "Position" DROP CONSTRAINT "Position_nextPositionId_fkey";

-- DropTable
DROP TABLE "AgentInteraction";

-- DropTable
DROP TABLE "Area";

-- DropTable
DROP TABLE "Collaborator";

-- DropTable
DROP TABLE "Course";

-- DropTable
DROP TABLE "Enrollment";

-- DropTable
DROP TABLE "Position";

-- CreateTable
CREATE TABLE "areas" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "areas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "positions" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "level" "Level" NOT NULL,
    "areaId" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "responsibilities" TEXT NOT NULL,
    "tools" TEXT NOT NULL,
    "keySkills" TEXT NOT NULL,
    "nextPositionId" INTEGER,

    CONSTRAINT "positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collaborators" (
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

    CONSTRAINT "collaborators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
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

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enrollments" (
    "id" SERIAL NOT NULL,
    "collaboratorId" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,
    "enrolledAt" DATE NOT NULL,
    "status" "EnrollmentStatus" NOT NULL,
    "grade" DOUBLE PRECISION,

    CONSTRAINT "enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_interactions" (
    "id" TEXT NOT NULL,
    "collaboratorId" INTEGER,
    "userMessage" TEXT NOT NULL,
    "detectedIntent" TEXT,
    "assistantResponse" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_interactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "areas_name_key" ON "areas"("name");

-- CreateIndex
CREATE INDEX "positions_areaId_idx" ON "positions"("areaId");

-- CreateIndex
CREATE UNIQUE INDEX "collaborators_email_key" ON "collaborators"("email");

-- CreateIndex
CREATE INDEX "collaborators_status_idx" ON "collaborators"("status");

-- CreateIndex
CREATE INDEX "collaborators_positionId_idx" ON "collaborators"("positionId");

-- CreateIndex
CREATE INDEX "collaborators_areaId_idx" ON "collaborators"("areaId");

-- CreateIndex
CREATE INDEX "courses_status_idx" ON "courses"("status");

-- CreateIndex
CREATE INDEX "enrollments_collaboratorId_idx" ON "enrollments"("collaboratorId");

-- CreateIndex
CREATE INDEX "enrollments_courseId_idx" ON "enrollments"("courseId");

-- CreateIndex
CREATE INDEX "enrollments_status_idx" ON "enrollments"("status");

-- CreateIndex
CREATE INDEX "agent_interactions_collaboratorId_idx" ON "agent_interactions"("collaboratorId");

-- CreateIndex
CREATE INDEX "agent_interactions_createdAt_idx" ON "agent_interactions"("createdAt");

-- AddForeignKey
ALTER TABLE "positions" ADD CONSTRAINT "positions_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "areas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "positions" ADD CONSTRAINT "positions_nextPositionId_fkey" FOREIGN KEY ("nextPositionId") REFERENCES "positions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collaborators" ADD CONSTRAINT "collaborators_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "positions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collaborators" ADD CONSTRAINT "collaborators_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "areas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_collaboratorId_fkey" FOREIGN KEY ("collaboratorId") REFERENCES "collaborators"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_interactions" ADD CONSTRAINT "agent_interactions_collaboratorId_fkey" FOREIGN KEY ("collaboratorId") REFERENCES "collaborators"("id") ON DELETE SET NULL ON UPDATE CASCADE;
