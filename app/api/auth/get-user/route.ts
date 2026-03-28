import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const { authId, email } = await request.json();

    if (!authId && !email) {
      return NextResponse.json(
        { success: false, message: 'authId or email is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const users = db.collection('users');

    const user = await users.findOne(authId ? { authId } : { email });

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('[Get User Error]', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}
