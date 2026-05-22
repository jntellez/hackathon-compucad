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
