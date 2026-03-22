import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/authOptions';
import { connectDB } from '../../../../../lib/mongodb';
import User from '../../../../../models/User';
import Supplier from '../../../../../models/Supplier';

export const dynamic = 'force-dynamic';

// ─── GET /api/dashboard/supplier/inventory ────────────────────────────────────
// Returns the dedicated inventory for the authenticated supplier.

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();

  const user = await User.findOne({ email: session.user.email }).lean<{ businessId?: any }>();
  if (!user?.businessId) {
    return NextResponse.json({ success: true, data: [] }, { status: 200 });
  }

  const supplier = await Supplier.findById(user.businessId)
    .select('dedicatedInventory')
    .lean<{ dedicatedInventory: any[] }>();

  return NextResponse.json(
    { success: true, data: supplier?.dedicatedInventory ?? [] },
    { status: 200 }
  );
}

// ─── POST /api/dashboard/supplier/inventory ───────────────────────────────────
// Add a new item (no itemId) or replace an existing one (itemId provided).
// Body: { itemName, quantity, unit, price, itemId? }

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { itemName, quantity, unit, price, itemId } = await req.json();

  if (!itemName?.trim() || quantity == null || !unit?.trim() || price == null) {
    return NextResponse.json(
      { success: false, message: 'itemName, quantity, unit, and price are required' },
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

  let supplier;

  if (itemId) {
    supplier = await Supplier.findOneAndUpdate(
      { _id: user.businessId, 'dedicatedInventory._id': itemId },
      {
        $set: {
          'dedicatedInventory.$.itemName': itemName.trim(),
          'dedicatedInventory.$.quantity': Number(quantity),
          'dedicatedInventory.$.unit': unit.trim(),
          'dedicatedInventory.$.price': Number(price),
          'dedicatedInventory.$.lastUpdated': new Date(),
        },
      },
      { new: true }
    ).select('dedicatedInventory');
  } else {
    supplier = await Supplier.findByIdAndUpdate(
      user.businessId,
      {
        $push: {
          dedicatedInventory: {
            itemName: itemName.trim(),
            quantity: Number(quantity),
            unit: unit.trim(),
            price: Number(price),
            lastUpdated: new Date(),
          },
        },
      },
      { new: true }
    ).select('dedicatedInventory');
  }

  return NextResponse.json(
    { success: true, data: supplier?.dedicatedInventory ?? [] },
    { status: 200 }
  );
}
