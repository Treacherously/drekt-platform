import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/authOptions';
import { connectDB } from '../../../../../lib/mongodb';
import User from '../../../../../models/User';

// ─── POST /api/admin/users/verify ────────────────────────────────────────────
// Allows an Admin to manually set isVerified=true for any user.
// Body: { userId: string }

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
  }

  const { userId } = await req.json();
  if (!userId) {
    return NextResponse.json({ success: false, message: 'userId is required' }, { status: 400 });
  }

  await connectDB();

  const user = await User.findByIdAndUpdate(
    userId,
    {
      isVerified: true,
      $unset: { verificationToken: '', tokenExpiry: '' },
    },
    { new: true }
  ).select('email role isVerified');

  if (!user) {
    return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
  }

  return NextResponse.json(
    { success: true, message: `${user.email} has been verified.`, data: user },
    { status: 200 }
  );
}
