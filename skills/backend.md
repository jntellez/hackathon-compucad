# Backend skill guidance

## Scope

Use these rules when modifying `apps/api`.

## Stack

- Express
- TypeScript
- Prisma
- Zod

## Rules

- Keep controllers thin.
- Put business logic in services.
- Put database access in repositories.
- Use shared Prisma access from `src/shared/db`.
- Use Zod for request validation.
- Prefer shared validation helpers in `src/shared/validation`.
- Return clear API errors.
- Never expose stack traces in API responses.
- Do not let LLM output directly mutate the database.

## Expected structure

- `controller` receives HTTP input and returns HTTP output.
- `service` owns deterministic business rules.
- `repository` owns Prisma queries and persistence details.
- `shared` contains reusable infrastructure.

## Suggested modules

- agent
- courses
- collaborators
- enrollments
- recommendations
