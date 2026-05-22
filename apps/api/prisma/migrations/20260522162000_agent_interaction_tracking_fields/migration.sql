-- RedefineTable
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_agent_interactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "collaborator_id" INTEGER,
    "user_message" TEXT NOT NULL,
    "detected_intent" TEXT,
    "model" TEXT,
    "prompt_tokens" INTEGER NOT NULL DEFAULT 0,
    "completion_tokens" INTEGER NOT NULL DEFAULT 0,
    "total_tokens" INTEGER NOT NULL DEFAULT 0,
    "assistant_response" TEXT,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "error_message" TEXT,
    "metadata" JSONB,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "agent_interactions_collaborator_id_fkey" FOREIGN KEY ("collaborator_id") REFERENCES "collaborators" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_agent_interactions" ("assistant_response", "collaborator_id", "created_at", "detected_intent", "id", "metadata", "user_message")
SELECT "assistant_response", "collaborator_id", "created_at", "detected_intent", "id", "metadata", "user_message" FROM "agent_interactions";
DROP TABLE "agent_interactions";
ALTER TABLE "new_agent_interactions" RENAME TO "agent_interactions";
CREATE INDEX "agent_interactions_collaborator_id_idx" ON "agent_interactions"("collaborator_id");
CREATE INDEX "agent_interactions_created_at_idx" ON "agent_interactions"("created_at");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
