# Quick Reference & Cheat Sheet

## 🚀 Quick Start (Copy & Paste)

### Terminal 1 - Backend
```bash
cd gpbetapp/server
npm install
cp .env.example .env
npm run dev
```

### Terminal 2 - Frontend  
```bash
cd gpbetapp/client
npm install
cp .env.local.example .env.local
npm run dev
```

### Open App
```
http://localhost:3000
```

---

## 🔐 Test Login Credentials

| Field | Value |
|-------|-------|
| **Username** | player1 |
| **Password** | password123 |

---

## 📝 NPM Commands

### Backend Commands
```bash
npm install          # Install dependencies
npm run dev          # Start dev server (auto-reload)
npm run build        # Compile TypeScript
npm start            # Run compiled server
```

### Frontend Commands
```bash
npm install          # Install dependencies
npm run dev          # Start dev server
npm run build        # Build for production
npm start            # Run production build
npm run lint         # Run ESLint
```

---

## 🔌 API Endpoints

### Login (Public)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"player1","password":"password123"}'
```

### Get User (Protected)
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <TOKEN_HERE>"
```

### Health Check
```bash
curl http://localhost:5000/health
```

---

## 🗄️ MongoDB Commands

### Connect to Local MongoDB
```bash
mongosh
```

### Use Database
```javascript
use gpbet-tournament
```

### Create Test User
```javascript
db.users.insertOne({
  username: "player1",
  password: "password123",
  uid: "UID123456",
  points: 0
})
```

### View All Users
```javascript
db.users.find().pretty()
```

### Find by Username
```javascript
db.users.findOne({ username: "player1" })
```

### Update Points
```javascript
db.users.updateOne(
  { username: "player1" },
  { $set: { points: 100 } }
)
```

### Delete User
```javascript
db.users.deleteOne({ username: "player1" })
```

### Count Users
```javascript
db.users.countDocuments()
```

### Drop Collection
```javascript
db.users.drop()
```

---

## 🐛 Common Issues & Fixes

### MongoDB Connection Failed
```
ERROR: Cannot connect to MongoDB

FIX:
1. Ensure mongod is running
2. Check connection string in .env
3. Verify MongoDB is on port 27017

# Start MongoDB (Docker)
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Start MongoDB (Local - Windows)
mongod
```

### CORS Error
```
ERROR: Access to XMLHttpRequest blocked by CORS

FIX:
1. Check NEXT_PUBLIC_API_URL = http://localhost:5000
2. Verify backend running on :5000
3. Verify frontend running on :3000
```

### "Cannot GET /home"
```
ERROR: 404 - Cannot GET /home

FIX:
1. Ensure you're logged in first
2. Check token in localStorage
3. Try logging in again
4. Clear browser cache
```

### Password Hashing Issues
```
ERROR: Password incorrect but should be correct

FIX:
1. Passwords are auto-hashed on save
2. Create test user via MongoDB directly
3. Check for extra spaces in password
4. Verify MongoDB schema
```

### Token Expired
```
ERROR: Invalid token or 401 Unauthorized

FIX:
1. Tokens expire after 7 days
2. Clear localStorage: localStorage.clear()
3. Login again to get new token
```

### Port Already in Use
```
ERROR: Port 5000 / 3000 already in use

FIX:
# Find process using port
lsof -i :5000

# Kill process
kill -9 <PID>

# Or use different port
PORT=5001 npm run dev
```

---

## 📁 Environment Files

### Backend .env
```env
MONGODB_URI=mongodb://localhost:27017/gpbet-tournament
JWT_SECRET=your_super_secret_key_here
PORT=5000
NODE_ENV=development
```

### Frontend .env.local
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## 🎨 UI Customization

### Change Theme Colors

File: `client/src/globals.css`

```css
:root {
  --bg-primary: #0f0f1e;        /* Dark background */
  --bg-secondary: #1a1a2e;      /* Secondary background */
  --accent-primary: #00d4ff;    /* Cyan accent */
  --accent-secondary: #ff006e;  /* Pink accent */
  --text-primary: #eaeaea;      /* Main text */
  --text-secondary: #b0b0b0;    /* Secondary text */
}
```

### Change JWT Expiry

File: `server/src/routes/auth.ts`

```typescript
// Change from 7 days to other durations:
{ expiresIn: "7d" }     // 7 days
{ expiresIn: "24h" }    // 24 hours
{ expiresIn: "30d" }    // 30 days
{ expiresIn: "365d" }   // 1 year
```

