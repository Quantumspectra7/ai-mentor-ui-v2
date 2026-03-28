# 🔐 AUTHENTICATION & DATABASE SETUP GUIDE
## Complete Implementation for Production

---

## CURRENT FLOW (What You Have Now)

```
Landing Screen
    ↓
LPU Explorer (Select User Type)
    ↓
SELECT "Fresher" (90-Day Journey)
    ↓
JourneyLoginScreen (NEW! - Email/Google Auth)
    ↓
Complete Profile (Onboarding)
    ↓
Dashboard (90-Day Journey)
    ↓
Logout Button (Top Right)
```

---

## 🎯 WHAT'S IMPLEMENTED

### ✅ COMPLETE (Frontend)
- Modern login screen with Google/Email options
- Beautiful, sleek dark theme UI (like Gudanta)
- Responsive design
- Password show/hide toggle
- Sign up / Login toggle
- Error messages
- Loading states

### ✅ COMPLETE (Backend - Basic)
- API routes for `/api/auth/login` (email/password)
- API routes for `/api/auth/google` (Google OAuth simulation)
- API routes for `/api/auth/save-user` (profile storage)
- In-memory user storage (working but not persistent)
- Password hashing with SHA256

### ❌ NOT YET IMPLEMENTED
- Real Google OAuth integration
- Persistent database (MongoDB, PostgreSQL, etc.)
- JWT token generation
- Session management
- Email verification
- Password reset
- 2FA (Two-Factor Authentication)

---

## 🔧 STEP 1: SET UP REAL DATABASE

### Option A: MongoDB (Recommended)

**Install Mongoose:**
```bash
npm install mongoose
```

**Create `.env.local`:**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-mentor?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_key_here_min_32_chars
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

**Create MongoDB models file `lib/mongoose.ts`:**
```typescript
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  authId: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String }, // optional for OAuth users
  name: String,
  provider: { type: String, enum: ['email', 'google'], default: 'email' },
  profile: {
    branch: String,
    hostel: String,
    interests: [String],
    profileCompleted: Boolean,
  },
  currentDay: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const User = mongoose.models.User || mongoose.model('User', userSchema);
```

### Option B: PostgreSQL with Prisma

**Install:**
```bash
npm install @prisma/client
npm install -D prisma
npx prisma init
```

**Create `prisma/schema.prisma`:**
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int     @id @default(autoincrement())
  authId    String  @unique
  email     String  @unique
  password  String?
  name      String?
  provider  String  @default("email")
  
  branch    String?
  hostel    String?
  interests String[]
  profileCompleted Boolean @default(false)
  
  currentDay Int @default(1)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}
```

**Run migrations:**
```bash
npx prisma migrate dev --name init
```

---

## 🔧 STEP 2: SET UP GOOGLE OAUTH

### Get Google Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project: "AI Mentor"
3. Enable "Google+ API"
4. Go to "Credentials" → Create OAuth 2.0 Client IDs
5. Configure OAuth consent screen
6. Application type: "Web application"
7. Authorized JavaScript origins: `http://localhost:3000`
8. Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
9. Copy Client ID and Client Secret → `.env.local`

### Install NextAuth.js (Recommended for OAuth)

```bash
npm install next-auth
```

**Create `app/api/auth/[...nextauth]/route.ts`:**
```typescript
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { User } from "@/lib/mongoose"
import mongoose from "mongoose"

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Connect to DB
        if (!mongoose.connection.readyState) {
          await mongoose.connect(process.env.MONGODB_URI!)
        }

        if (!credentials?.email || !credentials?.password) return null

        const user = await User.findOne({ email: credentials.email })
        if (!user) return null

        // Verify password
        const isValid = await verifyPassword(credentials.password, user.password)
        if (!isValid) return null

        return {
          id: user.authId,
          email: user.email,
          name: user.name,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.authId = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.authId as string
      }
      return session
    },
  },
})

export { handler as GET, handler as POST }
```

---

## 🔧 STEP 3: UPDATE LOGIN API WITH DATABASE

**Replace `/app/api/auth/login/route.ts`:**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { User } from '@/lib/mongoose';
import jwt from 'jsonwebtoken';

