# Endpoints principales

Base URL local: `http://localhost:3000/api`

## Salud

### `GET /health`

Verifica que la API esté operativa.

## Cursos

### `GET /courses`

Lista cursos. Filtros opcionales por query:

- `status`
- `category`
- `modality`

### `GET /courses/:id`

Obtiene un curso por ID.

## Colaboradores

### `GET /collaborators`

Lista colaboradores con resumen de posición y área.

### `GET /collaborators/:id`

Obtiene un colaborador por ID.

### `GET /collaborators/:id/enrollments`

Lista inscripciones activas del colaborador.

### `GET /collaborators/:id/history`

Lista cursos completados del colaborador.

### `GET /collaborators/:id/recommendations`

Devuelve recomendaciones determinísticas de cursos.

## Inscripciones

### `POST /enrollments`

Crea inscripción validando políticas de negocio en backend.

Body:

```json
{
  "collaboratorId": 1,
  "courseId": 2
}
```

Errores típicos:

- `400 POLICY_REJECTION` (incumplimiento de reglas)
- `400 AppError` (payload inválido)

### `POST /enrollments/:id/cancel`

Cancela una inscripción activa (`status = CANCELLED`).

### `POST /enrollments/:id/complete`

Completa una inscripción activa (`status = COMPLETED`) y suma puntos al colaborador.

## Agente IA

### `POST /agent/message`

Interpreta el mensaje con OpenRouter y delega la ejecución a servicios determinísticos.

Body:

```json
{
  "collaboratorId": 1,
  "message": "Inscribime en React Advanced"
}
```

Notas:

- Intenciones soportadas: `list_courses`, `get_active_enrollments`, `get_completed_courses`, `recommend_courses`, `enroll_course`, `cancel_enrollment`, `complete_enrollment`, `unknown`.
- El modelo NO escribe base de datos directamente.
- La API puede responder pidiendo aclaración si la intención es ambigua.

## Respuesta estándar

En general, los endpoints responden con:

```json
{
  "data": {}
}
```
