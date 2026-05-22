# Prisma skill guidance

## Scope

Use these rules when modifying the Prisma schema, migrations, or seed scripts.

## Stack

- PostgreSQL
- Prisma ORM

## Rules

- Model real persistence in PostgreSQL.
- Use explicit relations.
- Add indexes for frequent lookups.
- Keep enum values aligned with source data.
- Import or seed Excel data into PostgreSQL.
- Do not read from Excel files at runtime.
- Keep migrations clear and incremental.

## Core models to plan for

- Area
- Position
- Collaborator
- Course
- Enrollment
- AgentInteraction

## Data policy

The database is the source of truth. Excel is only an import source for migration or seed workflows.
