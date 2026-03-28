import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const { email, authId, name, branch, hostel, interests, progress } = await request.json();

    if (!email || !authId) {
      return NextResponse.json(
        { success: false, message: 'Email and authId are required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const users = db.collection('users');

    const updateDoc: Record<string, unknown> = {
      email,
      authId,
      profile: {
        name,
        branch,
        hostel,
        interests,
      },
      updatedAt: new Date(),
    };

    if (progress) {
      updateDoc.progress = progress;
    }

    await users.updateOne(
      { authId },
      { $set: updateDoc, $setOnInsert: { createdAt: new Date() } },
      { upsert: true }
    );

    const user = await users.findOne({ authId });

    return NextResponse.json({
      success: true,
      message: 'User profile saved successfully',
      user,
    });
  } catch (error) {
    console.error('[Save User Error]', error);
    return NextResponse.json(
      { success: false, message: 'Failed to save user profile' },
      { status: 500 }
    );
  }
}
