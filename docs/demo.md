# Guía corta de demo (Hackathon)

## Objetivo de la demo

Mostrar de punta a punta: consulta de cursos, recomendación, inscripción y uso del chat IA con control determinístico.

## Preparación (2-3 minutos)

1. Configurar `.env` en `apps/api` y `apps/web` con placeholders.
2. Ejecutar:

```bash
pnpm install
pnpm db:reset
pnpm dev
```

3. Confirmar salud backend: `GET /api/health`.

## Script sugerido de presentación (7-10 minutos)

1. **Contexto rápido**
   - Monorepo, frontend React, backend Express, SQLite + Prisma.
2. **Consulta funcional**
   - Listar cursos y mostrar colaboradores.
3. **Recomendaciones**
   - Mostrar `GET /api/collaborators/:id/recommendations`.
4. **Política determinística**
   - Intentar una inscripción inválida y mostrar rechazo de política.
   - Hacer una inscripción válida y mostrar éxito.
5. **Agente IA**
   - Enviar mensaje en chat (frontend) → `POST /api/agent/message`.
   - Explicar que IA interpreta, backend decide y ejecuta.

## Mensajes clave para evaluadores

- Seguridad: la API key de OpenRouter no se expone al cliente.
- Gobernanza: la IA no escribe DB directamente.
- Confiabilidad: reglas de negocio críticas son determinísticas y auditables.

## Plan B (si falla OpenRouter)

- Demostrar endpoints CRUD + recomendaciones + política de inscripción.
- Explicar que la capa IA es un adaptador sobre servicios ya funcionales.
