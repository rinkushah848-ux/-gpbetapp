# GPBET Tournament Login System - Setup & Launch Guide

## 📋 Prerequisites

- **Node.js** v16+ with npm
- **MongoDB** (local or Atlas)
- **2 Terminal windows** (one for backend, one for frontend)

---

## 🚀 Installation & Launch

### Step 1: Backend Setup (Terminal 1)

```bash
cd gpbetapp/server

# Install dependencies
npm install

# Create .env from template
cp .env.example .env

# Start server (will auto-reload on changes)
npm run dev
```

**Expected output:**
```
✓ Connected to MongoDB
✓ Server running on http://localhost:5000
```

### Step 2: Frontend Setup (Terminal 2)

```bash
cd gpbetapp/client

# Install dependencies
npm install

# Create .env.local from template
cp .env.local.example .env.local

# Start dev server
npm run dev
```

**Expected output:**
```
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
```

### Step 3: Open App

Visit: **http://localhost:3000**

---

## 🔐 Database Setup

### Option A: Local MongoDB (Windows)

**Using Docker:**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**Manual installation:**
- Download: https://www.mongodb.com/try/download/community
- Install and run `mongod`

### Option B: MongoDB Atlas (Cloud)

1. Create account: https://mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Update `.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gpbet-tournament
```

---

## 👤 Create Test User

### Via MongoDB Compass (GUI)

1. Download: https://www.mongodb.com/products/compass
2. Connect to `mongodb://localhost:27017`
3. Create database: `gpbet-tournament`
4. Create collection: `users`
5. Insert document:
```json
{
  "username": "player1",
  "password": "password123",
  "uid": "UID123456",
  "points": 0
}
```
**Note:** Password will be auto-hashed by the backend on first login attempt.

### Via MongoDB CLI

```bash
# Open MongoDB shell
mongosh

# Use database
use gpbet-tournament

# Insert test user
db.users.insertOne({
  username: "player1",
  password: "password123",
  uid: "UID123456",
  points: 0,
  createdAt: new Date()
})
```

---

## 🎮 Test Login

1. Go to `http://localhost:3000`
2. You'll be redirected to `/login`
3. Enter credentials:
   - **Username:** `player1`
   - **Password:** `password123`
4. Click **LOGIN**
5. ✅ Redirected to `/home` dashboard

---

## 📱 Dashboard Features

After login, you'll see:

- ✅ **Username** - Your login username
- ✅ **Game UID** - Your tournament identifier
- ✅ **Points** - Your current tournament score
- ✅ **Logout** - Sign out button

---

## 🔧 Configuration

### Backend `.env`
```env
MONGODB_URI=mongodb://localhost:27017/gpbet-tournament
JWT_SECRET=your_super_secret_jwt_key_change_in_production
PORT=5000
NODE_ENV=development
```

### Frontend `.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## 📁 Project Structure

```
gpbetapp/
├── README.md                 # This file
├── LAUNCH_GUIDE.md          # Setup instructions
│
├── server/                  # Express backend
│   ├── src/
│   │   ├── index.ts         # Express server
│   │   ├── models/User.ts   # MongoDB schema
│   │   ├── routes/auth.ts   # Login/auth routes
│   │   └── middleware/auth.ts # JWT verification
│   ├── package.json
│   ├── .env.example
│   └── tsconfig.json
│
└── client/                  # Next.js frontend
    ├── src/
    │   ├── app/
    │   │   ├── login/page.tsx  # Login page
    │   │   ├── home/page.tsx   # Dashboard
    │   │   └── layout.tsx
    │   ├── utils/
    │   │   ├── authService.ts  # API client
    │   │   └── useAuth.ts      # Auth hook
    │   └── globals.css         # Styles
    ├── package.json
    ├── .env.local.example
    └── tailwind.config.js
```

---

## ✨ Features Implemented

### Authentication
- ✅ Username + password login
- ✅ JWT token generation (7 days expiry)
- ✅ Password hashing with bcrypt
- ✅ Protected routes

### Database
- ✅ MongoDB with Mongoose
- ✅ User schema with validation
- ✅ Timestamps for created/updated

### Frontend
- ✅ Login page with form validation
- ✅ Protected home/dashboard page
- ✅ User profile display
- ✅ Logout functionality
- ✅ Dark gaming theme

### Backend
- ✅ Express REST API
- ✅ JWT middleware
- ✅ CORS enabled
- ✅ Error handling

---

## 🐛 Troubleshooting

### "Cannot connect to MongoDB"
```
Solution: 
- Ensure mongod is running
- Check connection string in .env
- Verify MongoDB is on port 27017
```

### "CORS error"
```
Solution:
- Check NEXT_PUBLIC_API_URL = http://localhost:5000
- Backend running on port 5000
- Frontend running on port 3000
```

### "Invalid username or password"
```
Solution:
- Create test user with exact credentials:
  username: player1
  password: password123
```

### "Cannot GET /home"
```
Solution:
- Ensure you're logged in
- Token stored in localStorage
- Check browser console for errors
```

---

## 📝 API Documentation

### POST /api/auth/login
```
Request:
{
  "username": "player1",
  "password": "password123"
}

Response (200):
{
  "token": "eyJhbGc...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "player1",
    "uid": "UID123456",
    "points": 0
  }
}
```

### GET /api/auth/me
```
Headers: Authorization: Bearer <token>

Response (200):
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "player1",
    "uid": "UID123456",
    "points": 0
  }
}
```

---

## 🎨 Customization

### Change Colors

Edit `client/src/globals.css`:
```css
:root {
  --bg-primary: #0f0f1e;
  --accent-primary: #00d4ff;
  --accent-secondary: #ff006e;
}
```

### Change JWT Expiry

Edit `server/src/routes/auth.ts`:
```typescript
const token = jwt.sign(..., { expiresIn: "7d" }); // Change to desired duration
```

### Add New Fields to User

1. Update schema in `server/src/models/User.ts`
2. Add migration if needed
3. Update login response
4. Update frontend to display new field

---

## 🚀 Next Steps

1. ✅ Test login system with provided credentials
2. 📧 Add email verification (optional)
3. 🔑 Add password reset feature
4. 👥 Add user registration endpoint
5. 🎯 Add tournament brackets/matches
6. 📊 Add leaderboard system

---

## 📞 Support

- Check backend logs: `http://localhost:5000/health`
- Check browser console (F12 → Console)
- Review README.md for detailed documentation

---

**Ready to launch?** Run the setup steps above and navigate to `http://localhost:3000` 🎮
