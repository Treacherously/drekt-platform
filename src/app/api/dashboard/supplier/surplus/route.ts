import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/authOptions';
import { connectDB } from '../../../../../lib/mongodb';
import User from '../../../../../models/User';
import Supplier from '../../../../../models/Supplier';
import Surplus from '../../../../../models/Surplus';

// ─── GET /api/dashboard/supplier/surplus ──────────────────────────────────────
// FARMER  → returns their own listings (all statuses)
// Others  → returns all available listings from farmers (the rescue feed)

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();

  const user = await User.findOne({ email: session.user.email }).lean<{ businessId?: any }>();

  if (user?.businessId) {
    const supplier = await Supplier.findById(user.businessId)
      .select('entityType')
      .lean<{ entityType: string[] }>();

    const isFarmer = supplier?.entityType?.includes('FARMER');

    if (isFarmer) {
      const listings = await Surplus.find({ ownerId: user.businessId })
        .sort({ createdAt: -1 })
        .lean();
      return NextResponse.json({ success: true, role: 'FARMER', data: listings }, { status: 200 });
    }
  }

  // Processor / any other role → show all available surplus from farmers
  const feed = await Surplus.find({ isAvailable: true })
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ success: true, role: 'PROCESSOR', data: feed }, { status: 200 });
}

// ─── POST /api/dashboard/supplier/surplus ─────────────────────────────────────
// Creates a surplus listing. Caller must have FARMER entityType.
// Body: { productName, quantity, unit, condition, description?, price, isFree }

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { productName, quantity, unit, condition, description, price, isFree } = body;

  if (!productName?.trim() || quantity == null || !unit?.trim() || !condition) {
    return NextResponse.json(
      { success: false, message: 'productName, quantity, unit, and condition are required' },
      { status: 400 }
    );
  }

  await connectDB();

  const user = await User.findOne({ email: session.user.email }).lean<{ businessId?: any }>();
  if (!user?.businessId) {
    return NextResponse.json(
      { success: false, message: 'No business profile linked to this account' },
      { status: 400 }
    );
  }

  const supplier = await Supplier.findById(user.businessId)
    .select('businessName location entityType')
    .lean<{ businessName: string; location: string; entityType: string[] }>();

  if (!supplier?.entityType?.includes('FARMER')) {
    return NextResponse.json(
      { success: false, message: 'Only FARMER accounts can post surplus listings' },
      { status: 403 }
    );
  }

  const listing = await Surplus.create({
    ownerId: user.businessId,
    ownerName: supplier.businessName,
    ownerLocation: supplier.location,
    productName: productName.trim(),
    quantity: Number(quantity),
    unit: unit.trim(),
    condition,
    description: description?.trim() ?? '',
    price: isFree ? 0 : Number(price ?? 0),
    isFree: Boolean(isFree),
    isAvailable: true,
  });

  return NextResponse.json({ success: true, data: listing }, { status: 201 });
}
