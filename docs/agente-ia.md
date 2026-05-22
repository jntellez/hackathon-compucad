# Flujo del agente de IA

## Qué hace

El endpoint `POST /api/agent/message` permite que un colaborador escriba en lenguaje natural y reciba una respuesta accionable del sistema.

## Flujo de ejecución

```mermaid
sequenceDiagram
  participant U as Usuario
  participant W as Frontend
  participant A as API
  participant L as OpenRouter
  participant S as Servicios determinísticos
  participant D as SQLite

  U->>W: Escribe mensaje
  W->>A: POST /api/agent/message
  A->>L: Clasificación de intención
  L-->>A: Intent + entidades
  A->>S: Ejecuta caso de uso permitido
  S->>D: Lee/escribe vía Prisma
  D-->>S: Resultado
  S-->>A: Resultado de negocio
  A-->>W: Respuesta final
```

## Principios de seguridad y control

1. `OPENROUTER_API_KEY` solo existe en backend.
2. El frontend nunca llama OpenRouter directamente.
3. El LLM interpreta intención, pero la decisión final la toma el backend.
4. Cualquier cambio de datos pasa por validaciones determinísticas.

## Intenciones soportadas

- Listar cursos
- Ver inscripciones activas
- Ver historial completado
- Pedir recomendaciones
- Inscribir en curso
- Cancelar inscripción
- Completar inscripción
- `unknown` (pedir aclaración)

## Qué defender ante jurado

- IA para comprensión de lenguaje natural.
- Reglas críticas controladas por código determinístico.
- Integridad de datos protegida por servicios + políticas de negocio.
