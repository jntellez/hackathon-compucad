# Architecture

## Overview

The project is organized as a monorepo with separate applications for the web client and the API, plus a shared package for common contracts.

## Mermaid diagram

```mermaid
flowchart LR
  User[User] --> Web[React Frontend]
  Web --> API[Express API]
  API --> Agent[Agent Service]
  Agent --> OpenRouter[OpenRouter]
  API --> Services[Business Services]
  Services --> Prisma[Prisma]
  Prisma --> SQLite[SQLite file:./dev.db]
```

## Notes

- The Agent Service and OpenRouter integration are intentionally deferred.
- Business validations remain deterministic in the backend.
- SQLite is used for local development and demos. The Prisma schema is portable to PostgreSQL if needed for production.
