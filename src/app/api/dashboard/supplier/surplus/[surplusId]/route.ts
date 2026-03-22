import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../../lib/authOptions';
import { connectDB } from '../../../../../../lib/mongodb';
import User from '../../../../../../models/User';
import Surplus from '../../../../../../models/Surplus';

export const dynamic = 'force-dynamic';

// ─── PATCH /api/dashboard/supplier/surplus/[surplusId] ────────────────────────
// Toggle isAvailable (mark as claimed / reopen)

export async function PATCH(
  req: NextRequest,
  { params }: { params: { surplusId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();

  const user = await User.findOne({ email: session.user.email }).lean<{ businessId?: any }>();
  const listing = await Surplus.findOne({ _id: params.surplusId, ownerId: user?.businessId });

  if (!listing) {
    return NextResponse.json({ success: false, message: 'Listing not found' }, { status: 404 });
  }

  listing.isAvailable = !listing.isAvailable;
  await listing.save();

  return NextResponse.json({ success: true, data: listing }, { status: 200 });
}

// ─── DELETE /api/dashboard/supplier/surplus/[surplusId] ───────────────────────
// Permanently removes a surplus listing owned by the caller.

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { surplusId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();

  const user = await User.findOne({ email: session.user.email }).lean<{ businessId?: any }>();
  const result = await Surplus.deleteOne({ _id: params.surplusId, ownerId: user?.businessId });

  if (result.deletedCount === 0) {
    return NextResponse.json({ success: false, message: 'Listing not found or not yours' }, { status: 404 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
