# Architecture & System Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (Next.js)                         │
│  ┌────────────────────────────────────────────────────┐    │
│  │ /login Page                                        │    │
│  │ - Username input                                   │    │
│  │ - Password input                                   │    │
│  │ - Calls POST /api/auth/login                       │    │
│  └────────────────────────────────────────────────────┘    │
│                         │                                    │
│                         ↓ JWT Token                          │
│  ┌────────────────────────────────────────────────────┐    │
│  │ /home Page (Protected)                             │    │
│  │ - Stored in localStorage                           │    │
│  │ - Added to API headers                             │    │
│  │ - Displays user profile                            │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTP/REST
                      ↓
┌─────────────────────────────────────────────────────────────┐
│                  SERVER (Express)                           │
│  ┌────────────────────────────────────────────────────┐    │
│  │ POST /api/auth/login                              │    │
│  │ 1. Receive { username, password }                 │    │
│  │ 2. Find user in database                          │    │
│  │ 3. Compare password with bcrypt                   │    │
│  │ 4. Generate JWT token                             │    │
│  │ 5. Return token + user data                        │    │
│  └────────────────────────────────────────────────────┘    │
│                         │                                    │
│                         ↓                                    │
│  ┌────────────────────────────────────────────────────┐    │
│  │ GET /api/auth/me (Protected)                       │    │
│  │ - Verify JWT token with middleware                 │    │
│  │ - Return authenticated user data                   │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────┬───────────────────────────────────────┘
                      │ Mongoose Driver
                      ↓
┌─────────────────────────────────────────────────────────────┐
│                  DATABASE (MongoDB)                         │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Collection: users                                  │    │
│  │ ┌──────────────────────────────────────────────┐  │    │
│  │ │ Document:                                    │  │    │
│  │ │ {                                            │  │    │
│  │ │   _id: ObjectId,                             │  │    │
│  │ │   username: "player1",                       │  │    │
│  │ │   password: "$2a$10$...",  [HASHED]          │  │    │
│  │ │   uid: "UID123456",                          │  │    │
│  │ │   points: 0,                                 │  │    │
│  │ │   createdAt: Date,                           │  │    │
│  │ │   updatedAt: Date                            │  │    │
│  │ │ }                                            │  │    │
│  │ └──────────────────────────────────────────────┘  │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Authentication Flow

```
USER VISITS /login
       ↓
   [Login Form]
   - Enter username
   - Enter password
   - Click LOGIN
       ↓
POST /api/auth/login
       ↓
BACKEND VALIDATION
├─ Find user by username
├─ If not found → Error 401
└─ If found → Continue
       ↓
PASSWORD VERIFICATION
├─ Compare password with bcrypt.compare()
├─ If wrong → Error 401
└─ If correct → Continue
       ↓
JWT TOKEN GENERATION
├─ Sign JWT with userId & username
├─ Set expiry to 7 days
└─ Return token to client
       ↓
FRONTEND RECEIVES RESPONSE
├─ Extract token
├─ Store in localStorage
├─ Add to axios headers
└─ Redirect to /home
       ↓
PROTECTED ROUTE ACCESS
├─ useAuth() checks localStorage for token
├─ If no token → Redirect to /login
├─ If token exists → Call GET /api/auth/me
└─ Verify token with authMiddleware
       ↓
DISPLAY USER DASHBOARD
├─ Show username
├─ Show game UID
├─ Show tournament points
└─ Allow logout
```

## Component Architecture

```
Frontend (Next.js)
│
├── app/
│   ├── layout.tsx (Root layout + CSS)
│   ├── page.tsx (Redirect /)
│   ├── providers.tsx (Client providers)
│   │
│   ├── login/
│   │   └── page.tsx (Login component)
│   │       ├── useState (username, password, error)
│   │       ├── handleLogin()
│   │       └── authService.login()
│   │
│   └── home/
│       └── page.tsx (Dashboard)
│           ├── useAuth() hook
│           ├── authService.getMe()
│           └── Display user profile
│
├── utils/
│   ├── authService.ts
│   │   ├── setToken()
│   │   ├── getToken()
│   │   ├── clearToken()
│   │   ├── login()
│   │   ├── getMe()
│   │   └── isAuthenticated()
│   │
│   └── useAuth.ts
│       ├── Check authentication status
│       ├── Redirect if not logged in
│       └── Manage loading state
│
└── globals.css
    ├── Dark theme colors
    ├── Tailwind utilities
    └── Custom components
```

