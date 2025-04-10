# Otp based backend System - Authentication API

A robust Node.js authentication system with email verification, rate limiting, and token-based authentication.

## Website Url
CLick here 👉 [Visit the website the check the live demo of the project ](https://www.authbackend.work.gd) or copy and paste  the link in the browser https://www.authbackend.work.gd
## Features

- User registration with email verification
- JWT-based authentication (Access & Refresh tokens)
- Rate limiting for verification requests
- Secure password handling with bcrypt
- Email notifications using Resend
- MongoDB for data persistence

## Prerequisites

- Node.js
- MongoDB
- Redis (optional)
- Resend API key for email service

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
MONGODB_URI=your_mongodb_connection_string
PORT=3000
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
ACCESS_TOKEN_EXPIRY=1h
REFRESH_TOKEN_EXPIRY=10d
RESEND_API_KEY=your_resend_api_key
```

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Start the server:
```bash
npm start
```

## API Endpoints

### Public Routes

- `GET /api/v1/users` - Welcome message to check everything is running fine
- `POST /api/v1/users/login` - Register/Login user
- `POST /api/v1/users/verify` - Verify email with token
- `POST /api/v1/users/resendVerificationToken` - Resend verification token
- `POST /api/v1/users/generateNewTokens` - Generate new access/refresh tokens

### Protected Routes

- `POST /api/v1/users/logout` - Logout user (requires authentication)

## Rate Limiting

- Maximum 3 verification requests per hour
- Verification tokens expire after 5 minutes

## Tech Stack

- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcrypt for password hashing
- Resend for email delivery

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