function generateAuthId(): string {
  return crypto.randomBytes(16).toString('hex');
}

async function hashPassword(password: string): Promise<string> {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return (await hashPassword(password)) === hash;
}

export async function POST(request: NextRequest) {
  try {
    // Connect to MongoDB
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const { email, password, isSignUp, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (isSignUp) {
      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return NextResponse.json(
          { success: false, message: 'Email already registered' },
          { status: 400 }
        );
      }

      const authId = generateAuthId();
      const hashedPassword = await hashPassword(password);

      // Create new user
      const newUser = await User.create({
        authId,
        email,
        password: hashedPassword,
        name,
        provider: 'email',
      });

      // Generate JWT token
      const token = jwt.sign(
        { authId, email },
        process.env.JWT_SECRET!,
        { expiresIn: '30d' }
      );

      return NextResponse.json({
        success: true,
        authId,
        email,
        token,
        message: 'Account created successfully',
      });
    } else {
      // Login
      const user = await User.findOne({ email });
      if (!user) {
        return NextResponse.json(
          { success: false, message: 'Invalid email or password' },
          { status: 401 }
        );
      }

      const isPasswordValid = await verifyPassword(password, user.password);
      if (!isPasswordValid) {
        return NextResponse.json(
          { success: false, message: 'Invalid email or password' },
          { status: 401 }
        );
      }

      // Generate JWT token
      const token = jwt.sign(
        { authId: user.authId, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: '30d' }
      );

      return NextResponse.json({
        success: true,
        authId: user.authId,
        email: user.email,
        name: user.name,
        token,
        message: 'Login successful',
      });
    }
  } catch (error) {
    console.error('[Auth Error]', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## 🔧 STEP 4: UPDATE GOOGLE AUTH API

**Replace `/app/api/auth/google/route.ts`:**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { User } from '@/lib/mongoose';
import jwt from 'jsonwebtoken';

function generateAuthId(): string {
  return crypto.randomBytes(16).toString('hex');
}

export async function POST(request: NextRequest) {
  try {
    // Connect to MongoDB
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const { email, name, picture } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    // Find or create user
    let user = await User.findOne({ email });
    
    if (!user) {
      const authId = generateAuthId();
      user = await User.create({
        authId,
        email,
        name,
        provider: 'google',
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { authId: user.authId, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '30d' }
    );

    return NextResponse.json({
      success: true,
      authId: user.authId,
      email: user.email,
      name: user.name || name,
      token,
      provider: 'google',
    });
  } catch (error) {
    console.error('[Google Auth Error]', error);
    return NextResponse.json(
      { success: false, message: 'Google authentication failed' },
      { status: 500 }
    );
  }
}
```

---

## 🔧 STEP 5: UPDATE SAVE-USER API

**Replace `/app/api/auth/save-user/route.ts`:**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { User } from '@/lib/mongoose';

export async function POST(request: NextRequest) {
  try {
    // Connect to MongoDB
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const { email, authId, name, branch, hostel, interests } = await request.json();

    if (!email || !authId) {
      return NextResponse.json(
        { success: false, message: 'Email and authId are required' },
        { status: 400 }
      );
    }

    // Update user profile
    const updatedUser = await User.findOneAndUpdate(
      { authId },
      {
        name,
        'profile.branch': branch,
        'profile.hostel': hostel,
        'profile.interests': interests,
        'profile.profileCompleted': true,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'User profile saved successfully',
      user: {
        email: updatedUser.email,
        authId: updatedUser.authId,
        name: updatedUser.name,
      },
    });
  } catch (error) {
    console.error('[Save User Error]', error);
    return NextResponse.json(
      { success: false, message: 'Failed to save user profile' },
      { status: 500 }
    );
  }
}
```

---

## 📦 DEPENDENCIES TO INSTALL

```bash
npm install mongoose jsonwebtoken next-auth
npm install --save-dev @types/jsonwebtoken
```

**Or for PostgreSQL:**
```bash
npm install @prisma/client
npm install -D prisma
npm install jsonwebtoken next-auth
```

---

## 🌐 ENVIRONMENT VARIABLES (`.env.local`)

```
# MongoDB (if using MongoDB)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-mentor

# PostgreSQL (if using Prisma)
DATABASE_URL="postgresql://user:password@localhost:5432/ai_mentor"

# Auth
JWT_SECRET=your_secret_key_minimum_32_characters_long

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# NextAuth (if using)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_key
```

---

## ✅ TESTING THE FLOW (Local Development)

1. **Start the app:**
   ```bash
   npm run dev
   ```

2. **Go to Landing Screen** → Select "Fresher"

3. **See Login Screen** with:
   - Google Login button
   - Email/Password form
   - Sign Up / Login toggle

4. **Test Email/Password:**
   - Sign up: Create new account
   - Verify: Check console logs (data being "saved")
   - Login: Use credentials you just created

5. **Test Google:**
   - Click "Continue with Google"
   - Login with your Google account
   - Should redirect to Onboarding

6. **Complete Onboarding:**
   - Fill name, branch, hostel, interests
   - Click "Initialize Interface"
   - Should go to Dashboard

7. **Test Logout:**
   - Top right of dashboard
   - Click logout button
   - Should return to landing

---

## 🚀 DEPLOYMENT CHECKLIST

### Before deploying to production:

- [ ] Set up actual database (MongoDB Atlas / Heroku PostgreSQL)
- [ ] Get Google OAuth credentials for your domain
- [ ] Set production environment variables
- [ ] Set `NEXTAUTH_URL` to your production domain
- [ ] Enable HTTPS (required for Google OAuth)
- [ ] Test all auth flows on production URL
- [ ] Set up error tracking (Sentry/LogRocket)
- [ ] Enable rate limiting on auth endpoints
- [ ] Set up password reset email service
- [ ] Add email verification
- [ ] Enable 2FA (optional)

---

## 🔒 SECURITY BEST PRACTICES

```typescript
// 1. Hash passwords (never store plain text)
const hashedPassword = await bcrypt.hash(password, 10);

// 2. Use JWT with expiration
const token = jwt.sign(payload, secret, { expiresIn: '30d' });

// 3. Validate all inputs
if (!email.includes('@')) return error;

// 4. Rate limit auth endpoints
// npm install express-rate-limit

// 5. Use HTTPS only in production
// 6. Set secure cookies
// 7. Enable CORS properly
// 8. Log auth events
```

---

## 📊 Database Schema Reference

### User Collection/Table:

```
{
  authId: String (unique) - generated ID for user
  email: String (unique) - user's email
  password: String - hashed password (empty for OAuth)
  name: String - full name
  provider: String - 'email' or 'google'
  
  profile: {
    branch: String - CSE, ECE, etc.
    hostel: String - Silver Oak, etc.
    interests: [String] - Coding, Design, etc.
    profileCompleted: Boolean - onboarding done?
  }
  
  currentDay: Number - current day (1-90)
  
  createdAt: DateTime
  updatedAt: DateTime
}
```

---

## 🆘 TROUBLESHOOTING

**"MongoDB connection refused"**
- Check MONGODB_URI in .env.local
- Verify IP whitelist in MongoDB Atlas
- Ensure network access is enabled

**"Google button doesn't work"**
- Verify GOOGLE_CLIENT_ID is correct
- Check redirect URI matches exactly
- Ensure HTTPS in production

**"Tokens not saving"**
- Check localStorage isn't disabled
- Verify API responses in Network tab
- Check browser console for errors

**"Can't sign up"**
- Check password strength requirements
- Verify email doesn't already exist
- Check API logs for detailed errors

---

## 📞 NEXT STEPS

1. Choose database: MongoDB or PostgreSQL
2. Get Google OAuth credentials
3. Install dependencies
4. Update API routes with database code
5. Test locally
6. Deploy to Vercel/production
7. Monitor auth metrics

---

**Questions?** Check the implementation files in `/app/api/auth/` or review the NextAuth.js documentation.

**Security audit needed?** Use tools like OWASP ZAP or npm audit before production deployment.
