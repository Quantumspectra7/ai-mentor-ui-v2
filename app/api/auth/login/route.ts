import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Simulated in-memory database (in production, use actual database like MongoDB/PostgreSQL)
const users: Record<string, { email: string; password: string; name: string; createdAt: Date; authId: string }> = {};

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function generateAuthId(): string {
  return crypto.randomBytes(16).toString('hex');
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, isSignUp, name } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    const hashedPassword = hashPassword(password);

    if (isSignUp) {
      // Sign up: Create new user
      if (users[email]) {
        return NextResponse.json(
          { success: false, message: 'Email already registered' },
          { status: 400 }
        );
      }

      if (!name) {
        return NextResponse.json(
          { success: false, message: 'Name is required for signup' },
          { status: 400 }
        );
      }

      const authId = generateAuthId();
      users[email] = {
        email,
        password: hashedPassword,
        name,
        createdAt: new Date(),
        authId,
      };

      // In production: Save to database here
      console.log(`[DB] New user created: ${email}`);

      return NextResponse.json({
        success: true,
        authId,
        email,
        message: 'Account created successfully',
      });
    } else {
      // Login: Verify existing user
      if (!users[email]) {
        return NextResponse.json(
          { success: false, message: 'Invalid email or password' },
          { status: 401 }
        );
      }

      if (users[email].password !== hashedPassword) {
        return NextResponse.json(
          { success: false, message: 'Invalid email or password' },
          { status: 401 }
        );
      }

      const authId = users[email].authId;

      return NextResponse.json({
        success: true,
        authId,
        email,
        name: users[email].name,
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
