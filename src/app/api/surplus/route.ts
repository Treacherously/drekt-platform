import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/authOptions';
import { connectDB } from '../../../lib/mongodb';
import User from '../../../models/User';
import Supplier from '../../../models/Supplier';
import Surplus from '../../../models/Surplus';

export const dynamic = 'force-dynamic';

// ─── GET /api/surplus ─────────────────────────────────────────────────────────
// Public feed endpoint.
// Supports optional filters: ?q=tomato&location=Benguet

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') ?? '').trim();
    const location = (searchParams.get('location') ?? '').trim();

    const filter: Record<string, any> = { isAvailable: true };
    if (q) filter.productName = { $regex: q, $options: 'i' };
    if (location) filter.ownerLocation = { $regex: location, $options: 'i' };

    const items = await Surplus.find(filter)
      .select('ownerName ownerLocation productName quantity unit condition description price isFree isAvailable createdAt updatedAt')
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    return NextResponse.json({ success: true, data: items }, { status: 200 });
  } catch (error) {
    console.error('[GET /api/surplus]', error);
    return NextResponse.json({ success: false, data: [], message: 'Failed to load surplus feed' }, { status: 500 });
  }
}

// ─── POST /api/surplus ────────────────────────────────────────────────────────
// Auth required. Must be FARMER entityType.
// Body: { productName, quantity, unit, condition, ownerLocation?, description?, price?, isFree? }

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { productName, quantity, unit, condition, ownerLocation, description, price, isFree } = body;

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
    ownerLocation: (ownerLocation ?? supplier.location ?? '').trim() || 'Philippines',
    productName: productName.trim(),
    quantity: Number(quantity),
    unit: unit.trim(),
    condition,
    description: description?.trim() ?? '',
    price: Boolean(isFree) ? 0 : Number(price ?? 0),
    isFree: Boolean(isFree),
    isAvailable: true,
  });

  return NextResponse.json({ success: true, data: listing }, { status: 201 });
}
