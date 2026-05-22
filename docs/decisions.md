# Technical decisions

## Why SQLite is used for local development

SQLite eliminates Docker and PostgreSQL setup friction for local development and hackathon demos. The database lives in a single file (`apps/api/prisma/dev.db`), making the project instantly runnable with `pnpm install && pnpm db:reset`. The Prisma schema and seed script remain portable if a production PostgreSQL instance is needed later.

## Why Docker was removed

Docker Compose added unnecessary complexity for a local hackathon demo. PostgreSQL container setup caused authentication and volume persistence issues that slowed development. SQLite provides the same Prisma interface with zero infrastructure overhead.

## Why the project uses a monorepo

The monorepo keeps the frontend, backend, shared contracts, and documentation aligned in one place. For a hackathon, this reduces coordination overhead and makes it easier to evolve shared types and scripts without juggling multiple repositories.

## Why the backend will keep business rules deterministic

Critical validations should not depend on a probabilistic model. The LLM can support training interactions later, but the backend must remain the source of truth for business rules, workflows, and data integrity.

## Why Excel is only an import source

The Excel workbook is used only to bootstrap the initial domain data during the Prisma seed process. Keeping Excel out of the runtime path avoids fragile file dependencies in the application and makes the database model explicit and testable.

## Why SQLite is the runtime source of truth

All runtime reads and writes currently go through SQLite via Prisma. This keeps collaborator, course, and enrollment data consistent across the API, future agent flows, and reporting logic without depending on a spreadsheet after setup.