### Change Bcrypt Salt Rounds

File: `server/src/models/User.ts`

```typescript
// Higher number = more secure but slower
const salt = await bcryptjs.genSalt(10); // 10 (default)
// Try 12 for production for higher security
```

---

## 🔍 Debugging Tips

### Check Backend Logs
```bash
# Terminal with npm run dev
# Logs appear in real-time
```

### Check Frontend Console
```
Browser: F12 → Console tab
Shows errors, network requests, auth status
```

### Network Requests
```
Browser: F12 → Network tab
See all API calls, responses, headers
```

### Check Token in Storage
```javascript
// In browser console
localStorage.getItem('token')
```

### Verify User in DB
```javascript
db.users.findOne({ username: "player1" })
```

### Check API Health
```bash
curl http://localhost:5000/health
# Should return: {"status":"Server is running"}
```

---

## 📱 Frontend Routes

| Route | Protected | Purpose |
|-------|-----------|---------|
| `/` | No | Redirect to /home |
| `/login` | No | Login page |
| `/home` | Yes | User dashboard |

---

## 🛡️ Security Headers

### Already Implemented
- ✅ CORS enabled
- ✅ JWT verification
- ✅ Password hashing
- ✅ Input validation

### For Production Add
```typescript
// server/src/index.ts
import helmet from 'helmet';
app.use(helmet());

// Rate limiting
import rateLimit from 'express-rate-limit';
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);
```

---

## 🚢 Deployment Checklist

### Before Deploying
- [ ] Update JWT_SECRET to strong random string
- [ ] Update MONGODB_URI to production database
- [ ] Set NODE_ENV=production
- [ ] Remove console.logs from code
- [ ] Test all authentication flows
- [ ] Enable HTTPS in production

### Backend Deployment (Heroku/Railway)
```bash
git init
git add .
git commit -m "Initial commit"
git push heroku main
```

### Frontend Deployment (Vercel)
```bash
vercel
# Or push to GitHub and auto-deploy
```

---

## 📊 Performance Tips

### Optimize Queries
```javascript
// Add indexes
db.users.createIndex({ username: 1 })
db.users.createIndex({ points: -1 })
```

### Connection Pooling
```typescript
mongoose.connect(uri, {
  maxPoolSize: 10,
  minPoolSize: 5,
});
```

### Database Caching
```typescript
// Add Redis for session caching
import redis from 'redis';
const client = redis.createClient();
```

---

## 🧪 Testing Scenarios

### Test 1: Successful Login
1. Go to http://localhost:3000
2. Enter: player1 / password123
3. ✅ Should redirect to /home with user data

### Test 2: Invalid Password
1. Go to http://localhost:3000
2. Enter: player1 / wrongpassword
3. ✅ Should show error message

### Test 3: Non-existent User
1. Go to http://localhost:3000
2. Enter: nonexistent / password123
3. ✅ Should show error message

### Test 4: Protected Route
1. Without logging in, visit http://localhost:3000/home
2. ✅ Should redirect to /login

### Test 5: Token Persistence
1. Login successfully
2. Close and reopen browser
3. ✅ Should stay logged in (token in localStorage)

---

## 🔑 Key Files to Know

| Priority | File | What to Edit |
|----------|------|--------------|
| 🔴 Critical | `.env` | Database and JWT settings |
| 🔴 Critical | User.ts schema | User database fields |
| 🟡 Important | auth.ts routes | API endpoints |
| 🟡 Important | login/page.tsx | Login UI |
| 🟢 Nice to Have | globals.css | Theme colors |

---

## 💾 Backup Commands

```bash
# Backup MongoDB
mongodump --uri "mongodb://localhost:27017/gpbet-tournament" \
  --out ./backup

# Restore MongoDB
mongorestore ./backup

# Export users as JSON
mongoexport --uri "mongodb://localhost:27017/gpbet-tournament" \
  --collection users \
  --out users.json
```

---

## 🎓 Learning Resources

- **MongoDB**: https://docs.mongodb.com
- **Express**: https://expressjs.com
- **Next.js**: https://nextjs.org/docs
- **JWT**: https://jwt.io
- **Bcrypt**: https://github.com/kelektiv/node.bcrypt.js
- **Tailwind**: https://tailwindcss.com

---

**Bookmark this page for quick reference!**
