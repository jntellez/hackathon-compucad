/*
  Warnings:

  - You are about to drop the column `assistantResponse` on the `agent_interactions` table. All the data in the column will be lost.
  - You are about to drop the column `collaboratorId` on the `agent_interactions` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `agent_interactions` table. All the data in the column will be lost.
  - You are about to drop the column `detectedIntent` on the `agent_interactions` table. All the data in the column will be lost.
  - You are about to drop the column `userMessage` on the `agent_interactions` table. All the data in the column will be lost.
  - You are about to drop the column `areaId` on the `collaborators` table. All the data in the column will be lost.
  - You are about to drop the column `englishLevel` on the `collaborators` table. All the data in the column will be lost.
  - You are about to drop the column `hireDate` on the `collaborators` table. All the data in the column will be lost.
  - You are about to drop the column `positionId` on the `collaborators` table. All the data in the column will be lost.
  - You are about to drop the column `workMode` on the `collaborators` table. All the data in the column will be lost.
  - You are about to drop the column `yearsExperience` on the `collaborators` table. All the data in the column will be lost.
  - You are about to drop the column `courseLevel` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the column `durationHours` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the column `maxCapacity` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the column `minimumRequiredLevel` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the column `pointsAwarded` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the column `collaboratorId` on the `enrollments` table. All the data in the column will be lost.
  - You are about to drop the column `courseId` on the `enrollments` table. All the data in the column will be lost.
  - You are about to drop the column `enrolledAt` on the `enrollments` table. All the data in the column will be lost.
  - You are about to drop the column `areaId` on the `positions` table. All the data in the column will be lost.
  - You are about to drop the column `keySkills` on the `positions` table. All the data in the column will be lost.
  - You are about to drop the column `nextPositionId` on the `positions` table. All the data in the column will be lost.
  - Added the required column `user_message` to the `agent_interactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `area_id` to the `collaborators` table without a default value. This is not possible if the table is not empty.
  - Added the required column `english_level` to the `collaborators` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hire_date` to the `collaborators` table without a default value. This is not possible if the table is not empty.
  - Added the required column `position_id` to the `collaborators` table without a default value. This is not possible if the table is not empty.
  - Added the required column `work_mode` to the `collaborators` table without a default value. This is not possible if the table is not empty.
  - Added the required column `years_experience` to the `collaborators` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `status` on the `collaborators` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `course_level` to the `courses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `duration_hours` to the `courses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `max_capacity` to the `courses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `minimum_required_level` to the `courses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `points_awarded` to the `courses` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `modality` on the `courses` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `courses` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `collaborator_id` to the `enrollments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `course_id` to the `enrollments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `enrolled_at` to the `enrollments` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `status` on the `enrollments` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `area_id` to the `positions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `key_skills` to the `positions` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `level` on the `positions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "employee_status" AS ENUM ('Activo', 'Inactivo');

-- CreateEnum
CREATE TYPE "enrollment_status" AS ENUM ('Activa', 'Cancelada', 'Completada');

-- CreateEnum
CREATE TYPE "level" AS ENUM ('Junior', 'Mid', 'Senior');

-- CreateEnum
CREATE TYPE "work_mode" AS ENUM ('Híbrido', 'Presencial', 'Remoto');

-- CreateEnum
CREATE TYPE "course_status" AS ENUM ('Activo', 'Archivado');

-- CreateEnum
CREATE TYPE "course_modality" AS ENUM ('Híbrido', 'Online', 'Presencial');

-- DropForeignKey
ALTER TABLE "agent_interactions" DROP CONSTRAINT "agent_interactions_collaboratorId_fkey";

-- DropForeignKey
ALTER TABLE "collaborators" DROP CONSTRAINT "collaborators_areaId_fkey";

-- DropForeignKey
ALTER TABLE "collaborators" DROP CONSTRAINT "collaborators_positionId_fkey";

-- DropForeignKey
ALTER TABLE "enrollments" DROP CONSTRAINT "enrollments_collaboratorId_fkey";

-- DropForeignKey
ALTER TABLE "enrollments" DROP CONSTRAINT "enrollments_courseId_fkey";

-- DropForeignKey
ALTER TABLE "positions" DROP CONSTRAINT "positions_areaId_fkey";

-- DropForeignKey
ALTER TABLE "positions" DROP CONSTRAINT "positions_nextPositionId_fkey";

-- DropIndex
DROP INDEX "agent_interactions_collaboratorId_idx";

-- DropIndex
DROP INDEX "agent_interactions_createdAt_idx";

-- DropIndex
DROP INDEX "collaborators_areaId_idx";

-- DropIndex
DROP INDEX "collaborators_positionId_idx";

-- DropIndex
DROP INDEX "enrollments_collaboratorId_idx";

-- DropIndex
DROP INDEX "enrollments_courseId_idx";

-- DropIndex
DROP INDEX "positions_areaId_idx";

-- AlterTable
ALTER TABLE "agent_interactions" DROP COLUMN "assistantResponse",
DROP COLUMN "collaboratorId",
DROP COLUMN "createdAt",
DROP COLUMN "detectedIntent",
DROP COLUMN "userMessage",
ADD COLUMN     "assistant_response" TEXT,
ADD COLUMN     "collaborator_id" INTEGER,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "detected_intent" TEXT,
ADD COLUMN     "user_message" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "collaborators" DROP COLUMN "areaId",
DROP COLUMN "englishLevel",
DROP COLUMN "hireDate",
DROP COLUMN "positionId",
DROP COLUMN "workMode",
DROP COLUMN "yearsExperience",
ADD COLUMN     "area_id" INTEGER NOT NULL,
ADD COLUMN     "english_level" TEXT NOT NULL,
ADD COLUMN     "hire_date" DATE NOT NULL,
ADD COLUMN     "position_id" INTEGER NOT NULL,
ADD COLUMN     "work_mode" "work_mode" NOT NULL,
ADD COLUMN     "years_experience" INTEGER NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "employee_status" NOT NULL;

-- AlterTable
ALTER TABLE "courses" DROP COLUMN "courseLevel",
DROP COLUMN "durationHours",
DROP COLUMN "maxCapacity",
DROP COLUMN "minimumRequiredLevel",
DROP COLUMN "pointsAwarded",
ADD COLUMN     "course_level" TEXT NOT NULL,
ADD COLUMN     "duration_hours" INTEGER NOT NULL,
ADD COLUMN     "max_capacity" INTEGER NOT NULL,
ADD COLUMN     "minimum_required_level" "level" NOT NULL,
ADD COLUMN     "points_awarded" INTEGER NOT NULL,
DROP COLUMN "modality",
ADD COLUMN     "modality" "course_modality" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "course_status" NOT NULL;

-- AlterTable
ALTER TABLE "enrollments" DROP COLUMN "collaboratorId",
DROP COLUMN "courseId",
DROP COLUMN "enrolledAt",
ADD COLUMN     "collaborator_id" INTEGER NOT NULL,
ADD COLUMN     "course_id" INTEGER NOT NULL,
ADD COLUMN     "enrolled_at" DATE NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "enrollment_status" NOT NULL;

-- AlterTable
ALTER TABLE "positions" DROP COLUMN "areaId",
DROP COLUMN "keySkills",
DROP COLUMN "nextPositionId",
ADD COLUMN     "area_id" INTEGER NOT NULL,
ADD COLUMN     "key_skills" TEXT NOT NULL,
ADD COLUMN     "next_position_id" INTEGER,
DROP COLUMN "level",
ADD COLUMN     "level" "level" NOT NULL;

-- DropEnum
DROP TYPE "CourseModality";

-- DropEnum
DROP TYPE "CourseStatus";

-- DropEnum
DROP TYPE "EmployeeStatus";

-- DropEnum
DROP TYPE "EnrollmentStatus";

-- DropEnum
DROP TYPE "Level";

-- DropEnum
DROP TYPE "WorkMode";

-- CreateIndex
CREATE INDEX "agent_interactions_collaborator_id_idx" ON "agent_interactions"("collaborator_id");

-- CreateIndex
CREATE INDEX "agent_interactions_created_at_idx" ON "agent_interactions"("created_at");

-- CreateIndex
CREATE INDEX "collaborators_status_idx" ON "collaborators"("status");

-- CreateIndex
CREATE INDEX "collaborators_position_id_idx" ON "collaborators"("position_id");

-- CreateIndex
CREATE INDEX "collaborators_area_id_idx" ON "collaborators"("area_id");

-- CreateIndex
CREATE INDEX "courses_status_idx" ON "courses"("status");

-- CreateIndex
CREATE INDEX "enrollments_collaborator_id_idx" ON "enrollments"("collaborator_id");

-- CreateIndex
CREATE INDEX "enrollments_course_id_idx" ON "enrollments"("course_id");

-- CreateIndex
CREATE INDEX "enrollments_status_idx" ON "enrollments"("status");

-- CreateIndex
CREATE INDEX "positions_area_id_idx" ON "positions"("area_id");

-- AddForeignKey
ALTER TABLE "positions" ADD CONSTRAINT "positions_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "areas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "positions" ADD CONSTRAINT "positions_next_position_id_fkey" FOREIGN KEY ("next_position_id") REFERENCES "positions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collaborators" ADD CONSTRAINT "collaborators_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "positions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collaborators" ADD CONSTRAINT "collaborators_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "areas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_collaborator_id_fkey" FOREIGN KEY ("collaborator_id") REFERENCES "collaborators"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_interactions" ADD CONSTRAINT "agent_interactions_collaborator_id_fkey" FOREIGN KEY ("collaborator_id") REFERENCES "collaborators"("id") ON DELETE SET NULL ON UPDATE CASCADE;
