# Reglas de negocio

Estas validaciones se ejecutan de forma determinística en backend antes de crear una inscripción.

## Reglas obligatorias de inscripción

1. El colaborador debe estar `Active`.
2. Debe tener al menos 1 mes de antigüedad.
3. El curso debe estar `Active`.
4. El nivel del colaborador debe ser >= nivel mínimo del curso.
5. No puede tener más de 3 inscripciones activas.
6. El curso debe tener cupo disponible.
7. No puede tener ya una inscripción activa al mismo curso.

## Dónde viven

- Servicio de políticas de inscripción en backend (`enrollments`).
- Validaciones previas a persistir cambios en SQLite.

## Importante

- Estas reglas no dependen del prompt ni del modelo.
- Si una regla falla, la API responde error de política y no se crea la inscripción.

## Recomendación: elegible vs bloqueado

Para recomendaciones y UX, se puede separar la salida en dos grupos:

- **Elegible**: cursos que cumplen todas las reglas para poder inscribirse.
- **Bloqueado**: cursos con motivo explícito de bloqueo (nivel insuficiente, curso sin cupo, colaborador inactivo, etc.).

Esta separación mejora trazabilidad funcional sin delegar decisiones al modelo.
