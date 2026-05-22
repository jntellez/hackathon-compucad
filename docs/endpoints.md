# Endpoints

## GET /api/health

Returns the current health status of the API.

### Response

```json
{
  "status": "ok",
  "service": "api",
  "timestamp": "2026-05-21T12:00:00.000Z"
}
```

### Notes

- Intended for local smoke testing and environment validation.
- Used by the frontend home screen to confirm backend connectivity.

---

## Courses

### GET /api/courses

Returns all courses. Supports optional query filters.

#### Query Parameters

| Parameter  | Type   | Required | Description                |
| ---------- | ------ | -------- | -------------------------- |
| `status`   | string | No       | Filter by course status    |
| `category` | string | No       | Filter by course category  |
| `modality` | string | No       | Filter by course modality  |

#### Response

```json
{
  "data": [
    {
      "id": 1,
      "name": "React Advanced",
      "category": "Frontend",
      "provider": "Udemy",
      "modality": "ONLINE",
      "courseLevel": "Advanced",
      "durationHours": 40,
      "maxCapacity": 30,
      "status": "ACTIVE",
      "minimumRequiredLevel": "MID",
      "cost": 200,
      "pointsAwarded": 500
    }
  ]
}
```

---

### GET /api/courses/:id

Returns a single course by ID.

#### Response

```json
{
  "data": {
    "id": 1,
    "name": "React Advanced",
    "category": "Frontend",
    ...
  }
}
```

#### Error Responses

| Status | Code  | Message         |
| ------ | ----- | --------------- |
| 404    | AppError | Course not found. |

---

## Collaborators

### GET /api/collaborators

Returns all collaborators with position and area summary.

#### Response

```json
{
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "position": { "id": 1, "name": "Developer", "level": "MID" },
      "area": { "id": 1, "name": "Engineering" },
      ...
    }
  ]
}
```

---

### GET /api/collaborators/:id

Returns a single collaborator by ID, including position and area.

#### Response

```json
{
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "position": { "id": 1, "name": "Developer", "level": "MID" },
    "area": { "id": 1, "name": "Engineering" },
    ...
  }
}
```

#### Error Responses

| Status | Code  | Message              |
| ------ | ----- | -------------------- |
| 404    | AppError | Collaborator not found. |

---

### GET /api/collaborators/:id/enrollments

Returns active enrollments for the collaborator, including course information.

#### Response

```json
{
  "data": [
    {
      "id": 1,
      "collaboratorId": 1,
      "courseId": 2,
      "enrolledAt": "2026-05-01",
      "status": "ACTIVE",
      "grade": null,
      "course": { ... }
    }
  ]
}
```

#### Error Responses

| Status | Code  | Message              |
| ------ | ----- | -------------------- |
| 404    | AppError | Collaborator not found. |

---

### GET /api/collaborators/:id/history

Returns completed enrollments for the collaborator, including course information.

#### Response

```json
{
  "data": [
    {
      "id": 1,
      "collaboratorId": 1,
      "courseId": 2,
      "enrolledAt": "2026-04-01",
      "status": "COMPLETED",
      "grade": 85.5,
      "course": { ... }
    }
  ]
}
```

#### Error Responses

| Status | Code  | Message              |
| ------ | ----- | -------------------- |
| 404    | AppError | Collaborator not found. |

---

### GET /api/collaborators/:id/recommendations

Returns deterministic course recommendations for the collaborator.

#### Response

```json
{
  "data": [
    {
      "course": {
        "id": 1,
        "name": "React Advanced"
      },
      "score": 85,
      "eligible": true,
      "reasons": [
        "Matches collaborator interests",
        "Aligned with collaborator area"
      ],
      "blockingReasons": []
    }
  ]
}
```

#### Notes

- Only active courses are considered.
- Completed courses and active enrollments are excluded.
- Recommendations include explainable reasons and policy-based blocking reasons.

#### Error Responses

| Status | Code     | Message                 |
| ------ | -------- | ----------------------- |
| 404    | AppError | Collaborator not found. |

---

## Enrollments

### POST /api/enrollments

Creates a new enrollment for a collaborator into a course. All business policy rules are validated before creation.

#### Request Body

```json
{
  "collaboratorId": 1,
  "courseId": 2
}
```

#### Response

```json
{
  "data": {
    "id": 10,
    "collaboratorId": 1,
    "courseId": 2,
    "enrolledAt": "2026-05-21",
    "status": "ACTIVE",
    "grade": null,
    "collaborator": { ... },
    "course": { ... }
  }
}
```

#### Error Responses

| Status | Code             | Message                                                                   |
| ------ | ---------------- | ------------------------------------------------------------------------- |
| 400    | POLICY_REJECTION | Any policy validation failure (see table below)                           |
| 400    | AppError         | Invalid request body (Zod validation)                                     |

**Policy rejection messages:**

| Message                                                                   |
| ------------------------------------------------------------------------- |
| Collaborator not found.                                                   |
| Course not found.                                                         |
| Collaborator is inactive.                                                 |
| Collaborator does not meet the minimum seniority requirement (1 month).   |
| Course is archived.                                                       |
| Collaborator level is lower than the course minimum required level.       |
| Collaborator already has 3 active enrollments.                            |
| Course has no available capacity.                                         |
| Collaborator already has an active enrollment for this course.            |

---

### POST /api/enrollments/:id/cancel

Cancels an active enrollment. Sets status to `CANCELLED`.

#### Response

```json
{
  "data": {
    "id": 10,
    "status": "CANCELLED",
    ...
  }
}
```

#### Error Responses

| Status | Code     | Message                                |
| ------ | -------- | -------------------------------------- |
| 404    | AppError | Enrollment not found.                  |
| 400    | AppError | Only active enrollments can be cancelled. |

---

### POST /api/enrollments/:id/complete

Marks an active enrollment as completed. Sets status to `COMPLETED` and adds the course's `pointsAwarded` to the collaborator's score.

#### Response

```json
{
  "data": {
    "id": 10,
    "status": "COMPLETED",
    ...
  }
}
```

#### Error Responses

| Status | Code     | Message                                |
| ------ | -------- | -------------------------------------- |
| 404    | AppError | Enrollment not found.                  |
| 400    | AppError | Only active enrollments can be completed. |

---

## Agent

### POST /api/agent/message

Classifies the collaborator message intent through OpenRouter and executes deterministic backend actions.

#### Request Body

```json
{
  "collaboratorId": 1,
  "message": "Enroll me in React Advanced"
}
```

#### Response

```json
{
  "data": {
    "message": "Enrollment created for React Advanced.",
    "intent": "enroll_course",
    "action": "enroll_course",
    "result": {},
    "usage": {
      "promptTokens": 100,
      "completionTokens": 40,
      "totalTokens": 140
    }
  }
}
```

#### Notes

- Supported intents: `list_courses`, `get_active_enrollments`, `get_completed_courses`, `recommend_courses`, `enroll_course`, `cancel_enrollment`, `complete_enrollment`, `unknown`.
- If the message is ambiguous, the API returns an intent clarification response instead of mutating data.
- Intent extraction does not mutate the database directly; all actions are executed only by existing deterministic services.

#### Error Responses

| Status | Code                    | Message                                   |
| ------ | ----------------------- | ----------------------------------------- |
| 500    | OpenRouterConfigError   | Missing OPENROUTER_API_KEY configuration. |
| 502    | AgentInvalidModelOutput | Model returned invalid JSON output.       |
