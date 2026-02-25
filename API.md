# API Documentation

Base URL: `/api/v1`

## Authentication

### Sign Up
`POST /auth/signup`
- **Body**: `name`, `email`, `password`, `password_confirmation`
- **Response**: `user`, `token`

### Login
`POST /auth/login`
- **Body**: `email`, `password`
- **Response**: `user`, `token`

### Logout
`POST /auth/logout`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Success message

## Users

### Get Profile
`GET /profile`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: User object

## Core Resources

### Subjects
`GET /subjects`
`POST /subjects` (Body: `name`, `description`, `color`)
`PUT /subjects/{id}`
`DELETE /subjects/{id}`

### Topics
`GET /subjects/{subjectId}/topics`
`POST /subjects/{subjectId}/topics`

## Advanced Features

### Files
`POST /files/upload`
- **Body**: `file` (Multipart)
- **Response**: File object

### Notifications
`GET /notifications`
`PATCH /notifications/{id}/read`

### Analytics
`POST /analytics/event`
- **Body**: `event` (string), `properties` (json)

## Errors
Standard format:
```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "statusCode": 400
  }
}
```
