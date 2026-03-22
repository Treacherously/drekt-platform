import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/authOptions';
import { connectDB } from '../../../../../lib/mongodb';
import User from '../../../../../models/User';
import Supplier from '../../../../../models/Supplier';

// ─── GET /api/dashboard/supplier/profile ─────────────────────────────────────
// Returns the Supplier document linked to the authenticated user.

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
    return NextResponse.json({ success: true, data: null }, { status: 200 });
  }

  const supplier = await Supplier.findById(user.businessId)
    .select('businessName industry location status contactEmail contactPhone description entityType specialties logoUrl')
    .lean();

  return NextResponse.json({ success: true, data: supplier ?? null }, { status: 200 });
}

// ─── PATCH /api/dashboard/supplier/profile ────────────────────────────────────
// Partial update — currently supports: logoUrl

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();

  const user = await User.findOne({ email: session.user.email }).lean<{ businessId?: any }>();

  if (!user?.businessId) {
    return NextResponse.json({ success: false, message: 'No linked business found' }, { status: 404 });
  }

  const body = await req.json();
  const allowed: Record<string, unknown> = {};
  if (typeof body.logoUrl === 'string') allowed.logoUrl = body.logoUrl;

  if (Object.keys(allowed).length === 0) {
    return NextResponse.json({ success: false, message: 'Nothing to update' }, { status: 400 });
  }

  const updated = await Supplier.findByIdAndUpdate(
    user.businessId,
    { $set: allowed },
    { new: true, select: 'businessName industry location status contactEmail contactPhone description entityType specialties logoUrl' }
  ).lean();

  return NextResponse.json({ success: true, data: updated }, { status: 200 });
}
