# Hackathon Compucad

Initial monorepo scaffold for an individual hackathon project focused on an AI training agent for employees.

## Project overview

This repository provides a clean foundation for building the Compucad Training Agent. The current scope is intentionally limited to the project structure, developer tooling, backend and frontend setup, database container, and documentation.

## Tech stack

- Monorepo: pnpm workspaces
- Frontend: React + Vite + TypeScript + TailwindCSS
- Backend: Node.js + Express + TypeScript
- Database: PostgreSQL with Docker Compose
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
├─ docker-compose.yml
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

   If you do not use nvm, install a compatible runtime manually.

3. Copy the environment files for each app:

   ```bash
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env
   ```
4. Install dependencies:

   ```bash
   pnpm install
   ```

5. Start PostgreSQL:

   ```bash
   pnpm db:up
   ```

6. Generate the initial Prisma migration when the first data model is ready:

   ```bash
   pnpm db:migrate
   ```

7. Seed the database from the Excel import source:

   ```bash
   pnpm db:seed
   ```

8. Start both applications:

   ```bash
   pnpm dev
   ```

## Useful commands

```bash
pnpm dev          # Run web and api in parallel
pnpm dev:web      # Run frontend only
pnpm dev:api      # Run backend only
pnpm db:up        # Start PostgreSQL container
pnpm db:down      # Stop containers
pnpm db:migrate   # Run Prisma migrate dev
pnpm db:reset     # Reset the database and rerun seed
pnpm db:seed      # Import Excel data into PostgreSQL
pnpm db:studio    # Open Prisma Studio
pnpm build        # Build all workspace packages
pnpm typecheck    # Type-check all workspace packages
```

## Node version note

The scaffold is configured for modern supported runtimes (`>=20.19.0`). Prisma was upgraded to the current major version and now uses `prisma.config.ts`, so the setup no longer depends on the older Node 22-only workaround.

## Prisma note

Prisma Client uses the Prisma 7 PostgreSQL driver adapter in the API runtime. Root `db:*` commands use `scripts/prisma-cli.sh` so Prisma CLI commands run consistently against the Dockerized PostgreSQL setup.

## Available documentation

- `docs/architecture.md`
- `docs/endpoints.md`
- `docs/decisions.md`
