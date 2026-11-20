# Student Portal API

A Node.js authentication API for a college student portal. It supports user registration, login with JWT authentication, protected profile access, and an admin-only student list.

## Requirements

- Node.js 18 or newer
- MongoDB

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create the environment file:

   ```bash
   copy .env.example .env
   ```

3. Set `MONGODB_URI` and `JWT_SECRET` in `.env`.

4. Start MongoDB and run the server:

   ```bash
   npm start
   ```

The server runs at `http://localhost:3000` by default.

## API Endpoints

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/register` | Public | Register a student or admin |
| POST | `/login` | Public | Authenticate and receive a one-hour JWT |
| GET | `/profile` | Authenticated | Return the logged-in user's profile |
| GET | `/students` | Admin | Return all users with the student role |
| GET | `/health` | Public | Check server status |

Send authenticated requests with:

```text
Authorization: Bearer <token>
```

## Postman

Import `postman/Student Portal.postman_collection.json`. The collection contains requests for registration, login, profile access, and admin access.

## Security

The API uses:

- bcrypt password hashing
- JWT authentication
- Helmet security headers
- CORS
- Express rate limiting
- Joi request validation
