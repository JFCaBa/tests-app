# API Documentation

## Base URL

```
http://localhost:3000/api
```

## Authentication Endpoints

### Register User

- **POST** `/auth/register`
- **Access:** Public
- **Description:** Register a new user
- **Request Body:**
  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string"
  }
  ```
- **Response:** JWT token and user data

### Login

- **POST** `/auth/login`
- **Access:** Public
- **Request Body:**
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response:** JWT token and user data

### Get Current User

- **GET** `/auth/me`
- **Access:** Private
- **Headers:** Authorization: Bearer {token}
- **Response:** User data

## Question Endpoints

### Get Questions

- **GET** `/questions`
- **Access:** Private
- **Query Parameters:**
  - subject (optional): listening, grammar, history, laws, reading, writing
  - type (optional): multiple-choice, writing, audio
  - difficulty (optional): easy, medium, hard
  - page (optional): number
  - limit (optional): number
- **Response:** Paginated questions list

### Create Question

- **POST** `/questions`
- **Access:** Admin
- **Content-Type:** multipart/form-data
- **Request Body:**
  ```json
  {
    "subject": "string",
    "type": "string",
    "question": "string",
    "options": ["string"],
    "correctAnswer": "number",
    "difficulty": "string",
    "audio": "file (optional)",
    "image": "file (optional)",
    "sampleResponse": "string (for writing questions)"
  }
  ```

### Update Question

- **PUT** `/questions/:id`
- **Access:** Admin
- **Parameters:** question ID
- **Request Body:** Same as create question

### Delete Question

- **DELETE** `/questions/:id`
- **Access:** Admin
- **Parameters:** question ID

## Test Endpoints

### Start Test

- **POST** `/tests/start`
- **Access:** Private
- **Request Body:**
  ```json
  {
    "subject": "string",
    "difficulty": "string (optional)",
    "questionCount": "number (optional)"
  }
  ```
- **Response:** Test session with questions

### Submit Test

- **POST** `/tests/submit`
- **Access:** Private
- **Request Body:**
  ```json
  {
    "testId": "string",
    "answers": [
      {
        "questionId": "string",
        "answer": "mixed",
        "timeSpent": "number"
      }
    ]
  }
  ```
- **Response:** Test results and correct answers

### Get Test History

- **GET** `/tests/history`
- **Access:** Private
- **Response:** User's test history

### Get Test Statistics

- **GET** `/tests/stats`
- **Access:** Private
- **Response:** User's test statistics by subject

## Admin Endpoints

### Get Users

- **GET** `/admin/users`
- **Access:** Admin
- **Query Parameters:**
  - page (optional)
  - limit (optional)
  - search (optional)

### Update User

- **PUT** `/admin/users/:id`
- **Access:** Admin
- **Request Body:**
  ```json
  {
    "role": "string (optional)",
    "isActive": "boolean (optional)"
  }
  ```

### Get System Statistics

- **GET** `/admin/stats`
- **Access:** Admin
- **Response:** System-wide statistics

### Bulk Create/Update Questions

- **POST** `/admin/bulk-questions`
- **Access:** Admin
- **Request Body:**
  ```json
  {
    "questions": [
      {
        "_id": "string (optional, for updates)",
        "subject": "string",
        "type": "string",
        "question": "string"
        // ... other question fields
      }
    ]
  }
  ```

## Error Responses

All endpoints follow this error response format:

```json
{
  "success": false,
  "error": "Error message",
  "details": {} // Additional error details (development only)
}
```

Common HTTP Status Codes:

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error
