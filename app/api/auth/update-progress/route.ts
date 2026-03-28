import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const { authId, email, progress, profile } = await request.json();

    if (!authId && !email) {
      return NextResponse.json(
        { success: false, message: 'authId or email is required' },
        { status: 400 }
      );
    }

    if (!progress && !profile) {
      return NextResponse.json(
        { success: false, message: 'progress or profile is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const users = db.collection('users');

    const updateDoc: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (progress) {
      updateDoc.progress = progress;
    }

    if (profile) {
      updateDoc.profile = profile;
    }

    await users.updateOne(
      authId ? { authId } : { email },
      { $set: updateDoc },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Update Progress Error]', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update progress' },
      { status: 500 }
    );
  }
}
