import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/authOptions';
import { connectDB } from '../../../../lib/mongodb';
import User from '../../../../models/User';

export const dynamic = 'force-dynamic';

// ─── GET /api/admin/users ─────────────────────────────────────────────────────
// Returns all users (admin only). Password fields are never returned.

export async function GET() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
  }

  await connectDB();

  const users = await User.find({})
    .select('email role isVerified businessId createdAt')
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ success: true, data: users }, { status: 200 });
}
