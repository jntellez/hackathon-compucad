# Decisiones técnicas

## 1) SQLite para desarrollo y demo

Se usa SQLite para eliminar fricción de infraestructura (sin Docker obligatorio) y poder levantar el proyecto rápido con `pnpm install && pnpm db:reset`. La base vive en `apps/api/prisma/dev.db`.

## 2) Monorepo con pnpm workspaces

Frontend, backend, contratos compartidos y docs conviven en un solo repositorio. Esto simplifica coordinación y acelera iteración para hackathon.

## 3) Reglas críticas determinísticas en backend

El modelo puede interpretar intención, pero la integridad de negocio no depende de una salida probabilística. Todas las validaciones de inscripción se ejecutan en servicios backend.

## 4) Excel solo como fuente de carga inicial

El Excel se usa en el seed. En runtime, toda lectura/escritura pasa por Prisma + SQLite.

## 5) OpenRouter solo en servidor

La `OPENROUTER_API_KEY` se mantiene fuera del frontend. El backend encapsula la llamada al modelo y aplica controles antes de ejecutar acciones.
