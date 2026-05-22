# Hackathon Compucad

Initial monorepo scaffold for an individual hackathon project focused on an AI training agent for employees.

## Project overview

This repository provides a clean foundation for building the Compucad Training Agent. The current scope is intentionally limited to the project structure, developer tooling, backend and frontend setup, local SQLite database, and documentation.

## Tech stack

- Monorepo: pnpm workspaces
- Frontend: React + Vite + TypeScript + TailwindCSS
- Backend: Node.js + Express + TypeScript
- Database: SQLite (local file, no Docker required)
- ORM: Prisma
- Shared package: TypeScript
- Documentation: Markdown + Mermaid

## Project structure

```text
hackathon-compucad/
├─ apps/
│  ├─ api/
│  └─ web/
├─ packages/
│  └─ shared/
├─ docs/
├─ scripts/
├─ pnpm-workspace.yaml
├─ package.json
└─ README.md
```

## Local setup

1. Install pnpm if it is not available yet.
2. Use Node.js 20.19+ or 22+ for this project:

   ```bash
   nvm use
   ```

   If you do not use nvm, install a compatible version manually.

3. Copy the environment files for each app:

   ```bash
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env
   ```

   Then set your OpenRouter API key in `apps/api/.env`:

   ```bash
   OPENROUTER_API_KEY="<your-openrouter-key>"
   # Optional override (default is a free model)
   OPENROUTER_MODEL="mistralai/mistral-7b-instruct:free"
   ```
4. Install dependencies:

   ```bash
   pnpm install
   ```

5. Create and seed the local SQLite database:

   ```bash
   pnpm db:reset
   ```

6. Start both applications:

   ```bash
   pnpm dev
   ```

## Useful commands

```bash
pnpm dev          # Run web and api in parallel
pnpm dev:web      # Run frontend only
pnpm dev:api      # Run backend only
pnpm db:migrate   # Run Prisma migrate dev
pnpm db:reset     # Reset the database and rerun seed
pnpm db:seed      # Import Excel data into SQLite
pnpm db:studio    # Open Prisma Studio
pnpm build        # Build all workspace packages
pnpm typecheck    # Type-check all workspace packages
```

## Node version note

The scaffold is configured for modern supported runtimes (`>=20.19.0`).

## Database note

The project uses SQLite for local development and demos. This eliminates Docker dependencies and makes the setup more reliable for hackathon presentations. The Prisma schema and seed script are designed to be portable if a production database is needed later.

`docker-compose.yml` may remain in the repository as a legacy artifact, but it is not required for local development, demo flows, or runtime execution.

## Available documentation

- `docs/architecture.md`
- `docs/endpoints.md`
- `docs/decisions.md`
