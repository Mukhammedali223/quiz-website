# Quiz Website

A full-stack Quiz/Trivia website where users can register, login, create and manage quizzes, and play quizzes. Built with Node.js, Express, MongoDB Atlas, and EJS templating.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Team](#team)

## Features

- User Authentication: Register, login with JWT tokens
- RBAC: Role-based access control (admin/user)
- Quiz Management: Full CRUD operations for quizzes
- Play Quizzes: Interactive quiz player with score calculation
- Responsive Design: Works on mobile and desktop
- Email Notifications: Welcome emails on registration
- Secure: Password hashing, rate limiting, helmet protection

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT, bcrypt
- **Validation**: Joi
- **Email**: Nodemailer (SMTP)
- **Frontend**: EJS, Vanilla CSS, JavaScript
- **Security**: Helmet, CORS, Rate Limiting

## Project Structure

```
quiz-website/
├── config/
│   └── db.js                 # MongoDB connection
├── controllers/
│   ├── authController.js     # Register, Login logic
│   ├── userController.js     # Profile management
│   └── resourceController.js # Quiz CRUD operations
├── middleware/
│   ├── auth.js               # JWT verification
│   ├── rbac.js               # Role-based access control
│   ├── errorHandler.js       # Global error handling
│   └── validate.js           # Joi validation middleware
├── models/
│   ├── User.js               # User schema
│   └── Quiz.js               # Quiz schema (resource)
├── routes/
│   ├── authRoutes.js         # Auth endpoints
│   ├── userRoutes.js         # User endpoints
│   └── resourceRoutes.js     # Quiz endpoints
├── services/
│   └── emailService.js       # Email functionality
├── validation/
│   └── schemas.js            # Joi validation schemas
├── views/                    # EJS templates
├── public/                   # Static assets (CSS, JS)
├── server.js                 # Entry point
└── package.json
```

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account (free tier works)
- SMTP provider account (SendGrid/Mailgun/Postmark) for emails

### Installation

1. Clone or download the project
   ```bash
   cd quiz-website
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create environment file
   ```bash
   cp .env.example .env
   ```

4. Configure environment variables (see section below)

5. Start the server
   ```bash
   npm run dev
   ```

6. Open in browser
   ```
   http://localhost:3000
   ```

## Environment Variables

Create a `.env` file with these variables:

```env
# Server
PORT=3000
NODE_ENV=development

# MongoDB Atlas
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority

# JWT
JWT_SECRET=your-super-secret-key-change-this
JWT_EXPIRES_IN=7d

# SMTP (SendGrid example)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key

# Email
EMAIL_FROM=noreply@yourapp.com
EMAIL_FROM_NAME=Quiz Website
```

## API Documentation

### Base URL
```
http://localhost:3000
```

### Authentication Header
For protected routes, include:
```
Authorization: Bearer <your-jwt-token>
```

### Authentication Endpoints

#### POST /register
Register a new user.

**Request:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "_id": "...",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### POST /login
Login and receive JWT token.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

### User Endpoints (Protected)

#### GET /users/profile
Get current user's profile.

#### PUT /users/profile
Update user profile.

### Resource (Quiz) Endpoints (Protected)

#### POST /resource
Create a new quiz.

#### GET /resource
Get all quizzes for current user.

#### GET /resource/:id
Get a single quiz by ID.

#### PUT /resource/:id
Update a quiz (owner or admin only).

#### DELETE /resource/:id
Delete a quiz (owner or admin only).

### Error Responses

| Status | Description |
|--------|-------------|
| 400 | Bad Request - Validation failed |
| 401 | Unauthorized - No/invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error |

## Team

**Group: SE-2414**

**Team Members:**
- Mukhammedali Khassenov
- Shakarim Ainatayev
- Kuanysh Seitzhan

## License

This project was created for educational purposes as part of a university assignment.
