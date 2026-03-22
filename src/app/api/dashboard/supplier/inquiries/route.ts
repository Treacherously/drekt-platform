import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/authOptions';
import { connectDB } from '../../../../../lib/mongodb';
import User from '../../../../../models/User';
import Inquiry from '../../../../../models/Inquiry';

// ─── GET /api/dashboard/supplier/inquiries ────────────────────────────────────
// Returns total and unread inquiry counts for the authenticated supplier.

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();

  const user = await User.findOne({ email: session.user.email }).lean<{
    businessId?: any;
  }>();

  if (!user?.businessId) {
    return NextResponse.json({ success: true, data: { total: 0, unread: 0 } }, { status: 200 });
  }

  const [total, unread] = await Promise.all([
    Inquiry.countDocuments({ businessId: user.businessId }),
    Inquiry.countDocuments({ businessId: user.businessId, status: 'PENDING' }),
  ]);

  return NextResponse.json({ success: true, data: { total, unread } }, { status: 200 });
}
