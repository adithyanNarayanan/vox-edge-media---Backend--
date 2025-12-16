# Vox Edge Media - Backend API

Complete authentication backend with Firebase integration.

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file in the Backend directory (use `.env.example` as template):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/vox-edge-media
```

### 3. Firebase Admin Setup (Choose One Option)

#### Option A: Service Account File (Recommended for Development)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** > **Service Accounts**
4. Click **Generate New Private Key**
5. Save the downloaded JSON file as `config/serviceAccountKey.json`

#### Option B: Environment Variables (Recommended for Production)
Add these to your `.env` file:
```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
```

**Note:** The backend will work without Firebase configured, but authentication endpoints will return a 503 error.

### 4. Start MongoDB
Make sure MongoDB is running on your system:
```bash
# Windows
mongod

# Mac/Linux
sudo systemctl start mongod
```

**Note:** The server will start even if MongoDB is not running, but database operations will fail.

### 5. Run the Server
```bash
npm start
# or for development
npm run dev
```

The server will start on `http://localhost:5000`

### 6. Verify Setup
Visit `http://localhost:5000/health` to check service status:
```json
{
  "status": "ok",
  "timestamp": "2025-12-15T12:00:00.000Z",
  "services": {
    "mongodb": "connected",
    "firebase": "initialized"
  }
}
```

## API Endpoints

### Authentication

#### Register with Email/Password
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "displayName": "John Doe"
}
```

#### Login with Email/Password
```http
POST /api/auth/login
Content-Type: application/json

{
  "firebaseToken": "firebase_id_token_here"
}
```

#### Send Phone OTP
```http
POST /api/auth/phone/send-otp
Content-Type: application/json

{
  "phoneNumber": "+919999999999"
}
```

#### Verify Phone OTP
```http
POST /api/auth/phone/verify-otp
Content-Type: application/json

{
  "firebaseToken": "firebase_id_token_here",
  "phoneNumber": "+919999999999",
  "displayName": "John Doe"
}
```

#### Google Authentication
```http
POST /api/auth/google
Content-Type: application/json

{
  "firebaseToken": "firebase_id_token_here"
}
```

#### Get Current User (Protected)
```http
GET /api/auth/me
Authorization: Bearer <firebase_token>
```

#### Update Profile (Protected)
```http
PUT /api/auth/me
Authorization: Bearer <firebase_token>
Content-Type: application/json

{
  "displayName": "New Name",
  "photoURL": "https://example.com/photo.jpg"
}
```

#### Logout (Protected)
```http
POST /api/auth/logout
Authorization: Bearer <firebase_token>
```

## Project Structure

```
Backend/
├── config/
│   ├── firebase-admin.js       # Firebase Admin SDK config
│   └── serviceAccountKey.json  # Firebase service account (gitignored)
├── controllers/
│   └── authController.js       # Auth logic
├── middleware/
│   └── authMiddleware.js       # JWT verification
├── models/
│   └── User.js                 # User schema
├── routes/
│   └── auth.js                 # Auth routes
├── .env                        # Environment variables
├── .gitignore
├── package.json
└── server.js                   # Entry point
```

## User Model Schema

```javascript
{
  email: String,
  password: String,
  phoneNumber: String,
  displayName: String,
  photoURL: String,
  provider: String, // 'email', 'phone', 'google'
  firebaseUid: String,
  emailVerified: Boolean,
  phoneVerified: Boolean,
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Security Notes

- All passwords are hashed using bcrypt
- Firebase Admin SDK verifies all tokens
- Protected routes require valid Firebase ID token
- CORS is enabled for frontend integration
- MongoDB indexes for faster queries

## Frontend Integration

The frontend should send the Firebase ID token in the Authorization header:

```javascript
const token = await user.getIdToken();

fetch('http://localhost:5000/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## Troubleshooting

### Firebase Not Initialized
**Error:** `⚠ Firebase Admin not initialized - missing credentials`

**Solution:**
1. Download service account key from Firebase Console and save as `config/serviceAccountKey.json`, OR
2. Add Firebase credentials to `.env` file (see `.env.example`)

**Note:** The server will run without Firebase, but auth endpoints will return 503 errors.

### MongoDB Connection Failed
**Error:** `✗ MongoDB Connection Error`

**Solutions:**
1. Make sure MongoDB is installed and running:
   ```bash
   # Windows - check if running
   tasklist | findstr mongod
   
   # Mac/Linux - check status
   sudo systemctl status mongod
   ```

2. Verify MongoDB URI in `.env` file
3. Try connecting manually:
   ```bash
   mongosh mongodb://localhost:27017/vox-edge-media
   ```

### Port Already in Use
**Error:** `EADDRINUSE: address already in use :::5000`

**Solution:**
1. Change PORT in `.env` file, OR
2. Kill the process using port 5000:
   ```bash
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   
   # Mac/Linux
   lsof -ti:5000 | xargs kill -9
   ```

### Module Not Found Errors
**Error:** `Cannot find module 'express'` or similar

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Check Service Status
Visit `http://localhost:5000/health` to see which services are running:
- `mongodb: "connected"` - Database is working
- `firebase: "initialized"` - Firebase is configured
- `mongodb: "disconnected"` - Check MongoDB setup
- `firebase: "not configured"` - Check Firebase credentials
