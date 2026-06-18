# Backend README

## Quick Start

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start development server
npm run dev
```

Server runs on `http://localhost:5000`

## Scripts

- `npm run dev` - Start development server with auto-reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run compiled server

## Project Structure

```
src/
├── index.ts          # Express app & MongoDB connection
├── models/
│   └── User.ts       # MongoDB User schema with bcrypt
├── routes/
│   └── auth.ts       # Authentication endpoints
└── middleware/
    └── auth.ts       # JWT verification middleware
```

## Database

**Collections:**
- `users` - User accounts with credentials

**User Schema:**
```javascript
{
  username: string (unique, lowercase),
  password: string (hashed),
  uid: string (unique),
  points: number,
  createdAt: date,
  updatedAt: date
}
```

## API Routes

**POST /api/auth/login**
- Request: `{ username, password }`
- Response: `{ token, user }`

**GET /api/auth/me**
- Headers: `Authorization: Bearer <token>`
- Response: `{ user }`

## Authentication

Uses JWT tokens that expire in 7 days. Token stored in localStorage on frontend.

## Middleware

- `authMiddleware` - Verifies JWT token on protected routes
