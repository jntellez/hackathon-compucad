# Hackathon Compucad Agent Guidance

## 1. Project overview

Hackathon Compucad is an individual project for an AI-assisted employee training platform. The product goal is to help collaborators consult available courses, enroll, cancel enrollments, review active or completed courses, and receive personalized recommendations while respecting internal training policies.

## 2. Tech stack

- Monorepo with pnpm workspaces
- Frontend: React + Vite + TypeScript + TailwindCSS
- Backend: Node.js + Express + TypeScript
- Database: SQLite (runtime local file, Docker not required)
- ORM: Prisma
- LLM provider: OpenRouter
- Documentation: Markdown + Mermaid

## 3. Development principles

- Keep the implementation simple, explicit, and easy to review.
- Prefer working end-to-end flows over speculative abstractions.
- Add only the minimum structure needed for the next milestone.
- Keep code and docs in English.
- Do not change app logic, dependencies, schema, or routes unless the task requires it.

## 4. Architecture rules

- Follow this backend flow:

  User message
  → Agent Service
  → Intent classification
  → Business service
  → Policy validation
  → Prisma repository
  → SQLite
  → User-facing response

- Use this application layering:

  Controller → Service → Repository → Database

- The LLM may interpret user intent, but all critical business validations must be deterministic in backend services.
- The LLM must not directly modify the database.

## 5. Backend code organization

Suggested backend modules:

- agent
- courses
- collaborators
- enrollments
- recommendations

Shared backend utilities belong under:

- `src/shared/db`
- `src/shared/http`
- `src/shared/errors`
- `src/shared/validation`

## 6. Business rule policy

Before creating an enrollment, validate all of the following deterministically:

1. Collaborator status must be `Active`.
2. Collaborator must have at least 1 month of seniority.
3. Course status must be `Active`.
4. Collaborator level must be greater than or equal to the course minimum required level.
5. Collaborator cannot have more than 3 active enrollments.
6. Course must have available capacity.

These checks belong in backend services and policy validation logic, never in prompt-only behavior.

## 7. Documentation rules

- Keep documentation concise, practical, and specific to this project.
- Update `docs/endpoints.md` when routes change.
- Update `docs/arquitectura.md` when system structure changes.
- Reflect important technical decisions in `docs/arquitectura.md` or `README.md` when relevant.
- Prefer diagrams and short explanation tables over long prose.

## 8. Current project priority

Do not implement the AI agent yet unless explicitly requested.

Current milestone order:

1. Prisma schema
2. Database migration
3. Seed from provided Excel data
4. CRUD endpoints
5. Deterministic enrollment policy service
6. OpenRouter integration
