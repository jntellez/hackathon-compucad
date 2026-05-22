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
  Prisma --> Postgres[PostgreSQL in Docker]
```

## Notes

- The Agent Service and OpenRouter integration are intentionally deferred.
- Business validations should remain deterministic in the backend.
- Prisma is prepared with a PostgreSQL datasource, but the domain schema is not defined yet.
