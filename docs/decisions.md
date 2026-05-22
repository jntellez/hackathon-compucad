# Technical decisions

## Why Docker is used for PostgreSQL

Docker Compose gives the project a repeatable local database environment with minimal setup friction. Every contributor can run the same PostgreSQL version and connection settings without manually installing or configuring a database server.

## Why the project uses a monorepo

The monorepo keeps the frontend, backend, shared contracts, and documentation aligned in one place. For a hackathon, this reduces coordination overhead and makes it easier to evolve shared types and scripts without juggling multiple repositories.

## Why the backend will keep business rules deterministic

Critical validations should not depend on a probabilistic model. The LLM can support training interactions later, but the backend must remain the source of truth for business rules, workflows, and data integrity.
