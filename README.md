# GPBET Tournament Login System

A full-stack authentication system for a tournament web app with a modern gaming-style UI. Built with Next.js, Express, MongoDB, JWT, and bcrypt.

## Features

✅ **User Authentication**
- Login with username and password
- JWT token-based authentication
- Password hashing with bcrypt
- Protected routes

✅ **User Management**
- MongoDB database with Mongoose ODM
- User profile with game UID and tournament points
- Secure password storage

✅ **Modern UI**
- Dark gaming theme with gradient accents
- Responsive design with Tailwind CSS
- Real-time error handling

✅ **API Security**
- JWT token verification middleware
- CORS enabled
- Input validation

## Project Structure

```
gpbetapp/
├── client/                 # Next.js frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── login/     # Login page
│   │   │   ├── home/      # Dashboard (protected)
│   │   │   ├── layout.tsx # Root layout
│   │   │   ├── page.tsx   # Redirect to home
│   │   │   └── providers.tsx
│   │   ├── components/    # React components
│   │   ├── utils/
│   │   │   ├── authService.ts    # API client
│   │   │   └── useAuth.ts        # Auth hook
│   │   └── globals.css    # Tailwind & custom styles
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── .env.local.example
│
└── server/                 # Express backend
    ├── src/
    │   ├── models/
    │   │   └── User.ts     # MongoDB User schema
    │   ├── routes/
    │   │   └── auth.ts     # Authentication routes
    │   ├── middleware/
    │   │   └── auth.ts     # JWT verification
    │   └── index.ts        # Express server
    ├── package.json
    ├── tsconfig.json
    ├── .env.example
    └── dist/               # Compiled output
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14, React 18, TypeScript, Tailwind CSS |
| **Backend** | Node.js, Express, TypeScript |
| **Database** | MongoDB, Mongoose |
| **Auth** | JWT (JSON Web Tokens) |
| **Security** | bcryptjs password hashing |
| **HTTP** | Axios for API calls |

## Prerequisites

- **Node.js** v16+ and npm/yarn
- **MongoDB** running locally or MongoDB Atlas connection string
- **Git** (optional)

## Setup Instructions

### 1. Clone/Open Project

```bash
cd gpbetapp
```

### 2. Backend Setup

```bash
cd server

# Install dependencies
npm install

# Create .env file (copy from .env.example)
cp .env.example .env
```

**Update `.env`:**
```env
MONGODB_URI=mongodb://localhost:27017/gpbet-tournament
JWT_SECRET=your_super_secret_key_change_this_in_production
PORT=5000
NODE_ENV=development
```

**Start Backend:**
```bash
npm run dev
```

Server runs on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd ../client

# Install dependencies
npm install

# Create .env.local (copy from .env.local.example)
cp .env.local.example .env.local
```

**Update `.env.local`:**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

**Start Frontend:**
```bash
npm run dev
```

App runs on `http://localhost:3000`

## Database Setup

### Option A: Local MongoDB

```bash
# Windows (if MongoDB installed)
mongod

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Option B: MongoDB Atlas (Cloud)

1. Create account at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Create a cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

## API Endpoints

### Authentication Routes

#### POST `/api/auth/login`
Login with username and password

**Request:**
```json
{
  "username": "player1",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "player1",
    "uid": "UID123456",
    "points": 0
  }
}
```

#### GET `/api/auth/me` (Protected)
Get current user data (requires JWT token)

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "player1",
    "uid": "UID123456",
    "points": 0
  }
}
```

## Frontend Routes

| Route | Description | Protected |
|-------|-------------|-----------|
| `/` | Redirects to `/home` | No |
| `/login` | Login page | No |
| `/home` | User dashboard | Yes |

## Authentication Flow

```
1. User enters username & password on /login
   ↓
2. Frontend calls POST /api/auth/login
   ↓
3. Backend validates credentials
   ↓
4. Backend generates JWT token
   ↓
5. Frontend stores token in localStorage
   ↓
6. Frontend sets Authorization header
   ↓
7. User redirected to /home
   ↓
8. Protected routes verify token with authMiddleware
```

## Create Test User

### Via MongoDB CLI

```javascript
// Connect to MongoDB
mongo

// Use database
use gpbet-tournament

// Insert test user (password will be auto-hashed on save)
db.users.insertOne({
  username: "player1",
  password: "password123",  // Will be hashed automatically
  uid: "UID123456",
  points: 0,
  createdAt: new Date()
})
```

### Via Backend (Create endpoint - Optional)

You can add a signup endpoint to create users through the frontend.

## Security Features

✅ **Password Security**
- Passwords hashed with bcryptjs (10 salt rounds)
- Never stored in plain text
- Password never sent back in responses

✅ **JWT Authentication**
- Token expires in 7 days
- Verified on protected routes
- Stored in httpOnly cookies (frontend uses localStorage as demo)

✅ **Input Validation**
- Username required & unique
- Password minimum 6 characters
- Email validation (if added)

✅ **CORS Protection**
- API restricted to frontend origin
- Can be configured in `server/src/index.ts`

## Customization

### Change Colors/Theme

Edit [client/src/globals.css](client/src/globals.css):

```css
:root {
  --bg-primary: #0f0f1e;        /* Dark background */
  --accent-primary: #00d4ff;    /* Cyan accent */
  --accent-secondary: #ff006e;  /* Pink accent */
}
```

### Add Email Login

1. Update User schema to include `email` field
2. Add email field to login form
3. Find user by email instead of username
4. Update API endpoint

### Add User Registration

1. Create `POST /api/auth/register` route
2. Validate username uniqueness
3. Create user with hashed password
4. Return JWT token

### Database Migrations

Add migration system for future schema changes:

```bash
npm install migrate-mongo
```

## Environment Variables

### Backend (.env)

```env
MONGODB_URI=mongodb://localhost:27017/gpbet-tournament
JWT_SECRET=your_secret_key
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Common Issues

### Issue: "Cannot connect to MongoDB"

**Solution:**
- Ensure MongoDB is running: `mongod`
- Check connection string in `.env`
- Verify MongoDB URI format

### Issue: "CORS error"

**Solution:**
- Check `NEXT_PUBLIC_API_URL` in frontend `.env.local`
- Verify backend CORS config
- Ensure ports match (3000 for frontend, 5000 for backend)

### Issue: "Token expired"

**Solution:**
- Token expires in 7 days
- User needs to login again
- Clear localStorage and login fresh

### Issue: "Password incorrect but correct password provided"

**Solution:**
- Check password doesn't have extra spaces
- Ensure user exists in database
- Try creating new test user

## Production Deployment

### Backend (Heroku/Railway)

```bash
# Build
npm run build

# Set environment variables on platform
MONGODB_URI=your_atlas_uri
JWT_SECRET=secure_random_string
```

### Frontend (Vercel)

```bash
# Deploy with Vercel CLI
vercel

# Or push to GitHub and connect to Vercel dashboard
```

## Testing

### Login with test credentials:

**Username:** player1  
**Password:** password123

Then navigate to dashboard to see user profile, UID, and points.

## Performance Tips

- **Database Indexing:** Add indexes on `username` for faster queries
- **Caching:** Implement Redis for session management
- **Rate Limiting:** Add express-rate-limit to prevent brute force

## License

MIT

## Support

For issues or questions, check the code comments or contact the development team.

---

**Built with ❤️ for GPBET Tournament Platform**