## Backend Architecture

```
Backend (Express)
│
├── src/
│   │
│   ├── index.ts (Main server)
│   │   ├── Express app setup
│   │   ├── CORS configuration
│   │   ├── Middleware setup
│   │   ├── Routes registration
│   │   └── MongoDB connection
│   │
│   ├── models/
│   │   └── User.ts
│   │       ├── Schema definition
│   │       ├── Pre-save: Hash password
│   │       ├── comparePassword() method
│   │       └── Exclude password on output
│   │
│   ├── routes/
│   │   └── auth.ts
│   │       ├── POST /api/auth/login
│   │       │   ├── Validate input
│   │       │   ├── Find user by username
│   │       │   ├── Compare password
│   │       │   ├── Generate JWT
│   │       │   └── Return response
│   │       │
│   │       └── GET /api/auth/me
│   │           ├── Check authMiddleware
│   │           ├── Get user ID from token
│   │           └── Return user data
│   │
│   └── middleware/
│       └── auth.ts
│           ├── Extract token from header
│           ├── Verify JWT signature
│           ├── Decode token payload
│           ├── Attach user to request
│           └── Handle errors
│
├── package.json
├── tsconfig.json
└── .env configuration
```

## Data Flow Diagram

```
┌─────────────────────┐
│  User Credentials   │
│ (username, pwd)     │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────────────────┐
│  Frontend Form Submission        │
│  authService.login()             │
└──────────────┬──────────────────┘
               │
               ↓ HTTP POST
┌──────────────────────────────────┐
│  Backend Login Handler            │
│  1. Validate input               │
│  2. Query MongoDB for user       │
│  3. Bcrypt.compare()             │
│  4. JWT.sign()                   │
└──────────────┬───────────────────┘
               │
               ↓
┌──────────────────────────────────┐
│  Return Response                  │
│  {                               │
│    token: "...",                 │
│    user: {...}                   │
│  }                               │
└──────────────┬───────────────────┘
               │
               ↓
┌──────────────────────────────────┐
│  Frontend Stores Token            │
│  localStorage.setItem("token")   │
└──────────────┬───────────────────┘
               │
               ↓
┌──────────────────────────────────┐
│  Navigate to /home               │
│  useAuth() verifies token        │
└──────────────┬───────────────────┘
               │
               ↓ Protected
┌──────────────────────────────────┐
│  Display User Dashboard           │
│  - Username                      │
│  - Game UID                      │
│  - Points                        │
└──────────────────────────────────┘
```

## Security Layers

```
1. INPUT VALIDATION
   ├─ Check username/password provided
   ├─ Trim whitespace
   └─ Validate format

2. DATABASE QUERY
   ├─ Find user by username (case-insensitive)
   ├─ Return null if not found
   └─ Reject with 401

3. PASSWORD VERIFICATION
   ├─ Use bcryptjs.compare()
   ├─ Never reveal if user exists
   └─ Generic error message

4. TOKEN GENERATION
   ├─ Sign with JWT_SECRET
   ├─ Include userId & username
   ├─ Set 7-day expiry
   └─ Return to client

5. TOKEN VERIFICATION (Protected Routes)
   ├─ Extract from Authorization header
   ├─ Verify signature
   ├─ Check expiry
   ├─ Decode payload
   └─ Attach to request

6. FRONTEND STORAGE
   ├─ Store in localStorage (demo)
   ├─ Include in all API requests
   ├─ Clear on logout
   └─ Validate before use
```

## Error Handling Flow

```
CLIENT ERROR                    SERVER RESPONSE
│                              │
├─ Missing credentials    →    400 Bad Request
├─ User not found         →    401 Unauthorized
├─ Wrong password         →    401 Unauthorized
├─ No token provided      →    401 Unauthorized
├─ Invalid token          →    401 Unauthorized
├─ Token expired          →    401 Unauthorized
└─ Server error           →    500 Internal Server Error

USER RESPONSE
│
├─ Display error message
├─ Clear form (optional)
├─ Highlight error field
└─ Suggest action
```

---

**This architecture ensures secure, scalable authentication for your tournament platform.**
