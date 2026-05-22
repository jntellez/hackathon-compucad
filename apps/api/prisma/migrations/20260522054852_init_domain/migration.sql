-- CreateTable
CREATE TABLE "areas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "positions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "area_id" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "responsibilities" TEXT NOT NULL,
    "tools" TEXT NOT NULL,
    "key_skills" TEXT NOT NULL,
    "next_position_id" INTEGER,
    CONSTRAINT "positions_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "areas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "positions_next_position_id_fkey" FOREIGN KEY ("next_position_id") REFERENCES "positions" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "collaborators" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "position_id" INTEGER NOT NULL,
    "area_id" INTEGER NOT NULL,
    "hire_date" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "years_experience" INTEGER NOT NULL,
    "english_level" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "work_mode" TEXT NOT NULL,
    "interests" TEXT NOT NULL,
    CONSTRAINT "collaborators_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "positions" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "collaborators_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "areas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "courses" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "modality" TEXT NOT NULL,
    "course_level" TEXT NOT NULL,
    "duration_hours" INTEGER NOT NULL,
    "max_capacity" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "minimum_required_level" TEXT NOT NULL,
    "cost" INTEGER NOT NULL,
    "points_awarded" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "enrollments" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "collaborator_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "enrolled_at" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    "grade" REAL,
    CONSTRAINT "enrollments_collaborator_id_fkey" FOREIGN KEY ("collaborator_id") REFERENCES "collaborators" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "enrollments_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "agent_interactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "collaborator_id" INTEGER,
    "user_message" TEXT NOT NULL,
    "detected_intent" TEXT,
    "assistant_response" TEXT,
    "metadata" JSONB,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "agent_interactions_collaborator_id_fkey" FOREIGN KEY ("collaborator_id") REFERENCES "collaborators" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "areas_name_key" ON "areas"("name");

-- CreateIndex
CREATE INDEX "positions_area_id_idx" ON "positions"("area_id");

-- CreateIndex
CREATE UNIQUE INDEX "collaborators_email_key" ON "collaborators"("email");

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
CREATE INDEX "agent_interactions_collaborator_id_idx" ON "agent_interactions"("collaborator_id");

-- CreateIndex
CREATE INDEX "agent_interactions_created_at_idx" ON "agent_interactions"("created_at");
