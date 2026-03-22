import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../../lib/authOptions';
import { connectDB } from '../../../../../../lib/mongodb';
import User from '../../../../../../models/User';
import Supplier from '../../../../../../models/Supplier';

// ─── DELETE /api/dashboard/supplier/inventory/[itemId] ────────────────────────
// Removes a single dedicated inventory item by its _id.

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { itemId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { itemId } = params;

  await connectDB();

  const user = await User.findOne({ email: session.user.email }).lean<{ businessId?: any }>();
  if (!user?.businessId) {
    return NextResponse.json(
      { success: false, message: 'No business profile linked' },
      { status: 400 }
    );
  }

  const supplier = await Supplier.findByIdAndUpdate(
    user.businessId,
    { $pull: { dedicatedInventory: { _id: itemId } } },
    { new: true }
  ).select('dedicatedInventory');

  return NextResponse.json(
    { success: true, data: supplier?.dedicatedInventory ?? [] },
    { status: 200 }
  );
}
