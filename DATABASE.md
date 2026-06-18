# Database Schema & Migrations

## User Collection Schema

### Schema Definition

```typescript
{
  _id: ObjectId                  // MongoDB auto-generated ID
  username: String               // Unique, required, lowercase
  password: String               // Hashed with bcryptjs (10 rounds)
  uid: String                    // Unique, game UID entered by user
  points: Number                 // Default 0, tournament score
  createdAt: Date               // Auto-set on creation
  updatedAt: Date               // Auto-updated on changes
}
```

### Validation Rules

| Field | Type | Required | Unique | Validation |
|-------|------|----------|--------|-----------|
| username | String | ✅ | ✅ | 3+ chars, lowercase |
| password | String | ✅ | ❌ | 6+ chars (before hash) |
| uid | String | ✅ | ✅ | User-provided game ID |
| points | Number | ❌ | ❌ | Default 0 |

### MongoDB Indexes

```javascript
// Index on username for faster queries
db.users.createIndex({ username: 1 }, { unique: true })

// Index on uid for game UID lookups
db.users.createIndex({ uid: 1 }, { unique: true })

// Index on createdAt for sorting by join date
db.users.createIndex({ createdAt: -1 })
```

---

## Sample User Documents

### User Document (After Creation)

```json
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "username": "player1",
  "password": "$2a$10$nOUIs5kJ7naTuTFkWK1Be.79/PHxIonziClnT2ayQ4UtVQreF2IYm",
  "uid": "UID123456",
  "points": 0,
  "createdAt": ISODate("2024-01-15T10:30:00Z"),
  "updatedAt": ISODate("2024-01-15T10:30:00Z")
}
```

### Responses Sent to Client

```json
{
  "id": "507f1f77bcf86cd799439011",
  "username": "player1",
  "uid": "UID123456",
  "points": 0
}
```

Note: **Password is never sent to client**

---

## Adding New Fields

### Example: Add Email Field

#### 1. Update User Schema

File: `server/src/models/User.ts`

```typescript
const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    uid: { type: String, required: true, unique: true },
    points: { type: Number, default: 0 },
    email: {                              // NEW FIELD
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    emailVerified: {                      // NEW FIELD
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
```

#### 2. Create Mongoose Migration

```bash
npm install migrate-mongo
npx migrate-mongo init
```

Create migration file: `migrations/001-add-email-field.js`

```javascript
module.exports = {
  async up(db, client) {
    const usersCollection = db.collection("users");
    await usersCollection.updateMany(
      {},
      {
        $set: {
          email: null,
          emailVerified: false,
        },
      }
    );
  },

  async down(db, client) {
    const usersCollection = db.collection("users");
    await usersCollection.updateMany(
      {},
      {
        $unset: {
          email: "",
          emailVerified: "",
        },
      }
    );
  },
};
```

#### 3. Run Migration

```bash
npx migrate-mongo up
```

#### 4. Update Backend Routes

File: `server/src/routes/auth.ts`

```typescript
router.post("/login", async (req: Request, res: Response) => {
  // ... existing code ...
  
  // Return updated user response
  res.json({
    token,
    user: {
      id: user._id,
      username: user.username,
      uid: user.uid,
      points: user.points,
      email: user.email,              // NEW
      emailVerified: user.emailVerified, // NEW
    },
  });
});
```

---

## Database Queries

### Find User by Username

```javascript
db.users.findOne({ username: "player1" })
```

### Find User by ID

```javascript
db.users.findOne({ _id: ObjectId("507f1f77bcf86cd799439011") })
```

### Find User by UID

```javascript
db.users.findOne({ uid: "UID123456" })
```

### Update User Points

```javascript
db.users.updateOne(
  { _id: ObjectId("507f1f77bcf86cd799439011") },
  { $set: { points: 100 } }
)
```

### Delete User

```javascript
db.users.deleteOne({ _id: ObjectId("507f1f77bcf86cd799439011") })
```

### Get All Users (sorted by points)

```javascript
db.users.find({}).sort({ points: -1 }).limit(10)
```

---

## Backup & Restore

### Backup Database

```bash
# Using mongoexport
mongoexport --uri "mongodb://localhost:27017/gpbet-tournament" \
  --collection users \
  --out backup-users.json

# Entire database
mongodump --uri "mongodb://localhost:27017/gpbet-tournament" \
  --out ./backup
```

### Restore Database

```bash
# Using mongoimport
mongoimport --uri "mongodb://localhost:27017/gpbet-tournament" \
  --collection users \
  --file backup-users.json

# Entire database
mongorestore --uri "mongodb://localhost:27017/gpbet-tournament" \
  ./backup/gpbet-tournament
```

---

## Performance Considerations

### Query Optimization

```javascript
// ❌ BAD: Full collection scan
db.users.find({ username: { $regex: "player" } })

// ✅ GOOD: Exact match with index
db.users.findOne({ username: "player1" })

// ✅ GOOD: Specific field projection
db.users.findOne(
  { _id: ObjectId(...) },
  { projection: { password: 0 } }
)
```

### Indexing Strategy

```javascript
// Primary lookup
db.users.createIndex({ username: 1 })

// Game UID lookups
db.users.createIndex({ uid: 1 })

// Leaderboard queries
db.users.createIndex({ points: -1 })

// Time-based queries
db.users.createIndex({ createdAt: -1 })

// Compound index for multiple fields
db.users.createIndex({ points: -1, createdAt: -1 })
```

### Pagination Example

```javascript
// Get page 2 (10 users per page)
db.users.find({})
  .sort({ points: -1 })
  .skip(10)
  .limit(10)
```

---

## Scaling Considerations

### Sharding (Future)

For very large user bases:

```javascript
// Enable sharding on database
sh.enableSharding("gpbet-tournament")

// Shard users collection by username
sh.shardCollection("gpbet-tournament.users", { username: 1 })
```

### Read Replicas

For high read loads:

```bash
# Connect to replica set
mongodb://node1:27017,node2:27017,node3:27017/gpbet-tournament?replicaSet=rs0
```

### Connection Pooling

```typescript
// In server/src/index.ts
mongoose.connect(MONGODB_URI, {
  maxPoolSize: 10,
  minPoolSize: 5,
})
```

---

## Data Validation Rules

### Pre-Save Validation

```typescript
userSchema.pre("save", async function (next) {
  // Validate username format
  if (!/^[a-zA-Z0-9_]{3,}$/.test(this.username)) {
    throw new Error("Username must be 3+ alphanumeric chars");
  }

  // Validate password strength
  if (this.password.length < 6) {
    throw new Error("Password must be 6+ characters");
  }

  // Hash password if modified
  if (this.isModified("password")) {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
  }

  next();
});
```

---

## Archive Old Users (Optional)

```javascript
// Archive users inactive for 1 year
db.createCollection("users_archived")

db.users.find({
  updatedAt: { $lt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
}).forEach(user => {
  db.users_archived.insertOne(user)
  db.users.deleteOne({ _id: user._id })
})
```

---

## Monitoring

### Check Collection Stats

```javascript
db.users.stats()
```

### List All Indexes

```javascript
db.users.getIndexes()
```

### Collection Size

```javascript
db.users.dataSize()  // Data size in bytes
db.users.totalSize() // Data + indexes
```

---

**Database is the foundation of your application. Plan schema changes carefully!**
